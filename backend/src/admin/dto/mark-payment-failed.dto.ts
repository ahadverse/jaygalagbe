import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkPaymentFailedDto {
  @ApiProperty({
    minLength: 4,
    maxLength: 300,
    description: 'Why this payment is being closed — kept in the audit log',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(300)
  reason!: string;
}
