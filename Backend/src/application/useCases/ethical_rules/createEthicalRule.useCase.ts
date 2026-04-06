import { EthicalNorm, IEthicalNormRepository } from "../../../domain";
import type { CreateEthicalNorm } from "../../../domain/entities/ethicalRule.entity";
import { CreateEthicalNormDto } from "../../dtos";

export class CreateEthicalRuleUseCase {
  constructor(private readonly repository: IEthicalNormRepository) { }

  public async execute(data: CreateEthicalNormDto): Promise<EthicalNorm> {
    const command: CreateEthicalNorm = { ...data };
    return this.repository.create(command);
  }
}
