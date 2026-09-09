import { IsEnum } from 'class-validator';
import { ImpressionContext } from '../../generated/prisma/client.js';

export class LogImpressionDto {
  @IsEnum(ImpressionContext)
  context!: ImpressionContext;
}
