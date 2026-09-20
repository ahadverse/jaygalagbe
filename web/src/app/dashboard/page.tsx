import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import { PageTitle } from "@/components/dashboard/page-title";
import { Panel, PanelNote } from "@/components/dashboard/panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { BrowsingStats } from "@/components/dashboard/browsing-stats";
import { LocalAdsGrid } from "@/components/dashboard/local-ads-grid";
import { StatsFilters } from "@/components/dashboard/stats-filters";
import { DashboardIcon } from "@/components/dashboard/icons";
import { TrendChart } from "@/components/charts/trend-chart";
import { FunnelBarChart } from "@/components/charts/funnel-bar-chart";
import { AdBreakdownChart } from "@/components/charts/ad-breakdown-chart";
import { ConversationCard } from "@/components/messaging/conversation-card";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyAds } from "@/lib/ads/fetch-my-ads";
import { fetchMyConversations } from "@/lib/messaging/fetch-conversations";
import { fetchAnalyticsOverview } from "@/lib/analytics/fetch-overview";
import { resolveStatsRange } from "@/lib/analytics/date-range";
import { resolveDashboardView } from "@/lib/dashboard/resolve-view";
import { formatAmount, formatRelativeTime } from "@/lib/format";
import { firstSearchParam } from "@/lib/utils";
import { AD_STATUS_BADGE } from "@/lib/ads/status";
import type { AuthUser } from "@/lib/auth/types";
import type { Conversation } from "@/lib/messaging/types";

export const metadata: Metadata = {
  title: "Overview | Jayga Lagbe",
};

const RECENT_LIMIT = 4;

export default async function DashboardOverviewPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const user = await requireUser();
  const view = await resolveDashboardView();
  const token = (await getToken())!;

  const resolved = await searchParams;
  const firstName = user.name.trim().split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title={`Welcome back, ${firstName}`}
        description={
          view === "advertiser"
            ? "How the properties you posted are doing, and who is asking about them."
            : "The listings you are following, and the owners you have talked to."
        }
      />

      {view === "advertiser" ? (
        <AdvertiserOverview
          user={user}
          token={token}
          range={firstSearchParam(resolved?.range)}
          adId={firstSearchParam(resolved?.adId) || undefined}
        />
      ) : (
        <CustomerOverview user={user} token={token} />
      )}
    </div>
  );
}

async function CustomerOverview({
  user,
  token,
}: {
  user: AuthUser;
  token: string;
}) {
  const conversations = await fetchMyConversations(token);
  const enquiries = conversations.filter(
    (conversation) => conversation.customerId === user.id,
  );
  const owners = new Set(enquiries.map((conversation) => conversation.advertiserId)).size;
  const unread = unreadCount(enquiries, user.id);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Your search"
        description="What you have been looking at across Jayga Lagbe."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <BrowsingStats />
        <StatCard
          label="Enquiries sent"
          value={enquiries.length.toLocaleString()}
          hint={`${owners} owner${owners === 1 ? "" : "s"} contacted`}
          tone="accent"
          icon={<DashboardIcon name="chat" />}
        />
        <StatCard
          label="Unread replies"
          value={unread.toLocaleString()}
          hint={unread > 0 ? "Waiting on you" : "All caught up"}
          tone={unread > 0 ? "warning" : "success"}
          icon={<DashboardIcon name="spark" />}
        />
      </div>

      <Panel
        title="Saved listings"
        description="Shortlisted properties, kept on this device."
        action={
          <Link
            href="/dashboard/saved"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        <LocalAdsGrid source="saved" limit={3} />
      </Panel>

      <Panel
        title="Pick up where you left off"
        description="Listings you opened recently."
      >
        <LocalAdsGrid source="viewed" limit={3} />
      </Panel>

      <Panel
        title="Your enquiries"
        description="Listings you reached out about."
        action={
          <Link
            href="/dashboard/messages"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        }
        bodyClassName="flex flex-col gap-2 p-3 sm:p-3"
      >
        {enquiries.length === 0 ? (
          <PanelNote>
            You have not contacted an owner yet. Open a listing and hit “Message
            the advertiser” to start.
          </PanelNote>
        ) : (
          enquiries.slice(0, RECENT_LIMIT).map((conversation) => (
            <ConversationCard
              key={conversation.id}
              href={`/dashboard/messages/${conversation.id}`}
              name={conversation.advertiser.name}
              adTitle={conversation.ad.title}
              preview={conversation.messages?.[0]?.body}
            />
          ))
        )}
      </Panel>

      <Panel bodyClassName="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-base font-bold text-foreground">
            Have a property to list?
          </p>
          <p className="measure text-sm text-muted-foreground">
            Posting is free. Switch to the advertiser view any time to see visit
            and lead charts for everything you post.
          </p>
        </div>
        <Link
          href="/dashboard/ads/new"
          className={buttonVariants({ variant: "primary" })}
        >
          Post an ad
        </Link>
      </Panel>
    </div>
  );
}

