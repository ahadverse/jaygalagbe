import { Module } from '@nestjs/common';
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

@Module({
  controllers: [
    AdminUsersController,
    AdminAdsController,
    AdminReportsController,
    AdminTransactionsController,
    AdminDashboardController,
  ],
  providers: [
    AdminUsersService,
    AdminAdsService,
    AdminReportsService,
    AdminTransactionsService,
    AdminDashboardService,
  ],
})
export class AdminModule {}
