import 'dotenv/config';
import { DataSource } from 'typeorm';

import { Account } from '../accounts/entities/account.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import { NotificationLog } from '../notifications/entities/notification.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5433),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'finbank',
  entities: [
    Account,
    AuditLog,
    LedgerEntry,
    NotificationLog,
    Transaction,
    User,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
});
