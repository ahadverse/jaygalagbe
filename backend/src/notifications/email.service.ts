import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { getSmtpCredentials } from './email.config.js';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter?: Transporter;

  async send(message: EmailMessage) {
    try {
      const { transporter, from } = this.getTransporter();
      await transporter.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
      });
    } catch (error) {
      this.logger.warn(`Failed to send email: ${(error as Error).message}`);
    }
  }

  private getTransporter() {
    const { host, port, user, password, from } = getSmtpCredentials();
    this.transporter ??= createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    return { transporter: this.transporter, from };
  }
}
