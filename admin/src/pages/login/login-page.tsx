import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { AlertIcon } from '@/components/ui/icons';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  if (status === 'authenticated') {
    const from = (location.state as LocationState | null)?.from?.pathname;
    return <Navigate to={from ?? '/'} replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ identifier, password });
      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from ?? '/', { replace: true });
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'Could not reach the server. Check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-900 lg:flex-row">
      {/* On desktop the brand panel carries the context; on mobile it collapses
          to a compact header so the form stays above the fold. */}
      <div className="flex shrink-0 flex-col justify-between gap-8 px-6 py-8 lg:w-2/5 lg:px-12 lg:py-14">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
            JL
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Jayga Lagbe</p>
            <p className="text-xs text-ink-400">Admin console</p>
          </div>
        </div>

        <div className="hidden lg:block">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Moderation, payments and platform health — in one place.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-400">
            Every listing is reviewed by a person before it reaches a buyer.
            This console is where that happens.
          </p>
        </div>

        <p className="hidden text-xs text-ink-600 lg:block">
Developed by Ahad Hossain        </p>
      </div>

      <div className="flex flex-1 items-start justify-center bg-background px-4 py-8 lg:items-center lg:rounded-l-2xl lg:py-14">
        <div className="w-full max-w-sm">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the email or phone on your admin account.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email or phone"
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="admin@jaygalagbe.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700"
              >
                <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="mt-1 w-full"
            >
              {submitting ? 'Signing in' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
