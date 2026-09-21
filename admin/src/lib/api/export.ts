import { API_URL } from './config';
import { ApiError, buildQuery, readToken, type QueryParams } from './client';

/**
 * Downloads a filtered table as CSV.
 *
 * Goes through `fetch` rather than pointing a link at the URL because the
 * endpoint is bearer-authenticated — a plain navigation cannot carry the
 * token. The response is turned into an object URL and clicked, which is the
 * only way to get the browser to honour the server's filename.
 */
export async function downloadCsv(
  resource: string,
  params: QueryParams,
): Promise<void> {
  const token = readToken();

  const response = await fetch(
    `${API_URL}/admin/${resource}/export${buildQuery(params)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 401 || response.status === 403
        ? 'Your session has expired — sign in again to export'
        : 'Could not build the export',
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filenameFrom(response) ?? `${resource}.csv`;
  document.body.append(link);
  link.click();
  link.remove();

  // Revoking immediately can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function filenameFrom(response: Response): string | null {
  const header = response.headers.get('Content-Disposition');
  const match = header?.match(/filename="([^"]+)"/);
  return match?.[1] ?? null;
}
