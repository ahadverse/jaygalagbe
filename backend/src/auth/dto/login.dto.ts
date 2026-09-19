import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}
