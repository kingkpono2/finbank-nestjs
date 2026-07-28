import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Transaction,
  TransactionStatus,
} from '../transactions/entities/transaction.entity';

@Injectable()
export class SettlementsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
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

    const successful = transactions.filter(
      (transaction) => transaction.status === TransactionStatus.SUCCESS,
    );
    const totalAmount = successful.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );

    return {
      date: start.toISOString().slice(0, 10),
      settlementBatchReference: `SETTLEMENT-${start.toISOString().slice(0, 10)}`,
      successfulTransactionCount: successful.length,
      grossAmount: totalAmount,
      currency: 'NGN',
      status: 'READY_FOR_SETTLEMENT',
    };
  }
}
