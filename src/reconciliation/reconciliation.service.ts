import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import {
  Transaction,
  TransactionStatus,
} from '../transactions/entities/transaction.entity';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: Repository<LedgerEntry>,
  ) {}

  async daily(date?: string) {
    const selectedDate = date ? new Date(date) : new Date();
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .where(
        'transaction.createdAt >= :start and transaction.createdAt < :end',
        { start, end },
      )
      .getMany();

    const ledgers = await this.ledgerRepo
      .createQueryBuilder('ledger')
      .leftJoinAndSelect('ledger.account', 'account')
      .where('ledger.createdAt >= :start and ledger.createdAt < :end', {
        start,
        end,
      })
      .getMany();

    const successful = transactions.filter(
      (transaction) => transaction.status === TransactionStatus.SUCCESS,
    );
    const ledgerReferences = new Map<string, number>();

    for (const entry of ledgers) {
      ledgerReferences.set(
        entry.reference,
        (ledgerReferences.get(entry.reference) ?? 0) + 1,
      );
    }

    const exceptions = successful
      .filter(
        (transaction) =>
          (ledgerReferences.get(transaction.reference) ?? 0) !== 2,
      )
      .map((transaction) => ({
        reference: transaction.reference,
        reason: 'Expected exactly two ledger entries for successful transfer',
      }));

    return {
      date: start.toISOString().slice(0, 10),
      transactionCount: transactions.length,
      successfulTransactionCount: successful.length,
      ledgerEntryCount: ledgers.length,
      exceptionCount: exceptions.length,
      exceptions,
    };
  }
}
