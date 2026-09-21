import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const GRANULARITIES = ['day', 'week', 'month'] as const;
export type Granularity = (typeof GRANULARITIES)[number];

/** Presets the console offers; `custom` is driven by `from`/`to`. */
export const RANGE_PRESETS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
} as const;

export type RangePreset = keyof typeof RANGE_PRESETS;

export const DEFAULT_RANGE: RangePreset = '30d';

/** A year of daily buckets is 365 points — past that, force a coarser grain. */
export const MAX_BUCKETS = 400;

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: Object.keys(RANGE_PRESETS),
    default: DEFAULT_RANGE,
    description: 'Ignored when both `from` and `to` are given',
  })
  @IsOptional()
  @IsIn(Object.keys(RANGE_PRESETS))
  range?: RangePreset;

  @ApiPropertyOptional({ description: 'ISO date — start of a custom range' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date — end of a custom range' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    enum: GRANULARITIES,
    description: 'Defaults to whatever keeps the series readable for the range',
  })
  @IsOptional()
  @IsIn(GRANULARITIES)
  granularity?: Granularity;
}
