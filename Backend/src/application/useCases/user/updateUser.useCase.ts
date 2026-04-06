import { UpdateUserDto, UpdateUserIaSettingsDto } from '../../dtos/user.dto';
import type { UpdateUser, User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(
    id: string,
    data: UpdateUserDto | UpdateUserIaSettingsDto
  ): Promise<User | null> {
    const command: UpdateUser = { ...data };
    return this.userRepository.update(id, command);
  }
}
