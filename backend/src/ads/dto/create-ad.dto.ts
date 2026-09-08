import {
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Sector } from '../../generated/prisma/client.js';

export class CreateAdDto {
  @IsEnum(Sector)
  sector!: Sector;

  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @MinLength(2)
  locationArea!: string;

  @IsString()
  @MinLength(2)
  locationDistrict!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
