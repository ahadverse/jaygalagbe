import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ToBoolean } from '../../common/transforms.js';
import { Role } from '../../auth/role.enum.js';

export const USER_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'name',
  'email',
  'ads',
] as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export class ListUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: USER_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(USER_SORT_FIELDS)
  sort?: UserSortField;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  suspended?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ description: 'ISO date — joined on or after' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — joined on or before' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
