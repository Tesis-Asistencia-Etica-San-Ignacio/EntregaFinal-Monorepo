import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/services/evaluationService";
import type { FileWithUrl } from "@/types/fileType";
import { useNotify } from "@/hooks/useNotify";
import { QUERY_KEYS, DEFAULT_QUERY_OPTIONS } from "@/lib/api/constants";

interface UploadVariables {
  files: FileWithUrl[];
  onProgress: (index: number, percent: number) => void;
}

export default function useCreateEvaluationHook() {
  const qc = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  const mutation = useMutation<void, Error, UploadVariables>({
    mutationFn: async ({ files, onProgress }) => {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.error) continue;

        const form = new FormData();
        form.append("file", f.file);

        await uploadFile(form, (e) => {
          if (!e.total) return;
          onProgress(i, Math.round((e.loaded / e.total) * 100));
        });

        notifySuccess({
          title: `Archivo ${f.name} subido`,
          description: "Se ha subido correctamente.",
          closeButton: true,
          icon: "✅",
        });
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
    onError: (err) => {
      notifyError({
        title: "Error subiendo archivos",
        description: err.message ?? "Revisa la consola para más detalles.",
        closeButton: true,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.EVALUATIONS });
      await qc.refetchQueries({
        queryKey: QUERY_KEYS.STATS,
        exact: false,
        type: 'all',
      });
    },
  });

  return {
    uploadFiles: (files: FileWithUrl[], onProgress: (i: number, p: number) => void) =>
      mutation.mutateAsync({ files, onProgress }),
    loading: mutation.isPending,
  };
}
