import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class LandAttributesDto {
  @IsNumber()
  @Min(0)
  size!: number;

  @IsIn(['katha', 'decimal'])
  sizeUnit!: 'katha' | 'decimal';

  @IsOptional()
  @IsString()
  propertyType?: string;

  /** Absent means `total` — ads posted before this existed were always a
   * total asking price. */
  @IsOptional()
  @IsIn(['total', 'per_decimal'])
  priceType?: 'total' | 'per_decimal';
}
