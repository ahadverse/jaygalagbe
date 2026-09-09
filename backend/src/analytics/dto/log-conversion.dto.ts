import { IsOptional, IsString } from 'class-validator';

export class LogConversionDto {
  @IsOptional()
  @IsString()
  visitId?: string;
}
