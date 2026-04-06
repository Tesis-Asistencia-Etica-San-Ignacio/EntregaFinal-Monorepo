import { IEthicalNormRepository } from "../../../domain";
import type { EthicalNorm, UpdateEthicalNorm } from "../../../domain/entities/ethicalRule.entity";
import { UpdateEthicalNormDto } from "../../dtos";

export class UpdateEthicalRuleUseCase {
  constructor(private readonly repository: IEthicalNormRepository) {}

  public async execute(
    id: string,
    data: UpdateEthicalNormDto
  ): Promise<EthicalNorm | null> {
    const command: UpdateEthicalNorm = { ...data };
    return this.repository.update(id, command);
  }
}
