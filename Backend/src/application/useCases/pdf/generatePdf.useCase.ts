import type { IPdfGenerator } from '../../ports/pdf-generator.port';

export class GeneratePdfUseCase {
  constructor(private readonly pdfGenerator: IPdfGenerator) {}

  /**
   * @param templateName nombre de la plantilla EJS en src/templates/pdf
   * @param data objeto con propiedades (e.g. date, norms, etc)
   */
  public async execute<T>(
    templateName: string,
    data: T
  ): Promise<Buffer> {
    return this.pdfGenerator.generatePdf(templateName, data);
  }
}
