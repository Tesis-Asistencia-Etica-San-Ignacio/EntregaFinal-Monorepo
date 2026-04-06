import { GeneratePdfUseCase } from '../../application/useCases/pdf/generatePdf.useCase';
import { PreviewPdfUseCase } from '../../application/useCases/pdf/previewPdf.useCase';
import { EjsPdfGeneratorService } from '../../infrastructure/services/ejs-pdf-generator.service';
import { InMemoryPdfPreviewCacheService } from '../../infrastructure/services/in-memory-pdf-preview-cache.service';

const pdfGenerator = new EjsPdfGeneratorService();
const pdfPreviewCache = new InMemoryPdfPreviewCacheService();

export const sharedPreviewPdfUseCase = new PreviewPdfUseCase(
  new GeneratePdfUseCase(pdfGenerator),
  pdfPreviewCache
);
