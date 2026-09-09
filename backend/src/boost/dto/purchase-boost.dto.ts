import { IsEnum } from 'class-validator';
import { BoostTier, PaymentGateway } from '../../generated/prisma/client.js';

export class PurchaseBoostDto {
  @IsEnum(BoostTier)
  tier!: BoostTier;

  @IsEnum(PaymentGateway)
  gateway!: PaymentGateway;
}
