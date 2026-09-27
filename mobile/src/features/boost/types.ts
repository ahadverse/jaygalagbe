export type BoostTier = 'THREE_DAY' | 'SEVEN_DAY' | 'FIFTEEN_DAY';
export type PaymentGateway = 'BKASH' | 'NAGAD' | 'CARD';

// Mirrors web/src/lib/boost/config.ts.
export const BOOST_TIERS: {
  value: BoostTier;
  label: string;
  priceBdt: number;
  blurb: string;
}[] = [
  {
    value: 'THREE_DAY',
    label: '3 days',
    priceBdt: 300,
    blurb: 'A quick push over the weekend.',
  },
  {
    value: 'SEVEN_DAY',
    label: '7 days',
    priceBdt: 600,
    blurb: 'Most popular - a full week at the top.',
  },
  {
    value: 'FIFTEEN_DAY',
    label: '15 days',
    priceBdt: 1000,
    blurb: 'Best value per day for slower-moving plots.',
  },
];

export const PAYMENT_GATEWAYS: { value: PaymentGateway; label: string }[] = [
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'CARD', label: 'Card' },
];

export type Boost = {
  id: string;
  adId: string;
  tier: BoostTier;
  status: string;
  paymentId: string;
  payment: {
    id: string;
    gateway: PaymentGateway;
    amount: string;
    status: string;
  };
};
