import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { LogImpressionDto } from './dto/log-impression.dto.js';
import { LogVisitDto } from './dto/log-visit.dto.js';
import { LogConversionDto } from './dto/log-conversion.dto.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAdOrThrow(adId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    return ad;
  }

  async logImpression(
    adId: string,
    viewerId: string | undefined,
    dto: LogImpressionDto,
  ) {
    await this.getAdOrThrow(adId);

    return this.prisma.adImpression.create({
      data: {
        adId,
        viewerId,
        context: dto.context,
      },
    });
  }

  async logVisit(adId: string, viewerId: string | undefined, dto: LogVisitDto) {
    await this.getAdOrThrow(adId);

    return this.prisma.adVisit.create({
      data: {
        adId,
        viewerId,
        sessionId: dto.sessionId,
      },
    });
  }

  async logConversion(adId: string, userId: string, dto: LogConversionDto) {
    await this.getAdOrThrow(adId);

    if (dto.visitId) {
      const visit = await this.prisma.adVisit.findUnique({
        where: { id: dto.visitId },
        include: { conversion: true },
      });
      if (!visit || visit.adId !== adId) {
        throw new NotFoundException('Visit not found');
      }
      if (visit.conversion) {
        throw new ConflictException('Visit already converted');
      }
    }

    return this.prisma.adConversion.create({
      data: {
        adId,
        userId,
        visitId: dto.visitId,
      },
    });
  }

  async getStats(adId: string, requester: AuthenticatedUser) {
    const ad = await this.getAdOrThrow(adId);
    if (ad.ownerId !== requester.id && !requester.isAdmin) {
      throw new ForbiddenException('You do not own this ad');
    }

    const [impressions, visits, conversions] = await this.prisma.$transaction([
      this.prisma.adImpression.count({ where: { adId } }),
      this.prisma.adVisit.count({ where: { adId } }),
      this.prisma.adConversion.count({ where: { adId } }),
    ]);

    return {
      impressions,
      visits,
      conversions,
      conversionRate: visits > 0 ? conversions / visits : 0,
    };
  }
}
