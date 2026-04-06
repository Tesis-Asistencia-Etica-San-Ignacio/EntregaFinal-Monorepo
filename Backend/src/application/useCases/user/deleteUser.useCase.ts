import type { IUserRepository } from '../../../domain/repositories/user.repository';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
