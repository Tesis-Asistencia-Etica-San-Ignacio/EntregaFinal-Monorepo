import { SmtpService } from '../../../infrastructure/services/smtp.service';

interface Attachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

interface SendEmailData {
    to: string[];
    subject: string;
    html?: string;
    attachments?: Attachment[];
}

export class SendEmailUseCase {
    private smtpService: SmtpService;

    constructor(smtpService: SmtpService) {
        this.smtpService = smtpService;
    }

    public async execute(data: SendEmailData): Promise<void> {
        const { to, subject, html, attachments } = data;
        await this.smtpService.sendEmail(to, subject, html, attachments);
    }
}
