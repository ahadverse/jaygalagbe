import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdminAnalyticsService } from './admin-analytics.service.js';
import { AdminAuditService } from './admin-audit.service.js';
import {
  AdStatus,
  BoostStatus,
  PaymentStatus,
  ReportStatus,
} from '../generated/prisma/client.js';
import { REVIEW_SLA_HOURS } from './admin-ads.service.js';
import type { AnalyticsQueryDto } from './dto/analytics-query.dto.js';

const MOST_REPORTED_LIMIT = 5;
const EXPIRING_SOON_HOURS = 72;

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AdminAnalyticsService,
    private readonly audit: AdminAuditService,
  ) {}

  /**
   * One request behind the whole landing page. The analytics overview supplies
   * the KPIs and time series for the selected window; everything added here is
   * "right now" state that a date range does not apply to — what is queued,
   * what is overdue, what is about to expire.
   */
  async getOverview(query: AnalyticsQueryDto) {
    const [analytics, attention, mostReported, recentActivity] =
      await Promise.all([
        this.analytics.getOverview(query),
        this.getNeedsAttention(),
        this.getMostReportedAdvertisers(),
        this.audit.findRecent(),
      ]);

    return { ...analytics, attention, mostReported, recentActivity };
  }

  /**
   * The work queue, as one object: everything a moderator opening the console
   * should act on before anything else.
   */
  private async getNeedsAttention() {
    const now = Date.now();
    const slaCutoff = new Date(now - REVIEW_SLA_HOURS * 60 * 60 * 1000);
    const expiryCutoff = new Date(now + EXPIRING_SOON_HOURS * 60 * 60 * 1000);

    const [
      pendingAds,
      overdueAds,
      pendingReports,
      suspendedUsers,
      failedPayments,
      expiringBoosts,
      oldestPending,
    ] = await Promise.all([
      this.prisma.ad.count({ where: { status: AdStatus.PENDING } }),
      this.prisma.ad.count({
        where: { status: AdStatus.PENDING, createdAt: { lt: slaCutoff } },
      }),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      this.prisma.user.count({ where: { isSuspended: true } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      this.prisma.boost.count({
        where: {
          status: BoostStatus.ACTIVE,
          endAt: { gte: new Date(now), lte: expiryCutoff },
        },
      }),
      this.prisma.ad.findFirst({
        where: { status: AdStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      pendingAds,
      overdueAds,
      slaHours: REVIEW_SLA_HOURS,
      oldestPendingAt: oldestPending?.createdAt?.toISOString() ?? null,
      pendingReports,
      suspendedUsers,
      failedPayments,
      expiringBoosts,
      expiringWindowHours: EXPIRING_SOON_HOURS,
    };
  }

  private async getMostReportedAdvertisers() {
    const grouped = await this.prisma.report.groupBy({
      by: ['adId'],
      _count: { _all: true },
    });
    if (grouped.length === 0) {
      return [];
    }

    const ads = await this.prisma.ad.findMany({
      where: { id: { in: grouped.map((group) => group.adId) } },
      select: {
        id: true,
        owner: { select: { id: true, name: true, isSuspended: true } },
      },
    });
    const ownerByAdId = new Map(ads.map((ad) => [ad.id, ad.owner]));

    const counts = new Map<
      string,
      { id: string; name: string; isSuspended: boolean; reportCount: number }
    >();
    for (const group of grouped) {
      const owner = ownerByAdId.get(group.adId);
      if (!owner) continue;
      const entry = counts.get(owner.id) ?? { ...owner, reportCount: 0 };
      entry.reportCount += group._count._all;
      counts.set(owner.id, entry);
    }

    return [...counts.values()]
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, MOST_REPORTED_LIMIT);
  }
}
