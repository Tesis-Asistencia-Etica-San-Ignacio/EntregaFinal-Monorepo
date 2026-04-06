import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';

export class DeletePromptUseCase {
  constructor(private readonly promptRepository: IPromptRepository) {}

  public async execute(id: string): Promise<boolean> {
    return this.promptRepository.delete(id);
  }
}
