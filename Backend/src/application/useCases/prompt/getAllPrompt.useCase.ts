import type { Prompt } from '../../../domain/entities/prompt.entity';
import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';

export class GetAllPromptsUseCase {
  constructor(private readonly promptRepository: IPromptRepository) {}

  public async execute(): Promise<Prompt[]> {
    return this.promptRepository.findAll();
  }
}
