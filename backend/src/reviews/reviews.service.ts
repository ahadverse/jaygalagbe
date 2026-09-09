import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertReviewDto } from './dto/upsert-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(customerId: string, advertiserId: string, dto: UpsertReviewDto) {
    if (customerId === advertiserId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const advertiser = await this.prisma.user.findUnique({
      where: { id: advertiserId },
    });
    if (!advertiser || !advertiser.isAdvertiser) {
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
    const [reviews, aggregate] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { advertiserId },
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true } } },
      }),
      this.prisma.review.aggregate({
        where: { advertiserId },
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
