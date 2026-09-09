import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsGateway } from './notifications.gateway.js';
import {
  NotificationEvent,
  type AdApprovedPayload,
  type AdRejectedPayload,
  type MessageReceivedPayload,
} from './notification-events.js';

@Injectable()
export class InAppNotificationsListener {
  constructor(private readonly gateway: NotificationsGateway) {}

  @OnEvent(NotificationEvent.AdApproved)
  handleAdApproved(payload: AdApprovedPayload) {
    this.gateway.sendToUser(payload.userId, 'notification', {
      type: NotificationEvent.AdApproved,
      ...payload,
    });
  }

  @OnEvent(NotificationEvent.AdRejected)
  handleAdRejected(payload: AdRejectedPayload) {
    this.gateway.sendToUser(payload.userId, 'notification', {
      type: NotificationEvent.AdRejected,
      ...payload,
    });
  }

  @OnEvent(NotificationEvent.MessageReceived)
  handleMessageReceived(payload: MessageReceivedPayload) {
    this.gateway.sendToUser(payload.userId, 'notification', {
      type: NotificationEvent.MessageReceived,
      ...payload,
    });
  }
}
