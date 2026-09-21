import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ToBoolean, ToStringArray } from '../../common/transforms.js';
import { BoostStatus, BoostTier } from '../../generated/prisma/client.js';

export const BOOST_SORT_FIELDS = [
  'createdAt',
  'startAt',
  'endAt',
  'status',
  'tier',
] as const;

export type BoostSortField = (typeof BOOST_SORT_FIELDS)[number];

/** How soon "expiring" means, for the shortcut filter and the summary tile. */
export const EXPIRING_WINDOW_HOURS = 72;

export class ListBoostsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: BOOST_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(BOOST_SORT_FIELDS)
  sort?: BoostSortField;

  @ApiPropertyOptional({ enum: BoostStatus, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(BoostStatus, { each: true })
  status?: BoostStatus[];

  @ApiPropertyOptional({ enum: BoostTier, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(BoostTier, { each: true })
  tier?: BoostTier[];

  @ApiPropertyOptional({
    description: `Active boosts ending within ${EXPIRING_WINDOW_HOURS} hours`,
  })
  @IsOptional()
  @ToBoolean()
  expiring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advertiserId?: string;

  @ApiPropertyOptional({ description: 'ISO date — started on or after' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — started on or before' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export const MAX_EXTENSION_DAYS = 30;

export class ExtendBoostDto {
  @ApiProperty({ minimum: 1, maximum: MAX_EXTENSION_DAYS })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_EXTENSION_DAYS)
  days!: number;

  @ApiPropertyOptional({ description: 'Why — recorded in the audit log' })
  @IsOptional()
  @IsString()
  reason?: string;
}
