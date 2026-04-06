import { IaOptionsDto } from "../../dtos";
import { createGroqChatCompletion } from "../../../infrastructure/services/ia/groq.service";
import { sendGeminiCompletion } from "../../../infrastructure/services/ia/gemini.service";

export class GenerateCompletionUseCase {
  async execute(IaMessage: IaOptionsDto, ia: string) {
    switch (ia) {
      case "groq":
        return createGroqChatCompletion(IaMessage);
      case "gemini":
        return sendGeminiCompletion(IaMessage);
    }
  }
}
