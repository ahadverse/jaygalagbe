import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  BoostStatus,
  ReportStatus,
  type Prisma,
} from '../generated/prisma/client.js';
import {
  paginate,
  resolvePage,
  resolveSort,
  type Paginated,
  type SortOrder,
} from '../common/pagination.js';
import { AD_SORT_FIELDS, type ListAdsDto } from './dto/list-ads.dto.js';

const LIST_INCLUDE = {
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isSuspended: true,
    },
  },
  boosts: {
    where: { status: BoostStatus.ACTIVE },
    select: { id: true, tier: true, endAt: true },
    orderBy: { endAt: 'desc' },
    take: 1,
  },
  _count: { select: { reports: true, conversations: true, visits: true } },
} satisfies Prisma.AdInclude;

function buildWhere(query: ListAdsDto): Prisma.AdWhereInput {
  const where: Prisma.AdWhereInput = {};
  const and: Prisma.AdWhereInput[] = [];

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    and.push({
      OR: [
        { id: query.search },
        { title: contains },
        { description: contains },
        { locationArea: contains },
        { locationDistrict: contains },
        { owner: { name: contains } },
        { owner: { email: contains } },
        { owner: { phone: contains } },
      ],
    });
  }

  if (query.status?.length) {
    where.status = { in: query.status };
  }
  if (query.sector?.length) {
    where.sector = { in: query.sector };
  }
  if (query.district) {
    where.locationDistrict = { equals: query.district, mode: 'insensitive' };
  }
  if (query.area) {
    where.locationArea = { contains: query.area, mode: 'insensitive' };
  }
  if (query.ownerId) {
    where.ownerId = query.ownerId;
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = { gte: query.minPrice, lte: query.maxPrice };
  }
  if (query.from || query.to) {
    where.createdAt = {
      gte: query.from ? new Date(query.from) : undefined,
      lte: query.to ? new Date(query.to) : undefined,
    };
  }
  if (query.boosted !== undefined) {
    const activeBoost: Prisma.BoostWhereInput = {
      status: BoostStatus.ACTIVE,
      endAt: { gt: new Date() },
    };
    and.push(
      query.boosted
        ? { boosts: { some: activeBoost } }
        : { boosts: { none: activeBoost } },
    );
  }
  if (query.reported !== undefined) {
    and.push(query.reported ? { reports: { some: {} } } : { reports: { none: {} } });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

function buildOrderBy(
  field: (typeof AD_SORT_FIELDS)[number],
  direction: SortOrder,
): Prisma.AdOrderByWithRelationInput {
  switch (field) {
    case 'owner':
      return { owner: { name: direction } };
    case 'reports':
      return { reports: { _count: direction } };
    default:
      return { [field]: direction };
  }
}

@Injectable()
export class AdminAdsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListAdsDto): Promise<Paginated<unknown>> {
    const page = resolvePage(query);
    const sort = resolveSort(
      AD_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.ad.count({ where }),
    ]);

    return paginate(data, total, page, sort);
  }

  /** Distinct districts across all ads, for the district filter dropdown. */
  async findDistricts(): Promise<string[]> {
    const rows = await this.prisma.ad.findMany({
      distinct: ['locationDistrict'],
      select: { locationDistrict: true },
      orderBy: { locationDistrict: 'asc' },
    });
    return rows.map((row) => row.locationDistrict);
  }

  async findOne(id: string) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isAdvertiser: true,
            isSuspended: true,
            createdAt: true,
          },
        },
        boosts: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            tier: true,
            status: true,
            startAt: true,
            endAt: true,
          },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: {
            reports: true,
            conversations: true,
            impressions: true,
            visits: true,
            conversions: true,
          },
        },
      },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return ad;
  }

  /** Counts for the queue tabs/badges, computed under the same filters. */
  async getStatusCounts() {
    const [byStatus, pendingReports] = await Promise.all([
      this.prisma.ad.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
    ]);

    return {
      byStatus: Object.fromEntries(
        byStatus.map((group) => [group.status, group._count._all]),
      ),
      pendingReports,
    };
  }
}
