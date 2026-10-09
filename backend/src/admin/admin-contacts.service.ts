import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ContactMessageStatus,
  type Prisma,
} from '../generated/prisma/client.js';
import { isObjectId } from '../common/object-id.js';
import { paginate, resolvePage, resolveSort } from '../common/pagination.js';
import { MAX_EXPORT_ROWS, toCsv, type CsvColumn } from '../common/csv.js';
import {
  CONTACT_SORT_FIELDS,
  type ListContactsDto,
} from './dto/list-contacts.dto.js';

function buildWhere(query: ListContactsDto): Prisma.ContactMessageWhereInput {
  const where: Prisma.ContactMessageWhereInput = {};

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    where.OR = [
      ...(isObjectId(query.search) ? [{ id: query.search }] : []),
      { name: contains },
      { email: contains },
      { phone: contains },
      { message: contains },
    ];
  }
  if (query.status?.length) where.status = { in: query.status };
  if (query.topic?.length) where.topic = { in: query.topic };
  if (query.from || query.to) {
    where.createdAt = {
      gte: query.from ? new Date(query.from) : undefined,
      lte: query.to ? new Date(query.to) : undefined,
    };
  }
  return where;
}

type ContactRow = Prisma.ContactMessageGetPayload<object>;

const EXPORT_COLUMNS: CsvColumn<ContactRow>[] = [
  { header: 'ID', value: (row) => row.id },
  { header: 'Received', value: (row) => row.createdAt },
  { header: 'Status', value: (row) => row.status },
  { header: 'Name', value: (row) => row.name },
  { header: 'Email', value: (row) => row.email },
  { header: 'Phone', value: (row) => row.phone },
  { header: 'Topic', value: (row) => row.topic },
  { header: 'Message', value: (row) => row.message },
];

@Injectable()
export class AdminContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListContactsDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      CONTACT_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total, countByStatus] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { [sort.field]: sort.direction },
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    return {
      ...paginate(data, total, page, sort),
      countByStatus: Object.fromEntries(
        countByStatus.map((group) => [group.status, group._count._all]),
      ),
    };
  }

  async exportCsv(query: ListContactsDto): Promise<string> {
    const sort = resolveSort(
      CONTACT_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const rows = await this.prisma.contactMessage.findMany({
      where: buildWhere(query),
      orderBy: { [sort.field]: sort.direction },
      take: MAX_EXPORT_ROWS,
    });
    return toCsv(rows, EXPORT_COLUMNS);
  }

  async setStatus(id: string, status: ContactMessageStatus) {
    const existing = await this.prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Message not found');
    await this.prisma.contactMessage.delete({ where: { id } });
  }

  async bulk(action: 'RESOLVED' | 'OPENED' | 'NEW' | 'DELETE', ids: string[]) {
    const where = { id: { in: ids } };
    const result =
      action === 'DELETE'
        ? await this.prisma.contactMessage.deleteMany({ where })
        : await this.prisma.contactMessage.updateMany({
            where,
            data: { status: action as ContactMessageStatus },
          });
    return {
      batchId: randomUUID(),
      requested: ids.length,
      succeeded: ids.slice(0, result.count),
      failed: ids
        .slice(result.count)
        .map((id) => ({ id, reason: 'Message not found' })),
    };
  }
}
