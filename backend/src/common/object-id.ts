const OBJECT_ID = /^[a-f\d]{24}$/i;

/** Mongo rejects any other string in an `id` filter, so guard before querying. */
export function isObjectId(value: string): boolean {
  return OBJECT_ID.test(value);
}

/**
 * Optional fields Prisma never wrote are unset in Mongo, not null, and a
 * `field: null` filter only matches an explicit null — so "empty" has to
 * accept both.
 */
export const isEmpty = (field: string) => ({
  OR: [{ [field]: null }, { [field]: { isSet: false } }],
});
