import { useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  AlertIcon,
  ClockIcon,
  MenuIcon,
  MoonIcon,
  RefreshIcon,
  SunIcon,
} from '@/components/ui/icons';
import { usePrefs } from '@/lib/prefs/prefs-context';
import { useAdCountsQuery } from '@/lib/api/queries';
import { formatCount, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS } from './nav-items';

function currentTitle(pathname: string): string {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.end ? pathname === item.to : pathname.startsWith(item.to)) {
        return item.label;
      }
    }
  }
  return 'Admin';
}

/**
 * Persistent chrome above every page: what needs attention right now, the
 * display preferences, and a manual refresh for a console that is usually
 * left open for a whole shift.
 */
export function Topbar({
  onOpenNav,
  onRefresh,
  refreshing,
}: {
  onOpenNav: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { pathname } = useLocation();
  const { theme, setTheme, resolvedTheme, density, setDensity } = usePrefs();
  const { data: counts } = useAdCountsQuery();

  const overdue = counts?.breachedSla ?? 0;

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-card/90 px-3 py-2 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenNav}
        aria-label="Open menu"
        className="lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </Button>

      <h1 className="truncate text-sm font-semibold text-foreground">
        {currentTitle(pathname)}
      </h1>

      {/* The one number worth interrupting for: submissions past the SLA. */}
      {overdue > 0 && (
        <span className="hidden items-center gap-1.5 rounded-full border border-danger-200 bg-danger-50 px-2 py-0.5 text-xs font-medium text-danger-700 sm:inline-flex">
          <AlertIcon className="h-3.5 w-3.5" />
          {formatCount(overdue)} over {counts?.slaHours ?? 24}h
        </span>
      )}

      {counts?.oldestPendingAt && overdue === 0 && (
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:inline-flex">
          <ClockIcon className="h-3.5 w-3.5" />
          Oldest {formatRelative(counts.oldestPendingAt)}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <SegmentedControl
          label="Row density"
          size="sm"
          className="hidden sm:inline-flex"
          value={density}
          onChange={setDensity}
          options={[
            { value: 'comfortable', label: 'Roomy' },
            { value: 'compact', label: 'Dense' },
          ]}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={
            resolvedTheme === 'dark'
              ? 'Switch to light theme'
              : 'Switch to dark theme'
          }
          title={resolvedTheme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {resolvedTheme === 'dark' ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          aria-label="Refresh data"
          title="Refresh"
        >
          <RefreshIcon
            className={cn('h-4 w-4', refreshing && 'animate-spin')}
          />
        </Button>
      </div>
    </header>
  );
}
