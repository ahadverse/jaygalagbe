export type Review = {
  id: string;
  advertiserId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string };
};

export type AdvertiserReviews = {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
};
