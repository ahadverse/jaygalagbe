import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AdStatus,
  BoostStatus,
  PaymentStatus,
} from '../generated/prisma/client.js';
import { PurchaseBoostDto } from './dto/purchase-boost.dto.js';
import { BOOST_TIER_CONFIG } from './boost-tier.config.js';

@Injectable()
export class BoostService {
  constructor(private readonly prisma: PrismaService) {}

  async purchase(adId: string, ownerId: string, dto: PurchaseBoostDto) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this ad');
    }
    if (ad.status !== AdStatus.LIVE) {
      throw new BadRequestException('Only live ads can be boosted');
    }

    const existingBoost = await this.prisma.boost.findFirst({
      where: {
        adId,
        status: { in: [BoostStatus.PENDING, BoostStatus.ACTIVE] },
      },
    });
    if (existingBoost) {
      throw new BadRequestException(
        'This ad already has a pending or active boost',
      );
    }

    const { priceBdt } = BOOST_TIER_CONFIG[dto.tier];

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: ownerId,
          adId,
          gateway: dto.gateway,
          amount: priceBdt,
          status: PaymentStatus.PENDING,
        },
      });

      return tx.boost.create({
        data: {
          adId,
          tier: dto.tier,
          paymentId: payment.id,
          status: BoostStatus.PENDING,
        },
        include: { payment: true },
      });
    });
  }

  async activateOnPaymentSuccess(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { boost: true },
    });
    if (!payment || !payment.boost) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      return payment.boost;
    }

    const { days } = BOOST_TIER_CONFIG[payment.boost.tier];
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + days * 24 * 60 * 60 * 1000);

    const [, boost] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESS },
      }),
      this.prisma.boost.update({
        where: { id: payment.boost.id },
        data: { status: BoostStatus.ACTIVE, startAt, endAt },
      }),
    ]);

    return boost;
  }

  async cancelOnPaymentFailure(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { boost: true },
    });
    if (!payment || !payment.boost) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      return payment.boost;
    }

    const [, boost] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED },
      }),
      this.prisma.boost.update({
        where: { id: payment.boost.id },
        data: { status: BoostStatus.CANCELLED },
      }),
    ]);

    return boost;
  }
}
