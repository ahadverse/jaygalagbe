import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/auth-context';
import { getMyConversations } from '../../features/messaging/api';
import { getReviewsBatch, upsertReview } from '../../features/reviews/api';
import type { Review } from '../../features/reviews/types';
import { formatRelativeTime } from '../../lib/format';

type ReviewableAdvertiser = {
  advertiserId: string;
  name: string;
  existing?: Review;
};

function useReceivedReviews(userId: string) {
  return useQuery({
    queryKey: ['reviews', 'received', userId],
    queryFn: async () => {
      const batch = await getReviewsBatch([userId]);
      return batch[userId] ?? { reviews: [], averageRating: 0, reviewCount: 0 };
    },
  });
}

// No "given"/"received" backend endpoints exist - this derives the
// reviewable list from conversations you started as a customer, same as
// web/src/app/dashboard/reviews/page.tsx.
function useReviewableAdvertisers(userId: string) {
  return useQuery({
    queryKey: ['reviews', 'reviewable', userId],
    queryFn: async (): Promise<ReviewableAdvertiser[]> => {
      const conversations = await getMyConversations();
      const byAdvertiser = new Map<string, string>();
      for (const conversation of conversations) {
        if (conversation.customerId === userId) {
          byAdvertiser.set(
            conversation.advertiserId,
            conversation.advertiser.name,
          );
        }
      }
      const ids = [...byAdvertiser.keys()];
      const batch = await getReviewsBatch(ids);
      return ids.map((id) => ({
        advertiserId: id,
        name: byAdvertiser.get(id)!,
        existing: batch[id]?.reviews.find(
          (review) => review.customerId === userId,
        ),
      }));
    },
  });
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconButton
          key={n}
          icon={n <= value ? 'star' : 'star-outline'}
          size={22}
          style={styles.starButton}
          onPress={() => onChange(n)}
        />
      ))}
    </View>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return <Text>{'★'.repeat(rating) + '☆'.repeat(5 - rating)}</Text>;
}

function ReviewableCard({
  advertiser,
  onSaved,
}: {
  advertiser: ReviewableAdvertiser;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(advertiser.existing?.rating ?? 5);
  const [comment, setComment] = useState(advertiser.existing?.comment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit() {
    if (!rating) {
      setError('Choose a rating before submitting.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await upsertReview(advertiser.advertiserId, {
        rating,
        comment: comment.trim() || undefined,
      });
      setSaved(true);
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't save your review.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card style={styles.card}>
      <Card.Title title={advertiser.name} />
      <Card.Content style={styles.cardContent}>
        <StarRatingInput value={rating} onChange={setRating} />
        <TextInput
          mode="outlined"
          label="Comment (optional)"
          placeholder="How was dealing with this advertiser?"
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={1000}
        />
        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}
        {saved ? (
          <HelperText type="info" visible>
            Review saved.
          </HelperText>
        ) : null}
      </Card.Content>
      <Card.Actions>
        <Button onPress={submit} loading={saving} disabled={saving}>
          {advertiser.existing ? 'Update review' : 'Submit review'}
        </Button>
      </Card.Actions>
    </Card>
  );
}

// "Given + received in one merged view, since the role is unified" per
// app.md - both sections always show together, unlike web's toggle.
export function ReviewsScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: received, isPending: loadingReceived } = useReceivedReviews(
    user!.id,
  );
  const { data: reviewable, isPending: loadingReviewable } =
    useReviewableAdvertisers(user!.id);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ['reviews'] });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text variant="titleMedium">About you</Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Reviews left by people who contacted you.
        </Text>
        {loadingReceived ? (
          <ActivityIndicator />
        ) : received && received.reviews.length > 0 ? (
          received.reviews.map((review) => (
            <View
              key={review.id}
              style={[
                styles.reviewRow,
                { borderBottomColor: theme.colors.outlineVariant },
              ]}
            >
              <StarDisplay rating={review.rating} />
              <Text variant="titleSmall">{review.customer.name}</Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {formatRelativeTime(review.createdAt)}
              </Text>
              {review.comment ? <Text>{review.comment}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Nobody has reviewed you yet. Reviews appear once someone you have
            talked to rates the experience.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">Rate an owner</Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Anyone whose listing you have messaged about.
        </Text>
        {loadingReviewable ? (
          <ActivityIndicator />
        ) : reviewable && reviewable.length > 0 ? (
          reviewable.map((advertiser) => (
            <ReviewableCard
              key={advertiser.advertiserId}
              advertiser={advertiser}
              onSaved={refresh}
            />
          ))
        ) : (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Contact an owner about a listing and you will be able to rate them
            here.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  card: {
    marginTop: 4,
  },
  cardContent: {
    gap: 8,
  },
  starRow: {
    flexDirection: 'row',
    marginLeft: -8,
  },
  starButton: {
    margin: 0,
  },
  reviewRow: {
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
