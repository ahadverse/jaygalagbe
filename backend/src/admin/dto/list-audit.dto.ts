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
  AuditAction,
  AuditTargetType,
} from '../../generated/prisma/client.js';

export const AUDIT_SORT_FIELDS = ['createdAt', 'action', 'actor'] as const;

export type AuditSortField = (typeof AUDIT_SORT_FIELDS)[number];

export class ListAuditDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AUDIT_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(AUDIT_SORT_FIELDS)
  sort?: AuditSortField;

  @ApiPropertyOptional({ enum: AuditAction, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(AuditAction, { each: true })
  action?: AuditAction[];

  @ApiPropertyOptional({ enum: AuditTargetType, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(AuditTargetType, { each: true })
  targetType?: AuditTargetType[];

  @ApiPropertyOptional({ description: 'Only entries by this admin' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ description: 'Full history of one record' })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ description: 'ISO date — on or after' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — on or before' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
