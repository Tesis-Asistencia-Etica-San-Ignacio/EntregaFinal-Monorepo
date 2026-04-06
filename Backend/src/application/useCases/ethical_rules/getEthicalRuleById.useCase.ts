import type { IEthicalNormRepository } from '../../../domain/repositories/ethicalRule.repository';
import type { EthicalNorm } from '../../../domain/entities/ethicalRule.entity';

export class GetEthicalRuleByIdUseCase {
  constructor(private readonly repository: IEthicalNormRepository) {}

  public async execute(id: string): Promise<EthicalNorm | null> {
    return this.repository.findById(id);
  }
}
