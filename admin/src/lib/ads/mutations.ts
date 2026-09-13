import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiRequest } from '@/lib/api/client';
import { useToast } from '@/lib/toast/toast-context';
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
