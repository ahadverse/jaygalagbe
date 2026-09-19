-- Listings now pick their location from a division → district → thana cascade.
-- Nullable so rows created before the cascade existed stay valid.
ALTER TABLE "ads" ADD COLUMN "locationDivision" TEXT;
