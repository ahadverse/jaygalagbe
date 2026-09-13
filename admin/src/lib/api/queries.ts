import { useQuery } from '@tanstack/react-query';
import { apiRequest, buildQuery, type QueryParams } from './client';
import type {
  AdCounts,
  AdDetail,
  AdListItem,
  DashboardOverview,
  Paginated,
  ReportPage,
  TransactionPage,
  UserListItem,
} from './types';

export const queryKeys = {
  adCounts: ['admin', 'ads', 'counts'] as const,
  adDistricts: ['admin', 'ads', 'districts'] as const,
  ads: (params: QueryParams) => ['admin', 'ads', 'list', params] as const,
  ad: (id: string) => ['admin', 'ads', 'detail', id] as const,
  users: (params: QueryParams) => ['admin', 'users', params] as const,
  transactions: (params: QueryParams) =>
    ['admin', 'transactions', params] as const,
  reports: (params: QueryParams) => ['admin', 'reports', params] as const,
  dashboard: ['admin', 'dashboard'] as const,
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
      apiRequest<Paginated<UserListItem>>(`/admin/users${buildQuery(params)}`, {
        signal,
      }),
    placeholderData: (previous) => previous,
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

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ({ signal }) =>
      apiRequest<DashboardOverview>('/admin/dashboard', { signal }),
  });
}
