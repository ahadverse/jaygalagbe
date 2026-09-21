import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ToTrimmedString } from '../../common/transforms.js';

/**
 * What an admin may correct on an account — a misspelled name, a wrong
 * contact detail, or a manual verification after checking documents.
 *
 * Admin access and suspension are not here: both have their own endpoints so
 * their guard rules (last admin, self-demotion) cannot be bypassed by a
 * general-purpose update.
 */
export class AdminUpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ToTrimmedString()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  // Blank is dropped by the trim transform, so a contact detail can be
  // corrected but not emptied — an account with neither could not sign in.
  @ApiPropertyOptional()
  @IsOptional()
  @ToTrimmedString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ToTrimmedString()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Mark the account verified by hand' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Why — kept in the audit log' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
