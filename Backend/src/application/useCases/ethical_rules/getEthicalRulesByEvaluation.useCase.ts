import { EthicalNorm, IEthicalNormRepository } from "../../../domain";

export class GetEthicalRulesByEvaluationUseCase {
  constructor(private readonly repository: IEthicalNormRepository) { }

  public async execute(evaluationId: string): Promise<EthicalNorm[]> {
    const all = await this.repository.findByEvaluationId(evaluationId);
    return all.sort((a, b) => a.codeNumber.localeCompare(b.codeNumber));
  }
}
