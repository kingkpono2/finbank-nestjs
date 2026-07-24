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
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from 'src/events/events.service';
import { AuditService } from 'src/audit/audit.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class TransactionsService {
 constructor(
  @InjectRepository(Transaction)
  private readonly transactionRepo: Repository<Transaction>,
  private readonly auditService:AuditService,

  @InjectRepository(Account)
  private readonly accountsRepository: Repository<Account>,

  @Inject(RedisService)
private readonly redisService: RedisService,
  @InjectDataSource()
  private readonly dataSource: DataSource,

  private readonly notificationsService: NotificationsService,
  private readonly eventsService: EventsService,

) {}
  private generateReference(): string {
    return `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  
  async transfer(
  req: any,
  dto: TransferDto,
) {
  const runner = this.dataSource.createQueryRunner();

  await runner.connect();
  await runner.startTransaction();

  let sender: Account | null;
  let receiver: Account | null;
  let reference: string;

  try {
        sender = await runner.manager.findOne(Account, {
        where: {
            accountNumber: dto.fromAccount,
        },
        lock: {
            mode: 'pessimistic_write',
        },
        });

        receiver = await runner.manager.findOne(Account, {
        where: {
            accountNumber: dto.toAccount,
        },
       
        lock: {
            mode: 'pessimistic_write',
        },
        });
    if (!sender) {
      throw new NotFoundException('Sender account not found');
    }

    if (!receiver) {
      throw new NotFoundException('Receiver account not found');
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


// -----------------------------
// AFTER COMMIT (Non-Critical)
// -----------------------------

const senderWithOwner = await this.accountsRepository.findOne({
  where: {
    id: sender!.id,
  },
  relations: {
    owner: true,
  },
});

try {
  await this.eventsService.publishTransferCompleted({
    reference,
    amount: dto.amount,
    fromAccount: sender!.accountNumber,
    toAccount: receiver!.accountNumber,

    email: senderWithOwner?.owner?.email,
    phone: (senderWithOwner?.owner as any)?.phone,

    narration: dto.narration,
    timestamp: new Date(),
  });

  console.log('Transfer event published successfully.');
} catch (e) {
  console.error('RabbitMQ publish failed:', e.message);
}

try {
  await this.auditService.log({
    userId: req.user.id,
    action: 'TRANSFER',
    entity: 'Transaction',
    entityId: reference,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
} catch (e) {
  console.error('Audit log failed:', e.message);
}

return {
  success: true,
  reference,
};
}
}