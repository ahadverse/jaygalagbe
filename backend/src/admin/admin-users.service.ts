import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { Role } from '../auth/role.enum.js';

export interface ListUsersQuery {
  search?: string;
  role?: Role;
  suspended?: boolean;
}

function buildWhere(query: ListUsersQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.role === Role.ADMIN) {
    where.isAdmin = true;
  } else if (query.role === Role.ADVERTISER) {
    where.isAdvertiser = true;
  } else if (query.role === Role.CUSTOMER) {
    where.isAdvertiser = false;
    where.isAdmin = false;
  }

  if (query.suspended !== undefined) {
    where.isSuspended = query.suspended;
  }

  return where;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListUsersQuery) {
    const users = await this.prisma.user.findMany({
      where: buildWhere(query),
      orderBy: { createdAt: 'desc' },
    });

    return users.map(sanitize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return sanitize(user);
  }

  async suspend(id: string) {
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
    });
    return sanitize(updated);
  }

  async unsuspend(id: string) {
    const user = await this.getUserOrThrow(id);
    if (!user.isSuspended) {
      throw new ConflictException('User is not suspended');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isSuspended: false },
    });
    return sanitize(updated);
  }

  private async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

function sanitize<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
