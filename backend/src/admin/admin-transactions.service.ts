import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentStatus, type Prisma } from '../generated/prisma/client.js';
import {
  paginate,
  resolvePage,
  resolveSort,
  type SortOrder,
} from '../common/pagination.js';
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

@Injectable()
export class AdminTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const [settled, all] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
    ]);

    return {
      successAmount: settled._sum.amount?.toString() ?? '0',
      successCount: settled._count._all,
      countByStatus: Object.fromEntries(
        all.map((group) => [group.status, group._count._all]),
      ),
    };
  }
}
