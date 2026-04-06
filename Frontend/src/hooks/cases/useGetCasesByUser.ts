import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCasesByUser } from "@/services/caseService";
import { QUERY_KEYS, DEFAULT_QUERY_OPTIONS } from "@/lib/api/constants";
import { useNotify } from "@/hooks/useNotify";
import type { PaginatedResponse, TableQueryParams } from "@/types/paginationType";

export default function useGetCasesByUserHook(params: TableQueryParams) {
  const { notifyError } = useNotify();

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedResponse<any>, Error>({
    queryKey: [
      ...QUERY_KEYS.CASES,
      params.page,
      params.pageSize,
      params.search ?? "",
      params.sortBy ?? "",
      params.sortOrder ?? "",
      JSON.stringify(params.filters ?? {}),
    ],
    queryFn: () => getCasesByUser(params),
    ...DEFAULT_QUERY_OPTIONS,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (isError && error instanceof Error) {
      notifyError({
        title: "Error cargando casos",
        description: error.message,
        closeButton: true,
      });
    }
  }, [isError, error, notifyError]);

  return {
    files: data?.items ?? [],
    pagination: data,
    isLoading,
    refetch,
  };
}
