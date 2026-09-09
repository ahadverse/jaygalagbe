import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto.js';

function byEmailOrPhone(email?: string, phone?: string): Prisma.UserWhereInput {
  const or: Prisma.UserWhereInput[] = [];
  if (email) or.push({ email });
  if (phone) or.push({ phone });
  return { OR: or };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return sanitize(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    if (dto.email || dto.phone) {
      const existing = await this.prisma.user.findFirst({
        where: { id: { not: id }, ...byEmailOrPhone(dto.email, dto.phone) },
      });
      if (existing) {
        throw new ConflictException(
          'An account with this email or phone already exists',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });

    return sanitize(user);
  }

  async deleteAccount(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }

  async upgradeToAdvertiser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isAdvertiser) {
      throw new ConflictException('Already an advertiser');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isAdvertiser: true },
    });

    return sanitize(updated);
  }

  async registerFcmToken(id: string, dto: RegisterFcmTokenDto) {
    await this.prisma.user.update({
      where: { id },
      data: { fcmToken: dto.token },
    });
  }

  async clearFcmToken(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { fcmToken: null },
    });
  }
}

function sanitize<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
