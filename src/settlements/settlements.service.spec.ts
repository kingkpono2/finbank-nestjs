import { SettlementsService } from './settlements.service';

describe('SettlementsService', () => {
  it('summarizes successful transaction totals', async () => {
    const repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { amount: 1000, status: 'SUCCESS' },
          { amount: 2500, status: 'SUCCESS' },
          { amount: 700, status: 'FAILED' },
        ]),
      }),
    };

    const service = new SettlementsService(repo as any);
    const result = await service.daily('2026-07-27');

    expect(result.successfulTransactionCount).toBe(2);
    expect(result.grossAmount).toBe(3500);
    expect(result.status).toBe('READY_FOR_SETTLEMENT');
  });
});
