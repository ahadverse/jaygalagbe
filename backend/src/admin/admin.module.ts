import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';
import { AdminTransactionsController } from './admin-transactions.controller.js';
import { AdminTransactionsService } from './admin-transactions.service.js';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Module({
  controllers: [
    AdminUsersController,
    AdminTransactionsController,
    AdminDashboardController,
  ],
  providers: [
    AdminUsersService,
    AdminTransactionsService,
    AdminDashboardService,
  ],
})
export class AdminModule {}
