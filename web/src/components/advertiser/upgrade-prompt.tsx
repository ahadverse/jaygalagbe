import { Button, Card, CardContent } from "@/components/ui";
import { upgradeToAdvertiserAction } from "@/lib/auth/advertiser-actions";

const perks = [
  "Post land and rental listings",
  "Boost an ad to the top of results",
  "Track views, visits and leads per ad",
];

export function UpgradePrompt() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-brand-50 to-accent-50 px-6 py-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-card text-brand-700 shadow-xs">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinejoin="round"
          >
            <path d="M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4V11Z" />
          </svg>
        </span>
        <h1 className="mt-3.5 font-heading text-xl font-bold tracking-tight text-neutral-900">
          Become an advertiser
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
          Upgrade your account — it&apos;s free, instant, and you keep the same
          login.
        </p>
      </div>

      <CardContent className="flex flex-col gap-5 pt-5">
        <ul className="flex flex-col gap-2.5">
          {perks.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-4 shrink-0 text-success-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 8.5 3.2 3.2L13 5" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>

        <form action={upgradeToAdvertiserAction}>
          <Button type="submit" size="lg" className="w-full">
            Upgrade to advertiser
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
