import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class HouseRentAttributesDto {
  @IsInt()
  @Min(0)
  bedrooms!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsString()
  propertyType?: string;
}
