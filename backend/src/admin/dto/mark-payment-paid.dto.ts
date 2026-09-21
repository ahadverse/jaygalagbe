import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToTrimmedString } from '../../common/transforms.js';

/**
 * Settling a payment by hand hands out a paid boost without the gateway having
 * confirmed anything, so both fields exist to make the decision traceable: why
 * the admin believes the money arrived, and the reference they checked it
 * against. `POST /admin/transactions/:id/recheck` is the safe route and should
 * be tried first — this is the override for when the gateway cannot confirm.
 */
export class MarkPaymentPaidDto {
  @ApiProperty({
    minLength: 8,
    maxLength: 300,
    description:
      'Evidence the money arrived — kept in the audit log against your account',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(300)
  reason!: string;

  @ApiPropertyOptional({
    maxLength: 120,
    description:
      'The gateway or bank reference checked against, when there is one',
  })
  @IsOptional()
  @ToTrimmedString()
  @IsString()
  @MaxLength(120)
  gatewayRef?: string;
}
