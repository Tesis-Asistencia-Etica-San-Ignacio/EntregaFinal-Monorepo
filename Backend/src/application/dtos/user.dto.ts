import { Static, Type } from '@sinclair/typebox';
import { EmailSchema } from './shared/email.schema';

export const UserTypeEnum = Type.Union([
  Type.Literal('EVALUADOR'),
  Type.Literal('INVESTIGADOR'),
]);

const PasswordSchema = Type.String({
  minLength: 8,
  maxLength: 128,
});

const UserNameSchema = Type.String({
  minLength: 1,
  maxLength: 100,
});

const ProviderSchema = Type.String({
  minLength: 1,
  maxLength: 50,
});

const ModelSchema = Type.String({
  minLength: 1,
  maxLength: 100,
});

export const CreateUserSchema = Type.Object(
  {
    name: UserNameSchema,
    last_name: UserNameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    type: Type.Optional(UserTypeEnum),
    modelo: Type.Optional(ModelSchema),
    provider: Type.Optional(ProviderSchema),
  },
  { additionalProperties: false }
);
export type CreateUserDto = Static<typeof CreateUserSchema>;

export const UpdateUserSchema = Type.Object(
  {
    name: Type.Optional(UserNameSchema),
    last_name: Type.Optional(UserNameSchema),
    email: Type.Optional(EmailSchema),
    modelo: Type.Optional(ModelSchema),
  },
  { additionalProperties: false, minProperties: 1 }
);
export type UpdateUserDto = Static<typeof UpdateUserSchema>;

export const UpdateUserIaSettingsSchema = Type.Object(
  {
    modelo: Type.Optional(Type.String({ maxLength: 100 })),
    provider: Type.Optional(ProviderSchema),
  },
  { additionalProperties: false, minProperties: 1 }
);
export type UpdateUserIaSettingsDto = Static<typeof UpdateUserIaSettingsSchema>;

export const UpdatePasswordSchema = Type.Object(
  {
    password: PasswordSchema,
    newPassword: PasswordSchema,
  },
  { additionalProperties: false }
);
export type UpdatePasswordDto = Static<typeof UpdatePasswordSchema>;

export const UserResponseSchema = Type.Object({
  id: Type.String(),
  name: UserNameSchema,
  last_name: UserNameSchema,
  email: EmailSchema,
  modelo: Type.Optional(ModelSchema),
  provider: Type.Optional(ProviderSchema),
  type: UserTypeEnum,
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type UserResponseDto = Static<typeof UserResponseSchema>;

export const UsersListSchema = Type.Object({
  users: Type.Array(UserResponseSchema),
});
export type UsersListDto = Static<typeof UsersListSchema>;
