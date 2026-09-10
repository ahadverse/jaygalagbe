import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
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
      )}
    </main>
  );
}
