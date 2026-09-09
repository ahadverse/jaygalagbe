import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway.js';
import { InAppNotificationsListener } from './in-app-notifications.listener.js';
import { FcmService } from './fcm.service.js';
import { FcmNotificationsListener } from './fcm-notifications.listener.js';
import { EmailService } from './email.service.js';
import { EmailNotificationsListener } from './email-notifications.listener.js';

@Module({
  providers: [
    NotificationsGateway,
    InAppNotificationsListener,
    FcmService,
    FcmNotificationsListener,
    EmailService,
    EmailNotificationsListener,
  ],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
