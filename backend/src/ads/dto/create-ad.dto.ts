import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Sector } from '../../generated/prisma/client.js';

export const MAX_AD_PHOTOS = 12;
const MAX_PRICE_BDT = 100_000_000_000;

export class CreateAdDto {
  @IsEnum(Sector)
  sector!: Sector;

  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRICE_BDT)
  price!: number;

  // Division / district / thana are checked as a set in the service against the
  // real administrative tree, so a hand-rolled request cannot invent a place.
  @IsString()
  @MaxLength(80)
  locationDivision!: string;

  @IsString()
  @MaxLength(80)
  locationDistrict!: string;

  /** The thana/upazila within the district. */
  @IsString()
  @MaxLength(80)
  locationArea!: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  // Photos are rendered as image sources, so only absolute http(s) URLs are
  // accepted — `javascript:` and `data:` values never reach the database.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_AD_PHOTOS)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { each: true })
  @MaxLength(2000, { each: true })
  photos?: string[];

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
