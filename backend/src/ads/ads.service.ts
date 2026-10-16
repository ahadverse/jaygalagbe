import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  AdStatus,
  AuditAction,
  AuditTargetType,
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

/** Case/whitespace-insensitive — client-sent country names and our own
 * seeded "Bangladesh" should match regardless of how either was typed. */
function isBangladesh(country: string | undefined): boolean {
  return (country ?? '').trim().toLowerCase() === 'bangladesh';
}

/**
 * Division/district/thana are only checked against the real administrative
 * tree for Bangladesh — that's the only country this ships a tree for.
 * Elsewhere the client's country/state/city picks are trusted as-is; the
 * only hard requirement everywhere is that `locationArea` (the city) is a
 * non-empty string, which the DTO already guarantees.
 */
function assertValidLocation(
  country: string | undefined,
  division: string | undefined,
  district: string | undefined,
  thana: string,
) {
  if (!isBangladesh(country)) return;
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
    if (field === 'price') return String(next) !== String(current.price);
    if (field === 'photos') {
      return (next as string[]).join('\u0000') !== current.photos.join('\u0000');
    }
    return next !== current[field];
  });
}

/** Digits shown to everyone; the rest of the number stays server-side. */
const PHONE_PREVIEW_DIGITS = 3;

/** "+8801712345678" -> "01712345678", so the preview is always the local prefix. */
function toLocalPhone(phone: string): string {
  return phone.replace(/^\+?880/, '0');
}

function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const local = toLocalPhone(phone);
  return (
    local.slice(0, PHONE_PREVIEW_DIGITS) +
    '•'.repeat(Math.max(local.length - PHONE_PREVIEW_DIGITS, 0))
  );
}

const DEFAULT_LIVE_ADS_TAKE = 200;
const MAX_LIVE_ADS_TAKE = 200;
const MAX_LIVE_ADS_SKIP = 10_000;

// A sold/rented listing stays in public results for a short window, stamped
// as unavailable, instead of vanishing the instant it's marked — buyers see
// it went to someone else rather than the listing just disappearing.
const SOLD_VISIBILITY_DAYS = 7;

function isRecentlySold(ad: { status: AdStatus; updatedAt: Date }): boolean {
  if (ad.status !== AdStatus.SOLD) return false;
  const cutoff = Date.now() - SOLD_VISIBILITY_DAYS * 24 * 60 * 60 * 1000;
  return ad.updatedAt.getTime() >= cutoff;
}

/** Fields whose change makes a live ad a different listing to a reader. */
const MODERATED_FIELDS = [
  'title',
  'description',
  'price',
  'photos',
  'locationCountry',
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
    private readonly audit: AuditService,
  ) {}

  async create(ownerId: string, dto: CreateAdDto) {
    // Buyers reach advertisers by phone, so an ad cannot go up without one.
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { phone: true },
    });
    if (!owner?.phone) {
      throw new BadRequestException(
        'A phone number is required to post an ad',
      );
    }

    const attributes = validateSectorAttributes(dto.sector, dto.attributes);
    assertValidLocation(
      dto.locationCountry,
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
        locationCountry: dto.locationCountry,
        locationCountryCode: dto.locationCountryCode,
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
    const soldCutoff = new Date(Date.now() - SOLD_VISIBILITY_DAYS * 24 * 60 * 60 * 1000);

    return this.prisma.ad.findMany({
      where: {
        sector,
        OR: [
          { status: AdStatus.LIVE },
          { status: AdStatus.SOLD, updatedAt: { gte: soldCutoff } },
        ],
      },
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
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { owner: { select: { phone: true } } },
    });
    if (!ad || !this.canView(ad, requester)) {
      throw new NotFoundException('Ad not found');
    }
    const { owner, ...rest } = ad;
    return { ...rest, ownerPhoneMasked: maskPhone(owner.phone) };
  }

  /** Full advertiser number; the controller only lets signed-in users here. */
  async revealPhone(id: string, requester: AuthenticatedUser) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { owner: { select: { phone: true } } },
    });
    if (!ad || !this.canView(ad, requester)) {
      throw new NotFoundException('Ad not found');
    }
    if (!ad.owner.phone) {
      throw new NotFoundException('The advertiser has no phone number');
    }
    return { phone: toLocalPhone(ad.owner.phone) };
  }

  async update(id: string, ownerId: string, dto: UpdateAdDto) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    if (ad.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this ad');
    }

    // Only a house-rent listing may go without a price; land keeps the sector
    // it was posted under, so that rule is checked against the stored sector
    // rather than anything the request sent.
    if (dto.price === null && ad.sector === Sector.LAND) {
      throw new BadRequestException('Land listings must have an asking price');
    }

    const attributes = dto.attributes
      ? validateSectorAttributes(ad.sector, dto.attributes)
      : undefined;

    // An edit may send any subset of these; a partial change still has to
    // land on a real place, so the stored values fill the gaps. Ads written
    // before worldwide locations existed have no stored country — they're
    // all Bangladesh, so that's the fallback.
    if (
      dto.locationCountry ||
      dto.locationDivision ||
      dto.locationDistrict ||
      dto.locationArea
    ) {
      assertValidLocation(
        dto.locationCountry ?? ad.locationCountry ?? 'Bangladesh',
        dto.locationDivision ?? ad.locationDivision ?? undefined,
        dto.locationDistrict ?? ad.locationDistrict ?? undefined,
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
        locationCountry: dto.locationCountry,
        locationCountryCode: dto.locationCountryCode,
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
    const isOwner = ad.ownerId === requester.id;
    if (!isOwner && !requester.isAdmin) {
      throw new ForbiddenException('You do not own this ad');
    }
    assertTransition(ad.status, AdStatus.REMOVED);

    await this.prisma.ad.update({
      where: { id },
      data: { status: AdStatus.REMOVED },
    });

    // An owner deleting their own listing is ordinary use, not moderation.
    if (!isOwner) {
      await this.audit.record({
        actorId: requester.id,
        action: AuditAction.AD_REMOVE,
        targetType: AuditTargetType.AD,
        targetId: ad.id,
        summary: `Took down "${ad.title}"`,
        metadata: { previousStatus: ad.status, ownerId: ad.ownerId },
      });
    }
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

  async approve(id: string, actorId: string, batchId?: string) {
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

    await this.audit.record({
      actorId,
      action: AuditAction.AD_APPROVE,
      targetType: AuditTargetType.AD,
      targetId: updated.id,
      summary: `Approved "${updated.title}"`,
      metadata: { previousStatus: ad.status, ownerId: ad.ownerId, batchId },
    });

    return updated;
  }

  async reject(id: string, dto: RejectAdDto, actorId: string, batchId?: string) {
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

    await this.audit.record({
      actorId,
      action: AuditAction.AD_REJECT,
      targetType: AuditTargetType.AD,
      targetId: updated.id,
      summary: `Rejected "${updated.title}" — ${dto.reasonCode}`,
      metadata: {
        previousStatus: ad.status,
        ownerId: ad.ownerId,
        reasonCode: dto.reasonCode,
        note: dto.note,
        batchId,
      },
    });

    return updated;
  }

  private canView(
    ad: { status: AdStatus; updatedAt: Date; ownerId: string },
    requester?: AuthenticatedUser,
  ): boolean {
    if (ad.status === AdStatus.LIVE || isRecentlySold(ad)) {
      return true;
    }
    return requester?.id === ad.ownerId || requester?.isAdmin === true;
  }
}
