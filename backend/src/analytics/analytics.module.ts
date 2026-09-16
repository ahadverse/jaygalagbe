import { Module } from '@nestjs/common';
import {
  AnalyticsController,
  AnalyticsOverviewController,
} from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  controllers: [AnalyticsController, AnalyticsOverviewController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
