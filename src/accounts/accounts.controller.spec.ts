import { AccountsController } from './accounts.controller';

describe('AccountsController', () => {
  it('creates an account for the authenticated user', async () => {
    const accountsService = {
      create: jest.fn().mockResolvedValue({ accountNumber: '20000000001' }),
    };
    const controller = new AccountsController(accountsService as any);

    await expect(
      controller.create({ user: { id: 'user-1' } }, {
        type: 'SAVINGS',
        initialBalance: 5000,
      } as any),
    ).resolves.toEqual({
      accountNumber: '20000000001',
    });
  });
});
