import { useState } from 'react';
import { Outlet } from 'react-router';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/use-auth';
import { useAdCountsQuery } from '@/lib/api/queries';
import { LogOutIcon, ShieldIcon, XIcon } from '@/components/ui/icons';
import { SidebarNav } from './sidebar-nav';
import { Topbar } from './topbar';

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
        JL
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">Jayga Lagbe</p>
        <p className="truncate text-xs text-rail-muted">Admin console</p>
      </div>
    </div>
  );
}

function AccountFooter() {
  const { user, logout } = useAuth();

  return (
    <div className="border-t border-rail-border p-2">
      <div className="flex items-center gap-2 rounded-md px-2.5 py-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rail-raised text-xs font-semibold text-rail-text">
          {user?.name.charAt(0).toUpperCase() ?? '?'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-xs font-medium text-white">
            {user?.name}
            <ShieldIcon
              className="h-3 w-3 shrink-0 text-brand-400"
              aria-label="Admin"
            />
          </p>
          <p className="truncate text-[0.6875rem] text-rail-muted">
            {user?.email ?? user?.phone}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          className="rounded p-1.5 text-rail-muted transition-colors hover:bg-rail-raised hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <LogOutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AdminShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: counts } = useAdCountsQuery();
  const queryClient = useQueryClient();
  const fetching = useIsFetching({ queryKey: ['admin'] });

  const badges = {
    pendingAds: counts?.byStatus.PENDING,
    pendingReports: counts?.pendingReports,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/*
        The rail stays dark in both themes — it is chrome, and a constantly
        dark rail is what makes the content area read as "the page" in either
        mode. Hence `rail-*` tokens rather than the flipping `ink-*` ramp.
      */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-rail lg:flex">
        <Brand />
        <SidebarNav badges={badges} />
        <AccountFooter />
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileNavOpen ? 'block' : 'hidden',
        )}
      >
        <div
          className="absolute inset-0 bg-ink-950/50"
          onClick={() => setMobileNavOpen(false)}
        />
        <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-rail shadow-lg">
          <div className="flex items-center justify-between pr-2">
            <Brand />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="rounded p-1.5 text-rail-muted hover:bg-rail-raised hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <SidebarNav
            badges={badges}
            onNavigate={() => setMobileNavOpen(false)}
          />
          <AccountFooter />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenNav={() => setMobileNavOpen(true)}
          onRefresh={() =>
            void queryClient.invalidateQueries({ queryKey: ['admin'] })
          }
          refreshing={fetching > 0}
        />

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
