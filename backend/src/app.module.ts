import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { HttpThrottlerGuard } from './common/http-throttler.guard.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { AdsModule } from './ads/ads.module.js';
import { BoostModule } from './boost/boost.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { MessagingModule } from './messaging/messaging.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1_000, limit: 20 },
        { name: 'medium', ttl: 60_000, limit: 200 },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AdsModule,
    BoostModule,
    PaymentsModule,
    MessagingModule,
    NotificationsModule,
    ReviewsModule,
    ReportsModule,
    AnalyticsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: HttpThrottlerGuard }],
})
export class AppModule {}
