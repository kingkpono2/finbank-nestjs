import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  it('delegates transfer execution with request context', async () => {
    const transactionsService = {
      transfer: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
    };
    const controller = new TransactionsController(transactionsService as any);

    await expect(
      controller.transfer({ user: { id: 'user-1' }, correlationId: 'corr-1' }, {
        amount: 2500,
      } as any),
    ).resolves.toEqual({
      status: 'SUCCESS',
    });
  });
});
