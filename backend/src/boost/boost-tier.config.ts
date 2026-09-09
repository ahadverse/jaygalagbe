import { BoostTier } from '../generated/prisma/client.js';

export interface BoostTierConfig {
  days: number;
  priceBdt: number;
}

export const BOOST_TIER_CONFIG: Record<BoostTier, BoostTierConfig> = {
  [BoostTier.THREE_DAY]: { days: 3, priceBdt: 300 },
  [BoostTier.SEVEN_DAY]: { days: 7, priceBdt: 600 },
  [BoostTier.FIFTEEN_DAY]: { days: 15, priceBdt: 1000 },
};
