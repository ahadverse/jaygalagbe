import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAdsService } from './admin-ads.service.js';
import { ListAdsDto } from './dto/list-ads.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';

/**
 * Read side of ad moderation. The write side (approve / reject / force-remove)
 * stays on `AdsController` so the status-transition rules live in one place.
 */
@ApiTags('Admin — Ads')
@ApiBearerAuth()
@Controller('admin/ads')
@Auth(Role.ADMIN)
export class AdminAdsController {
  constructor(private readonly adminAdsService: AdminAdsService) {}

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminAdsService.findOne(id);
  }
}
