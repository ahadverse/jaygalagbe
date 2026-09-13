import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MAX_PAGE_SIZE, type SortOrder } from '../pagination.js';
import { ToTrimmedString } from '../transforms.js';

/**
 * Shared list-query shape for every admin table: `?page=&limit=&sort=&order=&search=`.
 * Concrete list DTOs extend this and add their own filters plus a `sort` field
 * constrained to the columns that table can actually order by.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_PAGE_SIZE, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: SortOrder;

  @ApiPropertyOptional({ description: 'Free-text search across key columns' })
  @IsOptional()
  @ToTrimmedString()
  @IsString()
  @MaxLength(120)
  search?: string;
}
