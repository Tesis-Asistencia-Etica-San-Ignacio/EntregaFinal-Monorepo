import type { Case, ICaseRepository } from "../../../domain";
import type { UpdateCase } from "../../../domain/entities/case.entity";
import { UpdateCaseDto } from "../..";

export class UpdateCaseUseCase {
  constructor(private readonly caseRepository: ICaseRepository) { }

  public async execute(
    id: string,
    data: UpdateCaseDto,
  ): Promise<Case | null> {
    const { fecha, ...rest } = data;
    const command: UpdateCase = {
      ...rest,
      ...(fecha ? { fecha: new Date(fecha) } : {}),
    };

    return this.caseRepository.update(id, command);
  }
}
