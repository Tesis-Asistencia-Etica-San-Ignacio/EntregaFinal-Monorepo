import { Type } from '@sinclair/typebox';
import { Request, Response } from 'express';
import { PreviewPdfUseCase } from '../../application/useCases/pdf/previewPdf.useCase';
import { SendEmailUseCase } from '../../application/useCases/smtp/smtp.useCase';
import { GetUserByIdUseCase } from '../../application/useCases/user/getUserById.useCase';
import { EmailOrEmailListSchema } from '../../application/dtos/shared/email.schema';
import { generateEmailHtml } from '../../shared/utils/emailTemplate';
import { validateRequestBody } from '../../shared/utils';

const SendEmailSchema = Type.Object(
  {
    to: EmailOrEmailListSchema,
    infoMail: Type.Object(
      {
        subject: Type.String({ minLength: 1, maxLength: 255 }),
        mensajeAdicional: Type.Optional(Type.String({ maxLength: 5000 })),
        userType: Type.Optional(Type.String({ maxLength: 100 })),
      },
      { additionalProperties: false }
    ),
    evaluationId: Type.String({ pattern: '^[0-9a-fA-F]{24}$' }),
    modelo: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  },
  { additionalProperties: false }
);

export class SmtpController {
  constructor(
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly previewPdfUseCase: PreviewPdfUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase
  ) {}

  public async sendEmail(req: Request, res: Response): Promise<void> {
    const validation = validateRequestBody(SendEmailSchema, req.body);
    if (!validation.success) {
      res.status(400).json({ message: validation.message });
      return;
    }

    try {
      const { to, infoMail, modelo } = validation.data;
      const recipients = typeof to === 'string' ? [to.trim()] : to.map((item) => item.trim());

      let userFullName: string | undefined;
      if (req.user?.name && req.user?.last_name) {
        userFullName = `${req.user.name} ${req.user.last_name}`;
      }

      if (!userFullName && req.user?.id) {
        const user = await this.getUserByIdUseCase.execute(req.user.id);
        if (user?.name && user?.last_name) {
          userFullName = `${user.name} ${user.last_name}`;
        }
      }

      if (!userFullName) {
        res.status(400).json({ message: 'No se pudo determinar nombre de usuario.' });
        return;
      }

      const pdfId = req.header('X-Pdf-Id');
      if (!pdfId) {
        res.status(400).json({ message: 'Falta el identificador del PDF (X-Pdf-Id)' });
        return;
      }

      const buf = this.previewPdfUseCase.getBuffer(pdfId);
      if (!buf) {
        res.status(410).json({ message: 'El PDF ha expirado o no se encontro' });
        return;
      }

      const htmlContent = await generateEmailHtml({
        userName: userFullName,
        modelo: modelo ?? 'No configurado',
        infoMail,
      });

      await this.sendEmailUseCase.execute({
        to: recipients,
        subject: infoMail.subject.trim(),
        html: htmlContent,
        attachments: [
          {
            filename: 'reporte-normas.pdf',
            content: buf,
            contentType: 'application/pdf',
          },
        ],
      });

      this.previewPdfUseCase.clear(pdfId);
      res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      res.status(500).json({ message: 'Error al enviar el correo.' });
    }
  }
}
