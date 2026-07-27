import { Injectable } from '@nestjs/common';
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
  ) {}

  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const result = await this.mailer.sendMail({
        to: email,
        subject: 'Welcome to Almond FinBank',
        html: `
          <h2>Welcome to Almond FinBank</h2>
          <p>Hello ${firstName}, your demo banking profile has been created successfully.</p>
          <p>You can now log in, create accounts, and test transfers from Swagger.</p>
        `,
      });

      await this.notificationRepo.save({
        channel: 'EMAIL',
        recipient: email,
        subject: 'Welcome to Almond FinBank',
        body: 'User registration welcome email sent.',
        status: 'SUCCESS',
        provider: 'SMTP',
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      await this.notificationRepo.save({
        channel: 'EMAIL',
        recipient: email,
        subject: 'Welcome to Almond FinBank',
        body: message,
        status: 'FAILED',
        provider: 'SMTP',
      });

      throw error;
    }
  }

  async sendTransferReceipt(email: string, amount: number, reference: string) {
    try {
      const result = await this.mailer.sendMail({
        to: email,
        subject: 'Almond FinBank Transfer Receipt',
        html: `
          <h2>Transfer Successful</h2>
          <p>Your transfer was successful.</p>
          <p>Amount: NGN ${amount}</p>
          <p>Reference: ${reference}</p>
          <p>Thank you for banking with Almond FinBank.</p>
        `,
      });

      await this.notificationRepo.save({
        channel: 'EMAIL',
        recipient: email,
        subject: 'Almond FinBank Transfer Receipt',
        body: `Transfer of NGN ${amount}. Reference: ${reference}`,
        status: 'SUCCESS',
        provider: 'SMTP',
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      await this.notificationRepo.save({
        channel: 'EMAIL',
        recipient: email,
        subject: 'Almond FinBank Transfer Receipt',
        body: message,
        status: 'FAILED',
        provider: 'SMTP',
      });

      throw error;
    }
  }
}
