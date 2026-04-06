import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCase } from "@/services/caseService";
import { QUERY_KEYS } from "@/lib/api/constants";
import { useNotify } from "@/hooks/useNotify";
import { previewInvestigatorPdf } from "@/services/pdfService";
import axios from "axios";

export default function useCreateCaseHook() {
  const qc = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  const mutation = useMutation<void, Error, { caseData: Record<string, unknown>; pdfId: string }>({
    mutationFn: async ({ caseData, pdfId }) => {
      try {
        await createCase(caseData, pdfId);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 410
        ) {
          const { pdfId: freshPdfId } = await previewInvestigatorPdf(caseData);
          await createCase(caseData, freshPdfId);
          return;
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.CASES });
      notifySuccess({
        title: "Caso guardado",
        description: "Se añadió al historial correctamente.",
        icon: "✅",
        closeButton: true,
      });
    },
    onError: (err) =>
      notifyError({
        title: "Error guardando caso",
        description: err.message,
        closeButton: true,
      }),
  });

  return {
    createCase: (caseData: Record<string, unknown>, pdfId: string) =>
      mutation.mutateAsync({ caseData, pdfId }),
  };
}
