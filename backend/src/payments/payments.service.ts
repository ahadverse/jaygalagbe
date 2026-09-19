import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentStatus } from '../generated/prisma/client.js';
import { BoostService } from '../boost/boost.service.js';
import {
  getSslcommerzCredentials,
  sslcommerzBaseUrl,
} from './sslcommerz.config.js';
import { verifySslcommerzSignature } from './sslcommerz-signature.util.js';

const SUCCESS_STATUSES = new Set(['VALID', 'VALIDATED']);
const FAILURE_STATUSES = new Set(['FAILED', 'CANCELLED', 'EXPIRED']);
const CURRENCY = 'BDT';
const GATEWAY_TIMEOUT_MS = 15_000;

interface SslcommerzInitResponse {
  status: string;
  sessionkey?: string;
  GatewayPageURL?: string;
  failedreason?: string;
}

interface SslcommerzValidationResponse {
  status?: string;
  tran_id?: string;
  amount?: string;
  currency?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly boostService: BoostService,
  ) {}

  async initCheckout(paymentId: string, requesterId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true, ad: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.userId !== requesterId) {
      throw new ForbiddenException('You do not own this payment');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }

    const { storeId, storePassword, apiBaseUrl } = getSslcommerzCredentials();
    const callbackUrl = `${apiBaseUrl}/payments/ipn`;

    const params = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: payment.amount.toString(),
      currency: CURRENCY,
      tran_id: payment.id,
      success_url: callbackUrl,
      fail_url: callbackUrl,
      cancel_url: callbackUrl,
      ipn_url: callbackUrl,
      shipping_method: 'NO',
      product_name: `Ad boost - ${payment.adId}`,
      product_category: 'Boost',
      product_profile: 'general',
      cus_name: payment.user.name,
      cus_email: payment.user.email ?? 'no-reply@jaygalagbe.com',
      cus_phone: payment.user.phone ?? 'N/A',
      cus_add1: 'N/A',
      cus_city: 'N/A',
      cus_country: 'Bangladesh',
    });

    const response = await fetch(`${sslcommerzBaseUrl()}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    });
    const data = (await response.json()) as SslcommerzInitResponse;

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
      // The gateway's own reason can carry store details, so it is logged
      // rather than returned to the buyer.
      this.logger.warn(
        `Checkout init failed for ${paymentId}: ${data.failedreason ?? data.status}`,
      );
      throw new BadRequestException('Failed to initiate payment');
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { gatewayRef: data.sessionkey },
    });

    return { gatewayPageUrl: data.GatewayPageURL };
  }

  async handleIpn(payload: Record<string, string>) {
    const { storePassword } = getSslcommerzCredentials();
    if (!verifySslcommerzSignature(payload, storePassword)) {
      throw new UnauthorizedException('Invalid payment signature');
    }

    const paymentId = payload.tran_id;
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // A replayed or already-settled callback must not re-activate a boost.
    if (payment.status !== PaymentStatus.PENDING) {
      return { received: true };
    }

    if (FAILURE_STATUSES.has(payload.status)) {
      await this.boostService.cancelOnPaymentFailure(paymentId);
      return { received: true };
    }

    if (!SUCCESS_STATUSES.has(payload.status)) {
      return { received: true };
    }

    // A valid signature only proves the callback came from the store's own
    // credentials; the amount still has to be confirmed against the gateway.
    const settled = await this.validateWithGateway(payload.val_id);
    if (
      !settled ||
      settled.tran_id !== paymentId ||
      settled.currency !== CURRENCY ||
      Number(settled.amount) < payment.amount.toNumber()
    ) {
      this.logger.warn(`Rejected unverified IPN for payment ${paymentId}`);
      throw new UnauthorizedException('Payment could not be verified');
    }

    await this.boostService.activateOnPaymentSuccess(paymentId);
    return { received: true };
  }

  private async validateWithGateway(
    valId: string | undefined,
  ): Promise<SslcommerzValidationResponse | null> {
    if (!valId) {
      return null;
    }

    const { storeId, storePassword } = getSslcommerzCredentials();
    const query = new URLSearchParams({
      val_id: valId,
      store_id: storeId,
      store_passwd: storePassword,
      format: 'json',
    });

    try {
      const response = await fetch(
        `${sslcommerzBaseUrl()}/validator/api/validationserverAPI.php?${query.toString()}`,
        { signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS) },
      );
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as SslcommerzValidationResponse;
      return data.status && SUCCESS_STATUSES.has(data.status) ? data : null;
    } catch (error) {
      this.logger.warn(
        `SSLCommerz validation call failed: ${(error as Error).message}`,
      );
      return null;
    }
  }
}
