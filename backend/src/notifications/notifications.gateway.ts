import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import { useSocketAuth } from '../auth/ws-auth.util.js';
import { getCorsOrigins } from '../config/env.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

function userRoom(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({
  cors: { origin: getCorsOrigins(), credentials: true },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    useSocketAuth(server, this.jwtService, this.prisma);
  }

  // The middleware has already authenticated, so this only joins the room.
  async handleConnection(client: Socket) {
    const user = client.data.user as AuthenticatedUser | undefined;
    if (!user) {
      client.disconnect(true);
      return;
    }
    await client.join(userRoom(user.id));
  }

  sendToUser(userId: string, event: string, payload: unknown) {
    this.server.to(userRoom(userId)).emit(event, payload);
  }
}
