import { SmsService } from './sms.service';

describe('SmsService', () => {
  it('queues SMS through the mock provider by default', async () => {
    delete process.env.SMS_PROVIDER;
    const service = new SmsService();

    await expect(
      service.send('+2348012345678', 'hello', 'corr-1'),
    ).resolves.toMatchObject({
      status: 'QUEUED',
      provider: 'MOCK',
      correlationId: 'corr-1',
    });
  });
});
