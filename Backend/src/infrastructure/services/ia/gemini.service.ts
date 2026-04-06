import { Type } from "@google/genai";
import { getGeminiClient } from "../../config/geminiClient";
import { IaOptionsDto } from "../../../application/dtos";
import { validateTextFormattingStrict } from "../../../application/prompts/analisis.prompt";

function isIncompleteJsonError(error: unknown): boolean {
  return error instanceof SyntaxError && error.message.includes("Unexpected end of JSON input");
}

export async function sendGeminiCompletion(ia: IaOptionsDto) {
  const maxAttempts = 5;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const gemini = getGeminiClient();
      const outputTokens = Math.min(ia.maxOutputTokens ?? 8192, 12288);

      const response = await gemini.models.generateContent({
        model: ia.model || "gemini-2.0-flash",
        contents: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: ia.pdfBuffer?.toString("base64"),
            },
          },
          { text: ia.contents },
        ],
        config: {
          temperature: Math.max(0.05, 0.1 - attempts * 0.01),
          maxOutputTokens: outputTokens,
          systemInstruction: ia.systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          topP: Math.max(0.1, 0.2 - attempts * 0.02),
          topK: Math.max(5, 10 - attempts),
        },
      });
      try {
        const jsonResponse = JSON.parse(response.text ?? "");

        if (validateTextFormattingStrict(jsonResponse)) {
          return response.text;
        }

        attempts++;
        console.log(`Intento ${attempts}: formato incorrecto detectado, reintentando`);
      } catch (parseError) {
        attempts++;
        const truncationHint = isIncompleteJsonError(parseError)
          ? " Posible respuesta truncada por limite de tokens."
          : "";
        console.log(`Intento ${attempts}: error al parsear JSON: ${parseError}.${truncationHint}`);
      }
    } catch (error) {
      attempts++;
      console.log(`Intento ${attempts}: error en la llamada a Gemini: ${error}`);

      if (attempts >= maxAttempts) {
        throw new Error(`Error despues de ${maxAttempts} intentos: ${error}`);
      }
    }
  }

  throw new Error("No se pudo obtener respuesta con formato correcto");
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description: "Pregunta del usuario, bien formateada con espacios",
          },
          codeNumber: { type: Type.STRING },
          status: { type: Type.BOOLEAN },
          justification: {
            type: Type.STRING,
            description: "Justificacion clara y legible con espacios entre palabras y puntuacion apropiada",
          },
          cita: {
            type: Type.STRING,
            description: "Ubicacion especifica en el documento",
          },
        },
        required: ["description", "codeNumber", "status", "justification", "cita"],
      },
    },
  },
  required: ["analysis"],
};
