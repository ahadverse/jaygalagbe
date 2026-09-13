import { type HTMLAttributes } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { humanize } from '@/lib/format';
import type {
  AdStatus,
  BoostStatus,
  PaymentStatus,
  ReportStatus,
} from '@/lib/api/types';
import {
  BADGE_DOT_COLOR,
  badgeVariants,
  type BadgeTone,
} from './badge-variants';

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  tone,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            BADGE_DOT_COLOR[tone ?? 'neutral'],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

const AD_STATUS_TONE: Record<AdStatus, BadgeTone> = {
  PENDING: 'warning',
  LIVE: 'success',
  REJECTED: 'danger',
  SOLD: 'info',
  REMOVED: 'neutral',
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  PENDING: 'warning',
  SUCCESS: 'success',
  FAILED: 'danger',
};

const REPORT_STATUS_TONE: Record<ReportStatus, BadgeTone> = {
  PENDING: 'warning',
  REVIEWED: 'success',
  DISMISSED: 'neutral',
};

const BOOST_STATUS_TONE: Record<BoostStatus, BadgeTone> = {
  PENDING: 'warning',
  ACTIVE: 'brand',
  EXPIRED: 'neutral',
  CANCELLED: 'danger',
};

export function AdStatusBadge({ status }: { status: AdStatus }) {
  return (
    <Badge tone={AD_STATUS_TONE[status]} dot>
      {humanize(status)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge tone={PAYMENT_STATUS_TONE[status]} dot>
      {humanize(status)}
    </Badge>
  );
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge tone={REPORT_STATUS_TONE[status]} dot>
      {humanize(status)}
    </Badge>
  );
}

export function BoostStatusBadge({ status }: { status: BoostStatus }) {
  return <Badge tone={BOOST_STATUS_TONE[status]}>{humanize(status)}</Badge>;
}
