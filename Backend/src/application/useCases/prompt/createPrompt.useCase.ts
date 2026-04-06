import { CreatePromptDto } from '../../dtos/prompt.dto';
import type { CreatePrompt, Prompt } from '../../../domain/entities/prompt.entity';
import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';

export class CreatePromptUseCase {
  constructor(private readonly promptRepository: IPromptRepository) {}

  public async execute(data: CreatePromptDto): Promise<Prompt> {
    const command: CreatePrompt = { ...data };
    return this.promptRepository.create(command);
  }
}
