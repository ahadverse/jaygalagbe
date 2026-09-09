import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway.js';
import { InAppNotificationsListener } from './in-app-notifications.listener.js';

@Module({
  providers: [NotificationsGateway, InAppNotificationsListener],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
