import { Static, Type } from '@sinclair/typebox';

export const CreatePromptSchema = Type.Object(
  {
    uid: Type.String({ pattern: '^[0-9a-fA-F]{24}$' }),
    nombre: Type.String({ minLength: 1, maxLength: 255 }),
    texto: Type.String({ minLength: 1, maxLength: 20000 }),
    descripcion: Type.String({ minLength: 1, maxLength: 5000 }),
    codigo: Type.String({ minLength: 1, maxLength: 100 }),
  },
  { additionalProperties: false }
);
export type CreatePromptDto = Static<typeof CreatePromptSchema>;

export const UpdatePromptSchema = Type.Object(
  {
    nombre: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    texto: Type.Optional(Type.String({ minLength: 1, maxLength: 20000 })),
    descripcion: Type.Optional(Type.String({ minLength: 1, maxLength: 5000 })),
    codigo: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  },
  { additionalProperties: false, minProperties: 1 }
);
export type UpdatePromptDto = Static<typeof UpdatePromptSchema>;

export const PromptResponseSchema = Type.Object({
  id: Type.String(),
  uid: Type.String(),
  nombre: Type.String(),
  texto: Type.String(),
  codigo: Type.String(),
  descripcion: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});
export type PromptResponseDto = Static<typeof PromptResponseSchema>;
