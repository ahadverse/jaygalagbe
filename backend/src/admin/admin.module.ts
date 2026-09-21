import { Module } from '@nestjs/common';
import { AdsModule } from '../ads/ads.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { BoostModule } from '../boost/boost.module.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';
import { AdminAdsController } from './admin-ads.controller.js';
import { AdminAdsService } from './admin-ads.service.js';
import { AdminReportsController } from './admin-reports.controller.js';
import { AdminReportsService } from './admin-reports.service.js';
import { AdminTransactionsController } from './admin-transactions.controller.js';
import { AdminTransactionsService } from './admin-transactions.service.js';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { AdminAnalyticsService } from './admin-analytics.service.js';
import { AdminAuditController } from './admin-audit.controller.js';
import { AdminAuditService } from './admin-audit.service.js';
import { AdminBoostsController } from './admin-boosts.controller.js';
import { AdminBoostsService } from './admin-boosts.service.js';
import { AdminReviewsController } from './admin-reviews.controller.js';
import { AdminReviewsService } from './admin-reviews.service.js';
import { AdminBulkService } from './admin-bulk.service.js';

@Module({
  // The bulk runner drives the same `AdsService` transitions the single-ad
  // endpoints use, rather than reimplementing them. Settling a payment by hand
  // reuses the gateway check and the boost activation for the same reason.
  imports: [AdsModule, PaymentsModule, BoostModule],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminAdsController,
    AdminReportsController,
    AdminTransactionsController,
    AdminBoostsController,
    AdminReviewsController,
    AdminAuditController,
  ],
  providers: [
    AdminUsersService,
    AdminAdsService,
    AdminReportsService,
    AdminTransactionsService,
    AdminDashboardService,
    AdminAnalyticsService,
    AdminAuditService,
    AdminBoostsService,
    AdminReviewsService,
    AdminBulkService,
  ],
})
export class AdminModule {}
