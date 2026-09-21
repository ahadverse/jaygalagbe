import type { BadgeTone } from '@/components/ui/badge-variants';
import type { AuditAction, AuditTargetType } from '@/lib/api/types';

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  AD_APPROVE: 'Ad approved',
  AD_REJECT: 'Ad rejected',
  AD_REMOVE: 'Ad taken down',
  REPORT_RESOLVE: 'Report triaged',
  USER_SUSPEND: 'User suspended',
  USER_UNSUSPEND: 'User restored',
  USER_GRANT_ADMIN: 'Admin granted',
  USER_REVOKE_ADMIN: 'Admin revoked',
  BOOST_CANCEL: 'Boost cancelled',
  BOOST_EXTEND: 'Boost extended',
  PAYMENT_MARK_FAILED: 'Payment failed',
  REVIEW_HIDE: 'Review hidden',
  REVIEW_UNHIDE: 'Review restored',
};

/**
 * Tone by consequence, not by entity: anything that takes something away from
 * a user reads as danger, anything that restores or publishes reads as
 * success. Scanning the log for "what did we take down today" is the point.
 */
export const AUDIT_ACTION_TONE: Record<AuditAction, BadgeTone> = {
  AD_APPROVE: 'success',
  AD_REJECT: 'danger',
  AD_REMOVE: 'danger',
  REPORT_RESOLVE: 'info',
  USER_SUSPEND: 'danger',
  USER_UNSUSPEND: 'success',
  USER_GRANT_ADMIN: 'brand',
  USER_REVOKE_ADMIN: 'warning',
  BOOST_CANCEL: 'danger',
  BOOST_EXTEND: 'info',
  PAYMENT_MARK_FAILED: 'warning',
  REVIEW_HIDE: 'danger',
  REVIEW_UNHIDE: 'success',
};

export const AUDIT_TARGET_LABEL: Record<AuditTargetType, string> = {
  AD: 'Listing',
  USER: 'Account',
  REPORT: 'Report',
  BOOST: 'Boost',
  PAYMENT: 'Payment',
  REVIEW: 'Review',
};

/** Where a target id can be opened in the console, when it can be. */
export function targetLink(
  targetType: AuditTargetType,
  targetId: string,
): string | null {
  switch (targetType) {
    case 'AD':
      return `/ads?q=${encodeURIComponent(targetId)}`;
    case 'USER':
      return `/users?q=${encodeURIComponent(targetId)}`;
    case 'PAYMENT':
      return `/transactions?q=${encodeURIComponent(targetId)}`;
    case 'BOOST':
      return `/boosts?q=${encodeURIComponent(targetId)}`;
    case 'REVIEW':
      return `/reviews?q=${encodeURIComponent(targetId)}`;
    case 'REPORT':
      return `/reports?q=${encodeURIComponent(targetId)}`;
  }
}
