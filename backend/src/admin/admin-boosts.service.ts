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
import {
  BOOST_SORT_FIELDS,
  EXPIRING_WINDOW_HOURS,
  type ExtendBoostDto,
  type ListBoostsDto,
} from './dto/list-boosts.dto.js';

const LIST_INCLUDE = {
  ad: {
    select: {
      id: true,
      title: true,
      sector: true,
      status: true,
      photos: true,
      locationDistrict: true,
      owner: { select: { id: true, name: true, isSuspended: true } },
    },
  },
  payment: {
    select: {
      id: true,
      amount: true,
      status: true,
      gateway: true,
      gatewayRef: true,
    },
  },
} satisfies Prisma.BoostInclude;

type BoostRow = Prisma.BoostGetPayload<{ include: typeof LIST_INCLUDE }>;

function expiringWindow() {
  const now = new Date();
  return {
    now,
    cutoff: new Date(now.getTime() + EXPIRING_WINDOW_HOURS * 60 * 60 * 1000),
  };
}

function buildWhere(query: ListBoostsDto): Prisma.BoostWhereInput {
  const where: Prisma.BoostWhereInput = {};
  const and: Prisma.BoostWhereInput[] = [];

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    and.push({
      OR: [
        { id: query.search },
        { adId: query.search },
        { ad: { title: contains } },
        { ad: { owner: { name: contains } } },
        { payment: { gatewayRef: contains } },
      ],
    });
  }

  if (query.status?.length) {
    where.status = { in: query.status };
  }
  if (query.tier?.length) {
    where.tier = { in: query.tier };
  }
  if (query.adId) {
    where.adId = query.adId;
  }
  if (query.advertiserId) {
    where.ad = { ownerId: query.advertiserId };
  }
  if (query.expiring) {
    const { now, cutoff } = expiringWindow();
    and.push({
      status: BoostStatus.ACTIVE,
      endAt: { gte: now, lte: cutoff },
    });
  }
  if (query.from || query.to) {
    where.createdAt = {
      gte: query.from ? new Date(query.from) : undefined,
      lte: query.to ? new Date(query.to) : undefined,
    };
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

function buildOrderBy(
  field: (typeof BOOST_SORT_FIELDS)[number],
  direction: SortOrder,
): Prisma.BoostOrderByWithRelationInput {
  return { [field]: direction };
}

const EXPORT_COLUMNS: CsvColumn<BoostRow>[] = [
  { header: 'Boost ID', value: (boost) => boost.id },
  { header: 'Tier', value: (boost) => boost.tier },
  { header: 'Status', value: (boost) => boost.status },
  { header: 'Ad ID', value: (boost) => boost.ad.id },
  { header: 'Ad title', value: (boost) => boost.ad.title },
  { header: 'Ad status', value: (boost) => boost.ad.status },
  { header: 'Advertiser', value: (boost) => boost.ad.owner.name },
  { header: 'District', value: (boost) => boost.ad.locationDistrict },
  { header: 'Amount (BDT)', value: (boost) => boost.payment.amount.toString() },
  { header: 'Payment status', value: (boost) => boost.payment.status },
  { header: 'Gateway', value: (boost) => boost.payment.gateway },
  { header: 'Gateway ref', value: (boost) => boost.payment.gatewayRef },
  { header: 'Starts', value: (boost) => boost.startAt },
  { header: 'Ends', value: (boost) => boost.endAt },
  { header: 'Created', value: (boost) => boost.createdAt },
];

@Injectable()
export class AdminBoostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: ListBoostsDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      BOOST_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total, summary] = await Promise.all([
      this.prisma.boost.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.boost.count({ where }),
      this.getSummary(),
    ]);

    return { ...paginate(data, total, page, sort), summary };
  }

  /**
   * Portfolio-level numbers, deliberately independent of the table's filters:
   * this is the "what is running right now" strip above the list.
   */
  private async getSummary() {
    const { now, cutoff } = expiringWindow();

    const [byStatus, expiringSoon, activeRevenue] = await Promise.all([
      this.prisma.boost.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.boost.count({
        where: { status: BoostStatus.ACTIVE, endAt: { gte: now, lte: cutoff } },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
          boost: { status: BoostStatus.ACTIVE },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      countByStatus: Object.fromEntries(
        byStatus.map((group) => [group.status, group._count._all]),
      ),
      expiringSoon,
      expiringWindowHours: EXPIRING_WINDOW_HOURS,
      activeRevenue: activeRevenue._sum.amount?.toString() ?? '0',
    };
  }

  async exportCsv(query: ListBoostsDto): Promise<string> {
    const sort = resolveSort(
      BOOST_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );

    const rows = await this.prisma.boost.findMany({
      where: buildWhere(query),
      include: LIST_INCLUDE,
      orderBy: buildOrderBy(sort.field, sort.direction),
      take: MAX_EXPORT_ROWS,
    });

    return toCsv(rows, EXPORT_COLUMNS);
  }

  async cancel(id: string, actor: AuthenticatedUser) {
    const boost = await this.getBoostOrThrow(id);

    if (
      boost.status !== BoostStatus.ACTIVE &&
      boost.status !== BoostStatus.PENDING
    ) {
      throw new ConflictException(
        `A ${boost.status.toLowerCase()} boost cannot be cancelled`,
      );
    }

    const updated = await this.prisma.boost.update({
      where: { id },
      data: { status: BoostStatus.CANCELLED, endAt: new Date() },
      include: LIST_INCLUDE,
    });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.BOOST_CANCEL,
      targetType: AuditTargetType.BOOST,
      targetId: id,
      summary: `Cancelled the ${boost.tier} boost on "${boost.ad.title}"`,
      metadata: {
        previousStatus: boost.status,
        adId: boost.adId,
        originalEndAt: boost.endAt,
        paymentId: boost.paymentId,
      },
    });

    return updated;
  }

  /**
   * Goodwill extension — the usual case is a boost that ran while the listing
   * was down. Only an active boost has an end date to push, and the extension
   * is always measured from the current end so days are never silently lost.
   */
  async extend(id: string, dto: ExtendBoostDto, actor: AuthenticatedUser) {
    const boost = await this.getBoostOrThrow(id);

    if (boost.status !== BoostStatus.ACTIVE || !boost.endAt) {
      throw new ConflictException('Only an active boost can be extended');
    }

    const endAt = new Date(
      boost.endAt.getTime() + dto.days * 24 * 60 * 60 * 1000,
    );

    const updated = await this.prisma.boost.update({
      where: { id },
      data: { endAt },
      include: LIST_INCLUDE,
    });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.BOOST_EXTEND,
      targetType: AuditTargetType.BOOST,
      targetId: id,
      summary: `Extended the boost on "${boost.ad.title}" by ${dto.days} day${
        dto.days === 1 ? '' : 's'
      }`,
      metadata: {
        adId: boost.adId,
        days: dto.days,
        previousEndAt: boost.endAt,
        newEndAt: endAt,
        reason: dto.reason,
      },
    });

    return updated;
  }

  private async getBoostOrThrow(id: string) {
    const boost = await this.prisma.boost.findUnique({
      where: { id },
      include: { ad: { select: { id: true, title: true } } },
    });
    if (!boost) {
      throw new NotFoundException('Boost not found');
    }
    return boost;
  }
}
