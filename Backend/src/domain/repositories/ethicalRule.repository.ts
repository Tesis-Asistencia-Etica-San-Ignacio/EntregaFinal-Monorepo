import type { CreateEthicalNorm, EthicalNorm, UpdateEthicalNorm } from '../entities';

export interface IEthicalNormRepository {
  findAll(): Promise<EthicalNorm[]>;
  findById(id: string): Promise<EthicalNorm | null>;
  create(data: CreateEthicalNorm): Promise<EthicalNorm>;
  update(id: string, data: UpdateEthicalNorm): Promise<EthicalNorm | null>;
  delete(id: string): Promise<boolean>;
  findByEvaluationId(evaluationId: string): Promise<EthicalNorm[]>;
  deleteByEvaluationId(evaluationId: string): Promise<boolean>;
}
