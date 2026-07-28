import { ReconciliationService } from './reconciliation.service';

describe('ReconciliationService', () => {
  it('flags successful transactions without two ledger entries', async () => {
    const transactionRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { reference: 'TXN-1', status: 'SUCCESS' },
          { reference: 'TXN-2', status: 'SUCCESS' },
        ]),
      }),
    };
    const ledgerRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue([
            { reference: 'TXN-1' },
            { reference: 'TXN-1' },
            { reference: 'TXN-2' },
          ]),
      }),
    };

    const service = new ReconciliationService(
      transactionRepo as any,
      ledgerRepo as any,
    );
    const result = await service.daily('2026-07-27');

    expect(result.exceptionCount).toBe(1);
    expect(result.exceptions[0].reference).toBe('TXN-2');
  });
});
