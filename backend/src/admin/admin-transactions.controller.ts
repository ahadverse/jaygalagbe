import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminTransactionsService } from './admin-transactions.service.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import type { PaymentStatus } from '../generated/prisma/client.js';

@ApiTags('Admin — Transactions')
@ApiBearerAuth()
@Controller('admin/transactions')
@Auth(Role.ADMIN)
export class AdminTransactionsController {
  constructor(
    private readonly adminTransactionsService: AdminTransactionsService,
  ) {}

  @Get()
  findAll(
    @Query('advertiserId') advertiserId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminTransactionsService.findAll({
      advertiserId,
      status,
      from,
      to,
    });
  }
}
