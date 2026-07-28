import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, AuditService])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
