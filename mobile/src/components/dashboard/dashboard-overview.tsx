import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useState, type JSX, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { getMyAds } from '../../features/ads/api';
import { getOverview } from '../../features/analytics/api';
import type { StatsRangeValue } from '../../features/analytics/types';
import { useAuth } from '../../features/auth/auth-context';
import { getMyConversations } from '../../features/messaging/api';
import type { Conversation } from '../../features/messaging/types';
import { formatPrice, formatRelativeTime } from '../../lib/format';
import type {
  ProfileStackParamList,
  RootTabParamList,
} from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { PostAdButton } from '../brand/post-ad-button';
import { StatusBadge } from '../brand/status-badge';
import { AdBreakdownChart } from '../charts/ad-breakdown-chart';
import { FunnelBarChart } from '../charts/funnel-bar-chart';
import { TrendChart } from '../charts/trend-chart';
import { ConversationCard } from '../messages/conversation-card';
import { BrowsingStats } from './browsing-stats';
import { LocalAdsGrid } from './local-ads-grid';
import { Panel, PanelAction, PanelNote } from './panel';
import { StatCard } from './stat-card';
import { StatsRangeFilter } from './stats-range-filter';

const RECENT_LIMIT = 4;

/**
 * Ports web/src/app/dashboard/page.tsx as one overview instead of web's
 * cookie-switched customer/advertiser pair: the backend merged both into
 * Role.USER, so every signed-in user gets the search half, and the listings
 * half appears once they have actually posted something (app.md).
 */
