import { getGroqClient } from "../../config/groqClient";
import { IaOptionsDto } from "../../../application/dtos";
import { validateTextFormattingStrict } from "../../../application/prompts/analisis.prompt";

function isIncompleteJsonError(error: unknown): boolean {
  return error instanceof SyntaxError && error.message.includes("Unexpected end of JSON input");
}

export async function createGroqChatCompletion(ia: IaOptionsDto) {
  const maxAttempts = 5;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const groq = getGroqClient();
      const outputTokens = Math.min(ia.maxOutputTokens ?? 8192, 12288);

      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: ia.systemInstruction },
          { role: "user", content: ia.contents },
        ],
        model: ia.model || "deepseek-r1-distill-llama-70b",
        temperature: ia.temperature ?? 0.1,
        max_tokens: outputTokens,
        response_format: ia.responseType || { type: "text" },
      });

      const responseText = response.choices[0].message?.content;
      if (!responseText) {
        throw new Error("Respuesta vacia de Groq");
      }
      try {
        const jsonResponse = JSON.parse(responseText);

        if (validateTextFormattingStrict(jsonResponse)) {
          return responseText;
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
      console.log(`Intento ${attempts}: error en la llamada a Groq: ${error}`);

      if (attempts >= maxAttempts) {
        throw new Error(`Error despues de ${maxAttempts} intentos: ${error}`);
      }
    }
  }

  throw new Error("No se pudo obtener respuesta con formato correcto");
}
