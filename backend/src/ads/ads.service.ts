import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AdStatus,
  Sector,
  type Ad,
  type Prisma,
} from '../generated/prisma/client.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import {
  NotificationEvent,
  type AdApprovedPayload,
  type AdRejectedPayload,
} from '../notifications/notification-events.js';
import { CreateAdDto } from './dto/create-ad.dto.js';
import { UpdateAdDto } from './dto/update-ad.dto.js';
import { validateSectorAttributes } from './sector-attributes.validator.js';
import { assertTransition } from './ad-status.util.js';
import { isValidBdLocation } from '../common/bd-geo.js';
import { RejectAdDto } from './dto/reject-ad.dto.js';

function toInputJson(
  attributes: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  return attributes as Prisma.InputJsonValue | undefined;
}

function assertValidLocation(
  division: string | undefined,
  district: string,
  thana: string,
) {
  if (!isValidBdLocation(division, district, thana)) {
    throw new BadRequestException(
      'Pick a real division, district and thana combination',
    );
  }
}

function changesModeratedContent(current: Ad, dto: UpdateAdDto): boolean {
  if (dto.attributes !== undefined) {
    return true;
  }

  return MODERATED_FIELDS.some((field) => {
    const next = dto[field];
    if (next === undefined) return false;
    if (field === 'price') return String(next) !== current.price.toString();
    if (field === 'photos') {
      return (next as string[]).join('\u0000') !== current.photos.join('\u0000');
    }
    return next !== current[field];
  });
}

const DEFAULT_LIVE_ADS_TAKE = 200;
const MAX_LIVE_ADS_TAKE = 200;
const MAX_LIVE_ADS_SKIP = 10_000;

/** Fields whose change makes a live ad a different listing to a reader. */
const MODERATED_FIELDS = [
  'title',
  'description',
  'price',
  'photos',
  'locationDivision',
  'locationArea',
  'locationDistrict',
  'address',
] as const;

function clampInteger(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

@Injectable()
export class AdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  create(ownerId: string, dto: CreateAdDto) {
    const attributes = validateSectorAttributes(dto.sector, dto.attributes);
    assertValidLocation(
      dto.locationDivision,
      dto.locationDistrict,
      dto.locationArea,
    );

    return this.prisma.ad.create({
      data: {
        ownerId,
        sector: dto.sector,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        locationDivision: dto.locationDivision,
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

  findLive(sector?: Sector, pagination?: { take?: number; skip?: number }) {
    const take = clampInteger(
      pagination?.take,
      DEFAULT_LIVE_ADS_TAKE,
      1,
      MAX_LIVE_ADS_TAKE,
    );
    const skip = clampInteger(pagination?.skip, 0, 0, MAX_LIVE_ADS_SKIP);

    return this.prisma.ad.findMany({
      where: { status: AdStatus.LIVE, sector },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
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

    // An edit may send all three or none of them; a partial change still has to
    // land on a real place, so the stored values fill the gaps.
    if (dto.locationDivision || dto.locationDistrict || dto.locationArea) {
      assertValidLocation(
        dto.locationDivision ?? ad.locationDivision ?? undefined,
        dto.locationDistrict ?? ad.locationDistrict,
        dto.locationArea ?? ad.locationArea,
      );
    }

    // Editing the substance of a published ad sends it back through review, so
    // an approved listing cannot be swapped for unmoderated content.
    const needsReview =
      ad.status === AdStatus.LIVE && changesModeratedContent(ad, dto);

    return this.prisma.ad.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        locationDivision: dto.locationDivision,
        locationArea: dto.locationArea,
        locationDistrict: dto.locationDistrict,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        photos: dto.photos,
        attributes: toInputJson(attributes),
        ...(needsReview
          ? { status: AdStatus.PENDING, rejectionReason: null }
          : {}),
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

    const updated = await this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.LIVE, rejectionReason: null },
    });

    this.eventEmitter.emit(NotificationEvent.AdApproved, {
      userId: updated.ownerId,
      adId: updated.id,
      adTitle: updated.title,
    } satisfies AdApprovedPayload);

    return updated;
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

    const updated = await this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.REJECTED, rejectionReason },
    });

    this.eventEmitter.emit(NotificationEvent.AdRejected, {
      userId: updated.ownerId,
      adId: updated.id,
      adTitle: updated.title,
      reason: rejectionReason,
    } satisfies AdRejectedPayload);

    return updated;
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
