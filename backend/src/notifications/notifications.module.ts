import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway.js';
import { InAppNotificationsListener } from './in-app-notifications.listener.js';
import { EmailService } from './email.service.js';
import { EmailNotificationsListener } from './email-notifications.listener.js';
import { MessagingModule } from '../messaging/messaging.module.js';

@Module({
  imports: [MessagingModule],
  /* Two delivery channels: in-app over the socket, and email. Mobile push
   * lived here too, but nothing consumes it until the React Native app
   * exists, so the sender was removed rather than shipped dormant. The
   * fcmToken column and its endpoints stay — they carry no dependency and
   * are what a future app would register against. */
  providers: [
    NotificationsGateway,
    InAppNotificationsListener,
    EmailService,
    EmailNotificationsListener,
  ],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
