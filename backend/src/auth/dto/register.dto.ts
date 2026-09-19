import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Local (01XXXXXXXXX) or +880 form — the only numbers the platform serves. */
export const BD_PHONE_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(BD_PHONE_PATTERN, { message: 'phone must be a valid BD number' })
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
