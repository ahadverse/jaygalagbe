import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
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
  if (!user) {
    throw new UnauthorizedException('Invalid auth token');
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
