/**
 * Mirrors the limits the API enforces on `/uploads/ad-photos`. They are
 * repeated here only to fail fast in the browser — the server is still the
 * one that decides.
 */
export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_PHOTOS = 10;

export const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(",");

export type UploadedPhoto = {
  filename: string;
  key: string;
  url: string;
};

export function describeRejection(file: File): string | null {
  if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return "Only JPEG, PNG, WebP or AVIF images can be uploaded.";
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return `Images must be under ${MAX_PHOTO_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
}

/**
 * Posts the batch to our own API, which stores it in S3 and hands back the
 * CDN URLs.
 *
 * The bytes go through the API rather than browser-to-S3 with a presigned
 * PUT: a direct PUT needs a CORS rule on the bucket, and the bucket is shared
 * with other projects whose CORS config this deployment cannot safely change.
 *
 * XHR rather than fetch, because only XHR reports upload progress and a set
 * of phone photos on a Bangladeshi mobile connection is slow enough that a
 * bare spinner feels broken.
 */
export function uploadAdPhotos(
  files: File[],
  onProgress: (percent: number) => void,
): Promise<UploadedPhoto[]> {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      resolve([]);
      return;
    }

    const body = new FormData();
    for (const file of files) body.append("images", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/uploads/ad-photos");

    // One bar for the batch: the browser uploads the whole multipart body as
    // a single stream, so per-file progress would be invented.
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        try {
          resolve(JSON.parse(request.responseText) as UploadedPhoto[]);
        } catch {
          reject(new Error("The server returned an unreadable response."));
        }
        return;
      }
      reject(new Error(readError(request)));
    });

    request.addEventListener("error", () =>
      reject(new Error("The connection dropped while uploading.")),
    );
    request.addEventListener("abort", () =>
      reject(new Error("The upload was cancelled.")),
    );

    request.send(body);
  });
}

/** Surfaces the API's own validation message rather than a generic failure. */
function readError(request: XMLHttpRequest): string {
  try {
    const body: unknown = JSON.parse(request.responseText);
    if (body && typeof body === "object" && "message" in body) {
      const { message } = body as { message: unknown };
      if (Array.isArray(message)) return message.join(", ");
      if (typeof message === "string") return message;
    }
  } catch {
    // Not JSON — fall through to the generic message.
  }
  return request.status === 413
    ? "Those photos are too large to upload together."
    : "The photos could not be saved. Please try again.";
}
