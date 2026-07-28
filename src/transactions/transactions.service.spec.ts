import { ForbiddenException } from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { AccountStatus } from '../accounts/entities/account.entity';

const VICTIM_ID = 'victim-uuid';
const ATTACKER_ID = 'attacker-uuid';
const VICTIM_ACCOUNT = '20111111111';
const ATTACKER_ACCOUNT = '20222222222';

function buildAccounts() {
  return [
    {
      id: 'victim-account-id',
      accountNumber: VICTIM_ACCOUNT,
      ownerId: VICTIM_ID,
      status: AccountStatus.ACTIVE,
      balance: 100000,
    },
    {
      id: 'attacker-account-id',
      accountNumber: ATTACKER_ACCOUNT,
      ownerId: ATTACKER_ID,
      status: AccountStatus.ACTIVE,
      balance: 0,
    },
  ];
}

function buildHarness() {
  const accounts = buildAccounts();

  const queryBuilder = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(accounts),
  };

  const runner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    isTransactionActive: true,
    manager: {
      getRepository: jest
        .fn()
        .mockReturnValue({ createQueryBuilder: () => queryBuilder }),
      save: jest.fn().mockImplementation((value: unknown) => value),
    },
  };

  const transactionRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((value: unknown) => value),
  };

  const accountsRepository = {
    findOne: jest.fn().mockResolvedValue({
      id: 'victim-account-id',
      accountNumber: VICTIM_ACCOUNT,
      owner: { email: 'victim@finbank.test', phone: '+2348000000001' },
    }),
  };

  const redisService = { del: jest.fn().mockResolvedValue(undefined) };
  const eventsService = {
    publishTransferCompleted: jest.fn().mockResolvedValue(undefined),
  };
  const auditService = { log: jest.fn().mockResolvedValue(undefined) };

  const service = new TransactionsService(
    transactionRepo as any,
    auditService as any,
    accountsRepository as any,
    redisService as any,
    { createQueryRunner: () => runner } as any,
    eventsService as any,
  );

  return { service, runner, accounts, auditService, eventsService };
}

function buildRequest(userId: string) {
  return {
    user: { id: userId },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
    correlationId: 'corr-test-1',
  };
}

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

  it('rejects a debit from an account the caller does not own', async () => {
    const { service, runner, accounts } = buildHarness();

    await expect(
      service.transfer(buildRequest(ATTACKER_ID), {
        fromAccount: VICTIM_ACCOUNT,
        toAccount: ATTACKER_ACCOUNT,
        amount: 1000,
        narration: 'theft',
      }),
    ).rejects.toThrow(ForbiddenException);

    // the transaction must be rolled back and no balance may change
    expect(runner.rollbackTransaction).toHaveBeenCalled();
    expect(runner.commitTransaction).not.toHaveBeenCalled();
    expect(runner.release).toHaveBeenCalled();
    expect(accounts[0].balance).toBe(100000);
    expect(accounts[1].balance).toBe(0);
  });

  it('allows a debit from an account the caller does own', async () => {
    const { service, runner, accounts } = buildHarness();

    const result = await service.transfer(buildRequest(VICTIM_ID), {
      fromAccount: VICTIM_ACCOUNT,
      toAccount: ATTACKER_ACCOUNT,
      amount: 1000,
      narration: 'legitimate transfer',
    });

    expect(result.success).toBe(true);
    expect(result.reference).toMatch(/^TXN-/);
    expect(runner.commitTransaction).toHaveBeenCalled();
    expect(accounts[0].balance).toBe(99000);
    expect(accounts[1].balance).toBe(1000);
  });
});
