import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../common/guards/roles.guard';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ReconciliationController } from './reconciliation.controller';
import { ReconciliationService } from './reconciliation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, LedgerEntry])],
  controllers: [ReconciliationController],
  providers: [ReconciliationService, RolesGuard],
})
export class ReconciliationModule {}
