import type { Case, ICaseRepository } from "../../../domain";


export class GetAllCasesUseCase {
  constructor(private readonly caseRepository: ICaseRepository) {}
  public async execute(): Promise<Case[]> {
    return this.caseRepository.findAll();
  }
}
