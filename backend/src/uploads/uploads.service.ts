import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  AD_PHOTO_PREFIX,
  buildPublicUrl,
  getS3Client,
  getS3Credentials,
} from './s3.config.js';
import {
  decodeFilename,
  EXTENSION_BY_CONTENT_TYPE,
  MAX_UPLOAD_BYTES,
  slugifyFilename,
  type UploadedImage,
} from './upload-limits.js';

export interface UploadedPhoto {
  /** Echoed back so the browser can match a result to the tile it came from. */
  filename: string;
  key: string;
  url: string;
}

@Injectable()
export class UploadsService {
  /**
   * Streams each file to S3 and returns its public URL.
   *
   * The bytes pass through this process rather than going browser-to-S3 with
   * a presigned PUT. That costs a little memory per request, but it is the
   * only workable shape here: a direct PUT needs a CORS rule on the bucket,
   * and the bucket is shared with other projects whose CORS config this
   * deployment's IAM key can neither read nor safely replace.
   */
  async uploadAdPhotos(
    files: UploadedImage[],
  ): Promise<UploadedPhoto[]> {
    if (files.length === 0) {
      throw new BadRequestException('No files were uploaded');
    }

    const { bucket } = getS3Credentials();
    const client = getS3Client();
    // One folder per submission, so an ad's photos stay together even though
    // the ad row does not exist yet when they are uploaded.
    const folder = randomUUID();

    return Promise.all(
      files.map(async (file) => {
        const filename = decodeFilename(file.originalname);
        const extension = EXTENSION_BY_CONTENT_TYPE[file.mimetype];
        // Multer's limits cover size, but the type allow-list is enforced
        // here too: `fileFilter` runs before the body is fully parsed and a
        // rejected file must never reach the bucket.
        if (!extension) {
          throw new BadRequestException(
            `${filename}: only JPEG, PNG, WebP or AVIF images can be uploaded`,
          );
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new BadRequestException(
            `${filename}: images must be under ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB`,
          );
        }

        // Readable half from the original name, unique half generated. The
        // client's string never lands in the key verbatim, so traversal,
        // collisions and unicode surprises cannot reach it.
        const name = `${slugifyFilename(filename)}-${randomUUID()}`;
        const key = `${AD_PHOTO_PREFIX}${folder}/${name}.${extension}`;

        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            // Served through the CDN and never re-written under the same key.
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        );

        return { filename, key, url: buildPublicUrl(key) };
      }),
    );
  }
}
