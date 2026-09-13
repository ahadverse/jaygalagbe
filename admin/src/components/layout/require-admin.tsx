import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

/** Gate for every console route: only a confirmed admin gets past it. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-brand-600" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (status === 'anonymous' || !user?.isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
