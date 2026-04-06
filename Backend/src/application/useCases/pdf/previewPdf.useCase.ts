import type { IPdfPreviewCache } from '../../ports/pdf-preview-cache.port';
import { GeneratePdfUseCase } from './generatePdf.useCase';

/**
 * Use case que genera un PDF a partir de una plantilla y lo mantiene
 * en un cache temporal para ser reutilizado (preview, e-mail, guardado, etc.).
 */
export class PreviewPdfUseCase {
  private static readonly PREVIEW_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly genPdf: GeneratePdfUseCase,
    private readonly previewCache: IPdfPreviewCache
  ) {}

  /** Genera el PDF, lo guarda en cache y devuelve buffer + clave */
  public async execute(
    template: string,
    payload: Record<string, any>
  ): Promise<{ buf: Buffer; pdfId: string }> {
    const buf = await this.genPdf.execute(template, payload);
    const pdfId = this.previewCache.save(buf, PreviewPdfUseCase.PREVIEW_TTL_MS);

    return { buf, pdfId };
  }

  /** Devuelve el Buffer cacheado o undefined si ya no existe */
  public getBuffer(pdfId: string): Buffer | undefined {
    return this.previewCache.get(pdfId);
  }

  /** Elimina manualmente una entrada del cache */
  public clear(pdfId: string): void {
    this.previewCache.delete(pdfId);
  }
}
