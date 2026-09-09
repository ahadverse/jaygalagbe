import { IsNotEmpty, IsString } from 'class-validator';

export class LogVisitDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
