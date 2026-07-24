import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from './entities/account.entity';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
imports: [
    TypeOrmModule.forFeature([Account]),
],
exports: [
    AccountsService,
    TypeOrmModule,
],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}