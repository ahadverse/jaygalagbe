import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ToStringArray } from '../../common/transforms.js';
import {
  BoostTier,
  PaymentGateway,
  PaymentStatus,
} from '../../generated/prisma/client.js';

export const TRANSACTION_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'amount',
  'status',
  'gateway',
  'user',
] as const;

export type TransactionSortField = (typeof TRANSACTION_SORT_FIELDS)[number];

export class ListTransactionsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TRANSACTION_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(TRANSACTION_SORT_FIELDS)
  sort?: TransactionSortField;

  @ApiPropertyOptional({ enum: PaymentStatus, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(PaymentStatus, { each: true })
  status?: PaymentStatus[];

  @ApiPropertyOptional({ enum: PaymentGateway, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(PaymentGateway, { each: true })
  gateway?: PaymentGateway[];

  @ApiPropertyOptional({ enum: BoostTier, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(BoostTier, { each: true })
  tier?: BoostTier[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advertiserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adId?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'ISO date — paid on or after' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — paid on or before' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
