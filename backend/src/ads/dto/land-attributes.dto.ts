import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class LandAttributesDto {
  @IsNumber()
  @Min(0)
  sizeKatha!: number;

  @IsOptional()
  @IsString()
  propertyType?: string;
}
