import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { UpsertReviewDto } from './dto/upsert-review.dto.js';

type ReviewWithCustomer = Prisma.ReviewGetPayload<{
  include: { customer: { select: { id: true; name: true } } };
}>;

const MAX_REVIEWS_PER_ADVERTISER = 100;
/** Caps the fan-out of the batch endpoint so one request cannot scan the table. */
export const MAX_BATCH_ADVERTISERS = 50;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(customerId: string, advertiserId: string, dto: UpsertReviewDto) {
    if (customerId === advertiserId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const advertiser = await this.prisma.user.findUnique({
      where: { id: advertiserId },
      select: { id: true },
    });
    if (!advertiser) {
      throw new NotFoundException('Advertiser not found');
    }

    const hasContacted = await this.prisma.conversation.findFirst({
      where: { customerId, advertiserId },
    });
    if (!hasContacted) {
      throw new ForbiddenException(
        'You can only review an advertiser after contacting them',
      );
    }

    return this.prisma.review.upsert({
      where: { advertiserId_customerId: { advertiserId, customerId } },
      create: {
        advertiserId,
        customerId,
        rating: dto.rating,
        comment: dto.comment,
      },
      update: { rating: dto.rating, comment: dto.comment },
    });
  }

  async findByAdvertiser(advertiserId: string) {
    // `isHidden` is a moderation decision: a hidden review is gone from the
    // public view and from the average, but the row stays for dispute handling.
    const [reviews, aggregate] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { advertiserId, isHidden: false },
        orderBy: { createdAt: 'desc' },
        take: MAX_REVIEWS_PER_ADVERTISER,
        include: { customer: { select: { id: true, name: true } } },
      }),
      this.prisma.review.aggregate({
        where: { advertiserId, isHidden: false },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return {
      reviews,
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count,
    };
  }

  async findByAdvertisers(advertiserIds: string[]) {
    const uniqueIds = [...new Set(advertiserIds)].slice(
      0,
      MAX_BATCH_ADVERTISERS,
    );
    const result: Record<
      string,
      {
        reviews: ReviewWithCustomer[];
        averageRating: number;
        reviewCount: number;
      }
    > = {};
    for (const id of uniqueIds) {
      result[id] = { reviews: [], averageRating: 0, reviewCount: 0 };
    }
    if (uniqueIds.length === 0) {
      return result;
    }

    const [reviews, aggregates] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { advertiserId: { in: uniqueIds }, isHidden: false },
        orderBy: { createdAt: 'desc' },
        take: MAX_REVIEWS_PER_ADVERTISER * uniqueIds.length,
        include: { customer: { select: { id: true, name: true } } },
      }),
      this.prisma.review.groupBy({
        by: ['advertiserId'],
        where: { advertiserId: { in: uniqueIds }, isHidden: false },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    for (const review of reviews) {
      result[review.advertiserId]?.reviews.push(review);
    }
    for (const aggregate of aggregates) {
      const entry = result[aggregate.advertiserId];
      if (entry) {
        entry.averageRating = aggregate._avg.rating ?? 0;
        entry.reviewCount = aggregate._count;
      }
    }

    return result;
  }

  async remove(customerId: string, advertiserId: string) {
    const review = await this.prisma.review.findUnique({
      where: { advertiserId_customerId: { advertiserId, customerId } },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.prisma.review.delete({ where: { id: review.id } });
  }
}
