import type { IFileStorage } from '../../ports/file-storage.port';
import { CreateEvaluationUseCase } from '../evaluation/createEvaluation.useCase';

export class UploadEvaluationFileUseCase {
  constructor(
    private readonly createEvaluationUseCase: CreateEvaluationUseCase,
    private readonly fileStorage: IFileStorage
  ) {}

  public async execute(file: Express.Multer.File, evaluatorId: string) {
    await this.fileStorage.upload(file);

    const fileUrl = this.fileStorage.buildPublicUrl(file.originalname);

    return this.createEvaluationUseCase.execute({
      uid: evaluatorId,
      id_fundanet: 'Información de fundanet',
      file: fileUrl,
      estado: 'PENDIENTE',
      tipo_error: 'N/A',
      aprobado: false,
      correo_estudiante: 'estudiante@ejemplo.com',
      version: 1,
    });
  }
}
