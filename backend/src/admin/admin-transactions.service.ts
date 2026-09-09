import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma, PaymentStatus } from '../generated/prisma/client.js';

export interface ListTransactionsQuery {
  advertiserId?: string;
  status?: PaymentStatus;
  from?: string;
  to?: string;
}

function buildWhere(query: ListTransactionsQuery): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {};

  if (query.advertiserId) {
    where.userId = query.advertiserId;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.from || query.to) {
    where.createdAt = {
      gte: query.from ? new Date(query.from) : undefined,
      lte: query.to ? new Date(query.to) : undefined,
    };
  }

  return where;
}

@Injectable()
export class AdminTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListTransactionsQuery) {
    return this.prisma.payment.findMany({
      where: buildWhere(query),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        ad: { select: { id: true, title: true } },
        boost: { select: { id: true, tier: true, status: true } },
      },
    });
  }
}
