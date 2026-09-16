import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { MessagingGateway } from '../messaging/messaging.gateway.js';
import { EmailService } from './email.service.js';
import {
  NotificationEvent,
  type AdApprovedPayload,
  type AdRejectedPayload,
  type MessageReceivedPayload,
} from './notification-events.js';

@Injectable()
export class EmailNotificationsListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly messagingGateway: MessagingGateway,
  ) {}

  @OnEvent(NotificationEvent.AdApproved)
  handleAdApproved(payload: AdApprovedPayload) {
    return this.notify(payload.userId, {
      subject: 'Your ad is now live',
      text: `Good news! Your ad "${payload.adTitle}" has been approved and is now live on Jayga Lagbe.`,
    });
  }

  @OnEvent(NotificationEvent.AdRejected)
  handleAdRejected(payload: AdRejectedPayload) {
    return this.notify(payload.userId, {
      subject: 'Your ad was rejected',
      text: `Your ad "${payload.adTitle}" was rejected. Reason: ${payload.reason}`,
    });
  }

  @OnEvent(NotificationEvent.MessageReceived)
  async handleMessageReceived(payload: MessageReceivedPayload) {
    const isViewingConversation =
      await this.messagingGateway.isUserConnectedToConversation(
        payload.conversationId,
        payload.userId,
      );
    if (isViewingConversation) {
      return;
    }

    return this.notify(payload.userId, {
      subject: 'You have a new message',
      text: `You received a new message: "${payload.body}"`,
    });
  }

  private async notify(
    userId: string,
    email: { subject: string; text: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user?.email) {
      return;
    }
    await this.emailService.send({ to: user.email, ...email });
  }
}
