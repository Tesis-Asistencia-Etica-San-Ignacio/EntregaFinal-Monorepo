import { UpdatePromptDto } from '../../dtos/prompt.dto';
import type { Prompt, UpdatePrompt } from '../../../domain/entities/prompt.entity';
import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';

export class UpdatePromptUseCase {
  constructor(private readonly promptRepository: IPromptRepository) {}

  public async execute(id: string, data: UpdatePromptDto): Promise<Prompt | null> {
    const command: UpdatePrompt = { ...data };
    return this.promptRepository.update(id, command);
  }
}
