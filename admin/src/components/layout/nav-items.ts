import type { ComponentType, SVGProps } from 'react';
import {
  BoltIcon,
  ChartIcon,
  DashboardIcon,
  FlagIcon,
  HistoryIcon,
  ListIcon,
  QueueIcon,
  ReceiptIcon,
  StarIcon,
  UsersIcon,
} from '@/components/ui/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** `end` so the dashboard's "/" does not stay active on every child route. */
  end?: boolean;
  badgeKey?: keyof NavBadges;
  /** Renders the badge as a warning rather than a neutral count. */
  badgeTone?: 'neutral' | 'danger';
}

export interface NavBadges {
  pendingAds?: number;
  pendingReports?: number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Grouped by what the operator is doing, not by data model: the moderation
 * queue and the money are different shifts, and a flat list of nine links
 * made you read all nine to find either.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
      { to: '/analytics', label: 'Analytics', icon: ChartIcon },
    ],
  },
  {
    label: 'Moderation',
    items: [
      {
        to: '/review-queue',
        label: 'Review queue',
        icon: QueueIcon,
        badgeKey: 'pendingAds',
        badgeTone: 'danger',
      },
      { to: '/ads', label: 'Ads', icon: ListIcon },
      {
        to: '/reports',
        label: 'Reports',
        icon: FlagIcon,
        badgeKey: 'pendingReports',
        badgeTone: 'danger',
      },
      { to: '/reviews', label: 'Reviews', icon: StarIcon },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to: '/transactions', label: 'Transactions', icon: ReceiptIcon },
      { to: '/boosts', label: 'Boosts', icon: BoltIcon },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users', label: 'Users', icon: UsersIcon },
      { to: '/audit-log', label: 'Audit log', icon: HistoryIcon },
    ],
  },
];
