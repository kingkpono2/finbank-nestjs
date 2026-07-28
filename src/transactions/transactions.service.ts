import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { Account, AccountStatus } from '../accounts/entities/account.entity';
import { LedgerEntry, EntryType } from '../ledger/entities/ledger-entry.entity';
import { TransferDto } from './dto/transfer.dto';
import { EventsService } from 'src/events/events.service';
import { AuditService } from 'src/audit/audit.service';
import { RedisService } from 'src/redis/redis.service';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly auditService: AuditService,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @Inject(RedisService)
    private readonly redisService: RedisService,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly eventsService: EventsService,
  ) {}

  private generateReference(): string {
    return `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  async transfer(req: any, dto: TransferDto) {
    const correlationId = req.correlationId;
    const idempotencyKey = dto.idempotencyKey?.trim();

    if (dto.fromAccount === dto.toAccount) {
      throw new BadRequestException(
        'Sender and receiver accounts must be different',
      );
    }

    if (idempotencyKey) {
      const existingTransaction = await this.transactionRepo.findOne({
        where: { idempotencyKey },
      });

      if (existingTransaction) {
        return {
          success: existingTransaction.status === TransactionStatus.SUCCESS,
          reference: existingTransaction.reference,
          idempotentReplay: true,
        };
      }
    }

    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    let sender: Account | null = null;
    let receiver: Account | null = null;
    let reference = '';

    try {
      const accountNumbers = [dto.fromAccount, dto.toAccount].sort();
      const lockedAccounts = await runner.manager
        .getRepository(Account)
        .createQueryBuilder('account')
        .setLock('pessimistic_write')
        .where('account.accountNumber IN (:...accountNumbers)', {
          accountNumbers,
        })
        .orderBy('account.accountNumber', 'ASC')
        .getMany();

      sender =
        lockedAccounts.find(
          (account) => account.accountNumber === dto.fromAccount,
        ) ?? null;
      receiver =
        lockedAccounts.find(
          (account) => account.accountNumber === dto.toAccount,
        ) ?? null;

      if (!sender) {
        throw new NotFoundException('Sender account not found');
      }

      if (!receiver) {
        throw new NotFoundException('Receiver account not found');
      }

      if (sender.ownerId !== req.user.id) {
        throw new ForbiddenException(
          'You cannot debit an account you do not own',
        );
      }

      if (sender.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Sender account is not active');
      }

      if (receiver.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Receiver account is not active');
      }

      if (Number(sender.balance) < dto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      sender.balance = Number(sender.balance) - dto.amount;
      receiver.balance = Number(receiver.balance) + dto.amount;

      await runner.manager.save(sender);
      await runner.manager.save(receiver);

      reference = this.generateReference();

      const transaction = this.transactionRepo.create({
        reference,
        idempotencyKey: idempotencyKey || undefined,
        fromAccount: sender.accountNumber,
        toAccount: receiver.accountNumber,
        amount: dto.amount,
        status: TransactionStatus.SUCCESS,
      });

      await runner.manager.save(transaction);

      await runner.manager.save(LedgerEntry, {
        account: sender,
        type: EntryType.DEBIT,
        amount: dto.amount,
        reference,
        narration: dto.narration,
      });

      await runner.manager.save(LedgerEntry, {
        account: receiver,
        type: EntryType.CREDIT,
        amount: dto.amount,
        reference,
        narration: dto.narration,
      });

      await runner.commitTransaction();
      await this.redisService.del(`account:${sender.accountNumber}`);
      await this.redisService.del(`account:${receiver.accountNumber}`);
    } catch (error) {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }

      throw error;
    } finally {
      await runner.release();
    }

    const senderWithOwner = await this.accountsRepository.findOne({
      where: {
        id: sender.id,
      },
      relations: {
        owner: true,
      },
    });

    try {
      await this.eventsService.publishTransferCompleted({
        reference,
        amount: dto.amount,
        fromAccount: sender.accountNumber,
        toAccount: receiver.accountNumber,
        email: senderWithOwner?.owner?.email,
        phone: (senderWithOwner?.owner as any)?.phone,
        narration: dto.narration,
        timestamp: new Date(),
        correlationId,
      });

      console.log('Transfer event published successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('RabbitMQ publish failed:', message);
    }

    try {
      await this.auditService.log({
        userId: req.user.id,
        action: 'TRANSFER',
        entity: 'Transaction',
        entityId: reference,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Audit log failed:', message);
    }

    return {
      success: true,
      reference,
    };
  }
}
