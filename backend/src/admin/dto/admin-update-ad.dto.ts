import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
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
import { ApiPropertyOptional } from '@nestjs/swagger';

const MAX_PHOTOS = 10;

/**
 * What an admin may change on someone else's listing.
 *
 * Deliberately not `PartialType(CreateAdDto)`: the sector decides which
 * attribute schema applies and re-pointing it would invalidate the stored
 * attributes, and status is moved through the moderation endpoints so the
 * transition rules stay in one place.
 */
export class AdminUpdateAdDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  locationDivision?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  locationDistrict?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  locationArea?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ type: [String], maxItems: MAX_PHOTOS })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PHOTOS)
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ description: 'Sector-specific attributes' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Why the listing was edited — kept in the audit log',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
