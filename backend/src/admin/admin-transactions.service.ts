import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  AuditAction,
  AuditTargetType,
  BoostStatus,
  PaymentStatus,
  type Prisma,
} from '../generated/prisma/client.js';
import {
  paginate,
  resolvePage,
  resolveSort,
  type SortOrder,
} from '../common/pagination.js';
import { MAX_EXPORT_ROWS, toCsv, type CsvColumn } from '../common/csv.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { PaymentsService } from '../payments/payments.service.js';
import { BoostService } from '../boost/boost.service.js';
import type { MarkPaymentFailedDto } from './dto/mark-payment-failed.dto.js';
import type { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto.js';
import {
  TRANSACTION_SORT_FIELDS,
  type ListTransactionsDto,
} from './dto/list-transactions.dto.js';

const LIST_INCLUDE = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  ad: { select: { id: true, title: true, sector: true } },
  boost: {
    select: {
      id: true,
      tier: true,
      status: true,
      startAt: true,
      endAt: true,
    },
  },
} satisfies Prisma.PaymentInclude;

function buildWhere(query: ListTransactionsDto): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {};

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    where.OR = [
      { id: query.search },
      { gatewayRef: contains },
      { user: { name: contains } },
      { user: { email: contains } },
      { user: { phone: contains } },
      { ad: { title: contains } },
    ];
  }

  if (query.status?.length) {
    where.status = { in: query.status };
  }
  if (query.gateway?.length) {
    where.gateway = { in: query.gateway };
  }
  if (query.tier?.length) {
    where.boost = { tier: { in: query.tier } };
  }
  if (query.advertiserId) {
    where.userId = query.advertiserId;
  }
  if (query.adId) {
    where.adId = query.adId;
  }
  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    where.amount = { gte: query.minAmount, lte: query.maxAmount };
  }
  if (query.from || query.to) {
    where.createdAt = {
      gte: query.from ? new Date(query.from) : undefined,
      lte: query.to ? new Date(query.to) : undefined,
    };
  }

  return where;
}

function buildOrderBy(
  field: (typeof TRANSACTION_SORT_FIELDS)[number],
  direction: SortOrder,
): Prisma.PaymentOrderByWithRelationInput {
  if (field === 'user') {
    return { user: { name: direction } };
  }
  return { [field]: direction };
}

type PaymentRow = Prisma.PaymentGetPayload<{ include: typeof LIST_INCLUDE }>;

const EXPORT_COLUMNS: CsvColumn<PaymentRow>[] = [
  { header: 'Payment ID', value: (payment) => payment.id },
  { header: 'Created', value: (payment) => payment.createdAt },
  { header: 'Status', value: (payment) => payment.status },
  { header: 'Amount (BDT)', value: (payment) => payment.amount.toString() },
  { header: 'Gateway', value: (payment) => payment.gateway },
  { header: 'Gateway ref', value: (payment) => payment.gatewayRef },
  { header: 'Payer', value: (payment) => payment.user.name },
  { header: 'Payer email', value: (payment) => payment.user.email },
  { header: 'Payer phone', value: (payment) => payment.user.phone },
  { header: 'Ad ID', value: (payment) => payment.ad?.id },
  { header: 'Ad title', value: (payment) => payment.ad?.title },
  { header: 'Boost tier', value: (payment) => payment.boost?.tier },
  { header: 'Boost status', value: (payment) => payment.boost?.status },
  { header: 'Boost ends', value: (payment) => payment.boost?.endAt },
];

