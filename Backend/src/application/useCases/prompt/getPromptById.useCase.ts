import type { Prompt } from '../../../domain/entities/prompt.entity';
import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';

export class GetPromptByIdUseCase {
  constructor(private readonly promptRepository: IPromptRepository) {}

  public async execute(id: string): Promise<Prompt | null> {
    return this.promptRepository.findById(id);
  }
}
