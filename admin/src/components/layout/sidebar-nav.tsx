import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { NAV_ITEMS, type NavBadges } from './nav-items';

export function SidebarNav({
  badges,
  onNavigate,
}: {
  badges: NavBadges;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-2" aria-label="Sections">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end, badgeKey }) => {
        const badge = badgeKey ? badges[badgeKey] : undefined;

        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                isActive
                  ? 'bg-ink-800 text-white'
                  : 'text-ink-300 hover:bg-ink-800/60 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-brand-400'
                      : 'text-ink-500 group-hover:text-ink-300',
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tnum',
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'bg-ink-800 text-ink-300 group-hover:bg-ink-700',
                    )}
                  >
                    {formatCount(badge)}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