@Injectable()
export class AdminTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly payments: PaymentsService,
    private readonly boosts: BoostService,
  ) {}

  async findAll(query: ListTransactionsDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      TRANSACTION_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total, totals] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.payment.count({ where }),
      this.getTotals(where),
    ]);

    return { ...paginate(data, total, page, sort), totals };
  }

  /** Reconciliation summary for the filtered set, not just the current page. */
  private async getTotals(where: Prisma.PaymentWhereInput) {
    const [settled, pending, failed, all, byGateway] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
        _count: { _all: true },
        _avg: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.FAILED },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.payment.groupBy({
        by: ['gateway'],
        where: { ...where, status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    return {
      successAmount: settled._sum.amount?.toString() ?? '0',
      successCount: settled._count._all,
      averageAmount: settled._avg.amount?.toString() ?? '0',
      pendingAmount: pending._sum.amount?.toString() ?? '0',
      failedAmount: failed._sum.amount?.toString() ?? '0',
      countByStatus: Object.fromEntries(
        all.map((group) => [group.status, group._count._all]),
      ),
      byGateway: byGateway.map((group) => ({
        gateway: group.gateway,
        amount: group._sum.amount?.toString() ?? '0',
        count: group._count._all,
      })),
    };
  }

  async exportCsv(query: ListTransactionsDto): Promise<string> {
    const sort = resolveSort(
      TRANSACTION_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );

    const rows = await this.prisma.payment.findMany({
      where: buildWhere(query),
      include: LIST_INCLUDE,
      orderBy: buildOrderBy(sort.field, sort.direction),
      take: MAX_EXPORT_ROWS,
    });

    return toCsv(rows, EXPORT_COLUMNS);
  }

  /**
   * Manual reconciliation for a payment the gateway never resolved — the
   * callback was lost, or the customer abandoned the checkout. Only a PENDING
   * payment can be closed this way: a settled payment is a real money movement
   * and reversing it is a refund, which belongs to the gateway, not this
   * console. Any boost sitting behind it is cancelled in the same transaction
   * so the ad does not stay promoted on an unpaid boost.
   */
  async markFailed(
    id: string,
    dto: MarkPaymentFailedDto,
    actor: AuthenticatedUser,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { boost: true, user: { select: { name: true } } },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException(
        payment.status === PaymentStatus.SUCCESS
          ? 'A settled payment cannot be failed here — refund it through the gateway'
          : 'This payment is already marked failed',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (payment.boost && payment.boost.status === BoostStatus.PENDING) {
        await tx.boost.update({
          where: { id: payment.boost.id },
          data: { status: BoostStatus.CANCELLED },
        });
      }

      return tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.FAILED },
        include: LIST_INCLUDE,
      });
    });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.PAYMENT_MARK_FAILED,
      targetType: AuditTargetType.PAYMENT,
      targetId: id,
      summary: `Marked a ৳${payment.amount.toString()} payment from ${payment.user.name} as failed`,
      metadata: {
        amount: payment.amount.toString(),
        gateway: payment.gateway,
        gatewayRef: payment.gatewayRef,
        adId: payment.adId,
        boostId: payment.boost?.id,
        reason: dto.reason,
      },
    });

    return updated;
  }

  /**
   * Re-asks the gateway what happened to a stuck payment and writes back
   * whatever it says. This is the safe way to resolve a PENDING row whose IPN
   * was lost: the gateway is still the only thing that can settle it, so a
   * payment that never completed stays pending rather than being invented.
   */
  async recheck(id: string, actor: AuthenticatedUser) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: { id: true, status: true, amount: true, gateway: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException(
        'Only a pending payment can be re-checked — this one is already settled',
      );
    }

    const status = await this.payments.recheckWithGateway(id);

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.PAYMENT_GATEWAY_RECHECK,
      targetType: AuditTargetType.PAYMENT,
      targetId: id,
      summary:
        status === PaymentStatus.PENDING
          ? 'Re-checked a payment with the gateway — still pending'
          : `Re-checked a payment with the gateway — settled as ${status.toLowerCase()}`,
      metadata: {
        amount: payment.amount.toString(),
        gateway: payment.gateway,
        resultingStatus: status,
      },
    });

    return this.prisma.payment.findUnique({
      where: { id },
      include: LIST_INCLUDE,
    });
  }

  /**
   * Manual settlement, for money the gateway will not confirm but the admin
   * can account for out of band.
   *
   * This is the one write here that gives something away: it activates the
   * paid boost without a gateway confirmation, so the ledger and PayStation
   * will not agree on this row. It is deliberately recorded under its own
   * audit action, with the admin's evidence, so reconciliation can find every
   * one of them later. Prefer `recheck` — it settles genuinely-paid rows on
   * the gateway's word instead.
   */
  async markPaid(
    id: string,
    dto: MarkPaymentPaidDto,
    actor: AuthenticatedUser,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { boost: true, user: { select: { name: true } } },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException(
        payment.status === PaymentStatus.SUCCESS
          ? 'This payment is already settled'
          : 'A failed payment cannot be settled here — the buyer has to pay again',
      );
    }
    if (!payment.boost) {
      throw new ConflictException(
        'This payment has no boost attached, so there is nothing to activate',
      );
    }

    if (dto.gatewayRef) {
      await this.prisma.payment.update({
        where: { id },
        data: { gatewayRef: dto.gatewayRef },
      });
    }

    // The same activation the IPN runs, so a hand-settled boost behaves
    // exactly like a gateway-settled one: status SUCCESS, boost ACTIVE, and
    // its window starting now.
    await this.boosts.activateOnPaymentSuccess(id);

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.PAYMENT_MARK_PAID,
      targetType: AuditTargetType.PAYMENT,
      targetId: id,
      summary: `Manually settled a ৳${payment.amount.toString()} payment from ${payment.user.name} without gateway confirmation`,
      metadata: {
        amount: payment.amount.toString(),
        gateway: payment.gateway,
        gatewayRef: dto.gatewayRef ?? payment.gatewayRef,
        adId: payment.adId,
        boostId: payment.boost.id,
        boostTier: payment.boost.tier,
        reason: dto.reason,
        gatewayConfirmed: false,
      },
    });

    return this.prisma.payment.findUnique({
      where: { id },
      include: LIST_INCLUDE,
    });
  }
}
