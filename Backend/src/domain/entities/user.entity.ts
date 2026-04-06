export type UserType = 'EVALUADOR' | 'INVESTIGADOR';

export interface BaseUser {
  id: string;
  name: string;
  last_name: string;
  email: string;
  password?: string;
  type: UserType;
  modelo?: string;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type User = BaseUser;
export type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUser = Partial<Pick<User, 'name' | 'last_name' | 'email' | 'modelo' | 'provider'>>;
