import { SYSTEM_PROMPT } from "./system";
import type { Prompt } from "../../domain/entities/prompt.entity";

export const getAnalysisPrompt = (
  documentContent: string,
  prompts: Prompt[],
  provider: string
) => {
  const questionsText = prompts.map((question) => `[${question.codigo}] ${question.texto}`).join("\n");

  return {
    system: `
    ${SYSTEM_PROMPT}

    ${provider === 'gemini' ? '' : `
      IMPORTANTE PARA GROQ:

      - El texto fue extraido de un PDF, puede tener algunos problemas de formato
      - Debes reorganizar y limpiar el texto para que sea legible
      - SIEMPRE usa espacios entre palabras en tus respuestas
      - Manten la informacion original pero mejora la legibilidad`}
    `,
    user: `
      DOCUMENTO A ANALIZAR:

      ${provider === 'gemini' ? 'ANALIZA EL DOCUMENTO PDF ADJUNTO Y RESPONDE LAS SIGUIENTES PREGUNTAS:' : documentContent}

      PREGUNTAS A RESPONDER:
      ${questionsText}

      RECORDATORIO CRITICO:
      - Todas las justificaciones deben tener espacios entre palabras
      - NO copies texto pegado sin reformatearlo
      - Usa puntuacion apropiada en todas las respuestas
      - Cada campo "justification" debe ser una oracion clara y legible
      ${provider === 'gemini'
        ? ''
        : `IMPORTANTE: Tu respuesta debe ser EXACTAMENTE este formato JSON (sin texto adicional):
        ${JSON.stringify(
          {
            analysis: prompts.map((question) => ({
              description: "",
              codeNumber: question.codigo,
              status: "true or false",
              justification:
                "No puede ser un texto pegado o sin espacios a pesar de que el texto original lo sea",
              cita: "",
            })),
          },
          null,
          2
        )}
        El status debe ser un booleano.
        No debe tener comillas
        RESPONDE UNICAMENTE CON EL JSON COMPLETO.`}

      `,
  };
};

export function validateTextFormattingStrict(jsonResponse: any): boolean {
  if (!jsonResponse || typeof jsonResponse !== 'object') {
    return false;
  }

  if (!jsonResponse.analysis || !Array.isArray(jsonResponse.analysis)) {
    return false;
  }

  for (const item of jsonResponse.analysis) {
    if (!item || typeof item !== 'object') {
      return false;
    }

    if (item.status === true && item.justification && typeof item.justification === 'string') {
      const justification = item.justification;

      if (/\S{35,}/.test(justification)) {
        return false;
      }
    }
  }

  return true;
}
