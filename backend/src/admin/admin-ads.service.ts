import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { validateSectorAttributes } from '../ads/sector-attributes.validator.js';
import { isValidBdLocation } from '../common/bd-geo.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import type { AdminUpdateAdDto } from './dto/admin-update-ad.dto.js';
import {
  AdStatus,
  AuditAction,
  AuditTargetType,
  BoostStatus,
  PaymentStatus,
  ReportStatus,
  type Prisma,
} from '../generated/prisma/client.js';

/** How long a submission may sit in the review queue before it is overdue. */
export const REVIEW_SLA_HOURS = 24;
import {
  paginate,
  resolvePage,
  resolveSort,
  type Paginated,
  type SortOrder,
} from '../common/pagination.js';
import { MAX_EXPORT_ROWS, toCsv, type CsvColumn } from '../common/csv.js';
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

type AdRow = Prisma.AdGetPayload<{ include: typeof LIST_INCLUDE }>;

const EXPORT_COLUMNS: CsvColumn<AdRow>[] = [
  { header: 'ID', value: (ad) => ad.id },
  { header: 'Title', value: (ad) => ad.title },
  { header: 'Sector', value: (ad) => ad.sector },
  { header: 'Status', value: (ad) => ad.status },
  { header: 'Price (BDT)', value: (ad) => ad.price.toString() },
  { header: 'District', value: (ad) => ad.locationDistrict },
  { header: 'Area', value: (ad) => ad.locationArea },
  { header: 'Advertiser', value: (ad) => ad.owner.name },
  { header: 'Advertiser email', value: (ad) => ad.owner.email },
  { header: 'Advertiser phone', value: (ad) => ad.owner.phone },
  {
    header: 'Advertiser suspended',
    value: (ad) => (ad.owner.isSuspended ? 'Yes' : 'No'),
  },
  { header: 'Reports', value: (ad) => ad._count.reports },
  { header: 'Chats', value: (ad) => ad._count.conversations },
  { header: 'Visits', value: (ad) => ad._count.visits },
  { header: 'Boosted', value: (ad) => (ad.boosts.length > 0 ? 'Yes' : 'No') },
  { header: 'Rejection reason', value: (ad) => ad.rejectionReason },
  { header: 'Posted', value: (ad) => ad.createdAt },
  { header: 'Updated', value: (ad) => ad.updatedAt },
];

/** Fields an edit reports as changed, in the order they read on screen. */
const TRACKED_FIELDS = [
  'title',
  'description',
  'price',
  'locationDivision',
  'locationDistrict',
  'locationArea',
  'address',
  'photos',
] as const;

