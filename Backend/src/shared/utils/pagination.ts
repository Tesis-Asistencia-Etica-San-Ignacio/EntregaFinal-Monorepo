export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
}

export type FacetCounts = Record<string, Record<string, number>>;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  facets?: FacetCounts;
}

interface PaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  maxPageSize?: number;
}

export function parsePaginationQuery(
  query: Record<string, unknown>,
  options: PaginationOptions = {}
): PaginationParams {
  const defaultPage = options.defaultPage ?? 1;
  const defaultPageSize = options.defaultPageSize ?? 10;
  const maxPageSize = options.maxPageSize ?? 100;

  const rawPage = Number(query.page);
  const rawPageSize = Number(query.pageSize ?? query.limit);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : defaultPage;
  const requestedPageSize =
    Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : defaultPageSize;
  const pageSize = Math.min(requestedPageSize, maxPageSize);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function buildPaginatedResult<T>(
  items: T[],
  totalItems: number,
  pagination: PaginationParams,
  facets?: FacetCounts
): PaginatedResult<T> {
  return {
    items,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pagination.pageSize)),
    ...(facets ? { facets } : {}),
  };
}
