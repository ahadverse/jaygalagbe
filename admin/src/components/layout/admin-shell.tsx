import { useState } from 'react';
import { Outlet } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/use-auth';
import { useAdCountsQuery } from '@/lib/api/queries';
import { Button } from '@/components/ui/button';
import { LogOutIcon, MenuIcon, XIcon } from '@/components/ui/icons';
import { SidebarNav } from './sidebar-nav';

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
        JL
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">Jayga Lagbe</p>
        <p className="truncate text-xs text-ink-400">Admin console</p>
      </div>
    </div>
  );
}

function AccountFooter() {
  const { user, logout } = useAuth();

  return (
    <div className="mt-auto border-t border-ink-800 p-2">
      <div className="flex items-center gap-2 rounded-md px-2.5 py-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-ink-200">
          {user?.name.charAt(0).toUpperCase() ?? '?'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink-100">
            {user?.name}
          </p>
          <p className="truncate text-[0.6875rem] text-ink-500">
            {user?.email ?? user?.phone}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          className="rounded p-1.5 text-ink-400 transition-colors hover:bg-ink-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
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

  const badges = {
    pendingAds: counts?.byStatus.PENDING,
    pendingReports: counts?.pendingReports,
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink-900 lg:flex">
        <Brand />
        <SidebarNav badges={badges} />
        <AccountFooter />
      </aside>

      {/* Mobile drawer */}
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
        <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink-900 shadow-lg">
          <div className="flex items-center justify-between pr-2">
            <Brand />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="rounded p-1.5 text-ink-400 hover:bg-ink-800 hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <SidebarNav badges={badges} onNavigate={() => setMobileNavOpen(false)} />
          <AccountFooter />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-card/90 px-3 py-2 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold">Jayga Lagbe Admin</span>
        </header>

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
