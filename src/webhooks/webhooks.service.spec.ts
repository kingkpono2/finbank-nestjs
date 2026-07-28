import { BadRequestException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

describe('WebhooksService', () => {
  const redis = {
    setIfNotExists: jest.fn(),
  };
  let service: WebhooksService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WEBHOOK_SECRET = 'test-secret';
    service = new WebhooksService(redis as any);
  });

  it('accepts a valid signed payment webhook', async () => {
    redis.setIfNotExists.mockResolvedValue(true);
    const body = {
      provider: 'flutterwave',
      reference: 'FLW-1',
      status: 'SUCCESS',
    };
    const timestamp = String(Date.now());
    const signature = service.sign(timestamp, body);

    await expect(
      service.processPaymentWebhook({
        body,
        timestamp,
        signature,
        eventId: 'evt-1',
      }),
    ).resolves.toMatchObject({
      verified: true,
      eventId: 'evt-1',
      reference: 'FLW-1',
    });
  });

  it('rejects invalid signatures', async () => {
    redis.setIfNotExists.mockResolvedValue(true);

    await expect(
      service.processPaymentWebhook({
        body: { reference: 'FLW-1' },
        timestamp: String(Date.now()),
        signature: 'bad-signature',
        eventId: 'evt-1',
      }),
    ).resolves.toMatchObject({
      verified: false,
      reason: 'Invalid webhook signature',
    });
  });

  it('rejects replayed webhook event ids', async () => {
    redis.setIfNotExists.mockResolvedValue(false);
    const body = { reference: 'FLW-1' };
    const timestamp = String(Date.now());

    await expect(
      service.processPaymentWebhook({
        body,
        timestamp,
        signature: service.sign(timestamp, body),
        eventId: 'evt-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
