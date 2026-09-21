import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownIcon, ArrowUpIcon } from '@/components/ui/icons';
import type { Kpi } from '@/lib/api/types';

/**
 * Whether a rise is good news. Revenue up is good; "reports filed" up is not,
 * so the arrow's colour has to be told which way round the metric runs.
 */
export type DeltaSense = 'up-good' | 'up-bad' | 'neutral';

function DeltaBadge({
  changePct,
  sense,
}: {
  changePct: number | null;
  sense: DeltaSense;
}) {
  if (changePct === null) {
    return (
      <span className="text-[0.6875rem] text-muted-foreground">
        no prior data
      </span>
    );
  }

  const rounded = Math.round(changePct * 10) / 10;
  if (rounded === 0) {
    return (
      <span className="text-[0.6875rem] text-muted-foreground">no change</span>
    );
  }

  const up = rounded > 0;
  const good = sense === 'neutral' ? null : sense === 'up-good' ? up : !up;
  const Icon = up ? ArrowUpIcon : ArrowDownIcon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[0.6875rem] font-medium tnum',
        good === null && 'text-muted-foreground',
        good === true && 'text-success-700',
        good === false && 'text-danger-700',
      )}
    >
      {/* Arrow direction plus a sign — never colour alone. */}
      <Icon className="h-3 w-3" />
      {up ? '+' : ''}
      {rounded}%
    </span>
  );
}

export function KpiTile({
  label,
  value,
  kpi,
  sense = 'up-good',
  hint,
  to,
  loading = false,
}: {
  label: string;
  value: string;
  kpi?: Kpi;
  sense?: DeltaSense;
  hint?: string;
  to?: string;
  loading?: boolean;
}) {
  const body = (
    <>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-7 w-20" />
      ) : (
        // Proportional figures: tabular-nums makes a large standalone
        // number look loose.
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {kpi && !loading && (
          <DeltaBadge changePct={kpi.changePct} sense={sense} />
        )}
        {hint && (
          <span className="text-[0.6875rem] text-muted-foreground">{hint}</span>
        )}
      </div>
    </>
  );

  const shell = 'rounded-lg border border-border bg-card p-3.5 shadow-xs';

  if (!to) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <Link
      to={to}
      className={cn(
        shell,
        'card-interactive block hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      {body}
    </Link>
  );
}
