import {
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from '../auth/jwt.strategy.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { MessagingService } from './messaging.service.js';
import { ConversationRoomDto } from './dto/conversation-room.dto.js';
import { SendMessageWsDto } from './dto/send-message-ws.dto.js';

function roomName(conversationId: string): string {
  return `conversation:${conversationId}`;
}

function extractToken(client: Socket): string | undefined {
  const authToken = client.handshake.auth?.token as string | undefined;
  if (authToken) {
    return authToken;
  }
  const header = client.handshake.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

@WebSocketGateway({ cors: true })
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      client.data.user = await this.authenticate(client);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {}

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
    const message = await this.messagingService.sendMessage(
      dto.conversationId,
      user.id,
      { body: dto.body },
    );
    const payload = { ...message, sender: { id: user.id, name: user.name } };
    this.server.to(roomName(dto.conversationId)).emit('message:new', payload);
    return message;
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

  private requireUser(client: Socket): AuthenticatedUser {
    const user = client.data.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new WsException('Unauthorized');
    }
    return user;
  }

  private async authenticate(client: Socket): Promise<AuthenticatedUser> {
    const token = extractToken(client);
    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    const payload = this.jwtService.verify<JwtPayload>(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid auth token');
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
