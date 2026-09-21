import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '../../generated/prisma/client.js';
import { RejectionReasonCode } from '../../ads/rejection-reason-code.enum.js';

/**
 * One page of the largest table is 100 rows, so 100 is the most a moderator can
 * have selected. The cap keeps a bulk run bounded and its response readable.
 */
export const MAX_BULK_IDS = 100;

class BulkIdsDto {
  @ApiProperty({ type: [String], maxItems: MAX_BULK_IDS })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_BULK_IDS)
  @IsString({ each: true })
  ids!: string[];
}

/** `REMOVE` is the reversible take-down; `DELETE` is permanent. */
export const BULK_AD_ACTIONS = [
  'APPROVE',
  'REJECT',
  'REMOVE',
  'DELETE',
] as const;
export type BulkAdAction = (typeof BULK_AD_ACTIONS)[number];

export class BulkAdActionDto extends BulkIdsDto {
  @ApiProperty({ enum: BULK_AD_ACTIONS })
  @IsIn(BULK_AD_ACTIONS)
  action!: BulkAdAction;

  @ApiPropertyOptional({
    enum: RejectionReasonCode,
    description: 'Required when action is REJECT',
  })
  @IsOptional()
  @IsEnum(RejectionReasonCode)
  reasonCode?: RejectionReasonCode;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export const BULK_USER_ACTIONS = ['SUSPEND', 'UNSUSPEND', 'DELETE'] as const;
export type BulkUserAction = (typeof BULK_USER_ACTIONS)[number];

export class BulkUserActionDto extends BulkIdsDto {
  @ApiProperty({ enum: BULK_USER_ACTIONS })
  @IsIn(BULK_USER_ACTIONS)
  action!: BulkUserAction;
}

/** The two resolutions, plus the permanent delete the other tables also have. */
export const BULK_REPORT_ACTIONS = [
  ReportStatus.REVIEWED,
  ReportStatus.DISMISSED,
  'DELETE',
] as const;
export type BulkReportAction = (typeof BULK_REPORT_ACTIONS)[number];

export class BulkReportActionDto extends BulkIdsDto {
  @ApiProperty({ enum: BULK_REPORT_ACTIONS })
  @IsIn(BULK_REPORT_ACTIONS)
  action!: BulkReportAction;
}

/**
 * A bulk run is best-effort per row, never all-or-nothing: one listing that
 * already moved on must not block the other 99. The caller gets back exactly
 * which ids failed and why, so the UI can report it honestly.
 */
export interface BulkResult {
  batchId: string;
  requested: number;
  succeeded: string[];
  failed: { id: string; reason: string }[];
}
