import { useState, useCallback, useRef, useEffect } from "react";
import { previewInvestigatorPdf } from "@/services/pdfService";
import { useNotify } from "@/hooks/useNotify";

interface UseGeneratePdfResult {
  fetchPdfInvestigator: (data: Record<string, any>) => Promise<{ url: string; pdfId: string }>;
  pdfUrl: string;
  pdfId: string;
  loading: boolean;
  clearPdf: () => void;
}

const PREVIEW_REUSE_WINDOW_MS = 4 * 60 * 1000;

const normalizePayload = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizePayload);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, nestedValue]) => nestedValue !== undefined)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .reduce<Record<string, unknown>>((acc, [key, nestedValue]) => {
        acc[key] = normalizePayload(nestedValue);
        return acc;
      }, {});
  }

  return value;
};

const buildPayloadKey = (data: Record<string, any>): string => {
  return JSON.stringify(normalizePayload(data));
};

const useGeneratePdfByInvestigator = (): UseGeneratePdfResult => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfId, setPdfId] = useState("");
  const [loading, setLoading] = useState(false);
  const prevUrlRef = useRef<string>("");
  const lastPayloadKeyRef = useRef<string>("");
  const pdfIdRef = useRef<string>("");
  const generatedAtRef = useRef<number>(0);

  const { notifySuccess, notifyError } = useNotify();

  const fetchPdfInvestigator = useCallback(
    async (data: Record<string, any>): Promise<{ url: string; pdfId: string }> => {
      if (!data) return { url: "", pdfId: "" };
      const nextPayloadKey = buildPayloadKey(data);
      const now = Date.now();

      if (
        nextPayloadKey === lastPayloadKeyRef.current &&
        prevUrlRef.current &&
        pdfIdRef.current &&
        now - generatedAtRef.current < PREVIEW_REUSE_WINDOW_MS
      ) {
        setPdfUrl(prevUrlRef.current);
        setPdfId(pdfIdRef.current);
        return { url: prevUrlRef.current, pdfId: pdfIdRef.current };
      }

      setLoading(true);
      try {
        const { blob, pdfId: nextPdfId } = await previewInvestigatorPdf(data);

        // Revocar URL anterior
        if (prevUrlRef.current) {
          URL.revokeObjectURL(prevUrlRef.current);
        }

        // Crear nueva URL y guardar el pdfId en estado
        const objectUrl = URL.createObjectURL(blob);
        prevUrlRef.current = objectUrl;
        lastPayloadKeyRef.current = nextPayloadKey;
        pdfIdRef.current = nextPdfId;
        generatedAtRef.current = now;
        setPdfUrl(objectUrl);
        setPdfId(nextPdfId);

        notifySuccess({
          title: "PDF generado",
          description: "Vista previa disponible.",
          icon: "✅",
          closeButton: true,
        });

        return { url: objectUrl, pdfId: nextPdfId };
      } catch (err: any) {
        console.error("Error al generar PDF:", err);
        notifyError({
          title: "Error PDF",
          description: err?.message ?? "No se pudo generar vista previa.",
          closeButton: true,
        });
        return { url: "", pdfId: "" };
      } finally {
        setLoading(false);
      }
    },
    [notifySuccess, notifyError]
  );

  const clearPdf = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = "";
    }
    lastPayloadKeyRef.current = "";
    pdfIdRef.current = "";
    generatedAtRef.current = 0;
    setPdfUrl("");
    setPdfId("");
  }, []);

  useEffect(() => {
    return () => clearPdf();
  }, [clearPdf]);

  return {
    fetchPdfInvestigator,
    pdfUrl,
    pdfId,
    loading,
    clearPdf,
  };
};

export default useGeneratePdfByInvestigator;
