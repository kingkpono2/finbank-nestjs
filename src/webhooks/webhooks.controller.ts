import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  @Post('payment')
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
  paymentWebhook(@Body() body: any) {
    console.log('Webhook Received');
    console.log(body);

    return {
      received: true,
    };
  }
}
