import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ToStringArray } from '../../common/transforms.js';
import {
  AdStatus,
  ReportStatus,
  Sector,
} from '../../generated/prisma/client.js';

export const REPORT_SORT_FIELDS = [
  'createdAt',
  'status',
  'ad',
  'reporter',
] as const;

export type ReportSortField = (typeof REPORT_SORT_FIELDS)[number];

export class ListReportsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: REPORT_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(REPORT_SORT_FIELDS)
  sort?: ReportSortField;

  @ApiPropertyOptional({ enum: ReportStatus, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(ReportStatus, { each: true })
  status?: ReportStatus[];

  @ApiPropertyOptional({
    enum: AdStatus,
    isArray: true,
    description: 'Status of the reported ad',
  })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(AdStatus, { each: true })
  adStatus?: AdStatus[];

  @ApiPropertyOptional({ enum: Sector, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(Sector, { each: true })
  sector?: Sector[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adId?: string;

  @ApiPropertyOptional({ description: 'ISO date — reported on or after' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — reported on or before' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
