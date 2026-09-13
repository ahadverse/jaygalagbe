import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ToBoolean, ToStringArray } from '../../common/transforms.js';
import { AdStatus, Sector } from '../../generated/prisma/client.js';

export const AD_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'title',
  'price',
  'status',
  'sector',
  'owner',
  'reports',
] as const;

export type AdSortField = (typeof AD_SORT_FIELDS)[number];

export class ListAdsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AD_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(AD_SORT_FIELDS)
  sort?: AdSortField;

  @ApiPropertyOptional({
    enum: AdStatus,
    isArray: true,
    description: 'Repeatable or comma-separated',
  })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(AdStatus, { each: true })
  status?: AdStatus[];

  @ApiPropertyOptional({ enum: Sector, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(Sector, { each: true })
  sector?: Sector[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'ISO date — createdAt lower bound' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — createdAt upper bound' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Only ads with a currently active boost' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  boosted?: boolean;

  @ApiPropertyOptional({ description: 'Only ads with at least one report' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  reported?: boolean;
}
