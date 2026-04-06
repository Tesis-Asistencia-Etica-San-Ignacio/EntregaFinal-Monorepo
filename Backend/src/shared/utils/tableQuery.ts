import { PaginationParams, parsePaginationQuery } from './pagination';

export type SortOrder = 'asc' | 'desc';

export interface TableQueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder: SortOrder;
  filters: Record<string, string[]>;
}

interface TableQueryOptions {
  defaultSortBy?: string;
  defaultSortOrder?: SortOrder;
}

export function parseTableQuery(
  query: Record<string, unknown>,
  options: TableQueryOptions = {}
): TableQueryParams {
  const pagination = parsePaginationQuery(query);
  const search =
    typeof query.search === 'string' && query.search.trim().length > 0 ? query.search.trim() : undefined;
  const sortBy =
    typeof query.sortBy === 'string' && query.sortBy.trim().length > 0
      ? query.sortBy.trim()
      : options.defaultSortBy;
  const rawSortOrder = typeof query.sortOrder === 'string' ? query.sortOrder.toLowerCase() : '';
  const sortOrder: SortOrder =
    rawSortOrder === 'asc' || rawSortOrder === 'desc'
      ? rawSortOrder
      : options.defaultSortOrder ?? 'desc';

  let filters: Record<string, string[]> = {};
  if (typeof query.filters === 'string' && query.filters.trim().length > 0) {
    try {
      const parsed = JSON.parse(query.filters);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        filters = Object.entries(parsed).reduce<Record<string, string[]>>((acc, [key, value]) => {
          if (Array.isArray(value)) {
            const normalized = value
              .map((item) => String(item).trim())
              .filter((item) => item.length > 0);
            if (normalized.length > 0) {
              acc[key] = normalized;
            }
            return acc;
          }

          if (value !== undefined && value !== null) {
            const normalized = String(value).trim();
            if (normalized.length > 0) {
              acc[key] = [normalized];
            }
          }
          return acc;
        }, {});
      }
    } catch {
      filters = {};
    }
  }

  return {
    ...pagination,
    search,
    sortBy,
    sortOrder,
    filters,
  };
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
