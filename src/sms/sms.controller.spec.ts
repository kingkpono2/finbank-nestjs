import { SmsController } from './sms.controller';

describe('SmsController', () => {
  it('passes correlation id to SmsService', async () => {
    const smsService = {
      send: jest.fn().mockResolvedValue({ status: 'QUEUED' }),
    };
    const controller = new SmsController(smsService as any);

    await expect(
      controller.send({
        phone: '+2348012345678',
        message: 'hello',
        correlationId: 'corr-1',
      }),
    ).resolves.toEqual({
      status: 'QUEUED',
    });
    expect(smsService.send).toHaveBeenCalledWith(
      '+2348012345678',
      'hello',
      'corr-1',
    );
  });
});
