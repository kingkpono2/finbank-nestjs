import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('sends welcome email through SMTP and logs success with correlation id', async () => {
    const repo = { save: jest.fn(async (data) => data) };
    const mailer = {
      sendMail: jest
        .fn()
        .mockResolvedValue({ accepted: ['demo@finbank.test'] }),
    };
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const service = new NotificationsService(
      repo as any,
      mailer as any,
      config as any,
    );

    await service.sendWelcomeEmail(
      'demo@finbank.test',
      'Kpono-Abasi',
      'corr-1',
    );

    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'demo@finbank.test' }),
    );
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SUCCESS', correlationId: 'corr-1' }),
    );
  });
});
