import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import {
  paginate,
  resolvePage,
  resolveSort,
  type SortOrder,
} from '../common/pagination.js';
import { MAX_EXPORT_ROWS, toCsv, type CsvColumn } from '../common/csv.js';
import { AUDIT_SORT_FIELDS, type ListAuditDto } from './dto/list-audit.dto.js';

const LIST_INCLUDE = {
  actor: { select: { id: true, name: true, email: true } },
} satisfies Prisma.AdminAuditLogInclude;

type AuditRow = Prisma.AdminAuditLogGetPayload<{ include: typeof LIST_INCLUDE }>;

const RECENT_ACTIVITY_LIMIT = 8;

function buildWhere(query: ListAuditDto): Prisma.AdminAuditLogWhereInput {
  const where: Prisma.AdminAuditLogWhereInput = {};

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    where.OR = [
      { id: query.search },
      { targetId: query.search },
      { summary: contains },
      { actor: { name: contains } },
      { actor: { email: contains } },
    ];
  }

  if (query.action?.length) {
    where.action = { in: query.action };
  }
  if (query.targetType?.length) {
    where.targetType = { in: query.targetType };
  }
  if (query.actorId) {
    where.actorId = query.actorId;
  }
  if (query.targetId) {
    where.targetId = query.targetId;
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
  field: (typeof AUDIT_SORT_FIELDS)[number],
  direction: SortOrder,
): Prisma.AdminAuditLogOrderByWithRelationInput {
  if (field === 'actor') {
    return { actor: { name: direction } };
  }
  return { [field]: direction };
}

const EXPORT_COLUMNS: CsvColumn<AuditRow>[] = [
  { header: 'When', value: (entry) => entry.createdAt },
  { header: 'Admin', value: (entry) => entry.actor.name },
  { header: 'Admin email', value: (entry) => entry.actor.email },
  { header: 'Action', value: (entry) => entry.action },
  { header: 'Target type', value: (entry) => entry.targetType },
  { header: 'Target ID', value: (entry) => entry.targetId },
  { header: 'Summary', value: (entry) => entry.summary },
  {
    header: 'Detail',
    value: (entry) => (entry.metadata ? JSON.stringify(entry.metadata) : ''),
  },
];

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListAuditDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      AUDIT_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total, countByAction] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.adminAuditLog.count({ where }),
      this.prisma.adminAuditLog.groupBy({
        by: ['action'],
        where,
        _count: { _all: true },
      }),
    ]);

    return {
      ...paginate(data, total, page, sort),
      countByAction: Object.fromEntries(
        countByAction.map((group) => [group.action, group._count._all]),
      ),
    };
  }

  async exportCsv(query: ListAuditDto): Promise<string> {
    const sort = resolveSort(
      AUDIT_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );

    const rows = await this.prisma.adminAuditLog.findMany({
      where: buildWhere(query),
      include: LIST_INCLUDE,
      orderBy: buildOrderBy(sort.field, sort.direction),
      take: MAX_EXPORT_ROWS,
    });

    return toCsv(rows, EXPORT_COLUMNS);
  }

  /** The dashboard's "recent admin activity" strip. */
  findRecent() {
    return this.prisma.adminAuditLog.findMany({
      include: LIST_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: RECENT_ACTIVITY_LIMIT,
    });
  }

  /** Distinct admins who have ever acted, for the actor filter dropdown. */
  async findActors() {
    const groups = await this.prisma.adminAuditLog.groupBy({
      by: ['actorId'],
      _count: { _all: true },
    });
    if (groups.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: groups.map((group) => group.actorId) } },
      select: { id: true, name: true },
    });
    const countById = new Map(
      groups.map((group) => [group.actorId, group._count._all]),
    );

    return users
      .map((user) => ({ ...user, entryCount: countById.get(user.id) ?? 0 }))
      .sort((a, b) => b.entryCount - a.entryCount);
  }
}
