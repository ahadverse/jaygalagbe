import { formatCount } from '@/lib/format';
import { ChartEmpty } from './chart-frame';
import { STEPS } from './chart-tokens';

export interface FunnelStage {
  stage: string;
  value: number;
}

/**
 * Impression → visit → contact.
 *
 * Ordered stages, so this uses the ordinal ramp (one hue, light → dark)
 * rather than categorical slots: the stages have a natural sequence and hue
 * would imply they are unrelated categories. Every bar carries its own value
 * and its conversion rate from the previous stage, so nothing depends on
 * reading a length.
 */
export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value ?? 0;

  if (stages.length === 0 || top === 0) {
    return (
      <ChartEmpty>
        No traffic recorded in this period — impressions start appearing once
        listings are live and being browsed.
      </ChartEmpty>
    );
  }

  return (
    <ol className="flex flex-col gap-2.5">
      {stages.map((stage, index) => {
        const previous = index === 0 ? null : stages[index - 1].value;
        const stepRate =
          previous === null || previous === 0 ? null : stage.value / previous;
        const widthPct = Math.max((stage.value / top) * 100, 1.5);

        return (
          <li key={stage.stage}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium text-foreground">
                {stage.stage}
              </span>
              <span className="text-xs text-muted-foreground tnum">
                <span className="font-semibold text-foreground">
                  {formatCount(stage.value)}
                </span>
                {stepRate !== null && (
                  <span className="ml-1.5">
                    {(stepRate * 100).toFixed(1)}% of previous
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${widthPct}%`,
                  background: STEPS[Math.min(index, STEPS.length - 1)],
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
