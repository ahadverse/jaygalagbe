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
import { AdminBoostsService } from './admin-boosts.service.js';
import { ExtendBoostDto, ListBoostsDto } from './dto/list-boosts.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { csvFilename } from '../common/csv.js';

@ApiTags('Admin — Boosts')
@ApiBearerAuth()
@Controller('admin/boosts')
@Auth(Role.ADMIN)
export class AdminBoostsController {
  constructor(private readonly adminBoostsService: AdminBoostsService) {}

  @Get()
  findAll(@Query() query: ListBoostsDto) {
    return this.adminBoostsService.findAll(query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListBoostsDto, @Res() res: Response) {
    const csv = await this.adminBoostsService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('boosts')}"`,
    );
    res.send(csv);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminBoostsService.cancel(id, admin);
  }

  @Patch(':id/extend')
  extend(
    @Param('id') id: string,
    @Body() dto: ExtendBoostDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminBoostsService.extend(id, dto, admin);
  }
}
