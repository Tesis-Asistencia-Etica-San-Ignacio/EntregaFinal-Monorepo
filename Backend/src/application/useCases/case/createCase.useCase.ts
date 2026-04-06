import { CreateCaseDto } from '../../dtos/case.dto';
import type { Case, CreateCase } from '../../../domain/entities/case.entity';
import type { ICaseRepository } from '../../../domain/repositories/case.repository';

export class CreateCaseUseCase {
  constructor(private readonly caseRepository: ICaseRepository) {}

  public async execute(data: CreateCaseDto): Promise<Case> {
    const command: CreateCase = {
      ...data,
      fecha: new Date(data.fecha),
    };

    return this.caseRepository.create(command);
  }
}
