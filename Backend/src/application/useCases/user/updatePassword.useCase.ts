import bcrypt from 'bcryptjs';
import config from '../../../infrastructure/config';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { AppError } from '../../../shared/errors/appError';
import { UpdatePasswordDto } from '../../dtos/user.dto';

interface UpdatePasswordCommand extends UpdatePasswordDto {
  userId: string;
}

export class UpdatePasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(data: UpdatePasswordCommand): Promise<void> {
    const { userId, password, newPassword } = data;

    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    if (!user.password) {
      throw new AppError('La contraseña actual es incorrecta', 400);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('La contraseña actual es incorrecta', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, config.jwt.saltRounds);
    await this.userRepository.updatePassword(userId, hashedNewPassword);
  }
}
