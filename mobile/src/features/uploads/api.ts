import { API_URL } from '../../api/config';
import { ApiError, extractErrorMessage } from '../../api/errors';
import { getToken } from '../../api/token-store';

export type UploadedPhoto = { filename: string; key: string; url: string };
export type PickedImage = { uri: string; name: string; type: string };

// Bypasses api/client's apiFetch (it always JSON.stringifies the body and
// sets Content-Type: application/json) since this is a multipart upload -
// fetch must set its own boundary, so Content-Type is deliberately omitted.
export async function uploadAdPhotos(
  images: PickedImage[],
): Promise<UploadedPhoto[]> {
  const formData = new FormData();
  for (const image of images) {
    // React Native's FormData accepts this {uri,name,type} shape for a file
    // part - it isn't a real Blob, but RN's fetch polyfill knows how to read it.
    formData.append('images', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
  }

  const token = getToken();
  const response = await fetch(`${API_URL}/uploads/ad-photos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const isJson =
    response.headers.get('content-type')?.includes('application/json') ?? false;
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractErrorMessage(body, `Upload failed (${response.status})`),
      body,
    );
  }
  return body as UploadedPhoto[];
}
