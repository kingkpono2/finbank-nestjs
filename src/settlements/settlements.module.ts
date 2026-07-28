import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../common/guards/roles.guard';
import { Transaction } from '../transactions/entities/transaction.entity';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [SettlementsController],
  providers: [SettlementsService, RolesGuard],
})
export class SettlementsModule {}
