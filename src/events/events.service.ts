import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EventsService {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async publishTransferCompleted(payload: any) {
    return firstValueFrom(this.client.emit('transfer.completed', payload));
  }

  async publishTransferFailed(payload: any) {
    return firstValueFrom(this.client.emit('transfer.failed', payload));
  }

  async publishUserRegistered(payload: any) {
    return firstValueFrom(this.client.emit('user.registered', payload));
  }
}