async function AdvertiserOverview({
  user,
  token,
  range: requestedRange,
  adId,
}: {
  user: AuthUser;
  token: string;
  range?: string;
  adId?: string;
}) {
  const { range, from, to } = resolveStatsRange(requestedRange);

  const [ads, conversations] = await Promise.all([
    fetchMyAds(token),
    fetchMyConversations(token),
  ]);
  const overview =
    ads.length > 0
      ? await fetchAnalyticsOverview(token, { from, to, adId })
      : null;

  const liveCount = ads.filter((ad) => ad.status === "LIVE").length;
  const pendingCount = ads.filter((ad) => ad.status === "PENDING").length;
  const received = conversations.filter(
    (conversation) => conversation.advertiserId === user.id,
  );
  const unread = unreadCount(received, user.id);

  const totals = overview?.totals;
  const seriesHasData = overview?.series.some(
    (point) =>
      point.impressions > 0 || point.visits > 0 || point.conversions > 0,
  );
  const breakdown = overview?.ads.filter((ad) => ad.visits > 0) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Your listings"
        description="How the properties you posted are performing."
        action={
          <Link
            href="/dashboard/ads/new"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            Post a new ad
          </Link>
        }
      />

      {ads.length === 0 ? (
        <Panel bodyClassName="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-bold text-foreground">
              Nothing posted yet
            </p>
            <p className="measure text-sm text-muted-foreground">
              Posting is free. Your listing is checked and published, usually
              within a day — and you get visit and lead charts right here.
            </p>
          </div>
          <Link
            href="/dashboard/ads/new"
            className={buttonVariants({ variant: "primary" })}
          >
            Post your first ad
          </Link>
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Live listings"
              value={liveCount.toLocaleString()}
              hint={`${ads.length} total`}
              icon={<DashboardIcon name="home" />}
            />
            <StatCard
              label="In review"
              value={pendingCount.toLocaleString()}
              hint="Usually cleared within a day"
              tone="warning"
              icon={<DashboardIcon name="clock" />}
            />
            <StatCard
              label="Enquiries received"
              value={received.length.toLocaleString()}
              hint={unread > 0 ? `${unread} unread` : "People who messaged you"}
              tone="accent"
              icon={<DashboardIcon name="chat" />}
            />
            <StatCard
              label="Leads"
              value={(totals?.conversions ?? 0).toLocaleString()}
              hint="Sign-ups to contact you"
              tone="success"
              icon={<DashboardIcon name="spark" />}
            />
          </div>

          <Panel
            title="Performance"
            description="Across your listings, for the selected range."
          >
            <div className="flex flex-col gap-5">
              <StatsFilters
                action="/dashboard"
                range={range}
                ads={ads.map((ad) => ({ id: ad.id, title: ad.title }))}
                adId={adId}
              />

              {!totals ? (
                <PanelNote>
                  Performance data could not be loaded. Try again in a moment.
                </PanelNote>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <StatCard
                    label="Impressions"
                    value={totals.impressions.toLocaleString()}
                    hint="Times shown in a feed"
                    icon={<DashboardIcon name="eye" />}
                  />
                  <StatCard
                    label="Visits"
                    value={totals.visits.toLocaleString()}
                    hint="Listings opened"
                    tone="info"
                    icon={<DashboardIcon name="cursor" />}
                  />
                  <StatCard
                    label="Leads"
                    value={totals.conversions.toLocaleString()}
                    hint="Sign-ups to contact you"
                    tone="accent"
                    icon={<DashboardIcon name="spark" />}
                  />
                  <StatCard
                    label="Conversion rate"
                    value={`${(totals.conversionRate * 100).toFixed(1)}%`}
                    hint="Leads ÷ visits"
                    tone="success"
                    icon={<DashboardIcon name="trend" />}
                  />
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Activity over time"
            description="Impressions, visits and leads per day."
          >
            {overview && seriesHasData ? (
              <TrendChart data={overview.series} />
            ) : (
              <PanelNote>
                No activity in this range yet — try a wider date range.
              </PanelNote>
            )}
          </Panel>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel
              title="Funnel"
              description="How far people get from seeing a listing to contacting you."
            >
              {totals ? (
                <FunnelBarChart
                  stages={[
                    { label: "Impressions", value: totals.impressions },
                    { label: "Visits", value: totals.visits },
                    { label: "Leads", value: totals.conversions },
                  ]}
                />
              ) : (
                <PanelNote>Nothing to chart yet.</PanelNote>
              )}
            </Panel>

            <Panel
              title="Top listings"
              description="Ranked by visits in the selected range."
            >
              {breakdown.length > 0 ? (
                <AdBreakdownChart ads={breakdown} />
              ) : (
                <PanelNote>
                  Once your listings start getting visits, they will be ranked
                  here.
                </PanelNote>
              )}
            </Panel>
          </div>

          <Panel
            title="Enquiries about your listings"
            description="People who contacted you about something you posted."
            action={
              <Link
                href="/dashboard/messages"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            }
            bodyClassName="flex flex-col gap-2 p-3 sm:p-3"
          >
            {received.length === 0 ? (
              <PanelNote>
                Nobody has messaged you about a listing yet.
              </PanelNote>
            ) : (
              received.slice(0, RECENT_LIMIT).map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  href={`/dashboard/messages/${conversation.id}`}
                  name={conversation.customer.name}
                  adTitle={conversation.ad.title}
                  preview={conversation.messages?.[0]?.body}
                />
              ))
            )}
          </Panel>

          <Panel
            title="Recent listings"
            action={
              <Link
                href="/dashboard/ads"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            }
            bodyClassName="p-3 sm:p-3"
          >
            <ul className="flex flex-col">
              {ads.slice(0, RECENT_LIMIT).map((ad) => {
                const badge = AD_STATUS_BADGE[ad.status];
                return (
                  <li key={ad.id}>
                    <Link
                      href={`/ads/${ad.id}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/70"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {ad.title}
                        </span>
                        <span className="numeric truncate text-xs text-muted-foreground">
                          ৳ {formatAmount(ad.price)} ·{" "}
                          {formatRelativeTime(ad.createdAt)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}

function unreadCount(conversations: Conversation[], userId: string): number {
  return conversations.filter((conversation) => {
    const last = conversation.messages?.[0];
    return last && last.senderId !== userId && !last.readAt;
  }).length;
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-heading text-lg font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
