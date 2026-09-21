import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AdStatus,
  PaymentStatus,
  type Prisma,
} from '../generated/prisma/client.js';
import type { AnalyticsQueryDto } from './dto/analytics-query.dto.js';
import {
  bucketKey,
  bucketKeys,
  percentChange,
  resolveRange,
  type ResolvedRange,
} from './analytics-range.js';

const TOP_DISTRICTS_LIMIT = 8;
const TOP_ADVERTISERS_LIMIT = 8;

export interface Kpi {
  current: number;
  previous: number;
  changePct: number | null;
}

function kpi(current: number, previous: number): Kpi {
  return { current, previous, changePct: percentChange(current, previous) };
}

/** Rows carrying a timestamp, counted into the buckets of a range. */
function tally<T>(
  rows: T[],
  range: ResolvedRange,
  at: (row: T) => Date,
  weight: (row: T) => number = () => 1,
): Map<string, number> {
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = bucketKey(at(row), range.granularity);
    buckets.set(key, (buckets.get(key) ?? 0) + weight(row));
  }
  return buckets;
}

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(query: AnalyticsQueryDto) {
    const range = resolveRange(query);

    const [kpis, series, funnel, topDistricts, topAdvertisers, moderation] =
      await Promise.all([
        this.getKpis(range),
        this.getSeries(range),
        this.getFunnel(range),
        this.getTopDistricts(range),
        this.getTopAdvertisers(range),
        this.getModeration(range),
      ]);

    return {
      range: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        granularity: range.granularity,
        days: range.days,
        previousFrom: range.previousFrom.toISOString(),
        previousTo: range.previousTo.toISOString(),
      },
      kpis,
      series,
      funnel,
      topDistricts,
      topAdvertisers,
      moderation,
    };
  }

  private async getKpis(range: ResolvedRange) {
    const window = { gte: range.from, lte: range.to };
    const before = { gte: range.previousFrom, lte: range.previousTo };

    const settled = (createdAt: Prisma.DateTimeFilter) => ({
      status: PaymentStatus.SUCCESS,
      boost: { isNot: null },
      createdAt,
    });

    const [
      newAds,
      newAdsBefore,
      newUsers,
      newUsersBefore,
      revenue,
      revenueBefore,
      visits,
      visitsBefore,
      conversions,
      conversionsBefore,
      liveNow,
    ] = await Promise.all([
      this.prisma.ad.count({ where: { createdAt: window } }),
      this.prisma.ad.count({ where: { createdAt: before } }),
      this.prisma.user.count({ where: { createdAt: window } }),
      this.prisma.user.count({ where: { createdAt: before } }),
      this.prisma.payment.aggregate({
        where: settled(window),
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: settled(before),
        _sum: { amount: true },
      }),
      this.prisma.adVisit.count({ where: { createdAt: window } }),
      this.prisma.adVisit.count({ where: { createdAt: before } }),
      this.prisma.adConversion.count({ where: { convertedAt: window } }),
      this.prisma.adConversion.count({ where: { convertedAt: before } }),
      this.prisma.ad.count({ where: { status: AdStatus.LIVE } }),
    ]);

    return {
      newAds: kpi(newAds, newAdsBefore),
      newUsers: kpi(newUsers, newUsersBefore),
      revenue: kpi(
        revenue._sum.amount?.toNumber() ?? 0,
        revenueBefore._sum.amount?.toNumber() ?? 0,
      ),
      visits: kpi(visits, visitsBefore),
      conversions: kpi(conversions, conversionsBefore),
      liveAds: kpi(liveNow, liveNow),
    };
  }

  /**
   * One request, one shared time axis. Every series is keyed to the same
   * bucket list so the charts line up and an empty bucket renders as zero
   * rather than as a gap the line jumps across.
   */
  private async getSeries(range: ResolvedRange) {
    const window = { gte: range.from, lte: range.to };

    const [ads, users, payments, visits, conversions] = await Promise.all([
      this.prisma.ad.findMany({
        where: { createdAt: window },
        select: { createdAt: true, status: true },
      }),
      this.prisma.user.findMany({
        where: { createdAt: window },
        select: { createdAt: true },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.SUCCESS,
          boost: { isNot: null },
          createdAt: window,
        },
        select: { createdAt: true, amount: true },
      }),
      this.prisma.adVisit.findMany({
        where: { createdAt: window },
        select: { createdAt: true },
      }),
      this.prisma.adConversion.findMany({
        where: { convertedAt: window },
        select: { convertedAt: true },
      }),
    ]);

    const adBuckets = tally(ads, range, (row) => row.createdAt);
    const liveBuckets = tally(
      ads.filter((ad) => ad.status === AdStatus.LIVE),
      range,
      (row) => row.createdAt,
    );
    const userBuckets = tally(users, range, (row) => row.createdAt);
    const revenueBuckets = tally(
      payments,
      range,
      (row) => row.createdAt,
      (row) => row.amount.toNumber(),
    );
    const visitBuckets = tally(visits, range, (row) => row.createdAt);
    const conversionBuckets = tally(
      conversions,
      range,
      (row) => row.convertedAt,
    );

    return bucketKeys(range).map((bucket) => ({
      bucket,
      ads: adBuckets.get(bucket) ?? 0,
      liveAds: liveBuckets.get(bucket) ?? 0,
      users: userBuckets.get(bucket) ?? 0,
      revenue: revenueBuckets.get(bucket) ?? 0,
      visits: visitBuckets.get(bucket) ?? 0,
      conversions: conversionBuckets.get(bucket) ?? 0,
    }));
  }

  /** Impression → visit → conversion, over the selected window. */
  private async getFunnel(range: ResolvedRange) {
    const window = { gte: range.from, lte: range.to };

    const [impressions, visits, conversions] = await Promise.all([
      this.prisma.adImpression.count({ where: { createdAt: window } }),
      this.prisma.adVisit.count({ where: { createdAt: window } }),
      this.prisma.adConversion.count({ where: { convertedAt: window } }),
    ]);

    return [
      { stage: 'Impressions', value: impressions },
      { stage: 'Visits', value: visits },
      { stage: 'Contacts', value: conversions },
    ];
  }

  private async getTopDistricts(range: ResolvedRange) {
    const groups = await this.prisma.ad.groupBy({
      by: ['locationDistrict'],
      where: { createdAt: { gte: range.from, lte: range.to } },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
      take: TOP_DISTRICTS_LIMIT,
    });

    return groups.map((group) => ({
      district: group.locationDistrict,
      ads: group._count._all,
    }));
  }

  private async getTopAdvertisers(range: ResolvedRange) {
    const groups = await this.prisma.ad.groupBy({
      by: ['ownerId'],
      where: { createdAt: { gte: range.from, lte: range.to } },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
      take: TOP_ADVERTISERS_LIMIT,
    });
    if (groups.length === 0) return [];

    const owners = await this.prisma.user.findMany({
      where: { id: { in: groups.map((group) => group.ownerId) } },
      select: { id: true, name: true, isSuspended: true },
    });
    const byId = new Map(owners.map((owner) => [owner.id, owner]));

    return groups.flatMap((group) => {
      const owner = byId.get(group.ownerId);
      return owner ? [{ ...owner, ads: group._count._all }] : [];
    });
  }

  /**
   * How the queue behaved over the window. `medianDecisionHours` uses the
   * median rather than the mean because one listing left over a weekend
   * skews a mean badly enough to make the number useless.
   */
  private async getModeration(range: ResolvedRange) {
    const window = { gte: range.from, lte: range.to };

    const [decided, pendingNow, sectorMix, statusMix] = await Promise.all([
      this.prisma.ad.findMany({
        where: {
          status: { in: [AdStatus.LIVE, AdStatus.REJECTED] },
          updatedAt: window,
        },
        select: { status: true, createdAt: true, updatedAt: true },
      }),
      this.prisma.ad.count({ where: { status: AdStatus.PENDING } }),
      this.prisma.ad.groupBy({
        by: ['sector'],
        where: { createdAt: window },
        _count: { _all: true },
      }),
      this.prisma.ad.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const approved = decided.filter(
      (ad) => ad.status === AdStatus.LIVE,
    ).length;
    const rejected = decided.length - approved;

    const waits = decided
      .map((ad) => ad.updatedAt.getTime() - ad.createdAt.getTime())
      .filter((ms) => ms >= 0)
      .sort((a, b) => a - b);

    const median =
      waits.length === 0
        ? null
        : waits[Math.floor(waits.length / 2)] / (60 * 60 * 1000);

    return {
      approved,
      rejected,
      decided: decided.length,
      approvalRate: decided.length === 0 ? null : approved / decided.length,
      medianDecisionHours: median === null ? null : Number(median.toFixed(1)),
      pendingNow,
      sectorMix: sectorMix.map((group) => ({
        sector: group.sector,
        count: group._count._all,
      })),
      statusMix: statusMix.map((group) => ({
        status: group.status,
        count: group._count._all,
      })),
    };
  }
}
