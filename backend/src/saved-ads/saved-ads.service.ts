import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isObjectId } from '../common/object-id.js';
import { paginate, resolvePage } from '../common/pagination.js';
import { AdStatus } from '../generated/prisma/client.js';
import type { ListSavedAdsDto } from './dto/list-saved-ads.dto.js';

/** Upper bound on the id list so one account cannot make it unbounded. */
const MAX_SAVED_IDS = 1000;

/** Saved rows only count while the ad is still public. */
const LIVE_AD = { status: AdStatus.LIVE };

@Injectable()
export class SavedAdsService {
  constructor(private readonly prisma: PrismaService) {}

  async save(userId: string, adId: string) {
    const ad = isObjectId(adId)
      ? await this.prisma.ad.findFirst({
          where: { id: adId, ...LIVE_AD },
          select: { id: true },
        })
      : null;
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    // Upsert keeps repeat taps (and two devices racing) idempotent.
    await this.prisma.savedAd.upsert({
      where: { userId_adId: { userId, adId } },
      create: { userId, adId },
      update: {},
    });
    return { adId, saved: true };
  }

  async unsave(userId: string, adId: string) {
    if (isObjectId(adId)) {
      await this.prisma.savedAd.deleteMany({ where: { userId, adId } });
    }
    return { adId, saved: false };
  }

  async list(userId: string, query: ListSavedAdsDto) {
    const page = resolvePage(query);
    const where = { userId, ad: LIVE_AD };

    const [rows, total] = await Promise.all([
      this.prisma.savedAd.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page.skip,
        take: page.take,
        include: { ad: true },
      }),
      this.prisma.savedAd.count({ where }),
    ]);

    return paginate(
      rows.map((row) => ({ ...row.ad, savedAt: row.createdAt })),
      total,
      page,
      { field: 'createdAt', direction: 'desc' },
    );
  }

  async listIds(userId: string) {
    const rows = await this.prisma.savedAd.findMany({
      where: { userId, ad: LIVE_AD },
      orderBy: { createdAt: 'desc' },
      take: MAX_SAVED_IDS,
      select: { adId: true },
    });
    return { adIds: rows.map((row) => row.adId) };
  }
}
