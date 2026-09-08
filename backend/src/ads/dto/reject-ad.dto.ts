import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RejectionReasonCode } from '../rejection-reason-code.enum.js';

export class RejectAdDto {
  @IsEnum(RejectionReasonCode)
  reasonCode!: RejectionReasonCode;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
