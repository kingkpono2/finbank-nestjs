import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  it('creates an account with an owner and generated account number', async () => {
    const repository = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => data),
    };
    const redis = { get: jest.fn(), set: jest.fn() };
    const service = new AccountsService(repository as any, redis as any);

    const account = await service.create(
      { type: 'SAVINGS', initialBalance: 5000 } as any,
      { id: 'user-1' } as any,
    );

    expect(account.accountNumber).toMatch(/^20\d{9}$/);
    expect(account.balance).toBe(5000);
    expect(account.owner).toEqual({ id: 'user-1' });
  });
});
