export interface IPdfPreviewCache {
  save(buffer: Buffer, ttlMs: number): string;
  get(pdfId: string): Buffer | undefined;
  delete(pdfId: string): void;
}
