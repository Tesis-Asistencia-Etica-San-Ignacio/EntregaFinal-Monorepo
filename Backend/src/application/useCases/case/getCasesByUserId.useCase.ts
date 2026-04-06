import type { Case } from '../../../domain/entities/case.entity';
import type { ICaseRepository } from '../../../domain/repositories/case.repository';

export class GetCasesByUserIdUseCase {
  constructor(private readonly caseRepository: ICaseRepository) { }

  public async execute(userId: string): Promise<Case[]> {
    return this.caseRepository.findByUserId(userId);
  }
}
