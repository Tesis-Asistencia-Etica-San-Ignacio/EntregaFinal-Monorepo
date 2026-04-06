export interface IPdfGenerator {
  generatePdf<T>(templateName: string, data: T): Promise<Buffer>;
}
