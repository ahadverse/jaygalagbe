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
  ValidateIf,
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

  // Land always names a figure; a house-rent listing may go up without one
  // (common when the owner wants to negotiate), so it only validates when
  // actually present.
  @ValidateIf(
    (dto: CreateAdDto) =>
      dto.sector === Sector.LAND || (dto.price !== undefined && dto.price !== null),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRICE_BDT)
  price?: number | null;

  @IsString()
  @MaxLength(80)
  locationCountry!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  locationCountryCode?: string;

  // Bangladesh: division/district/thana are checked as a set in the service
  // against the real administrative tree, so a hand-rolled request cannot
  // invent a place — that check is what actually requires these two for a
  // Bangladesh ad. Elsewhere there's no such tree to check against, so they
  // stay optional here and are simply unused outside Bangladesh.
  @IsOptional()
  @IsString()
  @MaxLength(80)
  locationDivision?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  locationDistrict?: string;

  /** Bangladesh: the thana/upazila. Elsewhere: the city. Always required. */
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
