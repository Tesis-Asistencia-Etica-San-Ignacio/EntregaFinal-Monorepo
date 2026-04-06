import { Static, Type } from '@sinclair/typebox';

export const EthicalNormStatusEnum = Type.Union([
  Type.Literal('APROBADO'),
  Type.Literal('NO_APROBADO'),
  Type.Literal('NO_APLICA'),
]);

export const CreateEthicalNormSchema = Type.Object(
  {
    evaluationId: Type.String({ pattern: '^[0-9a-fA-F]{24}$' }),
    description: Type.String({ minLength: 1, maxLength: 5000 }),
    status: EthicalNormStatusEnum,
    justification: Type.String({ minLength: 1, maxLength: 10000 }),
    cita: Type.String({ minLength: 1, maxLength: 10000 }),
    codeNumber: Type.String({ minLength: 1, maxLength: 100 }),
  },
  { additionalProperties: false }
);
export type CreateEthicalNormDto = Static<typeof CreateEthicalNormSchema>;

export const UpdateEthicalNormSchema = Type.Object(
  {
    evaluationId: Type.Optional(Type.String({ pattern: '^[0-9a-fA-F]{24}$' })),
    description: Type.Optional(Type.String({ minLength: 1, maxLength: 5000 })),
    status: Type.Optional(EthicalNormStatusEnum),
    justification: Type.Optional(Type.String({ minLength: 1, maxLength: 10000 })),
    cita: Type.Optional(Type.String({ minLength: 1, maxLength: 10000 })),
    codeNumber: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  },
  { additionalProperties: false, minProperties: 1 }
);
export type UpdateEthicalNormDto = Static<typeof UpdateEthicalNormSchema>;

export const EthicalNormResponseSchema = Type.Object({
  id: Type.String(),
  evaluationId: Type.String(),
  description: Type.String(),
  status: EthicalNormStatusEnum,
  justification: Type.String(),
  cita: Type.String(),
  codeNumber: Type.String(),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
});
export type EthicalNormResponseDto = Static<typeof EthicalNormResponseSchema>;
