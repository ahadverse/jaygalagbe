import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ToStringArray } from '../../common/transforms.js';
import { ContactMessageStatus } from '../../generated/prisma/client.js';
import { CONTACT_TOPICS } from '../../contact/dto/create-contact-message.dto.js';

export const CONTACT_SORT_FIELDS = [
  'createdAt',
  'name',
  'topic',
  'status',
] as const;

export type ContactSortField = (typeof CONTACT_SORT_FIELDS)[number];

export class ListContactsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CONTACT_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(CONTACT_SORT_FIELDS)
  sort?: ContactSortField;

  @ApiPropertyOptional({ enum: ContactMessageStatus, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsEnum(ContactMessageStatus, { each: true })
  status?: ContactMessageStatus[];

  @ApiPropertyOptional({ enum: CONTACT_TOPICS, isArray: true })
  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsIn(CONTACT_TOPICS, { each: true })
  topic?: string[];

  @ApiPropertyOptional({ description: 'ISO date — received on or after' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — received on or before' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
