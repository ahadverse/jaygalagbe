import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  AuditAction,
  AuditTargetType,
  PaymentStatus,
  type Prisma,
} from '../generated/prisma/client.js';

/** How many rows each list in the account drawer carries. */
const DETAIL_LIST_LIMIT = 10;

/** `reviewsGiven` → `reviews given`, for the delete refusal message. */
function humanizeRelation(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').toLowerCase();
}
import { Role } from '../auth/role.enum.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import {
  paginate,
  resolvePage,
  resolveSort,
  type SortOrder,
} from '../common/pagination.js';
import { MAX_EXPORT_ROWS, toCsv, type CsvColumn } from '../common/csv.js';
import { USER_SORT_FIELDS, type ListUsersDto } from './dto/list-users.dto.js';
import type { AdminUpdateUserDto } from './dto/admin-update-user.dto.js';

const LIST_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isAdmin: true,
  isVerified: true,
  isSuspended: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { ads: true, payments: true, reviewsReceived: true } },
} satisfies Prisma.UserSelect;

type UserRow = Prisma.UserGetPayload<{ select: typeof LIST_SELECT }>;

function buildWhere(query: ListUsersDto): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    where.OR = [
      { id: query.search },
      { name: contains },
      { email: contains },
      { phone: contains },
    ];
  }

  if (query.role === Role.ADMIN) {
    where.isAdmin = true;
  } else if (query.role === Role.USER) {
    where.isAdmin = false;
  }

  if (query.suspended !== undefined) {
    where.isSuspended = query.suspended;
  }
  if (query.verified !== undefined) {
    where.isVerified = query.verified;
  }
  if (query.hasAds !== undefined) {
    where.ads = query.hasAds ? { some: {} } : { none: {} };
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
  field: (typeof USER_SORT_FIELDS)[number],
  direction: SortOrder,
): Prisma.UserOrderByWithRelationInput {
  switch (field) {
    case 'ads':
      return { ads: { _count: direction } };
    case 'payments':
      return { payments: { _count: direction } };
    default:
      return { [field]: direction };
  }
}

