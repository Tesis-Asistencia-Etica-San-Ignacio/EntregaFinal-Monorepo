import ejs from 'ejs';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import type { IPdfGenerator } from '../../application/ports/pdf-generator.port';

export class EjsPdfGeneratorService implements IPdfGenerator {
  public async generatePdf<T>(templateName: string, data: T): Promise<Buffer> {
    const templatePath = path.resolve(
      process.cwd(),
      'src',
      'templates',
      'pdf',
      `${templateName}.ejs`
    );

    const logoHusiPath = path.resolve(
      __dirname,
      '..',
      '..',
      'assets',
      'logo-HUSI-ajustado-nuevo.png'
    );
    const logoPujPath = path.resolve(
      __dirname,
      '..',
      '..',
      'assets',
      'pontificia_universidad_javeriana_logo-320x130.jpg'
    );

    const logoHusiBase64 = fs.readFileSync(logoHusiPath).toString('base64');
    const logoPujBase64 = fs.readFileSync(logoPujPath).toString('base64');

    const htmlContent = await ejs.renderFile(templatePath, {
      ...data,
      logoHusiUri: `data:image/png;base64,${logoHusiBase64}`,
      logoPujUri: `data:image/jpeg;base64,${logoPujBase64}`,
    });

    const chromePath = process.env.CHROME_PATH ?? '/usr/bin/chromium';

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });

    const pdfBuffer = await Promise.race([
      page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '16mm',
          bottom: '16mm',
          left: '0',
          right: '0',
        },
      }),
      new Promise<Buffer>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 60000)
      ),
    ]);

    await browser.close();
    return Buffer.from(pdfBuffer as Uint8Array);
  }
}
