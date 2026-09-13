import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { Role } from '../auth/role.enum.js';
import {
  paginate,
  resolvePage,
  resolveSort,
  type SortOrder,
} from '../common/pagination.js';
import { USER_SORT_FIELDS, type ListUsersDto } from './dto/list-users.dto.js';

const LIST_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isAdvertiser: true,
  isAdmin: true,
  isVerified: true,
  isSuspended: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { ads: true, payments: true, reviewsReceived: true } },
} satisfies Prisma.UserSelect;

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
  } else if (query.role === Role.ADVERTISER) {
    where.isAdvertiser = true;
    where.isAdmin = false;
  } else if (query.role === Role.CUSTOMER) {
    where.isAdvertiser = false;
    where.isAdmin = false;
  }

  if (query.suspended !== undefined) {
    where.isSuspended = query.suspended;
  }
  if (query.verified !== undefined) {
    where.isVerified = query.verified;
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
  if (field === 'ads') {
    return { ads: { _count: direction } };
  }
  return { [field]: direction };
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListUsersDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      USER_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: LIST_SELECT,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(data, total, page, sort);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: LIST_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async suspend(id: string) {
    const user = await this.getUserOrThrow(id);
    if (user.isAdmin) {
      throw new ForbiddenException('Cannot suspend an admin account');
    }
    if (user.isSuspended) {
      throw new ConflictException('User is already suspended');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isSuspended: true },
      select: LIST_SELECT,
    });
  }

  async unsuspend(id: string) {
    const user = await this.getUserOrThrow(id);
    if (!user.isSuspended) {
      throw new ConflictException('User is not suspended');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isSuspended: false },
      select: LIST_SELECT,
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
