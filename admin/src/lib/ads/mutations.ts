import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiRequest } from '@/lib/api/client';
import { useToast } from '@/lib/toast/toast-context';
import type { BulkResult } from '@/lib/api/types';
import type { RejectionReasonCode } from './labels';

function describe(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong';
}

/** Every moderation action invalidates the lists and the sidebar counters. */
function useModerationMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  successMessage: (variables: TVariables) => string,
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success(successMessage(variables));
    },
    onError: (error) => toast.error(describe(error)),
  });
}

export function useApproveAd() {
  return useModerationMutation(
    (adId: string) => apiRequest(`/ads/${adId}/approve`, { method: 'PATCH' }),
    () => 'Ad approved and published',
  );
}

export function useRejectAd() {
  return useModerationMutation(
    ({
      adId,
      reasonCode,
      note,
    }: {
      adId: string;
      reasonCode: RejectionReasonCode;
      note?: string;
    }) =>
      apiRequest(`/ads/${adId}/reject`, {
        method: 'PATCH',
        body: { reasonCode, note: note?.trim() || undefined },
      }),
    () => 'Ad rejected — the advertiser has been notified',
  );
}

export function useRemoveAd() {
  return useModerationMutation(
    (adId: string) => apiRequest(`/ads/${adId}`, { method: 'DELETE' }),
    () => 'Ad taken down',
  );
}

export function useResolveReport() {
  return useModerationMutation(
    ({ reportId, status }: { reportId: string; status: 'REVIEWED' | 'DISMISSED' }) =>
      apiRequest(`/admin/reports/${reportId}/resolve`, {
        method: 'PATCH',
        body: { status },
      }),
    ({ status }) =>
      status === 'REVIEWED' ? 'Report marked reviewed' : 'Report dismissed',
  );
}

export function useSetUserSuspended() {
  return useModerationMutation(
    ({ userId, suspended }: { userId: string; suspended: boolean }) =>
      apiRequest(`/admin/users/${userId}/${suspended ? 'suspend' : 'unsuspend'}`, {
        method: 'PATCH',
      }),
    ({ suspended }) =>
      suspended ? 'Account suspended' : 'Account restored',
  );
}

export function useSetUserAdmin() {
  return useModerationMutation(
    ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      apiRequest(
        `/admin/users/${userId}/${isAdmin ? 'grant-admin' : 'revoke-admin'}`,
        { method: 'PATCH' },
      ),
    ({ isAdmin }) =>
      isAdmin ? 'Admin access granted' : 'Admin access revoked',
  );
}

export function useCancelBoost() {
  return useModerationMutation(
    (boostId: string) =>
      apiRequest(`/admin/boosts/${boostId}/cancel`, { method: 'PATCH' }),
    () => 'Boost cancelled',
  );
}

export function useExtendBoost() {
  return useModerationMutation(
    ({
      boostId,
      days,
      reason,
    }: {
      boostId: string;
      days: number;
      reason?: string;
    }) =>
      apiRequest(`/admin/boosts/${boostId}/extend`, {
        method: 'PATCH',
        body: { days, reason: reason?.trim() || undefined },
      }),
    ({ days }) => `Boost extended by ${days} day${days === 1 ? '' : 's'}`,
  );
}

export function useSetReviewHidden() {
  return useModerationMutation(
    ({ reviewId, hidden }: { reviewId: string; hidden: boolean }) =>
      apiRequest(`/admin/reviews/${reviewId}/${hidden ? 'hide' : 'unhide'}`, {
        method: 'PATCH',
      }),
    ({ hidden }) =>
      hidden ? 'Review hidden from the advertiser' : 'Review restored',
  );
}

export function useMarkPaymentFailed() {
  return useModerationMutation(
    ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      apiRequest(`/admin/transactions/${paymentId}/mark-failed`, {
        method: 'PATCH',
        body: { reason: reason.trim() },
      }),
    () => 'Payment closed as failed',
  );
}

/** Asks the gateway again; the result decides, so the toast reports it. */
export function useRecheckPayment() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (paymentId: string) =>
      apiRequest<{ status: 'PENDING' | 'SUCCESS' | 'FAILED' }>(
        `/admin/transactions/${paymentId}/recheck`,
        { method: 'PATCH' },
      ),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      if (payment.status === 'SUCCESS') {
        toast.success('The gateway confirmed it — payment settled, boost active');
      } else if (payment.status === 'FAILED') {
        toast.success('The gateway reported it failed — payment closed');
      } else {
        toast.error('The gateway still shows this as pending — nothing changed');
      }
    },
    onError: (error) => toast.error(describe(error)),
  });
}

export function useMarkPaymentPaid() {
  return useModerationMutation(
    ({
      paymentId,
      reason,
      gatewayRef,
    }: {
      paymentId: string;
      reason: string;
      gatewayRef?: string;
    }) =>
      apiRequest(`/admin/transactions/${paymentId}/mark-paid`, {
        method: 'PATCH',
        body: { reason: reason.trim(), gatewayRef: gatewayRef?.trim() || undefined },
      }),
    () => 'Payment settled by hand — boost activated',
  );
}

