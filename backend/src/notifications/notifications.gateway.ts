import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import { authenticateSocket } from '../auth/ws-auth.util.js';

function userRoom(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await authenticateSocket(
        client,
        this.jwtService,
        this.prisma,
      );
      client.data.user = user;
      await client.join(userRoom(user.id));
    } catch {
      client.disconnect(true);
    }
  }

  sendToUser(userId: string, event: string, payload: unknown) {
    this.server.to(userRoom(userId)).emit(event, payload);
  }
}
