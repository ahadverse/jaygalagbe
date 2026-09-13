import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '../../generated/prisma/client.js';

const RESOLUTIONS = [ReportStatus.REVIEWED, ReportStatus.DISMISSED] as const;

export type ReportResolution = (typeof RESOLUTIONS)[number];

export class ResolveReportDto {
  @ApiProperty({ enum: RESOLUTIONS })
  @IsIn(RESOLUTIONS)
  status!: ReportResolution;
}
