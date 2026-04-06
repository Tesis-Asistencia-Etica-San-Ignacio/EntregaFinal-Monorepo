import nodemailer from "nodemailer";
import config from "../config/config";

export class SmtpService {
    private transporter: nodemailer.Transporter;

    constructor() {
        const { host, port, user, pass } = config.smtp;

        if (!host || !port || !user || !pass) {
            throw new Error("Faltan credenciales SMTP. Verifica tu archivo .env");
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: false,
            auth: {
                user,
                pass,
            },
            connectionTimeout: 10000,
            socketTimeout: 10000,
        });
    }

    async sendEmail(to: string[], subject: string, html?: string, attachments?: { filename: string; content: Buffer; contentType: string }[]) {
        try {
            const toList = to.join(", ");

            await this.transporter.sendMail({
                from: "HUSI <no-reply@acme.com>",
                to: toList,
                subject,
                html,
                attachments,
            });
        } catch (error) {
            console.error("Error enviando email via SMTP:", error);
            throw error;
        }
    }
}
