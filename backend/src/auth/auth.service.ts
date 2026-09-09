import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma, User } from '../generated/prisma/client.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

function byEmailOrPhone(email?: string, phone?: string): Prisma.UserWhereInput {
  const or: Prisma.UserWhereInput[] = [];
  if (email) or.push({ email });
  if (phone) or.push({ phone });
  return { OR: or };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    const existing = await this.prisma.user.findFirst({
      where: byEmailOrPhone(dto.email, dto.phone),
    });
    if (existing) {
      throw new ConflictException(
        'An account with this email or phone already exists',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    const user = await this.prisma.user.findFirst({
      where: byEmailOrPhone(dto.email, dto.phone),
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isSuspended) {
      throw new ForbiddenException('This account has been suspended');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      isAdvertiser: user.isAdvertiser,
      isAdmin: user.isAdmin,
    };
    const accessToken = this.jwtService.sign(payload);

    const { passwordHash: _passwordHash, ...safeUser } = user;

    return { user: safeUser, accessToken };
  }
}
