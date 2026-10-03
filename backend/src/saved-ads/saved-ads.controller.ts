import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SavedAdsService } from './saved-ads.service.js';
import { ListSavedAdsDto } from './dto/list-saved-ads.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@ApiTags('Saved ads')
@ApiBearerAuth()
@Auth(Role.USER)
@Controller()
export class SavedAdsController {
  constructor(private readonly savedAdsService: SavedAdsService) {}

  @Post('ads/:adId/save')
  save(@CurrentUser() user: AuthenticatedUser, @Param('adId') adId: string) {
    return this.savedAdsService.save(user.id, adId);
  }

  @Delete('ads/:adId/save')
  unsave(@CurrentUser() user: AuthenticatedUser, @Param('adId') adId: string) {
    return this.savedAdsService.unsave(user.id, adId);
  }

  @Get('saved-ads')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSavedAdsDto,
  ) {
    return this.savedAdsService.list(user.id, query);
  }

  @Get('saved-ads/ids')
  listIds(@CurrentUser() user: AuthenticatedUser) {
    return this.savedAdsService.listIds(user.id);
  }
}
