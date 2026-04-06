import type { CreateUser, UpdateUser, User } from '../entities/user.entity';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByIdWithPassword(id: string): Promise<User | null>;
  create(data: CreateUser): Promise<User>;
  update(id: string, data: UpdateUser): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  findByEmail(email: string): Promise<User | null>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
}
