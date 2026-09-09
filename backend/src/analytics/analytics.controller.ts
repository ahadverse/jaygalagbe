import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { LogImpressionDto } from './dto/log-impression.dto.js';
import { LogVisitDto } from './dto/log-visit.dto.js';
import { LogConversionDto } from './dto/log-conversion.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@Controller('ads/:adId')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('impressions')
  @UseGuards(OptionalJwtAuthGuard)
  logImpression(
    @Param('adId') adId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: LogImpressionDto,
  ) {
    return this.analyticsService.logImpression(adId, user?.id, dto);
  }

  @Post('visits')
  @UseGuards(OptionalJwtAuthGuard)
  logVisit(
    @Param('adId') adId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: LogVisitDto,
  ) {
    return this.analyticsService.logVisit(adId, user?.id, dto);
  }

  @Post('conversions')
  @UseGuards(JwtAuthGuard)
  logConversion(
    @Param('adId') adId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogConversionDto,
  ) {
    return this.analyticsService.logConversion(adId, user.id, dto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(
    @Param('adId') adId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.analyticsService.getStats(adId, user);
  }
}
