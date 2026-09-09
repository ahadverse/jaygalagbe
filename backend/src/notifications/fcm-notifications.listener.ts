import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { FcmService, type PushNotification } from './fcm.service.js';
import {
  NotificationEvent,
  type AdApprovedPayload,
  type AdRejectedPayload,
  type MessageReceivedPayload,
} from './notification-events.js';

@Injectable()
export class FcmNotificationsListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FcmService,
  ) {}

  @OnEvent(NotificationEvent.AdApproved)
  handleAdApproved(payload: AdApprovedPayload) {
    return this.notify(payload.userId, {
      title: 'Ad approved',
      body: `Your ad "${payload.adTitle}" is now live.`,
    });
  }

  @OnEvent(NotificationEvent.AdRejected)
  handleAdRejected(payload: AdRejectedPayload) {
    return this.notify(payload.userId, {
      title: 'Ad rejected',
      body: `Your ad "${payload.adTitle}" was rejected: ${payload.reason}`,
    });
  }

  @OnEvent(NotificationEvent.MessageReceived)
  handleMessageReceived(payload: MessageReceivedPayload) {
    return this.notify(payload.userId, {
      title: 'New message',
      body: payload.body,
    });
  }

  private async notify(userId: string, notification: PushNotification) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });
    if (!user?.fcmToken) {
      return;
    }
    await this.fcmService.sendToToken(user.fcmToken, notification);
  }
}
