import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AccountsModule } from 'src/accounts/accounts.module';
import { LedgerModule } from 'src/ledger/ledger.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Transaction } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { EventsModule } from 'src/events/events.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AccountsModule,
    LedgerModule,
    EventsModule,
    NotificationsModule, 
    AuditModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}