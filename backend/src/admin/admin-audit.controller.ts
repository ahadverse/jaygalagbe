import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuditService } from './admin-audit.service.js';
import { ListAuditDto } from './dto/list-audit.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { csvFilename } from '../common/csv.js';

/** Read-only by design — nothing in the app can edit or delete an entry. */
@ApiTags('Admin — Audit log')
@ApiBearerAuth()
@Controller('admin/audit')
@Auth(Role.ADMIN)
export class AdminAuditController {
  constructor(private readonly adminAuditService: AdminAuditService) {}

  @Get()
  findAll(@Query() query: ListAuditDto) {
    return this.adminAuditService.findAll(query);
  }

  @Get('actors')
  findActors() {
    return this.adminAuditService.findActors();
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListAuditDto, @Res() res: Response) {
    const csv = await this.adminAuditService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('audit-log')}"`,
    );
    res.send(csv);
  }
}
