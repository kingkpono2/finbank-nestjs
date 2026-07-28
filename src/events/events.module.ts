import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { EventsConsumer } from './events.consumer';
import { EventsService } from './events.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
          ],
          queue: 'finbank_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    NotificationsModule,
    SmsModule,
  ],
  providers: [EventsService],
  controllers: [EventsConsumer],
  exports: [EventsService],
})
export class EventsModule {}
