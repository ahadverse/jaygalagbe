import { UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import { useSocketAuth } from '../auth/ws-auth.util.js';
import { getCorsOrigins } from '../config/env.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { MessagingService } from './messaging.service.js';
import { ConversationRoomDto } from './dto/conversation-room.dto.js';
import { SendMessageWsDto } from './dto/send-message-ws.dto.js';
import {
  MessagingEvent,
  type MessageCreatedPayload,
} from './messaging-events.js';

function roomName(conversationId: string): string {
  return `conversation:${conversationId}`;
}

@WebSocketGateway({ cors: { origin: getCorsOrigins(), credentials: true } })
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class MessagingGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  afterInit(server: Server) {
    useSocketAuth(server, this.jwtService, this.prisma);
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ConversationRoomDto,
  ) {
    const user = this.requireUser(client);
    const conversation = await this.messagingService.findOne(
      dto.conversationId,
      user.id,
    );
    await client.join(roomName(conversation.id));
    return conversation;
  }

  @SubscribeMessage('conversation:leave')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ConversationRoomDto,
  ) {
    await client.leave(roomName(dto.conversationId));
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageWsDto,
  ) {
    const user = this.requireUser(client);
    return this.messagingService.sendMessage(dto.conversationId, user, {
      body: dto.body,
    });
  }

  @OnEvent(MessagingEvent.MessageCreated)
  handleMessageCreated(payload: MessageCreatedPayload) {
    this.server
      .to(roomName(payload.conversationId))
      .emit('message:new', payload.message);
  }

  @SubscribeMessage('message:read')
  async markRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ConversationRoomDto,
  ) {
    const user = this.requireUser(client);
    await this.messagingService.markRead(dto.conversationId, user.id);
    this.server.to(roomName(dto.conversationId)).emit('message:read', {
      conversationId: dto.conversationId,
      readerId: user.id,
    });
  }

  async isUserConnectedToConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const sockets = await this.server.in(roomName(conversationId)).fetchSockets();
    return sockets.some((socket) => {
      const user = socket.data.user as AuthenticatedUser | undefined;
      return user?.id === userId;
    });
  }

  private requireUser(client: Socket): AuthenticatedUser {
    const user = client.data.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new WsException('Unauthorized');
    }
    return user;
  }
}
