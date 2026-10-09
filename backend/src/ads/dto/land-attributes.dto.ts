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
}
