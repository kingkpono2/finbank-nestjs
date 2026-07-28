import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';

import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('payment/signature-demo')
  @ApiBody({
    schema: {
      example: {
        provider: 'flutterwave',
        reference: 'FLW-DEMO-20260727-001',
        accountNumber: '1000000001',
        amount: 25000,
        currency: 'NGN',
        status: 'SUCCESS',
        paidAt: '2026-07-27T12:00:00.000Z',
      },
    },
  })
  createPaymentWebhookSignature(@Body() body: any) {
    const timestamp = Date.now().toString();
    const eventId = `swagger-${timestamp}`;

    return {
      note: 'Copy these headers into POST /webhooks/payment and use the exact same JSON body.',
      headers: {
        'x-finbank-signature': this.webhooksService.sign(timestamp, body),
        'x-finbank-timestamp': timestamp,
        'x-finbank-event-id': eventId,
      },
      body,
    };
  }

  @Post('payment')
  @ApiHeader({ name: 'x-finbank-signature', required: true })
  @ApiHeader({ name: 'x-finbank-timestamp', required: true })
  @ApiHeader({ name: 'x-finbank-event-id', required: true })
  @ApiBody({
    schema: {
      example: {
        provider: 'flutterwave',
        reference: 'FLW-DEMO-20260727-001',
        accountNumber: '1000000001',
        amount: 25000,
        currency: 'NGN',
        status: 'SUCCESS',
        paidAt: '2026-07-27T12:00:00.000Z',
      },
    },
  })
  async paymentWebhook(
    @Body() body: any,
    @Headers('x-finbank-signature') signature: string,
    @Headers('x-finbank-timestamp') timestamp: string,
    @Headers('x-finbank-event-id') eventId: string,
  ) {
    const result = await this.webhooksService.processPaymentWebhook({
      body,
      signature,
      timestamp,
      eventId,
    });

    if (!result.verified) {
      throw new UnauthorizedException(result.reason);
    }

    return result;
  }
}
