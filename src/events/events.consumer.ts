import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { NotificationsService } from '../notifications/notifications.service';
import { SmsService } from '../sms/sms.service';

@Controller()
export class EventsConsumer {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly smsService: SmsService,
  ) {}

  @EventPattern('transfer.completed')
  async handleTransferCompleted(@Payload() payload: any) {
    console.log('RabbitMQ Event:', JSON.stringify(payload));

    try {
      await this.notificationsService.sendTransferReceipt(
        payload.email,
        payload.amount,
        payload.reference,
        payload.correlationId,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Transfer email failed:', message);
    }

    try {
      await this.smsService.send(
        payload.phone,
        `Debit Alert\nAmount: NGN ${payload.amount}\nRef: ${payload.reference}`,
        payload.correlationId,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Transfer SMS failed:', message);
    }
  }

  @EventPattern('transfer.failed')
  async handleTransferFailed(@Payload() payload: any) {
    console.log('Transfer Failed:', JSON.stringify(payload));
  }

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() payload: any) {
    console.log('New User:', JSON.stringify(payload));

    try {
      await this.notificationsService.sendWelcomeEmail(
        payload.email,
        payload.firstName,
        payload.correlationId,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Welcome email failed:', message);
    }

    if (payload.phone) {
      try {
        await this.smsService.send(
          payload.phone,
          `Welcome to Almond FinBank, ${payload.firstName}.`,
          payload.correlationId,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Welcome SMS failed:', message);
      }
    }
  }
}
