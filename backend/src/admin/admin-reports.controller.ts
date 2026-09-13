import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminReportsService } from './admin-reports.service.js';
import { ListReportsDto } from './dto/list-reports.dto.js';
import { ResolveReportDto } from './dto/resolve-report.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';

@ApiTags('Admin — Reports')
@ApiBearerAuth()
@Controller('admin/reports')
@Auth(Role.ADMIN)
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get()
  findAll(@Query() query: ListReportsDto) {
    return this.adminReportsService.findAll(query);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveReportDto) {
    return this.adminReportsService.resolve(id, dto);
  }
}
