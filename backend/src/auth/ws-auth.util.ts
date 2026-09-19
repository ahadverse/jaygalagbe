import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from './jwt.strategy.js';
import type { AuthenticatedUser } from './current-user.decorator.js';

export function extractSocketToken(client: Socket): string | undefined {
  const authToken = client.handshake.auth?.token as string | undefined;
  if (authToken) {
    return authToken;
  }
  const header = client.handshake.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

/**
 * Installs handshake authentication as Socket.IO middleware. It has to run
 * here rather than in `handleConnection`: a client can emit as soon as the
 * connection opens, which races an async connection handler and leaves the
 * first event without a user.
 */
export function useSocketAuth(
  server: Server,
  jwtService: JwtService,
  prisma: PrismaService,
): void {
  server.use((socket, next) => {
    authenticateSocket(socket, jwtService, prisma)
      .then((user) => {
        socket.data.user = user;
        next();
      })
      .catch(() => next(new Error('Unauthorized')));
  });
}

export async function authenticateSocket(
  client: Socket,
  jwtService: JwtService,
  prisma: PrismaService,
): Promise<AuthenticatedUser> {
  const token = extractSocketToken(client);
  if (!token) {
    throw new UnauthorizedException('Missing auth token');
  }

  const payload = jwtService.verify<JwtPayload>(token);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.isSuspended) {
    throw new UnauthorizedException('Invalid auth token');
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
