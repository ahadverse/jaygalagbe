import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service.js';
import { LogImpressionDto } from './dto/log-impression.dto.js';
import { LogVisitDto } from './dto/log-visit.dto.js';
import { LogConversionDto } from './dto/log-conversion.dto.js';
import {
  GetOverviewQueryDto,
  GetStatsQueryDto,
} from './dto/get-stats-query.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

/**
 * Impression and visit pings are unauthenticated by design, so they carry a
 * per-caller budget that keeps counts from being inflated by a loop.
 */
const TRACKING_THROTTLE = {
  short: { ttl: 10_000, limit: 30 },
  medium: { ttl: 60_000, limit: 120 },
};

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('ads/:adId')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('impressions')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle(TRACKING_THROTTLE)
  logImpression(
    @Param('adId') adId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: LogImpressionDto,
  ) {
    return this.analyticsService.logImpression(adId, user?.id, dto);
  }

  @Post('visits')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle(TRACKING_THROTTLE)
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
    @Query() query: GetStatsQueryDto,
  ) {
    return this.analyticsService.getStats(adId, user, query);
  }
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsOverviewController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  getOverview(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetOverviewQueryDto,
  ) {
    return this.analyticsService.getOverview(user, query);
  }
}
