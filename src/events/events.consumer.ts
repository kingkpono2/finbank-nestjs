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
    console.log('RabbitMQ Event:', payload);

    try {
      await this.notificationsService.sendTransferReceipt(
        payload.email,
        payload.amount,
        payload.reference,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Transfer email failed:', message);
    }

    try {
      await this.smsService.send(
        payload.phone,
        `Debit Alert
Amount: NGN ${payload.amount}
Ref: ${payload.reference}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Transfer SMS failed:', message);
    }
  }

  @EventPattern('transfer.failed')
  async handleTransferFailed(@Payload() payload: any) {
    console.log('Transfer Failed:', payload);
  }

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() payload: any) {
    console.log('New User:', payload);

    try {
      await this.notificationsService.sendWelcomeEmail(
        payload.email,
        payload.firstName,
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
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Welcome SMS failed:', message);
      }
    }
  }
}
