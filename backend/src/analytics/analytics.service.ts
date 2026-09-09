import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LogImpressionDto } from './dto/log-impression.dto.js';
import { LogVisitDto } from './dto/log-visit.dto.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertAdExists(adId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
  }

  async logImpression(
    adId: string,
    viewerId: string | undefined,
    dto: LogImpressionDto,
  ) {
    await this.assertAdExists(adId);

    return this.prisma.adImpression.create({
      data: {
        adId,
        viewerId,
        context: dto.context,
      },
    });
  }

  async logVisit(adId: string, viewerId: string | undefined, dto: LogVisitDto) {
    await this.assertAdExists(adId);

    return this.prisma.adVisit.create({
      data: {
        adId,
        viewerId,
        sessionId: dto.sessionId,
      },
    });
  }
}
