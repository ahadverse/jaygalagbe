import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertIcon,
  BoltIcon,
  ChevronRightIcon,
  FlagIcon,
  QueueIcon,
  ReceiptIcon,
} from '@/components/ui/icons';
import { formatCount } from '@/lib/format';
import type { DashboardOverview } from '@/lib/api/types';

type Attention = DashboardOverview['attention'];

/**
 * The work queue, above the charts.
 *
 * Deliberately not part of the date range: "what is waiting" is always about
 * now, and scoping it to a past window would hide the backlog. Items with
 * nothing outstanding drop out entirely rather than showing a zero — a strip
 * of zeroes trains people to ignore it.
 */
export function AttentionStrip({
  attention,
  loading,
}: {
  attention: Attention | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (!attention) return null;

  const items = [
    attention.pendingAds > 0 && {
      key: 'pending',
      to: '/review-queue',
      icon: QueueIcon,
      label: 'Waiting for review',
      value: attention.pendingAds,
      detail:
        attention.overdueAds > 0
          ? `${formatCount(attention.overdueAds)} past ${attention.slaHours}h`
          : 'all within target',
      urgent: attention.overdueAds > 0,
    },
    attention.pendingReports > 0 && {
      key: 'reports',
      to: '/reports?status=PENDING',
      icon: FlagIcon,
      label: 'Reports to triage',
      value: attention.pendingReports,
      detail: 'flagged by customers',
      urgent: true,
    },
    attention.expiringBoosts > 0 && {
      key: 'boosts',
      to: '/boosts?expiring=true',
      icon: BoltIcon,
      label: 'Boosts expiring',
      value: attention.expiringBoosts,
      detail: `within ${attention.expiringWindowHours}h`,
      urgent: false,
    },
    attention.failedPayments > 0 && {
      key: 'payments',
      to: '/transactions?status=FAILED',
      icon: ReceiptIcon,
      label: 'Failed payments',
      value: attention.failedPayments,
      detail: 'need reconciling',
      urgent: false,
    },
  ].filter((item): item is Exclude<typeof item, false> => item !== false);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-3.5 py-3">
        <span className="text-sm font-medium text-success-700">
          Everything is clear
        </span>
        <span className="text-xs text-success-700/80">
          No listings waiting, no open reports, nothing to reconcile.
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className={cn(
            // Hover deepens the border within its own family rather than
            // switching hue, so an overdue card still reads as overdue while
            // the cursor is on it.
            'card-interactive flex items-start gap-2.5 rounded-lg border bg-card p-3.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            item.urgent
              ? 'border-danger-200 hover:border-danger-500'
              : 'border-border hover:border-border-strong',
          )}
        >
          <span
            className={cn(
              'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
              item.urgent
                ? 'bg-danger-50 text-danger-700'
                : 'bg-ink-100 text-muted-foreground',
            )}
          >
            {/* Icon plus label — the colour never carries the meaning alone. */}
            {item.urgent ? (
              <AlertIcon className="h-4 w-4" />
            ) : (
              <item.icon className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-xl font-semibold tracking-tight">
              {formatCount(item.value)}
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              {item.label}
            </p>
            <p
              className={cn(
                'truncate text-[0.6875rem]',
                item.urgent ? 'text-danger-700' : 'text-muted-foreground',
              )}
            >
              {item.detail}
            </p>
          </div>
          <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0 self-center text-ink-400" />
        </Link>
      ))}
    </div>
  );
}
