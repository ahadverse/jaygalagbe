import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminTransactionsService } from './admin-transactions.service.js';
import { ListTransactionsDto } from './dto/list-transactions.dto.js';
import { MarkPaymentFailedDto } from './dto/mark-payment-failed.dto.js';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { csvFilename } from '../common/csv.js';

@ApiTags('Admin — Transactions')
@ApiBearerAuth()
@Controller('admin/transactions')
@Auth(Role.ADMIN)
export class AdminTransactionsController {
  constructor(
    private readonly adminTransactionsService: AdminTransactionsService,
  ) {}

  @Get()
  findAll(@Query() query: ListTransactionsDto) {
    return this.adminTransactionsService.findAll(query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListTransactionsDto, @Res() res: Response) {
    const csv = await this.adminTransactionsService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('transactions')}"`,
    );
    res.send(csv);
  }

  @Patch(':id/mark-failed')
  markFailed(
    @Param('id') id: string,
    @Body() dto: MarkPaymentFailedDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminTransactionsService.markFailed(id, dto, admin);
  }

  /** Asks the gateway again — the safe way to settle a stuck payment. */
  @Patch(':id/recheck')
  recheck(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminTransactionsService.recheck(id, admin);
  }

  /** Settles without gateway confirmation. Audited as a manual override. */
  @Patch(':id/mark-paid')
  markPaid(
    @Param('id') id: string,
    @Body() dto: MarkPaymentPaidDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminTransactionsService.markPaid(id, dto, admin);
  }
}