const EXPORT_COLUMNS: CsvColumn<UserRow>[] = [
  { header: 'ID', value: (user) => user.id },
  { header: 'Name', value: (user) => user.name },
  { header: 'Email', value: (user) => user.email },
  { header: 'Phone', value: (user) => user.phone },
  { header: 'Role', value: (user) => (user.isAdmin ? 'Admin' : 'Member') },
  { header: 'Verified', value: (user) => (user.isVerified ? 'Yes' : 'No') },
  { header: 'Suspended', value: (user) => (user.isSuspended ? 'Yes' : 'No') },
  { header: 'Ads', value: (user) => user._count.ads },
  { header: 'Payments', value: (user) => user._count.payments },
  { header: 'Reviews received', value: (user) => user._count.reviewsReceived },
  { header: 'Joined', value: (user) => user.createdAt },
];

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: ListUsersDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      USER_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total, counts] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: LIST_SELECT,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.user.count({ where }),
      this.getCounts(),
    ]);

    return { ...paginate(data, total, page, sort), counts };
  }

  /** Headline counts for the page's summary strip, unaffected by filters. */
  private async getCounts() {
    const [total, admins, suspended, unverified] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isAdmin: true } }),
      this.prisma.user.count({ where: { isSuspended: true } }),
      this.prisma.user.count({ where: { isVerified: false } }),
    ]);
    return { total, admins, suspended, unverified };
  }

  async exportCsv(query: ListUsersDto): Promise<string> {
    const sort = resolveSort(
      USER_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );

    const rows = await this.prisma.user.findMany({
      where: buildWhere(query),
      select: LIST_SELECT,
      orderBy: buildOrderBy(sort.field, sort.direction),
      take: MAX_EXPORT_ROWS,
    });

    return toCsv(rows, EXPORT_COLUMNS);
  }

  /**
   * Everything the account drawer shows in one round trip: the profile, what
   * they have posted and paid, and how often they have been complained about.
   * Lists are capped — this is a summary to act on, not an archive.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...LIST_SELECT,
        _count: {
          select: {
            ads: true,
            payments: true,
            reviewsReceived: true,
            reviewsGiven: true,
            reportsFiled: true,
            customerConversations: true,
            advertiserConversations: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [ads, payments, reviews, reportsAgainst, spend, adsByStatus] =
      await Promise.all([
        this.prisma.ad.findMany({
          where: { ownerId: id },
          orderBy: { createdAt: 'desc' },
          take: DETAIL_LIST_LIMIT,
          select: {
            id: true,
            title: true,
            status: true,
            sector: true,
            price: true,
            photos: true,
            createdAt: true,
            _count: { select: { reports: true } },
          },
        }),
        this.prisma.payment.findMany({
          where: { userId: id },
          orderBy: { createdAt: 'desc' },
          take: DETAIL_LIST_LIMIT,
          select: {
            id: true,
            amount: true,
            status: true,
            gateway: true,
            createdAt: true,
            ad: { select: { id: true, title: true } },
          },
        }),
        this.prisma.review.findMany({
          where: { advertiserId: id },
          orderBy: { createdAt: 'desc' },
          take: DETAIL_LIST_LIMIT,
          select: {
            id: true,
            rating: true,
            comment: true,
            isHidden: true,
            createdAt: true,
            customer: { select: { id: true, name: true } },
          },
        }),
        // Reports filed *against* this person's listings — the number that
        // decides whether an account is a problem.
        this.prisma.report.count({ where: { ad: { ownerId: id } } }),
        this.prisma.payment.aggregate({
          where: { userId: id, status: PaymentStatus.SUCCESS },
          _sum: { amount: true },
        }),
        this.prisma.ad.groupBy({
          by: ['status'],
          where: { ownerId: id },
          _count: { _all: true },
        }),
      ]);

    const ratings = await this.prisma.review.aggregate({
      where: { advertiserId: id, isHidden: false },
      _avg: { rating: true },
      _count: { _all: true },
    });

    return {
      ...user,
      ads,
      payments,
      reviews,
      stats: {
        reportsAgainst,
        totalSpend: spend._sum.amount?.toString() ?? '0',
        averageRating: ratings._avg.rating,
        ratedCount: ratings._count._all,
        adsByStatus: Object.fromEntries(
          adsByStatus.map((group) => [group.status, group._count._all]),
        ),
      },
    };
  }

  async suspend(id: string, actor: AuthenticatedUser, batchId?: string) {
    const user = await this.getUserOrThrow(id);
    if (user.isAdmin) {
      throw new ForbiddenException('Cannot suspend an admin account');
    }
    if (user.isSuspended) {
      throw new ConflictException('User is already suspended');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isSuspended: true },
      select: LIST_SELECT,
    });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_SUSPEND,
      targetType: AuditTargetType.USER,
      targetId: id,
      summary: `Suspended ${user.name}`,
      metadata: { email: user.email, phone: user.phone, batchId },
    });

    return updated;
  }

  async unsuspend(id: string, actor: AuthenticatedUser, batchId?: string) {
    const user = await this.getUserOrThrow(id);
    if (!user.isSuspended) {
      throw new ConflictException('User is not suspended');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isSuspended: false },
      select: LIST_SELECT,
    });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_UNSUSPEND,
      targetType: AuditTargetType.USER,
      targetId: id,
      summary: `Restored ${user.name}`,
      metadata: { email: user.email, phone: user.phone, batchId },
    });

    return updated;
  }

  /**
   * Granting admin hands over the whole console, so it is deliberately the one
   * action an admin cannot perform on themselves in either direction: you
   * cannot self-promote (you already are one) and you cannot self-demote and
   * leave the console without the account that was mid-session.
   */
  async setAdmin(id: string, isAdmin: boolean, actor: AuthenticatedUser) {
    const user = await this.getUserOrThrow(id);

    if (user.id === actor.id) {
      throw new ForbiddenException(
        'You cannot change your own admin access — ask another admin',
      );
    }
    if (user.isAdmin === isAdmin) {
      throw new ConflictException(
        isAdmin ? 'User is already an admin' : 'User is not an admin',
      );
    }
    if (isAdmin && user.isSuspended) {
      throw new ConflictException(
        'Restore this account before granting admin access',
      );
    }
    if (!isAdmin) {
      const remaining = await this.prisma.user.count({
        where: { isAdmin: true, id: { not: id } },
      });
      if (remaining === 0) {
        throw new ConflictException(
          'This is the last admin account — promote someone else first',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: LIST_SELECT,
    });

    await this.audit.record({
      actorId: actor.id,
      action: isAdmin
        ? AuditAction.USER_GRANT_ADMIN
        : AuditAction.USER_REVOKE_ADMIN,
      targetType: AuditTargetType.USER,
      targetId: id,
      summary: `${isAdmin ? 'Granted' : 'Revoked'} admin access ${
        isAdmin ? 'to' : 'from'
      } ${user.name}`,
      metadata: { email: user.email },
    });

    return updated;
  }

  /** Correcting contact details or verifying by hand. */
  async update(id: string, dto: AdminUpdateUserDto, actor: AuthenticatedUser) {
    const user = await this.getUserOrThrow(id);

    // Both columns are unique, so a clash has to be reported as a conflict
    // rather than surfacing as a raw constraint violation.
    for (const field of ['email', 'phone'] as const) {
      const value = dto[field];
      if (value === undefined || value === user[field]) continue;
      const taken = await this.prisma.user.findFirst({
        where: { [field]: value, id: { not: id } },
        select: { id: true },
      });
      if (taken) {
        throw new ConflictException(
          `Another account already uses that ${field}`,
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        isVerified: dto.isVerified,
      },
      select: LIST_SELECT,
    });

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const field of ['name', 'email', 'phone', 'isVerified'] as const) {
      if (dto[field] !== undefined && user[field] !== updated[field]) {
        changes[field] = { from: user[field], to: updated[field] };
      }
    }

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_EDIT,
      targetType: AuditTargetType.USER,
      targetId: id,
      summary: `Edited ${updated.name} — ${
        Object.keys(changes).join(', ') || 'no field changed'
      }`,
      metadata: { reason: dto.reason, changes },
    });

    return updated;
  }

  /**
   * Permanent delete, for junk signups only.
   *
   * An account that has posted, paid, talked to someone or been reviewed is
   * referenced from rows that have to stay readable, and an admin who has
   * acted is pinned by the audit log's own foreign key. Suspension is the
   * tool for a real account; this only clears the noise.
   */
  async remove(id: string, actor: AuthenticatedUser, batchId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            ads: true,
            payments: true,
            reviewsGiven: true,
            reviewsReceived: true,
            reportsFiled: true,
            sentMessages: true,
            customerConversations: true,
            advertiserConversations: true,
            auditEntries: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.id === actor.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    if (user.isAdmin) {
      throw new ForbiddenException(
        'Revoke admin access before deleting this account',
      );
    }

    const blockers = Object.entries(user._count).filter(
      ([, count]) => count > 0,
    );
    if (blockers.length > 0) {
      const parts = blockers.map(
        ([name, count]) => `${count} ${humanizeRelation(name)}`,
      );
      const listed =
        parts.length === 1
          ? parts[0]
          : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
      throw new ConflictException(
        `This account still has ${listed} — suspend it instead of deleting it`,
      );
    }

    // Analytics rows carry a nullable viewer, so they are detached rather
    // than deleted: the impression still happened.
    await this.prisma.$transaction(async (tx) => {
      await tx.adImpression.updateMany({
        where: { viewerId: id },
        data: { viewerId: null },
      });
      await tx.adVisit.updateMany({
        where: { viewerId: id },
        data: { viewerId: null },
      });
      await tx.user.delete({ where: { id } });
    });

    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.USER_DELETE,
      targetType: AuditTargetType.USER,
      targetId: id,
      summary: `Permanently deleted the empty account ${user.name}`,
      metadata: {
        email: user.email,
        phone: user.phone,
        joined: user.createdAt,
        batchId,
      },
    });
  }

  private async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
