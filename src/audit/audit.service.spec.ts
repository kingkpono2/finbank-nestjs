import { AuditService } from './audit.service';

describe('AuditService', () => {
  it('persists audit log data', async () => {
    const repo = { save: jest.fn(async (data) => data) };
    const service = new AuditService(repo as any);

    await expect(
      service.log({ action: 'TRANSFER', correlationId: 'corr-1' } as any),
    ).resolves.toEqual({
      action: 'TRANSFER',
      correlationId: 'corr-1',
    });
  });
});
