export interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  type: string;
  modelo?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

export interface CreateUserInput {
  name: string;
  last_name: string;
  email: string;
  password: string;
  type?: string;
  modelo?: string;
  provider?: string;
}

export interface UpdateUserInput {
  name?: string;
  last_name?: string;
  email?: string;
  modelo?: string;
  provider?: string;
}

export interface UpdatePasswordInput {
  password: string;
  newPassword: string;
}
