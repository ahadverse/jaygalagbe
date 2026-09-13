import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportReasonCode } from '../report-reason-code.enum.js';

export class CreateReportDto {
  @IsEnum(ReportReasonCode)
  reasonCode!: ReportReasonCode;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
