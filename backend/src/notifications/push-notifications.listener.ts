import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { MessagingGateway } from '../messaging/messaging.gateway.js';
import { PushService } from './push.service.js';
import {
  NotificationEvent,
  type AdApprovedPayload,
  type AdRejectedPayload,
  type MessageReceivedPayload,
} from './notification-events.js';

@Injectable()
export class PushNotificationsListener {
  private readonly logger = new Logger(PushNotificationsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly messagingGateway: MessagingGateway,
  ) {}

  @OnEvent(NotificationEvent.AdApproved)
  handleAdApproved(payload: AdApprovedPayload) {
    return this.notify(payload.userId, {
      title: 'Your ad is now live',
      body: `"${payload.adTitle}" has been approved.`,
      data: { type: NotificationEvent.AdApproved, adId: payload.adId },
    });
  }

  @OnEvent(NotificationEvent.AdRejected)
  handleAdRejected(payload: AdRejectedPayload) {
    return this.notify(payload.userId, {
      title: 'Your ad was rejected',
      body: `"${payload.adTitle}": ${payload.reason}`,
      data: { type: NotificationEvent.AdRejected, adId: payload.adId },
    });
  }

  @OnEvent(NotificationEvent.MessageReceived)
  async handleMessageReceived(payload: MessageReceivedPayload) {
    try {
      const isViewingConversation =
        await this.messagingGateway.isUserConnectedToConversation(
          payload.conversationId,
          payload.userId,
        );
      if (isViewingConversation) {
        return;
      }
    } catch (error) {
      this.logger.warn(
        `Push presence check failed: ${(error as Error).message}`,
      );
      return;
    }

    return this.notify(payload.userId, {
      title: `New message from ${payload.senderName}`,
      body: payload.body,
      data: {
        type: NotificationEvent.MessageReceived,
        conversationId: payload.conversationId,
      },
    });
  }

  /** Swallows every error: a push failure must never break the caller. */
  private async notify(
    userId: string,
    message: { title: string; body: string; data: Record<string, string> },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });
      if (!user?.fcmToken) {
        return;
      }
      const result = await this.push.send({ token: user.fcmToken, ...message });
      if (result === 'invalid-token') {
        // Only clear the token we just proved dead; the device may have
        // registered a fresh one in the meantime.
        await this.prisma.user.updateMany({
          where: { id: userId, fcmToken: user.fcmToken },
          data: { fcmToken: null },
        });
      }
    } catch (error) {
      this.logger.warn(`Push notification failed: ${(error as Error).message}`);
    }
  }
}
