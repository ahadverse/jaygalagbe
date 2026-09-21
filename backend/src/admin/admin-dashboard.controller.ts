import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { AdminAnalyticsService } from './admin-analytics.service.js';
import { AnalyticsQueryDto } from './dto/analytics-query.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';

@ApiTags('Admin — Dashboard')
@ApiBearerAuth()
@Controller('admin')
@Auth(Role.ADMIN)
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly adminAnalyticsService: AdminAnalyticsService,
  ) {}

  /** Landing page: the selected window's numbers plus live queue state. */
  @Get('dashboard')
  getOverview(@Query() query: AnalyticsQueryDto) {
    return this.adminDashboardService.getOverview(query);
  }

  /** The same window, without the queue state — for the analytics page. */
  @Get('analytics')
  getAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.adminAnalyticsService.getOverview(query);
  }
}
