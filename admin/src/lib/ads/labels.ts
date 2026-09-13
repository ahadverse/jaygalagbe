import type {
  AdStatus,
  BoostTier,
  PaymentGateway,
  PaymentStatus,
  ReportStatus,
  Sector,
} from '@/lib/api/types';

export const SECTOR_LABEL: Record<Sector, string> = {
  LAND: 'Jayga Jomi',
  HOUSE_RENT: 'Basha Bhara',
};

export const AD_STATUS_LABEL: Record<AdStatus, string> = {
  PENDING: 'Pending',
  LIVE: 'Live',
  REJECTED: 'Rejected',
  SOLD: 'Sold',
  REMOVED: 'Removed',
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: 'Pending',
  REVIEWED: 'Reviewed',
  DISMISSED: 'Dismissed',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAILED: 'Failed',
};

export const GATEWAY_LABEL: Record<PaymentGateway, string> = {
  BKASH: 'bKash',
  NAGAD: 'Nagad',
  CARD: 'Card',
};

export const BOOST_TIER_LABEL: Record<BoostTier, string> = {
  THREE_DAY: '3 days',
  SEVEN_DAY: '7 days',
  FIFTEEN_DAY: '15 days',
};

export const REJECTION_REASONS = [
  { code: 'FAKE_LISTING', label: 'Fake or misleading listing' },
  { code: 'DUPLICATE', label: 'Duplicate of another listing' },
  { code: 'WRONG_CATEGORY', label: 'Posted in the wrong sector' },
  { code: 'POOR_PHOTOS', label: 'Photos missing or unusable' },
  { code: 'PRICE_MISMATCH', label: 'Price does not match the property' },
  { code: 'OTHER', label: 'Other (explain below)' },
] as const;

export type RejectionReasonCode = (typeof REJECTION_REASONS)[number]['code'];

/** Options shaped for `FilterSelect`, derived from a label map. */
export function toOptions<T extends string>(
  labels: Record<T, string>,
): { value: string; label: string }[] {
  return Object.entries(labels).map(([value, label]) => ({
    value,
    label: label as string,
  }));
}
