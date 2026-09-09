import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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

interface SslcommerzInitResponse {
  status: string;
  sessionkey?: string;
  GatewayPageURL?: string;
  failedreason?: string;
}

@Injectable()
export class PaymentsService {
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
      currency: 'BDT',
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

    const response = await fetch(
      `${sslcommerzBaseUrl()}/gwprocess/v4/api.php`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      },
    );
    const data = (await response.json()) as SslcommerzInitResponse;

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
      throw new BadRequestException(
        data.failedreason ?? 'Failed to initiate payment',
      );
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

    if (SUCCESS_STATUSES.has(payload.status)) {
      await this.boostService.activateOnPaymentSuccess(paymentId);
    } else if (FAILURE_STATUSES.has(payload.status)) {
      await this.boostService.cancelOnPaymentFailure(paymentId);
    }

    return { received: true };
  }
}
