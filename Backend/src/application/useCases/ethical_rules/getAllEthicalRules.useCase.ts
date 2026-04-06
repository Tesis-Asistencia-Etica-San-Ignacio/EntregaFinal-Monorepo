import { EthicalNorm, IEthicalNormRepository } from "../../../domain";

export class GetAllEthicalRulesUseCase {
  constructor(private readonly repository: IEthicalNormRepository) { }

  public async execute(): Promise<EthicalNorm[]> {
    return this.repository.findAll();
  }
}
