import { UnauthorizedException } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';

describe('WebhooksController', () => {
  it('returns copyable Swagger demo headers', () => {
    const service = { sign: jest.fn().mockReturnValue('signed') };
    const controller = new WebhooksController(service as any);
    const body = { reference: 'FLW-DEMO-1', amount: 25000 };

    const result = controller.createPaymentWebhookSignature(body);

    expect(result.headers['x-finbank-signature']).toBe('signed');
    expect(result.headers['x-finbank-event-id']).toMatch(/^swagger-/);
  });

  it('rejects invalid payment webhooks', async () => {
    const service = {
      processPaymentWebhook: jest.fn().mockResolvedValue({
        verified: false,
        reason: 'Invalid webhook signature',
      }),
    };
    const controller = new WebhooksController(service as any);

    await expect(
      controller.paymentWebhook({}, 'bad', '1', 'event-1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
