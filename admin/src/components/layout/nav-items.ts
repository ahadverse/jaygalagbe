import type { ComponentType, SVGProps } from 'react';
import {
  DashboardIcon,
  FlagIcon,
  ListIcon,
  QueueIcon,
  ReceiptIcon,
  UsersIcon,
} from '@/components/ui/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** `end` so the dashboard's "/" does not stay active on every child route. */
  end?: boolean;
  badgeKey?: keyof NavBadges;
}

export interface NavBadges {
  pendingAds?: number;
  pendingReports?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  {
    to: '/review-queue',
    label: 'Review queue',
    icon: QueueIcon,
    badgeKey: 'pendingAds',
  },
  { to: '/ads', label: 'Ads', icon: ListIcon },
  {
    to: '/reports',
    label: 'Reports',
    icon: FlagIcon,
    badgeKey: 'pendingReports',
  },
  { to: '/users', label: 'Users', icon: UsersIcon },
  { to: '/transactions', label: 'Transactions', icon: ReceiptIcon },
];
