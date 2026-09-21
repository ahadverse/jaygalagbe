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
  owner: AdOwner & { createdAt: string };
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
  oldestPendingAt: string | null;
  breachedSla: number;
  slaHours: number;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
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
  averageAmount: string;
  pendingAmount: string;
  failedAmount: string;
  countByStatus: Partial<Record<PaymentStatus, number>>;
  byGateway: { gateway: PaymentGateway; amount: string; count: number }[];
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

export interface UserDetail extends UserListItem {
  _count: UserListItem['_count'] & {
    reviewsGiven: number;
    reportsFiled: number;
    customerConversations: number;
    advertiserConversations: number;
  };
  ads: {
    id: string;
    title: string;
    status: AdStatus;
    sector: Sector;
    price: string;
    photos: string[];
    createdAt: string;
    _count: { reports: number };
  }[];
  payments: {
    id: string;
    amount: string;
    status: PaymentStatus;
    gateway: PaymentGateway;
    createdAt: string;
    ad: { id: string; title: string } | null;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    isHidden: boolean;
    createdAt: string;
    customer: { id: string; name: string };
  }[];
  stats: {
    reportsAgainst: number;
    totalSpend: string;
    averageRating: number | null;
    ratedCount: number;
    adsByStatus: Partial<Record<AdStatus, number>>;
  };
}

export type UserPage = Paginated<UserListItem> & {
  counts: {
    total: number;
    admins: number;
    suspended: number;
    unverified: number;
  };
};

/* ── Boosts ───────────────────────────────────────────────────────────── */

export interface BoostListItem {
  id: string;
  adId: string;
  tier: BoostTier;
  status: BoostStatus;
  startAt: string | null;
  endAt: string | null;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  ad: {
    id: string;
    title: string;
    sector: Sector;
    status: AdStatus;
    photos: string[];
    locationDistrict: string;
    owner: { id: string; name: string; isSuspended: boolean };
  };
  payment: {
    id: string;
    amount: string;
    status: PaymentStatus;
    gateway: PaymentGateway;
    gatewayRef: string | null;
  };
}

export type BoostPage = Paginated<BoostListItem> & {
  summary: {
    countByStatus: Partial<Record<BoostStatus, number>>;
    expiringSoon: number;
    expiringWindowHours: number;
    activeRevenue: string;
  };
};

/* ── Reviews ──────────────────────────────────────────────────────────── */

export interface ReviewListItem {
  id: string;
  advertiserId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  advertiser: {
    id: string;
    name: string;
    email: string | null;
    isSuspended: boolean;
  };
  customer: { id: string; name: string; email: string | null };
}

export type ReviewPage = Paginated<ReviewListItem> & {
  summary: {
    averageRating: number;
    visibleCount: number;
    hiddenCount: number;
    lowRatedCount: number;
    lowRatingCeiling: number;
    distribution: { rating: number; count: number }[];
  };
};

/* ── Audit log ────────────────────────────────────────────────────────── */

export type AuditAction =
  | 'AD_APPROVE'
  | 'AD_REJECT'
  | 'AD_REMOVE'
  | 'REPORT_RESOLVE'
  | 'USER_SUSPEND'
  | 'USER_UNSUSPEND'
  | 'USER_GRANT_ADMIN'
  | 'USER_REVOKE_ADMIN'
  | 'BOOST_CANCEL'
  | 'BOOST_EXTEND'
  | 'PAYMENT_MARK_FAILED'
  | 'REVIEW_HIDE'
  | 'REVIEW_UNHIDE';

export type AuditTargetType =
  | 'AD'
  | 'USER'
  | 'REPORT'
  | 'BOOST'
  | 'PAYMENT'
  | 'REVIEW';

export interface AuditEntry {
  id: string;
  actorId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string | null };
}

export type AuditPage = Paginated<AuditEntry> & {
  countByAction: Partial<Record<AuditAction, number>>;
};

export interface AuditActor {
  id: string;
  name: string;
  entryCount: number;
}

/* ── Bulk actions ─────────────────────────────────────────────────────── */

export interface BulkResult {
  batchId: string;
  requested: number;
  succeeded: string[];
  failed: { id: string; reason: string }[];
}

/* ── Analytics ────────────────────────────────────────────────────────── */

export type Granularity = 'day' | 'week' | 'month';
export type RangePreset = '7d' | '30d' | '90d' | '365d';

export interface Kpi {
  current: number;
  previous: number;
  /** `null` when the previous period was zero — no meaningful change. */
  changePct: number | null;
}

export interface SeriesPoint {
  bucket: string;
  ads: number;
  liveAds: number;
  users: number;
  revenue: number;
  visits: number;
  conversions: number;
}

export interface AnalyticsOverview {
  range: {
    from: string;
    to: string;
    granularity: Granularity;
    days: number;
    previousFrom: string;
    previousTo: string;
  };
  kpis: {
    newAds: Kpi;
    newUsers: Kpi;
    revenue: Kpi;
    visits: Kpi;
    conversions: Kpi;
    liveAds: Kpi;
  };
  series: SeriesPoint[];
  funnel: { stage: string; value: number }[];
  topDistricts: { district: string; ads: number }[];
  topAdvertisers: {
    id: string;
    name: string;
    isSuspended: boolean;
    ads: number;
  }[];
  moderation: {
    approved: number;
    rejected: number;
    decided: number;
    approvalRate: number | null;
    medianDecisionHours: number | null;
    pendingNow: number;
    sectorMix: { sector: Sector; count: number }[];
    statusMix: { status: AdStatus; count: number }[];
  };
}

export interface DashboardOverview extends AnalyticsOverview {
  attention: {
    pendingAds: number;
    overdueAds: number;
    slaHours: number;
    oldestPendingAt: string | null;
    pendingReports: number;
    suspendedUsers: number;
    failedPayments: number;
    expiringBoosts: number;
    expiringWindowHours: number;
  };
  mostReported: {
    id: string;
    name: string;
    isSuspended: boolean;
    reportCount: number;
  }[];
  recentActivity: AuditEntry[];
}
