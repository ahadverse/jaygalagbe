import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdStatus, Prisma } from '../generated/prisma/client.js';
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
/** Hard ceiling on the requested window — the series is built one row per day. */
const MAX_RANGE_DAYS = 366;
const MAX_OVERVIEW_ADS = 500;

type DailyBucket = {
  date: string;
  impressions: number;
  visits: number;
  conversions: number;
};

type AnalyticsTable = 'ad_impressions' | 'ad_visits' | 'ad_conversions';
type DayCount = { day: Date; count: number };

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException('Invalid date range');
  }
  return parsed;
}

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

  /** Only a published ad can accrue traffic, so anything else is rejected. */
  private async getLiveAdOrThrow(adId: string) {
    const ad = await this.getAdOrThrow(adId);
    if (ad.status !== AdStatus.LIVE) {
      throw new NotFoundException('Ad not found');
    }
    return ad;
  }

  private resolveRange(query: GetStatsQueryDto) {
    const to = parseDate(query.to) ?? new Date();
    to.setUTCHours(23, 59, 59, 999);

    const from =
      parseDate(query.from) ??
      new Date(to.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
    from.setUTCHours(0, 0, 0, 0);

    if (from > to) {
      throw new BadRequestException('`from` must be on or before `to`');
    }
    const earliest = new Date(to.getTime() - (MAX_RANGE_DAYS - 1) * DAY_MS);
    earliest.setUTCHours(0, 0, 0, 0);

    return { from: from < earliest ? earliest : from, to };
  }

  /**
   * Counts per day are grouped in the database rather than by loading every
   * row: a busy ad can have millions of impressions in the window.
   */
  private async buildDailySeries(
    adIds: string[],
    from: Date,
    to: Date,
  ): Promise<DailyBucket[]> {
    const [impressions, visits, conversions] = await Promise.all([
      this.countByDay('ad_impressions', 'createdAt', adIds, from, to),
      this.countByDay('ad_visits', 'createdAt', adIds, from, to),
      this.countByDay('ad_conversions', 'convertedAt', adIds, from, to),
    ]);

    const buckets = new Map<string, DailyBucket>();
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = cursor.toISOString().slice(0, 10);
      buckets.set(key, { date: key, impressions: 0, visits: 0, conversions: 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const tally = (
      rows: DayCount[],
      key: 'impressions' | 'visits' | 'conversions',
    ) => {
      for (const row of rows) {
        const bucket = buckets.get(row.day.toISOString().slice(0, 10));
        if (bucket) bucket[key] = Number(row.count);
      }
    };
    tally(impressions, 'impressions');
    tally(visits, 'visits');
    tally(conversions, 'conversions');

    return [...buckets.values()];
  }

  private countByDay(
    table: AnalyticsTable,
    column: 'createdAt' | 'convertedAt',
    adIds: string[],
    from: Date,
    to: Date,
  ): Promise<DayCount[]> {
    // Table and column come from the literal unions above, never from input;
    // every value is still passed as a bound parameter.
    return this.prisma.$queryRaw<DayCount[]>`
      SELECT date_trunc('day', ${Prisma.raw(`"${column}"`)} AT TIME ZONE 'UTC') AS day,
             COUNT(*)::int AS count
      FROM ${Prisma.raw(`"${table}"`)}
      WHERE "adId" = ANY(${adIds})
        AND ${Prisma.raw(`"${column}"`)} BETWEEN ${from} AND ${to}
      GROUP BY day
    `;
  }

  async logImpression(
    adId: string,
    viewerId: string | undefined,
    dto: LogImpressionDto,
  ) {
    await this.getLiveAdOrThrow(adId);

    return this.prisma.adImpression.create({
      data: {
        adId,
        viewerId,
        context: dto.context,
      },
    });
  }

  async logVisit(adId: string, viewerId: string | undefined, dto: LogVisitDto) {
    await this.getLiveAdOrThrow(adId);

    return this.prisma.adVisit.create({
      data: {
        adId,
        viewerId,
        sessionId: dto.sessionId,
      },
    });
  }

  async logConversion(adId: string, userId: string, dto: LogConversionDto) {
    await this.getLiveAdOrThrow(adId);

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

    const [impressions, visits, conversions, series] = await Promise.all([
      this.prisma.adImpression.count({
        where: { adId, createdAt: { gte: from, lte: to } },
      }),
      this.prisma.adVisit.count({
        where: { adId, createdAt: { gte: from, lte: to } },
      }),
      this.prisma.adConversion.count({
        where: { adId, convertedAt: { gte: from, lte: to } },
      }),
      this.buildDailySeries([adId], from, to),
    ]);

    return {
      impressions,
      visits,
      conversions,
      conversionRate: visits > 0 ? conversions / visits : 0,
      series,
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
      take: MAX_OVERVIEW_ADS,
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

    const [impressionGroups, visitGroups, conversionGroups, series] =
      await Promise.all([
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
        this.buildDailySeries(adIds, from, to),
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
        conversionRate:
          totals.visits > 0 ? totals.conversions / totals.visits : 0,
      },
      series,
      ads: adBreakdown,
    };
  }
}
