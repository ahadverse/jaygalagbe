import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  HelperText,
  TextInput,
} from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { useAuth } from '../../features/auth/auth-context';
import { getMyConversations } from '../../features/messaging/api';
import { getReviewsBatch, upsertReview } from '../../features/reviews/api';
import type { Review } from '../../features/reviews/types';
import { formatRelativeTime } from '../../lib/format';
import { colors, fontFamily, radius } from '../../theme/tokens';

const STARS = [1, 2, 3, 4, 5];

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

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <Ionicons
      name={filled ? 'star' : 'star-outline'}
      size={size}
      color={filled ? colors.warning[500] : colors.neutral[300]}
    />
  );
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
      {STARS.map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          hitSlop={6}
          style={styles.starTarget}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${n} out of 5`}
        >
          <Star filled={n <= value} size={26} />
        </Pressable>
      ))}
    </View>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {STARS.map((n) => (
        <Star key={n} filled={n <= rating} size={15} />
      ))}
    </View>
  );
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
    <BrandCard variant="card" radius="lg" style={styles.card}>
      <Text style={styles.personName}>{advertiser.name}</Text>
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
      <Button
        mode="contained"
        onPress={submit}
        loading={saving}
        disabled={saving}
        style={styles.submitButton}
        contentStyle={styles.submitContent}
      >
        {advertiser.existing ? 'Update review' : 'Submit review'}
      </Button>
    </BrandCard>
  );
}

// "Given + received in one merged view, since the role is unified" per
// app.md - both sections always show together, unlike web's toggle.
export function ReviewsScreen() {
  const { user } = useAuth();
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
        <Eyebrow>Received</Eyebrow>
        <Text style={styles.sectionTitle}>About you</Text>
        <Text style={styles.sectionHint}>
          Reviews left by people who contacted you.
        </Text>
        {loadingReceived ? (
          <ActivityIndicator />
        ) : received && received.reviews.length > 0 ? (
          received.reviews.map((review) => (
            <BrandCard
              key={review.id}
              variant="card"
              radius="lg"
              style={styles.card}
            >
              <StarDisplay rating={review.rating} />
              <Text style={styles.personName}>{review.customer.name}</Text>
              {review.comment ? (
                <Text style={styles.reviewBody}>{review.comment}</Text>
              ) : null}
              <Text style={styles.reviewDate}>
                {formatRelativeTime(review.createdAt)}
              </Text>
            </BrandCard>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Nobody has reviewed you yet. Reviews appear once someone you have
            talked to rates the experience.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Eyebrow>Given</Eyebrow>
        <Text style={styles.sectionTitle}>Rate an owner</Text>
        <Text style={styles.sectionHint}>
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
          <Text style={styles.emptyText}>
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
    gap: 4,
  },
  sectionTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.neutral[900],
  },
  sectionHint: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[600],
    marginBottom: 6,
  },
  card: {
    marginTop: 6,
    gap: 8,
  },
  starRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 2,
  },
  starTarget: {
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  personName: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: colors.neutral[900],
  },
  reviewBody: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    lineHeight: 21,
    color: colors.neutral[700],
  },
  reviewDate: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    color: colors.neutral[500],
  },
  emptyText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[500],
  },
  submitButton: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  submitContent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
