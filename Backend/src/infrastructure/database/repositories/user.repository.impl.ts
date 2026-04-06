import type { CreateUser, UpdateUser, User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { User as UserModel } from '../models/user.model';
import { isValidObjectId } from '../../../shared/utils';

const toUserEntity = (user: {
  _id: { toString(): string };
  name: string;
  last_name: string;
  email: string;
  type: string;
  password?: string;
  modelo?: string;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}): User => ({
  id: user._id.toString(),
  name: user.name,
  last_name: user.last_name,
  email: user.email,
  password: user.password,
  type: user.type as User['type'],
  modelo: user.modelo,
  provider: user.provider,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class UserRepository implements IUserRepository {
  public async findAll(): Promise<User[]> {
    const users = await UserModel.find({});
    return users.map(toUserEntity);
  }

  public async findById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const user = await UserModel.findById(id);
    return user ? toUserEntity(user) : null;
  }

  public async findByIdWithPassword(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const user = await UserModel.findById(id).select('+password');
    if (!user) {
      return null;
    }

    return toUserEntity(user);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return null;
    }

    return toUserEntity(user);
  }

  public async create(data: CreateUser): Promise<User> {
    const user = await UserModel.create(data);
    return toUserEntity(user);
  }

  public async update(id: string, data: UpdateUser): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const user = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return user ? toUserEntity(user) : null;
  }

  public async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }

  public async updatePassword(id: string, hashedPassword: string): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }

    await UserModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true, runValidators: true }
    );
  }
}
