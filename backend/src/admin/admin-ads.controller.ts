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
import { AdminAdsService } from './admin-ads.service.js';
import { AdminBulkService } from './admin-bulk.service.js';
import { ListAdsDto } from './dto/list-ads.dto.js';
import { BulkAdActionDto } from './dto/bulk-action.dto.js';
import { AdminUpdateAdDto } from './dto/admin-update-ad.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { csvFilename } from '../common/csv.js';

/**
 * Read side of ad moderation plus the bulk entry point. Single-ad writes stay
 * on `AdsController` so the status-transition rules live in one place — the
 * bulk runner calls straight into the same `AdsService` methods.
 */
@ApiTags('Admin — Ads')
@ApiBearerAuth()
@Controller('admin/ads')
@Auth(Role.ADMIN)
export class AdminAdsController {
  constructor(
    private readonly adminAdsService: AdminAdsService,
    private readonly bulkService: AdminBulkService,
  ) {}

  @Get()
  findAll(@Query() query: ListAdsDto) {
    return this.adminAdsService.findAll(query);
  }

  @Get('counts')
  getStatusCounts() {
    return this.adminAdsService.getStatusCounts();
  }

  @Get('districts')
  findDistricts() {
    return this.adminAdsService.findDistricts();
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListAdsDto, @Res() res: Response) {
    const csv = await this.adminAdsService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('ads')}"`,
    );
    res.send(csv);
  }

  @Post('bulk')
  runBulk(
    @Body() dto: BulkAdActionDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.bulkService.runAdAction(dto, admin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminAdsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateAdDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminAdsService.update(id, dto, admin);
  }

  /** Permanent. Take-down (`DELETE /ads/:id`) is the reversible one. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminAdsService.remove(id, admin);
  }
}
