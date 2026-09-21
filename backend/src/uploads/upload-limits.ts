/**
 * Limits for ad photo uploads. The browser mirrors these to fail fast, but
 * this file is the one that decides.
 */

/** Content type → file extension. Doubles as the allow-list. */
export const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const ALLOWED_CONTENT_TYPES = Object.keys(EXTENSION_BY_CONTENT_TYPE);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** A listing carries at most this many photos, so a request carries at most this many. */
export const MAX_FILES_PER_REQUEST = 10;

/**
 * The part of Multer's file object this module actually uses.
 *
 * Declared here rather than pulled from `Express.Multer.File`: this project's
 * `tsconfig` pins `types` to node and vitest, so ambient global augmentation
 * from `@types/multer` is not in scope, and widening that list to reach one
 * interface would drag every other global it declares in with it.
 */
export interface UploadedImage {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Multer reads multipart filenames as latin1, which turns any Bangla name
 * into mojibake. Re-decoding as UTF-8 restores it.
 */
export function decodeFilename(originalname: string): string {
  return Buffer.from(originalname, 'latin1').toString('utf8');
}

/**
 * `Plot in Bashundhara.JPG` → `plot-in-bashundhara`.
 *
 * Keeps the original name readable in the bucket, the way the rest of this
 * account's uploads are named, but it is only ever one half of a key — a
 * generated id supplies uniqueness, so nothing here has to be trusted.
 */
export function slugifyFilename(originalname: string): string {
  const withoutExtension = originalname.replace(/\.[^.]+$/, '');
  const slug = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  // A name that is entirely non-Latin (Bangla, for instance) slugs to nothing.
  return slug || 'photo';
}
