import type { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}

