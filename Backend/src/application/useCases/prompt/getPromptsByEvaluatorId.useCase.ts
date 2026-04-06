import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';
import type { Prompt } from '../../../domain/entities/prompt.entity';
import { seedPromptsForEvaluator } from '../../services/promptSeeding.service';

export class GetPromptsByEvaluatorIdUseCase {
  constructor(private readonly promptRepository: IPromptRepository) { }

  public async execute(evaluatorId: string): Promise<Prompt[]> {
    let prompts = await this.promptRepository.findByEvaluatorId(evaluatorId);

    if (prompts.length === 0) {
      await seedPromptsForEvaluator(evaluatorId, this.promptRepository);
      prompts = await this.promptRepository.findByEvaluatorId(evaluatorId);
    }

    return prompts;
  }
}
