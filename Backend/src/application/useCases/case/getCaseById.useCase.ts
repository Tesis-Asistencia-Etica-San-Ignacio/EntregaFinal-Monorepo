import type { Case, ICaseRepository } from "../../../domain";

export class GetCaseByIdUseCase {
  constructor(private readonly caseRepository: ICaseRepository) {}

  public async execute(id: string): Promise<Case | null> {
    return this.caseRepository.findById(id);
  }
}
