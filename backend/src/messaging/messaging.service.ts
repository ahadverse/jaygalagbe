import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdStatus, type Conversation } from '../generated/prisma/client.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import {
  NotificationEvent,
  type MessageReceivedPayload,
} from '../notifications/notification-events.js';
import { MessagingEvent } from './messaging-events.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

const MAX_MESSAGES_PER_THREAD = 200;
const MAX_CONVERSATIONS = 200;

const conversationSummaryInclude = {
  ad: { select: { id: true, title: true, photos: true, sector: true } },
  customer: { select: { id: true, name: true } },
  advertiser: { select: { id: true, name: true } },
};

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async startConversation(customerId: string, dto: CreateConversationDto) {
    const ad = await this.prisma.ad.findUnique({ where: { id: dto.adId } });
    // Only a published listing is contactable — a pending or removed ad must
    // not become a channel to its owner.
    if (!ad || ad.status !== AdStatus.LIVE) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId === customerId) {
      throw new BadRequestException(
        'You cannot message yourself about your own ad',
      );
    }

    return this.prisma.conversation.upsert({
      where: {
        adId_customerId_advertiserId: {
          adId: ad.id,
          customerId,
          advertiserId: ad.ownerId,
        },
      },
      create: { adId: ad.id, customerId, advertiserId: ad.ownerId },
      update: {},
      include: conversationSummaryInclude,
    });
  }

  findMine(userId: string) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ customerId: userId }, { advertiserId: userId }] },
      orderBy: { updatedAt: 'desc' },
      take: MAX_CONVERSATIONS,
      include: {
        ...conversationSummaryInclude,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  /**
   * Unread messages addressed to this user, for the header's message badge.
   * Counted as messages rather than threads because the badge reads as
   * "how many messages are waiting", the same as every other chat app.
   */
  async countUnread(userId: string) {
    const [messages, conversationIds] = await Promise.all([
      this.prisma.message.count({
        where: {
          readAt: null,
          senderId: { not: userId },
          conversation: {
            OR: [{ customerId: userId }, { advertiserId: userId }],
          },
        },
      }),
      this.prisma.message.findMany({
        where: {
          readAt: null,
          senderId: { not: userId },
          conversation: {
            OR: [{ customerId: userId }, { advertiserId: userId }],
          },
        },
        distinct: ['conversationId'],
        select: { conversationId: true },
      }),
    ]);

    return { messages, conversations: conversationIds.length };
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: conversationSummaryInclude,
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    this.assertParticipant(conversation, userId);
    return conversation;
  }

  async listMessages(conversationId: string, userId: string) {
    await this.getParticipantConversation(conversationId, userId);
    const recent = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: MAX_MESSAGES_PER_THREAD,
    });
    return recent.reverse();
  }

  async sendMessage(
    conversationId: string,
    sender: Pick<AuthenticatedUser, 'id' | 'name'>,
    dto: CreateMessageDto,
  ) {
    const senderId = sender.id;
    const conversation = await this.getParticipantConversation(
      conversationId,
      senderId,
    );
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { conversationId: conversation.id, senderId, body: dto.body },
      }),
      this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {},
      }),
    ]);

    const recipientId =
      conversation.customerId === senderId
        ? conversation.advertiserId
        : conversation.customerId;

    this.eventEmitter.emit(MessagingEvent.MessageCreated, {
      conversationId: conversation.id,
      message: { ...message, sender: { id: sender.id, name: sender.name } },
    });

    this.eventEmitter.emit(NotificationEvent.MessageReceived, {
      userId: recipientId,
      conversationId: conversation.id,
      senderId,
      senderName: sender.name,
      body: message.body,
    } satisfies MessageReceivedPayload);

    return message;
  }

  async markRead(conversationId: string, userId: string) {
    await this.getParticipantConversation(conversationId, userId);
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  private async getParticipantConversation(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    this.assertParticipant(conversation, userId);
    return conversation;
  }

  private assertParticipant(conversation: Conversation, userId: string) {
    if (
      conversation.customerId !== userId &&
      conversation.advertiserId !== userId
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }
  }
}