/* ── Edit ─────────────────────────────────────────────────────────────── */

export interface AdEditFields {
  title?: string;
  description?: string;
  price?: number;
  locationDivision?: string;
  locationDistrict?: string;
  locationArea?: string;
  address?: string;
  photos?: string[];
}

export function useUpdateAd() {
  return useModerationMutation(
    ({
      adId,
      changes,
      reason,
    }: {
      adId: string;
      changes: AdEditFields;
      reason?: string;
    }) =>
      apiRequest(`/admin/ads/${adId}`, {
        method: 'PATCH',
        body: { ...changes, reason: reason?.trim() || undefined },
      }),
    () => 'Listing updated',
  );
}

export interface UserEditFields {
  name?: string;
  email?: string;
  phone?: string;
  isVerified?: boolean;
}

export function useUpdateUser() {
  return useModerationMutation(
    ({
      userId,
      changes,
      reason,
    }: {
      userId: string;
      changes: UserEditFields;
      reason?: string;
    }) =>
      apiRequest(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: { ...changes, reason: reason?.trim() || undefined },
      }),
    () => 'Account updated',
  );
}

/* ── Permanent delete ─────────────────────────────────────────────────── */

export function useDeleteAd() {
  return useModerationMutation(
    (adId: string) => apiRequest(`/admin/ads/${adId}`, { method: 'DELETE' }),
    () => 'Listing permanently deleted',
  );
}

export function useDeleteUser() {
  return useModerationMutation(
    (userId: string) =>
      apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),
    () => 'Account permanently deleted',
  );
}

export function useDeleteReview() {
  return useModerationMutation(
    (reviewId: string) =>
      apiRequest(`/admin/reviews/${reviewId}`, { method: 'DELETE' }),
    () => 'Review permanently deleted',
  );
}

export function useDeleteReport() {
  return useModerationMutation(
    (reportId: string) =>
      apiRequest(`/admin/reports/${reportId}`, { method: 'DELETE' }),
    () => 'Report deleted',
  );
}

/* ── Bulk ─────────────────────────────────────────────────────────────── */

/**
 * A bulk run is best-effort per row, so "success" is not all-or-nothing. The
 * toast reports the real split rather than claiming everything worked.
 */
function useBulkMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<BulkResult>,
  verb: (variables: TVariables) => string,
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });

      const done = result.succeeded.length;
      const failed = result.failed.length;

      if (failed === 0) {
        toast.success(`${verb(variables)} ${done} item${done === 1 ? '' : 's'}`);
      } else if (done === 0) {
        toast.error(
          `Nothing changed — ${result.failed[0]?.reason ?? 'all items were rejected'}`,
        );
      } else {
        toast.error(
          `${verb(variables)} ${done} of ${result.requested} — ${failed} failed (${result.failed[0]?.reason ?? 'see the audit log'})`,
        );
      }
    },
    onError: (error) => toast.error(describe(error)),
  });
}

export function useBulkAdAction() {
  return useBulkMutation(
    (variables: {
      action: 'APPROVE' | 'REJECT' | 'REMOVE' | 'DELETE';
      ids: string[];
      reasonCode?: RejectionReasonCode;
      note?: string;
    }) =>
      apiRequest<BulkResult>('/admin/ads/bulk', {
        method: 'POST',
        body: {
          action: variables.action,
          ids: variables.ids,
          reasonCode: variables.reasonCode,
          note: variables.note?.trim() || undefined,
        },
      }),
    ({ action }) =>
      action === 'APPROVE'
        ? 'Approved'
        : action === 'REJECT'
          ? 'Rejected'
          : action === 'REMOVE'
            ? 'Took down'
            : 'Permanently deleted',
  );
}

export function useBulkUserAction() {
  return useBulkMutation(
    (variables: {
      action: 'SUSPEND' | 'UNSUSPEND' | 'DELETE';
      ids: string[];
    }) =>
      apiRequest<BulkResult>('/admin/users/bulk', {
        method: 'POST',
        body: variables,
      }),
    ({ action }) =>
      action === 'SUSPEND'
        ? 'Suspended'
        : action === 'UNSUSPEND'
          ? 'Restored'
          : 'Permanently deleted',
  );
}

export function useBulkReportAction() {
  return useBulkMutation(
    (variables: {
      action: 'REVIEWED' | 'DISMISSED' | 'DELETE';
      ids: string[];
    }) =>
      apiRequest<BulkResult>('/admin/reports/bulk', {
        method: 'POST',
        body: variables,
      }),
    ({ action }) =>
      action === 'REVIEWED'
        ? 'Marked reviewed'
        : action === 'DISMISSED'
          ? 'Dismissed'
          : 'Deleted',
  );
}
