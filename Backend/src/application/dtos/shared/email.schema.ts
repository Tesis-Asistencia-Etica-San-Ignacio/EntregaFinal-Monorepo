import { Type } from '@sinclair/typebox';

export const EmailSchema = Type.String({
  minLength: 5,
  maxLength: 255,
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
});

export const EmailOrEmailListSchema = Type.Union([
  EmailSchema,
  Type.Array(EmailSchema, { minItems: 1 }),
]);
