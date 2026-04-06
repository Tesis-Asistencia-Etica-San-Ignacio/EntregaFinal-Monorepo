import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { User } from '../../../domain/entities/user.entity';

export class GetUserByEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
