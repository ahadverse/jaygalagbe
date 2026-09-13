<<<<<<< HEAD
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  buttonVariants,
} from "@/components/ui";
=======
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
>>>>>>> d25365ce5b7a25abf0fe934b5f79c9df7167f32f
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchAd } from "@/lib/ads/fetch-ad";
import { fetchAdStats } from "@/lib/ads/fetch-ad-stats";
import { StatsFunnel } from "@/components/advertiser/stats-funnel";

export default async function AdStatsPage({
  params,
}: PageProps<"/advertiser/ads/[id]/stats">) {
  const user = await requireUser();
  const { id } = await params;
  const token = (await getToken())!;

  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  const stats = await fetchAdStats(id, token);
<<<<<<< HEAD
  const clickRate =
    stats && stats.impressions > 0 ? stats.visits / stats.impressions : 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-brand-700">Performance</p>
        <h1 className="font-heading text-title text-neutral-900">
          Ad statistics
        </h1>
        <p className="truncate text-sm text-muted-foreground">{ad.title}</p>
      </header>

      {!stats ? (
        <EmptyState
          tone="danger"
          title="Statistics didn't load"
          description="We couldn't reach the analytics service. Try refreshing in a moment."
          action={
            <Link
              href="/advertiser"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Back to your ads
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-neutral-900/5">
            <div className="flex flex-col gap-1 bg-card px-5 py-4">
              <span className="eyebrow text-subtle-foreground">
                Click-through
              </span>
              <span className="numeric font-heading text-2xl font-bold tracking-tight text-neutral-900">
                {(clickRate * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                Visits ÷ impressions
              </span>
            </div>
            <div className="flex flex-col gap-1 bg-card px-5 py-4">
              <span className="eyebrow text-subtle-foreground">
                Conversion
              </span>
              <span className="numeric font-heading text-2xl font-bold tracking-tight text-primary">
                {(stats.conversionRate * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                Sign-ups ÷ visits
              </span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsFunnel stats={stats} />
            </CardContent>
          </Card>
        </div>
=======

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ad statistics</h1>
        <p className="text-muted-foreground">{ad.title}</p>
      </div>

      {!stats ? (
        <p className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
          Couldn&apos;t load statistics right now.
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Performance funnel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <StatsFunnel stats={stats} />
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                Conversion rate
              </span>
              <span className="text-lg font-semibold text-primary">
                {(stats.conversionRate * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
>>>>>>> d25365ce5b7a25abf0fe934b5f79c9df7167f32f
      )}
    </main>
  );
}
