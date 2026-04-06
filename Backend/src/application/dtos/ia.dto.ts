import { Static, Type } from '@sinclair/typebox';

export type IaOptionsDto = {
  model?: string;
  contents: string;
  systemInstruction: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseType?: {
    type: 'text' | 'json_object';
  };
  pdfBuffer?: Buffer;
};

export const EvaluateRequestSchema = Type.Object(
  {
    evaluationId: Type.String({ pattern: '^[0-9a-fA-F]{24}$' }),
  },
  { additionalProperties: false }
);
export type EvaluateRequestDto = Static<typeof EvaluateRequestSchema>;

export const ModifyProviderApiKeySchema = Type.Object(
  {
    provider: Type.Union([Type.Literal('gemini'), Type.Literal('groq')]),
    apiKey: Type.String({ minLength: 1, maxLength: 500 }),
  },
  { additionalProperties: false }
);
export type ModifyProviderApiKeyDto = Static<typeof ModifyProviderApiKeySchema>;
