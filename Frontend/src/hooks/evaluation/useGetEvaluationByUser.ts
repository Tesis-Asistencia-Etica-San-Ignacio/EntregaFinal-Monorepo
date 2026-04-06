import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvaluationsByUser } from '@/services/evaluationService';
import { useNotify } from '@/hooks/useNotify';
import { QUERY_KEYS, DEFAULT_QUERY_OPTIONS } from '@/lib/api/constants';
import type { PaginatedResponse, TableQueryParams } from '@/types/paginationType';

export default function useGetEvaluationsByUserHook(params: TableQueryParams) {
  const { notifyError } = useNotify();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PaginatedResponse<any>, Error>({
    queryKey: [
      ...QUERY_KEYS.EVALUATIONS,
      params.page,
      params.pageSize,
      params.search ?? '',
      params.sortBy ?? '',
      params.sortOrder ?? '',
      JSON.stringify(params.filters ?? {}),
    ],
    queryFn: () => getEvaluationsByUser(params),
    ...DEFAULT_QUERY_OPTIONS,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (isError && error instanceof Error) {
      notifyError({
        title: 'Error cargando evaluaciones',
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
};

