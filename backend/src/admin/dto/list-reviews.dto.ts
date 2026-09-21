import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ToBoolean } from '../../common/transforms.js';

export const REVIEW_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'rating',
] as const;

export type ReviewSortField = (typeof REVIEW_SORT_FIELDS)[number];

export class ListReviewsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: REVIEW_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(REVIEW_SORT_FIELDS)
  sort?: ReviewSortField;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @ApiPropertyOptional({ description: 'Moderation state' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional({ description: 'Only reviews that left a comment' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasComment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advertiserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'ISO date — left on or after' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — left on or before' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
