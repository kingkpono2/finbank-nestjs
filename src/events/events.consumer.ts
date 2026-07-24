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

    await this.notificationsService.sendTransferReceipt(
      payload.email,
      payload.amount,
      payload.reference,
    );

    await this.smsService.send(
      payload.phone,
      `Debit Alert
Amount: ₦${payload.amount}
Ref: ${payload.reference}`,
    );
  }

  @EventPattern('transfer.failed')
  async handleTransferFailed(@Payload() payload: any) {
    console.log('Transfer Failed:', payload);
  }

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() payload: any) {
    console.log('New User:', payload);

    // Optional welcome email
  }
}