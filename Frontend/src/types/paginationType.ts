import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export type SortOrder = "asc" | "desc";
export type FacetCounts = Record<string, Record<string, number>>;

export interface TableQueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  facets?: FacetCounts;
}

export interface PaginationTableState extends PaginationParams {
  totalItems: number;
  totalPages: number;
  facetCounts?: FacetCounts;
  search?: string;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onSortingChange?: (sorting: SortingState) => void;
}
