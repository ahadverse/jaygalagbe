import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LogVisitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  sessionId!: string;
}
