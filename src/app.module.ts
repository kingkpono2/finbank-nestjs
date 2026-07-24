import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { AccountsModule } from './accounts/accounts.module';
import { LedgerModule } from './ledger/ledger.module';
import { TransactionsModule } from './transactions/transactions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MockModule } from './mock/mock.module';
import { PaymentsModule } from './payments/payments.module';
import { SmsModule } from './sms/sms.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuditModule } from './audit/audit.module';
import { AppCacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

    UsersModule,
    AuthModule,
    HealthModule,
    AccountsModule,
    LedgerModule,
    TransactionsModule,
    NotificationsModule,
    MockModule,
    PaymentsModule,
    SmsModule,
    WebhooksModule,
    AuditModule,
    AppCacheModule,
  ],
})
export class AppModule {}