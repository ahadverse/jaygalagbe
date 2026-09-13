import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdStatus, ReportStatus } from '../generated/prisma/client.js';
import { CreateReportDto } from './dto/create-report.dto.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, adId: string, dto: CreateReportDto) {
    const ad = await this.prisma.ad.findUnique({
      where: { id: adId },
      select: { id: true, ownerId: true, status: true },
    });
    if (!ad || ad.status !== AdStatus.LIVE) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId === reporterId) {
      throw new BadRequestException('You cannot report your own ad');
    }

    const existing = await this.prisma.report.findFirst({
      where: { adId, reporterId, status: ReportStatus.PENDING },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'You have already reported this ad — our team is reviewing it',
      );
    }

    return this.prisma.report.create({
      data: {
        adId,
        reporterId,
        reason: dto.note ? `${dto.reasonCode}: ${dto.note}` : dto.reasonCode,
      },
    });
  }
}
