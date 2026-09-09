import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller.js';
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
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AdsModule,
    BoostModule,
    PaymentsModule,
    MessagingModule,
    NotificationsModule,
    ReviewsModule,
    AnalyticsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
