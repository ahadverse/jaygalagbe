import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminTransactionsService } from './admin-transactions.service.js';
import { ListTransactionsDto } from './dto/list-transactions.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';

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
}
