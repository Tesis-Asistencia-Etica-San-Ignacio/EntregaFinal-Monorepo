import { Static, Type } from '@sinclair/typebox';

const ObjectIdSchema = Type.String({ pattern: '^[0-9a-fA-F]{24}$' });

export const CreateCaseRequestSchema = Type.Object(
  {
    nombre_proyecto: Type.String({ minLength: 1, maxLength: 255 }),
    fecha: Type.String({ minLength: 1, maxLength: 100 }),
    version: Type.String({ minLength: 1, maxLength: 50 }),
    codigo: Type.String({ minLength: 1, maxLength: 100 }),
  },
  { additionalProperties: false }
);
export type CreateCaseRequestDto = Static<typeof CreateCaseRequestSchema>;

export const CreateCaseRequestPayloadSchema = Type.Object(
  {
    nombre_proyecto: Type.String({ minLength: 1, maxLength: 255 }),
    fecha: Type.String({ minLength: 1, maxLength: 100 }),
    version: Type.Union([
      Type.String({ minLength: 1, maxLength: 50 }),
      Type.Number(),
    ]),
    codigo: Type.String({ minLength: 1, maxLength: 100 }),
  },
  { additionalProperties: true }
);
export type CreateCaseRequestPayloadDto = Static<typeof CreateCaseRequestPayloadSchema>;

export const CreateCaseSchema = Type.Object(
  {
    uid: ObjectIdSchema,
    nombre_proyecto: Type.String({ minLength: 1, maxLength: 255 }),
    fecha: Type.String({ minLength: 1, maxLength: 100 }),
    version: Type.String({ minLength: 1, maxLength: 50 }),
    codigo: Type.String({ minLength: 1, maxLength: 100 }),
    pdf: Type.String({ minLength: 1, maxLength: 5000 }),
  },
  { additionalProperties: false }
);
export type CreateCaseDto = Static<typeof CreateCaseSchema>;

export const UpdateCaseSchema = Type.Object(
  {
    nombre_proyecto: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    fecha: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    version: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
    codigo: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  },
  { additionalProperties: false, minProperties: 1 }
);
export type UpdateCaseDto = Static<typeof UpdateCaseSchema>;

export const CaseResponseSchema = Type.Object({
  id: Type.String(),
  uid: Type.String(),
  nombre_proyecto: Type.String(),
  fecha: Type.String({ format: 'date-time' }),
  version: Type.String(),
  codigo: Type.String(),
  pdf: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});
export type CaseResponseDto = Static<typeof CaseResponseSchema>;

export const CasesListSchema = Type.Object({
  cases: Type.Array(CaseResponseSchema),
});
export type CasesListDto = Static<typeof CasesListSchema>;
