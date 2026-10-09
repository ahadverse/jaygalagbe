import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const CONTACT_TOPICS = [
  'general',
  'listing',
  'advertising',
  'account',
  'report',
  'other',
] as const;

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsIn(CONTACT_TOPICS)
  topic!: (typeof CONTACT_TOPICS)[number];

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
