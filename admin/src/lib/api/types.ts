export type SortOrder = 'asc' | 'desc';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  sort: string;
  order: SortOrder;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export type Sector = 'LAND' | 'HOUSE_RENT';
export type AdStatus = 'PENDING' | 'LIVE' | 'REJECTED' | 'SOLD' | 'REMOVED';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type PaymentGateway = 'BKASH' | 'NAGAD' | 'CARD';
export type BoostTier = 'THREE_DAY' | 'SEVEN_DAY' | 'FIFTEEN_DAY';
export type BoostStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isAdvertiser: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdOwner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isSuspended: boolean;
}

export interface AdListItem {
  id: string;
  ownerId: string;
  owner: AdOwner;
  sector: Sector;
  title: string;
  description: string;
  price: string;
  locationArea: string;
  locationDistrict: string;
  address: string | null;
  photos: string[];
  attributes: Record<string, unknown> | null;
  status: AdStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  boosts: { id: string; tier: BoostTier; endAt: string | null }[];
  _count: { reports: number; conversations: number; visits: number };
}

export interface AdDetail extends Omit<AdListItem, 'boosts' | '_count'> {
  owner: AdOwner & { isAdvertiser: boolean; createdAt: string };
  boosts: {
    id: string;
    tier: BoostTier;
    status: BoostStatus;
    startAt: string | null;
    endAt: string | null;
  }[];
  reports: {
    id: string;
    reason: string;
    status: ReportStatus;
    createdAt: string;
    reporter: { id: string; name: string; email: string | null };
  }[];
  _count: {
    reports: number;
    conversations: number;
    impressions: number;
    visits: number;
    conversions: number;
  };
}

export interface AdCounts {
  byStatus: Partial<Record<AdStatus, number>>;
  pendingReports: number;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isAdvertiser: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { ads: number; payments: number; reviewsReceived: number };
}

export interface TransactionListItem {
  id: string;
  userId: string;
  adId: string;
  gateway: PaymentGateway;
  gatewayRef: string | null;
  amount: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string | null; phone: string | null };
  ad: { id: string; title: string; sector: Sector } | null;
  boost: {
    id: string;
    tier: BoostTier;
    status: BoostStatus;
    startAt: string | null;
    endAt: string | null;
  } | null;
}

export interface TransactionTotals {
  successAmount: string;
  successCount: number;
  countByStatus: Partial<Record<PaymentStatus, number>>;
}

export type TransactionPage = Paginated<TransactionListItem> & {
  totals: TransactionTotals;
};

export interface ReportListItem {
  id: string;
  adId: string;
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter: { id: string; name: string; email: string | null; phone: string | null };
  ad: {
    id: string;
    title: string;
    sector: Sector;
    status: AdStatus;
    price: string;
    locationArea: string;
    locationDistrict: string;
    photos: string[];
    owner: { id: string; name: string; isSuspended: boolean };
    _count: { reports: number };
  };
}

export type ReportPage = Paginated<ReportListItem> & {
  countByStatus: Partial<Record<ReportStatus, number>>;
};

export interface DashboardOverview {
  adsByStatus: { status: AdStatus; count: number }[];
  adsBySector: { sector: Sector; count: number }[];
  boostRevenueByMonth: { month: string; revenue: number }[];
  mostReportedAdvertisers: { id: string; name: string; reportCount: number }[];
}
