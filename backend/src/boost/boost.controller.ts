import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BoostService } from './boost.service.js';
import { PurchaseBoostDto } from './dto/purchase-boost.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@ApiTags('Boost')
@ApiBearerAuth()
@Controller('ads/:adId/boosts')
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  purchase(
    @Param('adId') adId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PurchaseBoostDto,
  ) {
    return this.boostService.purchase(adId, user.id, dto);
  }
}
