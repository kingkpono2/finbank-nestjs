import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerEntry } from './entities/ledger-entry.entity';

@Module({
 imports:[
    TypeOrmModule.forFeature([LedgerEntry]),
],
exports:[
    LedgerService,
    TypeOrmModule,
],
  providers: [LedgerService],
  controllers: [LedgerController]
})
export class LedgerModule {}
