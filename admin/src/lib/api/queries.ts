import { useQuery } from '@tanstack/react-query';
import { apiRequest, buildQuery, type QueryParams } from './client';
import type {
  AdCounts,
  AdDetail,
  AdListItem,
  AnalyticsOverview,
  AuditActor,
  AuditPage,
  BoostPage,
  DashboardOverview,
  Paginated,
  ReportPage,
  ReviewPage,
  TransactionPage,
  UserDetail,
  UserPage,
} from './types';

export const queryKeys = {
  adCounts: ['admin', 'ads', 'counts'] as const,
  adDistricts: ['admin', 'ads', 'districts'] as const,
  ads: (params: QueryParams) => ['admin', 'ads', 'list', params] as const,
  ad: (id: string) => ['admin', 'ads', 'detail', id] as const,
  users: (params: QueryParams) => ['admin', 'users', params] as const,
  user: (id: string) => ['admin', 'users', 'detail', id] as const,
  transactions: (params: QueryParams) =>
    ['admin', 'transactions', params] as const,
  reports: (params: QueryParams) => ['admin', 'reports', params] as const,
  boosts: (params: QueryParams) => ['admin', 'boosts', params] as const,
  reviews: (params: QueryParams) => ['admin', 'reviews', params] as const,
  audit: (params: QueryParams) => ['admin', 'audit', params] as const,
  auditActors: ['admin', 'audit', 'actors'] as const,
  dashboard: (params: QueryParams) => ['admin', 'dashboard', params] as const,
  analytics: (params: QueryParams) => ['admin', 'analytics', params] as const,
};

export function useAdsQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.ads(params),
    queryFn: ({ signal }) =>
      apiRequest<Paginated<AdListItem>>(`/admin/ads${buildQuery(params)}`, {
        signal,
      }),
    placeholderData: (previous) => previous,
  });
}

export function useAdQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.ad(id ?? ''),
    queryFn: ({ signal }) => apiRequest<AdDetail>(`/admin/ads/${id}`, { signal }),
    enabled: id !== null,
  });
}

export function useAdCountsQuery() {
  return useQuery({
    queryKey: queryKeys.adCounts,
    queryFn: ({ signal }) => apiRequest<AdCounts>('/admin/ads/counts', { signal }),
    staleTime: 30_000,
  });
}

export function useAdDistrictsQuery() {
  return useQuery({
    queryKey: queryKeys.adDistricts,
    queryFn: ({ signal }) =>
      apiRequest<string[]>('/admin/ads/districts', { signal }),
    staleTime: 5 * 60_000,
  });
}

export function useUsersQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: ({ signal }) =>
      apiRequest<UserPage>(`/admin/users${buildQuery(params)}`, { signal }),
    placeholderData: (previous) => previous,
  });
}

export function useUserQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.user(id ?? ''),
    queryFn: ({ signal }) =>
      apiRequest<UserDetail>(`/admin/users/${id}`, { signal }),
    enabled: id !== null,
  });
}

export function useTransactionsQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: ({ signal }) =>
      apiRequest<TransactionPage>(`/admin/transactions${buildQuery(params)}`, {
        signal,
      }),
    placeholderData: (previous) => previous,
  });
}

export function useReportsQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.reports(params),
    queryFn: ({ signal }) =>
      apiRequest<ReportPage>(`/admin/reports${buildQuery(params)}`, { signal }),
    placeholderData: (previous) => previous,
  });
}

export function useBoostsQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.boosts(params),
    queryFn: ({ signal }) =>
      apiRequest<BoostPage>(`/admin/boosts${buildQuery(params)}`, { signal }),
    placeholderData: (previous) => previous,
  });
}

export function useReviewsQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.reviews(params),
    queryFn: ({ signal }) =>
      apiRequest<ReviewPage>(`/admin/reviews${buildQuery(params)}`, { signal }),
    placeholderData: (previous) => previous,
  });
}

export function useAuditQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.audit(params),
    queryFn: ({ signal }) =>
      apiRequest<AuditPage>(`/admin/audit${buildQuery(params)}`, { signal }),
    placeholderData: (previous) => previous,
  });
}

export function useAuditActorsQuery() {
  return useQuery({
    queryKey: queryKeys.auditActors,
    queryFn: ({ signal }) =>
      apiRequest<AuditActor[]>('/admin/audit/actors', { signal }),
    staleTime: 5 * 60_000,
  });
}

export function useDashboardQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard(params),
    queryFn: ({ signal }) =>
      apiRequest<DashboardOverview>(`/admin/dashboard${buildQuery(params)}`, {
        signal,
      }),
    placeholderData: (previous) => previous,
  });
}

export function useAnalyticsQuery(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics(params),
    queryFn: ({ signal }) =>
      apiRequest<AnalyticsOverview>(`/admin/analytics${buildQuery(params)}`, {
        signal,
      }),
    placeholderData: (previous) => previous,
  });
}
