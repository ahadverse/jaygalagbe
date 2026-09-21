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
  REVIEW_SORT_FIELDS,
  type ListReviewsDto,
} from './dto/list-reviews.dto.js';

const LIST_INCLUDE = {
  advertiser: {
    select: { id: true, name: true, email: true, isSuspended: true },
  },
  customer: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ReviewInclude;

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof LIST_INCLUDE }>;

/** A one-star review with a comment is the usual moderation trigger. */
const LOW_RATING_CEILING = 2;

function buildWhere(query: ListReviewsDto): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = {};

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    where.OR = [
      { id: query.search },
      { comment: contains },
      { advertiser: { name: contains } },
      { customer: { name: contains } },
    ];
  }

  if (query.minRating !== undefined || query.maxRating !== undefined) {
    where.rating = { gte: query.minRating, lte: query.maxRating };
  }
  if (query.hidden !== undefined) {
    where.isHidden = query.hidden;
  }
  if (query.hasComment !== undefined) {
    where.comment = query.hasComment ? { not: null } : null;
  }
  if (query.advertiserId) {
    where.advertiserId = query.advertiserId;
  }
  if (query.customerId) {
    where.customerId = query.customerId;
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
  field: (typeof REVIEW_SORT_FIELDS)[number],
  direction: SortOrder,
): Prisma.ReviewOrderByWithRelationInput {
  return { [field]: direction };
}

const EXPORT_COLUMNS: CsvColumn<ReviewRow>[] = [
  { header: 'ID', value: (review) => review.id },
  { header: 'Rating', value: (review) => review.rating },
  { header: 'Comment', value: (review) => review.comment },
  { header: 'Hidden', value: (review) => (review.isHidden ? 'Yes' : 'No') },
  { header: 'Advertiser', value: (review) => review.advertiser.name },
  { header: 'Advertiser ID', value: (review) => review.advertiser.id },
  { header: 'Customer', value: (review) => review.customer.name },
  { header: 'Customer ID', value: (review) => review.customer.id },
  { header: 'Left at', value: (review) => review.createdAt },
  { header: 'Updated', value: (review) => review.updatedAt },
];

@Injectable()
export class AdminReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: ListReviewsDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      REVIEW_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total, summary] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.review.count({ where }),
      this.getSummary(),
    ]);

    return { ...paginate(data, total, page, sort), summary };
  }

  private async getSummary() {
    const [overall, hidden, lowRated, distribution] = await Promise.all([
      this.prisma.review.aggregate({
        where: { isHidden: false },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.prisma.review.count({ where: { isHidden: true } }),
      this.prisma.review.count({
        where: { isHidden: false, rating: { lte: LOW_RATING_CEILING } },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { isHidden: false },
        _count: { _all: true },
      }),
    ]);

    return {
      averageRating: overall._avg.rating ?? 0,
      visibleCount: overall._count._all,
      hiddenCount: hidden,
      lowRatedCount: lowRated,
      lowRatingCeiling: LOW_RATING_CEILING,
      // Always all five buckets, so the chart never changes shape.
      distribution: [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count:
          distribution.find((group) => group.rating === rating)?._count._all ??
          0,
      })),
    };
  }

  async exportCsv(query: ListReviewsDto): Promise<string> {
    const sort = resolveSort(
      REVIEW_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );

    const rows = await this.prisma.review.findMany({
      where: buildWhere(query),
      include: LIST_INCLUDE,
      orderBy: buildOrderBy(sort.field, sort.direction),
      take: MAX_EXPORT_ROWS,
    });

    return toCsv(rows, EXPORT_COLUMNS);
  }

  /**
   * Hiding, never deleting: a hidden review drops out of the advertiser's
   * public rating but the row survives, so a disputed take-down can be
   * reversed and the original text is still there to point at.
   */
  async setHidden(id: string, isHidden: boolean, actor: AuthenticatedUser) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { advertiser: { select: { name: true } } },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.isHidden === isHidden) {
      throw new ConflictException(
        isHidden ? 'Review is already hidden' : 'Review is already visible',
      );
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: { isHidden },
      include: LIST_INCLUDE,
    });

    await this.audit.record({
      actorId: actor.id,
      action: isHidden ? AuditAction.REVIEW_HIDE : AuditAction.REVIEW_UNHIDE,
      targetType: AuditTargetType.REVIEW,
      targetId: id,
      summary: `${isHidden ? 'Hid' : 'Restored'} a ${review.rating}-star review of ${review.advertiser.name}`,
      metadata: {
        rating: review.rating,
        comment: review.comment,
        advertiserId: review.advertiserId,
        customerId: review.customerId,
      },
    });

    return updated;
  }

  /**
   * Permanent delete, for a review that should never have existed — abuse,
   * or someone's phone number in the comment. Hiding is the usual tool and
   * is reversible; this is not, so the text is copied into the audit entry
   * before the row goes.
   */
  async remove(id: string, actor: AuthenticatedUser) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        advertiser: { select: { name: true } },
        customer: { select: { name: true } },
      },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.delete({ where: { id } });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.REVIEW_DELETE,
      targetType: AuditTargetType.REVIEW,
      targetId: id,
      summary: `Permanently deleted a ${review.rating}-star review of ${review.advertiser.name}`,
      metadata: {
        rating: review.rating,
        comment: review.comment,
        wasHidden: review.isHidden,
        advertiserId: review.advertiserId,
        advertiserName: review.advertiser.name,
        customerId: review.customerId,
        customerName: review.customer.name,
        leftAt: review.createdAt,
      },
    });
  }
}
