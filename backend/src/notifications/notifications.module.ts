import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway.js';
import { InAppNotificationsListener } from './in-app-notifications.listener.js';
import { EmailService } from './email.service.js';
import { EmailNotificationsListener } from './email-notifications.listener.js';
import { PushService } from './push.service.js';
import { PushNotificationsListener } from './push-notifications.listener.js';
import { MessagingModule } from '../messaging/messaging.module.js';

@Module({
  imports: [MessagingModule],
  /* Three delivery channels: in-app over the socket, email, and FCM push
   * to the device token the mobile app registers. Email and push are
   * best-effort and no-op when their credentials are not configured. */
  providers: [
    NotificationsGateway,
    InAppNotificationsListener,
    EmailService,
    EmailNotificationsListener,
    PushService,
    PushNotificationsListener,
  ],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
