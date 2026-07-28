import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationLog } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationRepo: Repository<NotificationLog>,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    correlationId?: string,
  ) {
    const subject = 'Welcome to Almond FinBank';
    const html = `
      <h2>Welcome to Almond FinBank</h2>
      <p>Hello ${this.escapeHtml(firstName)}, your demo banking profile has been created successfully.</p>
      <p>You can now log in, create accounts, and test transfers from Swagger.</p>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      successBody: 'User registration welcome email sent.',
      correlationId,
    });
  }

  async sendTransferReceipt(
    email: string,
    amount: number,
    reference: string,
    correlationId?: string,
  ) {
    const subject = 'Almond FinBank Transfer Receipt';
    const html = `
      <h2>Transfer Successful</h2>
      <p>Your transfer was successful.</p>
      <p>Amount: NGN ${amount}</p>
      <p>Reference: ${this.escapeHtml(reference)}</p>
      <p>Thank you for banking with Almond FinBank.</p>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      successBody: `Transfer of NGN ${amount}. Reference: ${reference}`,
      correlationId,
    });
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    successBody: string;
    correlationId?: string;
  }) {
    const brevoApiKey = this.config.get<string>('BREVO_API_KEY');
    const provider = brevoApiKey ? 'BREVO' : 'SMTP';

    try {
      const result = brevoApiKey
        ? await this.sendWithBrevo(brevoApiKey, params)
        : await this.mailer.sendMail({
            to: params.to,
            subject: params.subject,
            html: params.html,
          });

      await this.notificationRepo.save({
        channel: 'EMAIL',
        recipient: params.to,
        subject: params.subject,
        body: params.successBody,
        status: 'SUCCESS',
        provider,
        correlationId: params.correlationId,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      await this.notificationRepo.save({
        channel: 'EMAIL',
        recipient: params.to,
        subject: params.subject,
        body: message,
        status: 'FAILED',
        provider,
        correlationId: params.correlationId,
      });

      throw error;
    }
  }

  private async sendWithBrevo(
    apiKey: string,
    params: { to: string; subject: string; html: string },
  ) {
    const senderEmail =
      this.config.get<string>('BREVO_FROM_EMAIL') ||
      this.config.get<string>('SMTP_FROM_EMAIL') ||
      'admin@almondsystems.com.ng';
    const senderName =
      this.config.get<string>('BREVO_FROM_NAME') || 'Almond FinBank';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
      }),
    });

    const body = await response.text();

    if (!response.ok) {
      throw new Error(`Brevo email failed (${response.status}): ${body}`);
    }

    return body ? JSON.parse(body) : {};
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[char];
    });
  }
}
