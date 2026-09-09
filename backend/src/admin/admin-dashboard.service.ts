import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentStatus } from '../generated/prisma/client.js';

const REVENUE_WINDOW_MONTHS = 6;
const MOST_REPORTED_LIMIT = 5;

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      adsByStatus,
      adsBySector,
      boostRevenueByMonth,
      mostReportedAdvertisers,
    ] = await Promise.all([
      this.getAdsByStatus(),
      this.getAdsBySector(),
      this.getBoostRevenueByMonth(),
      this.getMostReportedAdvertisers(),
    ]);

    return {
      adsByStatus,
      adsBySector,
      boostRevenueByMonth,
      mostReportedAdvertisers,
    };
  }

  private async getAdsByStatus() {
    const groups = await this.prisma.ad.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return groups.map((g) => ({ status: g.status, count: g._count._all }));
  }

  private async getAdsBySector() {
    const groups = await this.prisma.ad.groupBy({
      by: ['sector'],
      _count: { _all: true },
    });
    return groups.map((g) => ({ sector: g.sector, count: g._count._all }));
  }

  private async getBoostRevenueByMonth() {
    const since = new Date();
    since.setMonth(since.getMonth() - (REVENUE_WINDOW_MONTHS - 1), 1);
    since.setHours(0, 0, 0, 0);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.SUCCESS,
        boost: { isNot: null },
        createdAt: { gte: since },
      },
      select: { amount: true, createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (const payment of payments) {
      const month = `${payment.createdAt.getFullYear()}-${String(
        payment.createdAt.getMonth() + 1,
      ).padStart(2, '0')}`;
      buckets.set(month, (buckets.get(month) ?? 0) + payment.amount.toNumber());
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
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
      where: { id: { in: grouped.map((g) => g.adId) } },
      select: { id: true, owner: { select: { id: true, name: true } } },
    });
    const ownerByAdId = new Map(ads.map((ad) => [ad.id, ad.owner]));

    const counts = new Map<
      string,
      { id: string; name: string; reportCount: number }
    >();
    for (const group of grouped) {
      const owner = ownerByAdId.get(group.adId);
      if (!owner) continue;
      const entry = counts.get(owner.id) ?? {
        id: owner.id,
        name: owner.name,
        reportCount: 0,
      };
      entry.reportCount += group._count._all;
      counts.set(owner.id, entry);
    }

    return [...counts.values()]
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, MOST_REPORTED_LIMIT);
  }
}
