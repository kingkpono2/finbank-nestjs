import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  it('is constructed with transaction, account, ledger, event, audit, and redis dependencies', () => {
    const service = new TransactionsService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    expect(service).toBeDefined();
  });
});