@Injectable()
export class AdminAdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Admin edit of someone else's listing — fixing a typo'd price or a wrong
   * district, rather than making the advertiser resubmit.
   *
   * Unlike an owner edit this does *not* send a live ad back to PENDING: the
   * change was made by a moderator, so re-reviewing their own work is noise.
   * Every changed field is recorded with its old and new value.
   */
  async update(id: string, dto: AdminUpdateAdDto, actor: AuthenticatedUser) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    if (dto.attributes) {
      validateSectorAttributes(ad.sector, dto.attributes);
    }

    // A partial edit may send only one of the three location parts, so the
    // stored values fill the gaps before the combination is checked.
    if (dto.locationDivision || dto.locationDistrict || dto.locationArea) {
      const division = dto.locationDivision ?? ad.locationDivision ?? undefined;
      const district = dto.locationDistrict ?? ad.locationDistrict;
      const area = dto.locationArea ?? ad.locationArea;
      if (!isValidBdLocation(division, district, area)) {
        throw new BadRequestException(
          'Pick a real division, district and thana combination',
        );
      }
    }

    const data: Prisma.AdUpdateInput = {
      title: dto.title,
      description: dto.description,
      price: dto.price,
      locationDivision: dto.locationDivision,
      locationDistrict: dto.locationDistrict,
      locationArea: dto.locationArea,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      photos: dto.photos,
      attributes: dto.attributes as Prisma.InputJsonValue | undefined,
    };

    const updated = await this.prisma.ad.update({ where: { id }, data });

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const field of TRACKED_FIELDS) {
      if (dto[field] === undefined) continue;
      const before = ad[field];
      const after = updated[field];
      const same =
        Array.isArray(before) && Array.isArray(after)
          ? before.join('\u0000') === after.join('\u0000')
          : String(before) === String(after);
      if (!same) {
        changes[field] = { from: before, to: after };
      }
    }
    if (dto.attributes !== undefined) {
      changes.attributes = { from: ad.attributes, to: updated.attributes };
    }

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.AD_EDIT,
      targetType: AuditTargetType.AD,
      targetId: id,
      summary: `Edited "${updated.title}" — ${
        Object.keys(changes).join(', ') || 'no field changed'
      }`,
      metadata: { ownerId: ad.ownerId, reason: dto.reason, changes },
    });

    return updated;
  }

  /**
   * Permanent delete. Take-down (status REMOVED) is the normal tool — this is
   * for content that must not exist at all, like a listing full of someone
   * else's photos.
   *
   * Refused once money is attached: a settled payment is an accounting record
   * and the listing it names has to stay resolvable. Those get taken down.
   */
  async remove(id: string, actor: AuthenticatedUser, batchId?: string) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: {
        _count: { select: { reports: true, conversations: true } },
        payments: { select: { id: true, status: true } },
      },
    });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    const settled = ad.payments.filter(
      (payment) => payment.status === PaymentStatus.SUCCESS,
    );
    if (settled.length > 0) {
      throw new ConflictException(
        'This listing has settled payments against it and cannot be deleted — take it down instead',
      );
    }

    // Dependents have no cascade in the schema, so they go first, in one
    // transaction: a half-deleted ad would leave orphaned rows pointing at
    // an id that no longer resolves.
    await this.prisma.$transaction(async (tx) => {
      const conversations = await tx.conversation.findMany({
        where: { adId: id },
        select: { id: true },
      });
      const conversationIds = conversations.map((row) => row.id);

      if (conversationIds.length > 0) {
        await tx.message.deleteMany({
          where: { conversationId: { in: conversationIds } },
        });
        await tx.conversation.deleteMany({ where: { adId: id } });
      }

      await tx.adConversion.deleteMany({ where: { adId: id } });
      await tx.adVisit.deleteMany({ where: { adId: id } });
      await tx.adImpression.deleteMany({ where: { adId: id } });
      await tx.report.deleteMany({ where: { adId: id } });
      await tx.boost.deleteMany({ where: { adId: id } });
      await tx.payment.deleteMany({ where: { adId: id } });
      await tx.ad.delete({ where: { id } });
    });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.AD_DELETE,
      targetType: AuditTargetType.AD,
      targetId: id,
      summary: `Permanently deleted "${ad.title}"`,
      metadata: {
        ownerId: ad.ownerId,
        status: ad.status,
        price: ad.price.toString(),
        reportsRemoved: ad._count.reports,
        conversationsRemoved: ad._count.conversations,
        batchId,
      },
    });
  }

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

  async exportCsv(query: ListAdsDto): Promise<string> {
    const sort = resolveSort(
      AD_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );

    const rows = await this.prisma.ad.findMany({
      where: buildWhere(query),
      include: LIST_INCLUDE,
      orderBy: buildOrderBy(sort.field, sort.direction),
      take: MAX_EXPORT_ROWS,
    });

    return toCsv(rows, EXPORT_COLUMNS);
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

  /**
   * Counts and queue health for the sidebar badges and the review-queue
   * header. `breachedSla` is the number the moderator on shift actually cares
   * about: listings that have been waiting longer than the target.
   */
  async getStatusCounts() {
    const slaCutoff = new Date(Date.now() - REVIEW_SLA_HOURS * 60 * 60 * 1000);

    const [byStatus, pendingReports, oldestPending, breachedSla] =
      await Promise.all([
        this.prisma.ad.groupBy({ by: ['status'], _count: { _all: true } }),
        this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
        this.prisma.ad.findFirst({
          where: { status: AdStatus.PENDING },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        }),
        this.prisma.ad.count({
          where: { status: AdStatus.PENDING, createdAt: { lt: slaCutoff } },
        }),
      ]);

    return {
      byStatus: Object.fromEntries(
        byStatus.map((group) => [group.status, group._count._all]),
      ),
      pendingReports,
      oldestPendingAt: oldestPending?.createdAt ?? null,
      breachedSla,
      slaHours: REVIEW_SLA_HOURS,
    };
  }
}
