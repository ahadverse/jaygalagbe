import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminReportsService } from './admin-reports.service.js';
import { AdminBulkService } from './admin-bulk.service.js';
import { ListReportsDto } from './dto/list-reports.dto.js';
import { ResolveReportDto } from './dto/resolve-report.dto.js';
import { BulkReportActionDto } from './dto/bulk-action.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { csvFilename } from '../common/csv.js';

@ApiTags('Admin — Reports')
@ApiBearerAuth()
@Controller('admin/reports')
@Auth(Role.ADMIN)
export class AdminReportsController {
  constructor(
    private readonly adminReportsService: AdminReportsService,
    private readonly bulkService: AdminBulkService,
  ) {}

  @Get()
  findAll(@Query() query: ListReportsDto) {
    return this.adminReportsService.findAll(query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListReportsDto, @Res() res: Response) {
    const csv = await this.adminReportsService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('reports')}"`,
    );
    res.send(csv);
  }

  @Post('bulk')
  runBulk(
    @Body() dto: BulkReportActionDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.bulkService.runReportAction(dto, admin);
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminReportsService.resolve(id, dto, admin);
  }

  /** Permanent — the record is copied into the audit entry first. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminReportsService.remove(id, admin);
  }
}
