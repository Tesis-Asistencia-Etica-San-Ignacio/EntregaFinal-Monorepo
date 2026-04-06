import { Static, Type } from '@sinclair/typebox';
import { EmailSchema } from './shared/email.schema';

export const LoginSchema = Type.Object(
  {
    email: EmailSchema,
    password: Type.String({
      minLength: 8,
      maxLength: 128,
    }),
  },
  { additionalProperties: false }
);
export type LoginDto = Static<typeof LoginSchema>;

export const RefreshTokenSchema = Type.Object(
  {
    refreshToken: Type.String(),
  },
  { additionalProperties: false }
);
export type RefreshTokenDto = Static<typeof RefreshTokenSchema>;

export const JwtAccessTokenSchema = Type.Object({
  accessToken: Type.String(),
});
export type JwtAccessTokenDto = Static<typeof JwtAccessTokenSchema>;

export const JwtRefreshTokenSchema = Type.Object({
  refreshToken: Type.String(),
});
export type JwtRefreshTokenDto = Static<typeof JwtRefreshTokenSchema>;

export const JwtTokensSchema = Type.Object(
  {
    accessToken: Type.String(),
    refreshToken: Type.String(),
    userType: Type.String(),
    id: Type.String(),
  },
  { additionalProperties: false }
);
export type JwtTokensDto = Static<typeof JwtTokensSchema>;
