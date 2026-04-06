import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { reEvaluateEvaluation } from "@/services/iaService";
import { wasEvaluationProcessedAfterError } from "./evaluationProcessingFallback";
import { useNotify } from "@/hooks/useNotify";
import { QUERY_KEYS } from "@/lib/api/constants";
import type { PaginatedResponse } from "@/types/paginationType";

function updateEvaluationInPaginatedCache(
  old: PaginatedResponse<any> | undefined,
  evaluationId: string,
  patch: Record<string, unknown>
) {
  if (!old) return old;

  return {
    ...old,
    items: old.items.map((ev) =>
      ev.id === evaluationId
        ? { ...ev, ...patch, updatedAt: new Date().toISOString() }
        : ev
    ),
  };
}

function getApiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const responseData = err.response?.data as { message?: string; error?: string } | undefined;
    return responseData?.message || responseData?.error || err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Error desconocido";
}

export default function useReEvaluateEvaluation() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { notifySuccess, notifyError } = useNotify();

  const reEvaluate = useCallback(
    async (evaluationId: string) => {
      setLoading(true);
      setError(null);

      try {
        await reEvaluateEvaluation(evaluationId);

        qc.setQueriesData<PaginatedResponse<any>>(
          { queryKey: QUERY_KEYS.EVALUATIONS },
          (old) => updateEvaluationInPaginatedCache(old, evaluationId, { estado: "EN CURSO" })
        );
        await qc.invalidateQueries({ queryKey: QUERY_KEYS.EVALUATIONS });

        notifySuccess({
          title: "Re-evaluación completada",
          description: "Se actualizó el estado correctamente.",
          closeButton: true,
          icon: "🔄",
        });
        return true;
      } catch (err: unknown) {
        const processedAfterError = await wasEvaluationProcessedAfterError(evaluationId);

        if (processedAfterError) {
          qc.setQueriesData<PaginatedResponse<any>>(
            { queryKey: QUERY_KEYS.EVALUATIONS },
            (old) => updateEvaluationInPaginatedCache(old, evaluationId, { estado: "EN CURSO" })
          );
          await qc.invalidateQueries({ queryKey: QUERY_KEYS.EVALUATIONS });
          await qc.invalidateQueries({ queryKey: QUERY_KEYS.ETHICAL_NORMS(evaluationId) });

          notifySuccess({
            title: "Re-evaluación completada",
            description: "La plataforma confirmó el resultado después de un retraso inicial.",
            closeButton: true,
            icon: "🔄",
          });
          return true;
        }

        const e = new Error(getApiErrorMessage(err));
        setError(e);
        notifyError({
          title: "Error al re-evaluar",
          description: e.message,
          closeButton: true,
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [notifySuccess, notifyError, qc]
  );

  return { reEvaluate, loading, error };
}
