import { randomUUID } from 'crypto';
import type { IPdfPreviewCache } from '../../application/ports/pdf-preview-cache.port';

export class InMemoryPdfPreviewCacheService implements IPdfPreviewCache {
  private readonly cache = new Map<string, Buffer>();

  public save(buffer: Buffer, ttlMs: number): string {
    const pdfId = randomUUID();
    this.cache.set(pdfId, buffer);

    setTimeout(() => this.cache.delete(pdfId), ttlMs);

    return pdfId;
  }

  public get(pdfId: string): Buffer | undefined {
    return this.cache.get(pdfId);
  }

  public delete(pdfId: string): void {
    this.cache.delete(pdfId);
  }
}
