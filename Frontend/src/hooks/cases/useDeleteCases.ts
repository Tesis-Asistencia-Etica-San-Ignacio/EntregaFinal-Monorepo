import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCase } from "@/services/caseService";
import { QUERY_KEYS } from "@/lib/api/constants";
import { useNotify } from "@/hooks/useNotify";

export default function useDeleteCasesHook() {
  const qc = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  const mutation = useMutation<void, Error, string>({
    mutationFn: id => deleteCase(id),
    onSuccess: () => {
      notifySuccess({
        title: "Caso eliminado",
        description: "Se quitó del historial.",
        icon: "✅",
        closeButton: true,
      });
    },
    onError: err =>
      notifyError({
        title: "Error eliminando caso",
        description: err.message,
        closeButton: true,
      }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CASES });
    },
  });

  return {
    deleteCase: (id: string) => mutation.mutateAsync(id),
    loading: mutation.isPending,
  };
}
