export type SortOrder = 'asc' | 'desc';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  sort: string;
  order: SortOrder;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface PageRequest {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function resolvePage(query: {
  page?: number;
  limit?: number;
}): PageRequest {
  const page = Math.max(1, Math.trunc(query.page ?? 1));
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(query.limit ?? DEFAULT_PAGE_SIZE)),
  );

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

/**
 * Guards against arbitrary `?sort=` values reaching Prisma: only columns the
 * caller explicitly allow-listed are accepted, anything else falls back.
 */
export function resolveSort<TField extends string>(
  allowed: readonly TField[],
  fallback: TField,
  sort?: string,
  order?: SortOrder,
): { field: TField; direction: SortOrder } {
  const field = allowed.includes(sort as TField) ? (sort as TField) : fallback;
  return { field, direction: order === 'asc' ? 'asc' : 'desc' };
}

export function paginate<T>(
  data: T[],
  total: number,
  page: PageRequest,
  sort: { field: string; direction: SortOrder },
): Paginated<T> {
  const totalPages = total === 0 ? 0 : Math.ceil(total / page.limit);

  return {
    data,
    meta: {
      page: page.page,
      limit: page.limit,
      total,
      totalPages,
      hasPreviousPage: page.page > 1,
      hasNextPage: page.page < totalPages,
      sort: sort.field,
      order: sort.direction,
    },
  };
}
