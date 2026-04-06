import { CreateCaseRequestDto } from '../../dtos/case.dto';
import type { IFileStorage } from '../../ports/file-storage.port';
import { PreviewPdfUseCase } from '../pdf/previewPdf.useCase';
import { CreateCaseUseCase } from './createCase.useCase';

export class CreateCaseFromPreviewUseCase {
  constructor(
    private readonly previewPdfUseCase: PreviewPdfUseCase,
    private readonly createCaseUseCase: CreateCaseUseCase,
    private readonly fileStorage: IFileStorage
  ) {}

  public async execute(userId: string, pdfId: string, body: CreateCaseRequestDto) {
    const buffer = this.previewPdfUseCase.getBuffer(pdfId);
    if (!buffer) {
      throw new Error('PREVIEW_PDF_NOT_FOUND');
    }

    const filename = `case_${body.codigo}_${Date.now()}.pdf`;
    const fileForMinio = {
      fieldname: 'pdf',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer,
      size: buffer.length,
    } as Express.Multer.File;

    await this.fileStorage.upload(fileForMinio);
    const fileUrl = this.fileStorage.buildPublicUrl(filename);

    const newCase = await this.createCaseUseCase.execute({
      uid: userId,
      nombre_proyecto: body.nombre_proyecto,
      fecha: body.fecha,
      version: body.version,
      codigo: body.codigo,
      pdf: fileUrl,
    });

    this.previewPdfUseCase.clear(pdfId);
    return newCase;
  }
}
