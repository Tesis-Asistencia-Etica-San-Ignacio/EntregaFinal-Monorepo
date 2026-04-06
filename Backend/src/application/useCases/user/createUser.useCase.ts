import bcrypt from 'bcryptjs';
import { CreateUserDto } from '../../dtos/user.dto';
import { seedPromptsForEvaluator } from '../../services/promptSeeding.service';
import config from '../../../infrastructure/config';
import type { CreateUser, User } from '../../../domain/entities/user.entity';
import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';

export class CreateEvaluatorUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly promptRepository: IPromptRepository
  ) {}

  public async execute(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, config.jwt.saltRounds);

    const userWithHashedPassword: CreateUser = {
      ...data,
      type: 'EVALUADOR',
      password: hashedPassword,
    };

    const user = await this.userRepository.create(userWithHashedPassword);
    await seedPromptsForEvaluator(user.id, this.promptRepository);

    return user;
  }
}

export class CreateInvestigatorUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, config.jwt.saltRounds);

    const userWithHashedPassword: CreateUser = {
      ...data,
      type: 'INVESTIGADOR',
      password: hashedPassword,
    };

    return this.userRepository.create(userWithHashedPassword);
  }
}
