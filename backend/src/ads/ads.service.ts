import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdStatus, Sector, type Prisma } from '../generated/prisma/client.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { CreateAdDto } from './dto/create-ad.dto.js';
import { UpdateAdDto } from './dto/update-ad.dto.js';

function toInputJson(
  attributes: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  return attributes as Prisma.InputJsonValue | undefined;
}

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateAdDto) {
    return this.prisma.ad.create({
      data: {
        ownerId,
        sector: dto.sector,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        locationArea: dto.locationArea,
        locationDistrict: dto.locationDistrict,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        photos: dto.photos ?? [],
        attributes: toInputJson(dto.attributes),
      },
    });
  }

  findLive(sector?: Sector) {
    return this.prisma.ad.findMany({
      where: { status: AdStatus.LIVE, sector },
      orderBy: { createdAt: 'desc' },
    });
  }

  findMine(ownerId: string) {
    return this.prisma.ad.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneVisible(id: string, requester?: AuthenticatedUser) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad || !this.canView(ad.status, ad.ownerId, requester)) {
      throw new NotFoundException('Ad not found');
    }
    return ad;
  }

  async update(id: string, ownerId: string, dto: UpdateAdDto) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this ad');
    }

    return this.prisma.ad.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        locationArea: dto.locationArea,
        locationDistrict: dto.locationDistrict,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        photos: dto.photos,
        attributes: toInputJson(dto.attributes),
      },
    });
  }

  async softDelete(id: string, requester: AuthenticatedUser) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId !== requester.id && !requester.isAdmin) {
      throw new ForbiddenException('You do not own this ad');
    }

    await this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.REMOVED },
    });
  }

  private canView(
    status: AdStatus,
    ownerId: string,
    requester?: AuthenticatedUser,
  ): boolean {
    if (status === AdStatus.LIVE) {
      return true;
    }
    return requester?.id === ownerId || requester?.isAdmin === true;
  }
}
