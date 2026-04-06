import { useState, useCallback, useRef, useEffect } from "react";
import { generatePdfByEvaluationId } from "@/services/pdfService";
import { useNotify } from "@/hooks/useNotify";

export interface UseEvaluatorPdf {
  pdfUrl: string;
  pdfId: string;
  loading: boolean;
  fetchPdf: (evaluationId: string) => Promise<string>;
  clear: () => void;
}

const PREVIEW_REUSE_WINDOW_MS = 4 * 60 * 1000;

export default function useGeneratePdfByEvaluationId(): UseEvaluatorPdf {
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfId, setPdfId] = useState("");
  const [loading, setLoading] = useState(false);
  const prevUrlRef = useRef("");
  const lastEvaluationIdRef = useRef("");
  const pdfIdRef = useRef("");
  const generatedAtRef = useRef(0);

  const { notifySuccess, notifyError } = useNotify();

  const fetchPdf = useCallback(async (evaluationId: string) => {
    if (!evaluationId) return "";
    const now = Date.now();

    if (
      evaluationId === lastEvaluationIdRef.current &&
      prevUrlRef.current &&
      pdfIdRef.current &&
      now - generatedAtRef.current < PREVIEW_REUSE_WINDOW_MS
    ) {
      setPdfUrl(prevUrlRef.current);
      setPdfId(pdfIdRef.current);
      return prevUrlRef.current;
    }

    setLoading(true);
    try {
      const { blob, pdfId } = await generatePdfByEvaluationId(evaluationId);

      // revocar anterior
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

      const objectUrl = URL.createObjectURL(blob);
      prevUrlRef.current = objectUrl;
      lastEvaluationIdRef.current = evaluationId;
      pdfIdRef.current = pdfId;
      generatedAtRef.current = now;
      setPdfUrl(objectUrl);
      setPdfId(pdfId);

      notifySuccess({
        title: "PDF generado",
        description: "Vista previa disponible.",
        icon: "✅",
        closeButton: true,
      });

      return objectUrl;
    } catch (err: any) {
      console.error("Error al generar PDF:", err);
      notifyError({
        title: "Error PDF",
        description: err?.message ?? "No se pudo generar la vista previa.",
        closeButton: true,
      });
      return "";
    } finally {
      setLoading(false);
    }
  }, [notifySuccess, notifyError]);

  const clear = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = "";
    }
    lastEvaluationIdRef.current = "";
    pdfIdRef.current = "";
    generatedAtRef.current = 0;
    setPdfUrl("");
    setPdfId("");
  }, []);

  // limpia al desmontar
  useEffect(() => () => clear(), [clear]);

  return { pdfUrl, pdfId, loading, fetchPdf, clear };
}
