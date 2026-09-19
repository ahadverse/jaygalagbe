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

const BCRYPT_ROUNDS = 12;

/**
 * Compared against when no account matches, so a wrong identifier costs the
 * same time as a wrong password and cannot be used to enumerate accounts.
 */
const DUMMY_HASH = bcrypt.hashSync('jayga-lagbe-timing-equaliser', 10);

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
    const email = dto.email?.trim().toLowerCase();
    const phone = dto.phone?.trim();
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: { name: dto.name.trim(), email, phone, passwordHash },
      });
      return this.buildAuthResponse(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'An account with this email or phone already exists',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    const phone = dto.phone?.trim();
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    const user = await this.prisma.user.findFirst({
      where: byEmailOrPhone(email, phone),
    });

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isSuspended) {
      throw new ForbiddenException('This account has been suspended');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      isAdmin: user.isAdmin,
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;

    return { user: safeUser, accessToken };
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2002'
  );
}