export function DashboardOverview(): JSX.Element {
  const { user } = useAuth();
  const [range, setRange] = useState<StatsRangeValue>('30d');
  const [adId, setAdId] = useState<string | undefined>(undefined);

  // Mounted in the Profile stack (its own Saved route), but the listings and
  // enquiries live in sibling tabs, which only the tab param list types.
  const stack = useNavigation<NavigationProp<ProfileStackParamList>>();
  const tabs = useNavigation<NavigationProp<RootTabParamList>>();

  const adsQuery = useQuery({
    queryKey: ['ads', 'mine'],
    queryFn: getMyAds,
    enabled: !!user,
  });
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: getMyConversations,
    enabled: !!user,
  });

  const ads = adsQuery.data ?? [];
  const hasAds = ads.length > 0;

  const overviewQuery = useQuery({
    queryKey: ['analytics', 'overview', range, adId ?? 'all'],
    queryFn: () => getOverview(range, adId),
    enabled: !!user && hasAds,
  });

  const conversations = conversationsQuery.data ?? [];
  const conversationsPending = !!user && conversationsQuery.isPending;
  // Web's CustomerOverview/AdvertiserOverview split the same list by which
  // side of it you are on; merged into one role, both halves are just filters.
  const enquiries = conversations.filter(
    (conversation) => conversation.customerId === user?.id,
  );
  const received = conversations.filter(
    (conversation) => conversation.advertiserId === user?.id,
  );
  const owners = new Set(
    enquiries.map((conversation) => conversation.advertiserId),
  ).size;
  const unreadSent = unreadCount(enquiries, user?.id);
  const unreadReceived = unreadCount(received, user?.id);

  const overview = overviewQuery.data;
  const totals = overview?.totals;
  const seriesHasData = overview?.series.some(
    (point) =>
      point.impressions > 0 || point.visits > 0 || point.conversions > 0,
  );
  const breakdown = overview?.ads.filter((ad) => ad.visits > 0) ?? [];

  const liveCount = ads.filter((ad) => ad.status === 'LIVE').length;
  const pendingCount = ads.filter((ad) => ad.status === 'PENDING').length;

  function openMessages() {
    tabs.navigate('MessagesTab', { screen: 'Messages' });
  }

  return (
    <View style={styles.overview}>
      <SectionHeading
        title="Your search"
        description="What you have been looking at across Jayga Lagbe."
      />

      <View style={styles.statsRow}>
        <BrowsingStats cardStyle={styles.statCard} />
        <StatCard
          label="Enquiries sent"
          value={conversationsPending ? '—' : String(enquiries.length)}
          hint={`${owners} owner${owners === 1 ? '' : 's'} contacted`}
          tone="accent"
          icon="chat"
          style={styles.statCard}
        />
        <StatCard
          label="Unread replies"
          value={conversationsPending ? '—' : String(unreadSent)}
          hint={unreadSent > 0 ? 'Waiting on you' : 'All caught up'}
          tone={unreadSent > 0 ? 'warning' : 'success'}
          icon="spark"
          style={styles.statCard}
        />
      </View>

      <Panel
        title="Saved listings"
        description="Shortlisted properties, kept on this device."
        action={
          <PanelAction
            label="View all"
            onPress={() => stack.navigate('Saved')}
          />
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
        action={<PanelAction label="View all" onPress={openMessages} />}
      >
        <ConversationList
          conversations={enquiries}
          isPending={conversationsPending}
          isError={conversationsQuery.isError}
          emptyNote="You have not contacted an owner yet. Open a listing and hit “Message the advertiser” to start."
          nameOf={(conversation) => conversation.advertiser.name}
          userId={user?.id}
          onOpen={(conversationId) =>
            tabs.navigate('MessagesTab', {
              screen: 'ChatThread',
              params: { conversationId },
            })
          }
        />
      </Panel>

      {adsQuery.isError ? (
        <Panel title="Your listings">
          <PanelNote>
            Your listings could not be loaded. Try again in a moment.
          </PanelNote>
        </Panel>
      ) : adsQuery.isPending && !!user ? null : hasAds ? (
        <>
          <SectionHeading
            title="Your listings"
            description="How the properties you posted are performing."
            action={<PostAdButton />}
          />

          <View style={styles.statsRow}>
            <StatCard
              label="Live listings"
              value={String(liveCount)}
              hint={`${ads.length} total`}
              icon="home"
              style={styles.statCard}
            />
            <StatCard
              label="In review"
              value={String(pendingCount)}
              hint="Usually cleared within a day"
              tone="warning"
              icon="clock"
              style={styles.statCard}
            />
            <StatCard
              label="Enquiries received"
              value={conversationsPending ? '—' : String(received.length)}
              hint={
                unreadReceived > 0
                  ? `${unreadReceived} unread`
                  : 'People who messaged you'
              }
              tone="accent"
              icon="chat"
              style={styles.statCard}
            />
            <StatCard
              label="Leads"
              value={String(totals?.conversions ?? 0)}
              hint="Sign-ups to contact you"
              tone="success"
              icon="spark"
              style={styles.statCard}
            />
          </View>

          <Panel
            title="Performance"
            description="Across your listings, for the selected range."
          >
            <View style={styles.panelStack}>
              <StatsRangeFilter
                range={range}
                onRangeChange={setRange}
                ads={ads.map((ad) => ({ id: ad.id, title: ad.title }))}
                adId={adId}
                onAdChange={setAdId}
              />

              {overviewQuery.isPending ? (
                <ActivityIndicator style={styles.loading} />
              ) : !totals ? (
                <PanelNote>
                  Performance data could not be loaded. Try again in a moment.
                </PanelNote>
              ) : (
                <View style={styles.statsRow}>
                  <StatCard
                    label="Impressions"
                    value={String(totals.impressions)}
                    hint="Times shown in a feed"
                    icon="eye"
                    style={styles.statCard}
                  />
                  <StatCard
                    label="Visits"
                    value={String(totals.visits)}
                    hint="Listings opened"
                    tone="info"
                    icon="cursor"
                    style={styles.statCard}
                  />
                  <StatCard
                    label="Leads"
                    value={String(totals.conversions)}
                    hint="Sign-ups to contact you"
                    tone="accent"
                    icon="spark"
                    style={styles.statCard}
                  />
                  <StatCard
                    label="Conversion rate"
                    value={`${(totals.conversionRate * 100).toFixed(1)}%`}
                    hint="Leads ÷ visits"
                    tone="success"
                    icon="trend"
                    style={styles.statCard}
                  />
                </View>
              )}
            </View>
          </Panel>

          <Panel
            title="Activity over time"
            description="Impressions, visits and leads per day."
          >
            {overviewQuery.isPending ? (
              <ActivityIndicator style={styles.loading} />
            ) : overview && seriesHasData ? (
              <TrendChart data={overview.series} />
            ) : (
              <PanelNote>
                No activity in this range yet — try a wider date range.
              </PanelNote>
            )}
          </Panel>

          <Panel
            title="Funnel"
            description="How far people get from seeing a listing to contacting you."
          >
            {totals ? (
              <FunnelBarChart
                stages={[
                  { label: 'Impressions', value: totals.impressions },
                  { label: 'Visits', value: totals.visits },
                  { label: 'Leads', value: totals.conversions },
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

          <Panel
            title="Enquiries about your listings"
            description="People who contacted you about something you posted."
            action={<PanelAction label="View all" onPress={openMessages} />}
          >
            <ConversationList
              conversations={received}
              isPending={conversationsPending}
              isError={conversationsQuery.isError}
              emptyNote="Nobody has messaged you about a listing yet."
              nameOf={(conversation) => conversation.customer.name}
              userId={user?.id}
              onOpen={(conversationId) =>
                tabs.navigate('MessagesTab', {
                  screen: 'ChatThread',
                  params: { conversationId },
                })
              }
            />
          </Panel>

          <Panel
            title="Recent listings"
            action={
              <PanelAction
                label="View all"
                onPress={() => tabs.navigate('MyAdsTab', { screen: 'MyAds' })}
              />
            }
          >
            <View>
              {ads.slice(0, RECENT_LIMIT).map((ad) => (
                <Pressable
                  key={ad.id}
                  accessibilityRole="button"
                  onPress={() =>
                    tabs.navigate('MyAdsTab', {
                      screen: 'AdStats',
                      params: { adId: ad.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.listingRow,
                    pressed ? styles.listingRowPressed : null,
                  ]}
                >
                  <View style={styles.listingText}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {ad.title}
                    </Text>
                    <Text style={styles.listingMeta} numberOfLines={1}>
                      {formatPrice(ad.price)} ·{' '}
                      {formatRelativeTime(ad.createdAt)}
                    </Text>
                  </View>
                  <StatusBadge status={ad.status} />
                </Pressable>
              ))}
            </View>
          </Panel>
        </>
      ) : (
        <Panel>
          <View style={styles.prompt}>
            <View style={styles.promptText}>
              <Text style={styles.promptTitle}>Nothing posted yet</Text>
              <Text style={styles.promptNote}>
                Posting is free. Your listing is checked and published, usually
                within a day — and you get visit and lead charts right here.
              </Text>
            </View>
            <PostAdButton />
          </View>
        </Panel>
      )}
    </View>
  );
}

function ConversationList({
  conversations,
  isPending,
  isError,
  emptyNote,
  nameOf,
  userId,
  onOpen,
}: {
  conversations: Conversation[];
  isPending: boolean;
  isError: boolean;
  emptyNote: string;
  nameOf: (conversation: Conversation) => string;
  userId?: string;
  onOpen: (conversationId: string) => void;
}) {
  if (isPending) return <ActivityIndicator style={styles.loading} />;
  if (isError) {
    return (
      <PanelNote>
        Your conversations could not be loaded. Try again in a moment.
      </PanelNote>
    );
  }
  if (conversations.length === 0) return <PanelNote>{emptyNote}</PanelNote>;

  return (
    <View>
      {conversations.slice(0, RECENT_LIMIT).map((conversation) => {
        const last = conversation.messages?.[0];
        return (
          <ConversationCard
            key={conversation.id}
            name={nameOf(conversation)}
            adTitle={conversation.ad.title}
            preview={last?.body}
            timestamp={last ? formatRelativeTime(last.createdAt) : undefined}
            unread={!!last && last.senderId !== userId && !last.readAt}
            onPress={() => onOpen(conversation.id)}
          />
        );
      })}
    </View>
  );
}

function unreadCount(
  conversations: Conversation[],
  userId: string | undefined,
): number {
  return conversations.filter((conversation) => {
    const last = conversation.messages?.[0];
    return !!last && last.senderId !== userId && !last.readAt;
  }).length;
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.heading}>
      <View style={styles.headingText}>
        <Text style={styles.headingTitle}>{title}</Text>
        <Text style={styles.headingDescription}>{description}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  overview: {
    gap: 14,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 10,
    marginTop: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headingText: {
    flex: 1,
    gap: 2,
  },
  headingTitle: {
    fontFamily: fontFamily.display,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.neutral[900],
  },
  headingDescription: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.neutral[500],
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    minWidth: '46%',
    flexGrow: 1,
    flexBasis: 0,
  },
  panelStack: {
    gap: 16,
  },
  loading: {
    marginVertical: 20,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  listingRowPressed: {
    backgroundColor: colors.neutral[100],
  },
  listingText: {
    flex: 1,
    gap: 2,
  },
  listingTitle: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: colors.neutral[900],
  },
  listingMeta: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    color: colors.neutral[500],
    fontVariant: ['tabular-nums'],
  },
  prompt: {
    gap: 14,
    alignItems: 'flex-start',
  },
  promptText: {
    gap: 4,
  },
  promptTitle: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  promptNote: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[500],
  },
});
