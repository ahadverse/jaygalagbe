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
import { validateSectorAttributes } from './sector-attributes.validator.js';
import { assertTransition } from './ad-status.util.js';
import { RejectAdDto } from './dto/reject-ad.dto.js';

function toInputJson(
  attributes: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  return attributes as Prisma.InputJsonValue | undefined;
}

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateAdDto) {
    const attributes = validateSectorAttributes(dto.sector, dto.attributes);

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
        attributes: toInputJson(attributes),
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

    const attributes = dto.attributes
      ? validateSectorAttributes(ad.sector, dto.attributes)
      : undefined;

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
        attributes: toInputJson(attributes),
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
    assertTransition(ad.status, AdStatus.REMOVED);

    await this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.REMOVED },
    });
  }

  async markSold(id: string, ownerId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this ad');
    }
    assertTransition(ad.status, AdStatus.SOLD);

    return this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.SOLD },
    });
  }

  async resubmit(id: string, ownerId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this ad');
    }
    assertTransition(ad.status, AdStatus.PENDING);

    return this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.PENDING, rejectionReason: null },
    });
  }

  async approve(id: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    assertTransition(ad.status, AdStatus.LIVE);

    return this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.LIVE, rejectionReason: null },
    });
  }

  async reject(id: string, dto: RejectAdDto) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    assertTransition(ad.status, AdStatus.REJECTED);

    const rejectionReason = dto.note
      ? `${dto.reasonCode}: ${dto.note}`
      : dto.reasonCode;

    return this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.REJECTED, rejectionReason },
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
