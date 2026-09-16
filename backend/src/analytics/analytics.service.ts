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
import {
  GetOverviewQueryDto,
  GetStatsQueryDto,
} from './dto/get-stats-query.dto.js';

const DAY_MS = 86_400_000;
const DEFAULT_RANGE_DAYS = 30;

type DailyBucket = {
  date: string;
  impressions: number;
  visits: number;
  conversions: number;
};

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

  private resolveRange(query: GetStatsQueryDto) {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);
    return { from, to };
  }

  private buildDailySeries(
    from: Date,
    to: Date,
    impressionDates: Date[],
    visitDates: Date[],
    conversionDates: Date[],
  ): DailyBucket[] {
    const buckets = new Map<string, DailyBucket>();
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = cursor.toISOString().slice(0, 10);
      buckets.set(key, { date: key, impressions: 0, visits: 0, conversions: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const tally = (dates: Date[], key: 'impressions' | 'visits' | 'conversions') => {
      for (const date of dates) {
        const bucket = buckets.get(date.toISOString().slice(0, 10));
        if (bucket) bucket[key] += 1;
      }
    };
    tally(impressionDates, 'impressions');
    tally(visitDates, 'visits');
    tally(conversionDates, 'conversions');

    return [...buckets.values()];
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

      return this.prisma.adConversion.create({
        data: {
          adId,
          userId,
          visitId: dto.visitId,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.adConversion.findFirst({
        where: { adId, userId, visitId: null },
      });
      if (existing) {
        return existing;
      }

      return tx.adConversion.create({
        data: {
          adId,
          userId,
          visitId: dto.visitId,
        },
      });
    });
  }

  async getStats(
    adId: string,
    requester: AuthenticatedUser,
    query: GetStatsQueryDto,
  ) {
    const ad = await this.getAdOrThrow(adId);
    if (ad.ownerId !== requester.id && !requester.isAdmin) {
      throw new ForbiddenException('You do not own this ad');
    }

    const { from, to } = this.resolveRange(query);

    const [
      impressions,
      visits,
      conversions,
      impressionRows,
      visitRows,
      conversionRows,
    ] = await this.prisma.$transaction([
      this.prisma.adImpression.count({
        where: { adId, createdAt: { gte: from, lte: to } },
      }),
      this.prisma.adVisit.count({
        where: { adId, createdAt: { gte: from, lte: to } },
      }),
      this.prisma.adConversion.count({
        where: { adId, convertedAt: { gte: from, lte: to } },
      }),
      this.prisma.adImpression.findMany({
        where: { adId, createdAt: { gte: from, lte: to } },
        select: { createdAt: true },
      }),
      this.prisma.adVisit.findMany({
        where: { adId, createdAt: { gte: from, lte: to } },
        select: { createdAt: true },
      }),
      this.prisma.adConversion.findMany({
        where: { adId, convertedAt: { gte: from, lte: to } },
        select: { convertedAt: true },
      }),
    ]);

    return {
      impressions,
      visits,
      conversions,
      conversionRate: visits > 0 ? conversions / visits : 0,
      series: this.buildDailySeries(
        from,
        to,
        impressionRows.map((row) => row.createdAt),
        visitRows.map((row) => row.createdAt),
        conversionRows.map((row) => row.convertedAt),
      ),
    };
  }

  async getOverview(requester: AuthenticatedUser, query: GetOverviewQueryDto) {
    const ads = await this.prisma.ad.findMany({
      where: {
        ownerId: requester.id,
        ...(query.adId ? { id: query.adId } : {}),
      },
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: 'desc' },
    });

    if (ads.length === 0) {
      return {
        totals: { impressions: 0, visits: 0, conversions: 0, conversionRate: 0 },
        series: [] as DailyBucket[],
        ads: [] as Array<{
          id: string;
          title: string;
          status: string;
          impressions: number;
          visits: number;
          conversions: number;
          conversionRate: number;
        }>,
      };
    }

    const adIds = ads.map((ad) => ad.id);
    const { from, to } = this.resolveRange(query);

    const [
      impressionGroups,
      visitGroups,
      conversionGroups,
      impressionRows,
      visitRows,
      conversionRows,
    ] = await this.prisma.$transaction([
      this.prisma.adImpression.groupBy({
        by: ['adId'],
        where: { adId: { in: adIds }, createdAt: { gte: from, lte: to } },
        _count: { _all: true },
      }),
      this.prisma.adVisit.groupBy({
        by: ['adId'],
        where: { adId: { in: adIds }, createdAt: { gte: from, lte: to } },
        _count: { _all: true },
      }),
      this.prisma.adConversion.groupBy({
        by: ['adId'],
        where: { adId: { in: adIds }, convertedAt: { gte: from, lte: to } },
        _count: { _all: true },
      }),
      this.prisma.adImpression.findMany({
        where: { adId: { in: adIds }, createdAt: { gte: from, lte: to } },
        select: { createdAt: true },
      }),
      this.prisma.adVisit.findMany({
        where: { adId: { in: adIds }, createdAt: { gte: from, lte: to } },
        select: { createdAt: true },
      }),
      this.prisma.adConversion.findMany({
        where: { adId: { in: adIds }, convertedAt: { gte: from, lte: to } },
        select: { convertedAt: true },
      }),
    ]);

    const impressionsByAd = new Map(
      impressionGroups.map((group) => [group.adId, group._count._all]),
    );
    const visitsByAd = new Map(
      visitGroups.map((group) => [group.adId, group._count._all]),
    );
    const conversionsByAd = new Map(
      conversionGroups.map((group) => [group.adId, group._count._all]),
    );

    const adBreakdown = ads.map((ad) => {
      const impressions = impressionsByAd.get(ad.id) ?? 0;
      const visits = visitsByAd.get(ad.id) ?? 0;
      const conversions = conversionsByAd.get(ad.id) ?? 0;
      return {
        id: ad.id,
        title: ad.title,
        status: ad.status,
        impressions,
        visits,
        conversions,
        conversionRate: visits > 0 ? conversions / visits : 0,
      };
    });

    const totals = adBreakdown.reduce(
      (acc, ad) => ({
        impressions: acc.impressions + ad.impressions,
        visits: acc.visits + ad.visits,
        conversions: acc.conversions + ad.conversions,
      }),
      { impressions: 0, visits: 0, conversions: 0 },
    );

    return {
      totals: {
        ...totals,
        conversionRate: totals.visits > 0 ? totals.conversions / totals.visits : 0,
      },
      series: this.buildDailySeries(
        from,
        to,
        impressionRows.map((row) => row.createdAt),
        visitRows.map((row) => row.createdAt),
        conversionRows.map((row) => row.convertedAt),
      ),
      ads: adBreakdown,
    };
  }
}
