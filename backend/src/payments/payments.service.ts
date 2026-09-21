import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentStatus } from '../generated/prisma/client.js';
import { BoostService } from '../boost/boost.service.js';
import { getCorsOrigins } from '../config/env.js';
import { getPaystationCredentials } from './paystation.config.js';

/**
 * PayStation hosted checkout (https://www.paystation.com.bd/documentation).
 *
 * 1. `POST {base}/initiate-payment`, form-encoded, `merchantId` + `password`
 *    in the *body*. Returns `{ status_code, status, message, payment_amount,
 *    invoice_number, payment_url }`; `payment_url` is where the buyer goes.
 * 2. The buyer is returned to `callback_url` in their browser with
 *    `invoice_number`, `trx_id` and `status` as parameters.
 * 3. On success only, PayStation also POSTs a flat JSON IPN to the merchant's
 *    configured IPN URL: `{ invoice_number, trx_status: "Success", trx_id,
 *    trx_amount, order_date_time, payment_method, reference }`.
 * 4. `POST {base}/transaction-status`, form-encoded `invoice_number`, with
 *    `merchantId` as an HTTP *header*. Returns
 *    `{ status_code, status, message, data: { invoice_number, trx_status,
 *    trx_id, payment_amount, order_date_time, payer_mobile_no,
 *    payment_method, reference, checkout_items } }`.
 *
 * Neither the browser return nor the IPN is authenticated, so both are treated
 * purely as a nudge to re-read step 4 server-side.
 */
const CURRENCY = 'BDT';
const GATEWAY_TIMEOUT_MS = 15_000;
const OK_STATUS_CODE = '200';

// `trx_status` is documented as "Success"/"Failed" on v1 and lower-cased on
// v2, so it is compared case-insensitively.
const SUCCESS_STATUSES = new Set(['success']);
const FAILURE_STATUSES = new Set(['failed', 'cancelled', 'expired']);

/**
 * A payment left PENDING is still being processed at the wallet's end; saying
 * "failed" there would send the buyer off to pay a second time.
 */
const RETURN_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.SUCCESS]: 'success',
  [PaymentStatus.FAILED]: 'failed',
  [PaymentStatus.PENDING]: 'pending',
};

interface PaystationInitiateResponse {
  status_code?: string;
  status?: string;
  message?: string;
  payment_url?: string;
}

interface PaystationTransaction {
  invoice_number?: string;
  trx_status?: string;
  trx_id?: string;
  /** v1 names it `payment_amount`; the v2 endpoint and the IPN use `trx_amount`. */
  payment_amount?: string | number;
  trx_amount?: string | number;
}

interface PaystationStatusResponse {
  status_code?: string;
  status?: string;
  message?: string;
  data?: PaystationTransaction;
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

    const { merchantId, password, baseUrl, callbackUrl } =
      getPaystationCredentials();

    // The payment id doubles as the invoice number: PayStation rejects a
    // duplicate, which is exactly the replay protection we want.
    const params = new URLSearchParams({
      merchantId,
      password,
      invoice_number: payment.id,
      currency: CURRENCY,
      payment_amount: payment.amount.toString(),
      reference: payment.adId,
      cust_name: payment.user.name,
      cust_email: payment.user.email ?? 'no-reply@jaygalagbe.com',
      cust_phone: payment.user.phone ?? 'N/A',
      cust_address: 'N/A',
      callback_url: callbackUrl,
      checkout_items: `Ad boost - ${payment.adId}`,
    });

    const response = await fetch(`${baseUrl}/initiate-payment`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    });
    const data = (await response.json()) as PaystationInitiateResponse;

    if (data.status_code !== OK_STATUS_CODE || !data.payment_url) {
      // The gateway's own reason can carry merchant details, so it is logged
      // rather than returned to the buyer.
      this.logger.warn(
        `Checkout init failed for ${paymentId}: ${data.message ?? data.status}`,
      );
      throw new BadRequestException('Failed to initiate payment');
    }

    return { gatewayPageUrl: data.payment_url };
  }

  /**
   * Server-to-server IPN. PayStation sends it only for successful payments and
   * may retry it, so it settles through the same idempotent path as everything
   * else.
   */
  async handleIpn(payload: Record<string, unknown>) {
    await this.settle(String(payload.invoice_number ?? ''));
    return { received: true };
  }

  /**
   * Where the buyer's browser lands after checkout. The query string is not
   * trusted for anything beyond naming the invoice to re-read.
   */
  async handleGatewayReturn(query: Record<string, string>): Promise<string> {
    const settled = await this.settle(query.invoice_number ?? '');
    return `${this.webAppOrigin()}/dashboard/ads?payment=${RETURN_LABELS[settled]}`;
  }

  /**
   * Admin-triggered settlement for a payment whose IPN never arrived. It runs
   * the same gateway check the buyer's return does, so the gateway stays the
   * only thing that can move a payment to SUCCESS.
   */
  async recheckWithGateway(paymentId: string): Promise<PaymentStatus> {
    return this.settle(paymentId);
  }

  /**
   * Re-reads the transaction from PayStation and moves the payment to its
   * final state. Returns the resulting status; a payment that is still
   * processing stays PENDING so a later IPN can settle it.
   */
  private async settle(invoiceNumber: string): Promise<PaymentStatus> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: invoiceNumber },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // A replayed or already-settled callback must not re-activate a boost.
    if (payment.status !== PaymentStatus.PENDING) {
      return payment.status;
    }

    const transaction = await this.fetchTransaction(invoiceNumber);
    const trxStatus = transaction?.trx_status?.toLowerCase() ?? '';

    if (FAILURE_STATUSES.has(trxStatus)) {
      await this.boostService.cancelOnPaymentFailure(payment.id);
      return PaymentStatus.FAILED;
    }

    if (!transaction || !SUCCESS_STATUSES.has(trxStatus)) {
      return PaymentStatus.PENDING;
    }

    // A "Success" from the gateway still has to be for the right amount — the
    // buyer could otherwise pay one taka against a fifteen-day boost.
    const paid = Number(transaction.payment_amount ?? transaction.trx_amount);
    if (
      transaction.invoice_number !== payment.id ||
      !Number.isFinite(paid) ||
      paid < payment.amount.toNumber()
    ) {
      this.logger.warn(`Rejected unverified settlement for ${payment.id}`);
      return PaymentStatus.PENDING;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayRef: transaction.trx_id },
    });
    await this.boostService.activateOnPaymentSuccess(payment.id);
    return PaymentStatus.SUCCESS;
  }

  private async fetchTransaction(
    invoiceNumber: string,
  ): Promise<PaystationTransaction | null> {
    const { merchantId, baseUrl } = getPaystationCredentials();

    try {
      const response = await fetch(`${baseUrl}/transaction-status`, {
        method: 'POST',
        headers: {
          merchantId,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ invoice_number: invoiceNumber }),
        signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
      });
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as PaystationStatusResponse;
      return data.status_code === OK_STATUS_CODE ? (data.data ?? null) : null;
    } catch (error) {
      this.logger.warn(
        `PayStation status call failed: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * The buyer has to be sent back to the storefront, and the only place this
   * service already knows it is the CORS allowlist — its first entry is the
   * Next.js app.
   */
  private webAppOrigin(): string {
    return getCorsOrigins()[0];
  }
}
