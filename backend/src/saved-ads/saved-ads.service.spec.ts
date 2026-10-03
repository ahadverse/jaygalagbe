import { NotFoundException } from '@nestjs/common';
import { SavedAdsService } from './saved-ads.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const USER = 'a'.repeat(24);
const AD = 'b'.repeat(24);

describe('SavedAdsService', () => {
  let prisma: {
    ad: { findFirst: ReturnType<typeof vi.fn> };
    savedAd: Record<string, ReturnType<typeof vi.fn>>;
  };
  let service: SavedAdsService;

  beforeEach(() => {
    prisma = {
      ad: { findFirst: vi.fn() },
      savedAd: {
        upsert: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    service = new SavedAdsService(prisma as unknown as PrismaService);
  });

  describe('save', () => {
    it('upserts for a live ad', async () => {
      prisma.ad.findFirst.mockResolvedValue({ id: AD });
      await expect(service.save(USER, AD)).resolves.toEqual({
        adId: AD,
        saved: true,
      });
      expect(prisma.ad.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: AD, status: 'LIVE' } }),
      );
      expect(prisma.savedAd.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_adId: { userId: USER, adId: AD } },
        }),
      );
    });

    it('404s when the ad is not live', async () => {
      prisma.ad.findFirst.mockResolvedValue(null);
      await expect(service.save(USER, AD)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.savedAd.upsert).not.toHaveBeenCalled();
    });

    it('404s on a malformed id without querying', async () => {
      await expect(service.save(USER, 'nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.ad.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('unsave', () => {
    it('deletes the row and is idempotent', async () => {
      await expect(service.unsave(USER, AD)).resolves.toEqual({
        adId: AD,
        saved: false,
      });
      expect(prisma.savedAd.deleteMany).toHaveBeenCalledWith({
        where: { userId: USER, adId: AD },
      });
    });

    it('ignores a malformed id', async () => {
      await service.unsave(USER, 'nope');
      expect(prisma.savedAd.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns live ads with pagination meta', async () => {
      const createdAt = new Date();
      prisma.savedAd.findMany.mockResolvedValue([
        { id: 's1', createdAt, ad: { id: AD, title: 'Plot' } },
      ]);
      prisma.savedAd.count.mockResolvedValue(21);

      const result = await service.list(USER, { page: 2, limit: 10 });

      expect(prisma.savedAd.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER, ad: { status: 'LIVE' } },
          skip: 10,
          take: 10,
        }),
      );
      expect(result.data).toEqual([
        { id: AD, title: 'Plot', savedAt: createdAt },
      ]);
      expect(result.meta).toMatchObject({
        page: 2,
        total: 21,
        totalPages: 3,
        hasNextPage: true,
      });
    });
  });

  describe('listIds', () => {
    it('returns only the ad ids', async () => {
      prisma.savedAd.findMany.mockResolvedValue([{ adId: AD }]);
      await expect(service.listIds(USER)).resolves.toEqual({ adIds: [AD] });
    });
  });
});
