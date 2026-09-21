import { NavLink, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { BookmarkIcon, XIcon } from '@/components/ui/icons';
import { useSavedViews } from '@/lib/views/use-saved-views';
import { NAV_SECTIONS, type NavBadges } from './nav-items';

export function SidebarNav({
  badges,
  onNavigate,
}: {
  badges: NavBadges;
  onNavigate?: () => void;
}) {
  const { views, remove } = useSavedViews();
  const location = useLocation();
  const currentUrl = `${location.pathname}${location.search}`;

  return (
    <nav
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-2"
      aria-label="Sections"
    >
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-2.5 pb-1 text-[0.625rem] font-semibold tracking-wider text-rail-muted uppercase">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map(
              ({ to, label, icon: Icon, end, badgeKey, badgeTone }) => {
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
                          ? 'bg-rail-raised text-white'
                          : 'text-rail-text hover:bg-rail-raised/60 hover:text-white',
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
                              : 'text-rail-muted group-hover:text-rail-text',
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tnum',
                              badgeTone === 'danger'
                                ? 'bg-danger-600 text-white'
                                : isActive
                                  ? 'bg-brand-500 text-white'
                                  : 'bg-rail-raised text-rail-text group-hover:bg-rail-raised',
                            )}
                          >
                            {formatCount(badge)}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              },
            )}
          </div>
        </div>
      ))}

      {views.length > 0 && (
        <div>
          <p className="px-2.5 pb-1 text-[0.625rem] font-semibold tracking-wider text-rail-muted uppercase">
            Saved views
          </p>
          <div className="flex flex-col gap-0.5">
            {views.map((view) => {
              const href = `${view.path}${view.search ? `?${view.search}` : ''}`;
              const active = href === currentUrl;

              return (
                <div key={view.id} className="group/view relative flex">
                  <NavLink
                    to={href}
                    onClick={onNavigate}
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-2 pr-7 pl-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      active
                        ? 'bg-rail-raised text-white'
                        : 'text-rail-text hover:bg-rail-raised/60 hover:text-white',
                    )}
                  >
                    <BookmarkIcon
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        active ? 'text-brand-400' : 'text-rail-muted',
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{view.name}</span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => remove(view.id)}
                    aria-label={`Delete saved view ${view.name}`}
                    className="absolute top-1/2 right-1 -translate-y-1/2 rounded p-1 text-rail-muted opacity-0 transition-opacity group-hover/view:opacity-100 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
