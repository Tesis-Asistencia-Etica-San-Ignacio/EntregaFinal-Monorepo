import { Static, Type } from '@sinclair/typebox';
import { EmailSchema } from './shared/email.schema';

export const ESTADO_EVALUACION = Type.Union([
  Type.Literal('PENDIENTE'),
  Type.Literal('EN CURSO'),
  Type.Literal('EVALUADO'),
]);

export const CreateEvaluationSchema = Type.Object(
  {
    uid: Type.String({ pattern: '^[0-9a-fA-F]{24}$' }),
    id_fundanet: Type.String({ minLength: 1, maxLength: 255 }),
    file: Type.String({ minLength: 1, maxLength: 5000 }),
    estado: ESTADO_EVALUACION,
    tipo_error: Type.String({ minLength: 1, maxLength: 255 }),
    aprobado: Type.Boolean(),
    correo_estudiante: EmailSchema,
    version: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);
export type CreateEvaluationDto = Static<typeof CreateEvaluationSchema>;

export const UpdateEvaluationSchema = Type.Object(
  {
    id_fundanet: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    estado: Type.Optional(ESTADO_EVALUACION),
    tipo_error: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    aprobado: Type.Optional(Type.Boolean()),
    correo_estudiante: Type.Optional(EmailSchema),
    version: Type.Optional(Type.Number()),
  },
  { additionalProperties: false, minProperties: 1 }
);
export type UpdateEvaluationDto = Static<typeof UpdateEvaluationSchema>;

export const EvaluationResponseSchema = Type.Object({
  id: Type.String(),
  uid: Type.String(),
  id_fundanet: Type.String(),
  file: Type.String(),
  estado: ESTADO_EVALUACION,
  tipo_error: Type.String(),
  aprobado: Type.Boolean(),
  correo_estudiante: Type.String(),
  version: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});
export type EvaluationResponseDto = Static<typeof EvaluationResponseSchema>;

export const EvaluationsListSchema = Type.Object({
  evaluations: Type.Array(EvaluationResponseSchema),
});
export type EvaluationsListDto = Static<typeof EvaluationsListSchema>;
