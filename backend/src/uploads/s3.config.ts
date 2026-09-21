import { S3Client } from '@aws-sdk/client-s3';

/**
 * The bucket is shared with other projects, so every object this API writes
 * lives under one root prefix. Nothing outside it may ever be read or deleted
 * through these endpoints.
 */
export const S3_ROOT_PREFIX = 'jayga-lagbe/';

/** Sub-path for photos attached to an ad. */
export const AD_PHOTO_PREFIX = `${S3_ROOT_PREFIX}ads/`;

export interface S3Credentials {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Optional CDN in front of the bucket; public URLs prefer it when present. */
  cloudFrontDomain?: string;
}

export function getS3Credentials(): S3Credentials {
  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_BUCKET_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'S3 is not configured: set AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY',
    );
  }
  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    cloudFrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || undefined,
  };
}

let client: S3Client | undefined;

/**
 * One client per process: it pools sockets and caches the signing key, and
 * rebuilding it per request would re-derive both on every upload.
 */
export function getS3Client(): S3Client {
  if (!client) {
    const { region, accessKeyId, secretAccessKey } = getS3Credentials();
    client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

export function buildPublicUrl(key: string): string {
  const { bucket, region, cloudFrontDomain } = getS3Credentials();
  return cloudFrontDomain
    ? `https://${cloudFrontDomain}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
