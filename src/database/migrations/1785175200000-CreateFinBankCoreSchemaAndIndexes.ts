import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFinBankCoreSchemaAndIndexes1785175200000 implements MigrationInterface {
  name = 'CreateFinBankCoreSchemaAndIndexes1785175200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."users_role_enum" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPPORT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."account_type_enum" AS ENUM ('SAVINGS', 'CURRENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."account_status_enum" AS ENUM ('ACTIVE', 'BLOCKED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."transaction_status_enum" AS ENUM ('PENDING', 'SUCCESS', 'FAILED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."ledger_entry_type_enum" AS ENUM ('DEBIT', 'CREDIT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "firstName" character varying NOT NULL,
      "lastName" character varying NOT NULL,
      "email" character varying NOT NULL,
      "phone" character varying,
      "password" character varying NOT NULL,
      "role" "public"."users_role_enum" NOT NULL DEFAULT 'CUSTOMER',
      "isActive" boolean NOT NULL DEFAULT true,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      "refreshToken" text,
      CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_users_email" UNIQUE ("email"),
      CONSTRAINT "UQ_users_phone" UNIQUE ("phone")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "account" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "accountNumber" character varying NOT NULL,
      "type" "public"."account_type_enum" NOT NULL,
      "currency" character varying NOT NULL DEFAULT 'NGN',
      "balance" numeric(18,2) NOT NULL DEFAULT 0,
      "status" "public"."account_status_enum" NOT NULL DEFAULT 'ACTIVE',
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      "ownerId" uuid,
      CONSTRAINT "PK_account_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_account_accountNumber" UNIQUE ("accountNumber")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "transaction" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "reference" character varying NOT NULL,
      "idempotencyKey" character varying,
      "fromAccount" character varying NOT NULL,
      "toAccount" character varying NOT NULL,
      "amount" numeric(18,2) NOT NULL,
      "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'PENDING',
      "createdAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_transaction_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_transaction_reference" UNIQUE ("reference")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ledger_entry" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "type" "public"."ledger_entry_type_enum" NOT NULL,
      "amount" numeric(18,2) NOT NULL,
      "reference" character varying NOT NULL,
      "narration" character varying NOT NULL,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "accountId" uuid,
      CONSTRAINT "PK_ledger_entry_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_log" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "userId" character varying NOT NULL,
      "action" character varying NOT NULL,
      "entity" character varying NOT NULL,
      "entityId" character varying NOT NULL,
      "ipAddress" character varying NOT NULL,
      "userAgent" character varying NOT NULL,
      "correlationId" character varying,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notification_log" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "channel" character varying NOT NULL,
      "recipient" character varying NOT NULL,
      "subject" character varying NOT NULL,
      "body" text NOT NULL,
      "status" character varying NOT NULL,
      "provider" character varying NOT NULL,
      "correlationId" character varying,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "PK_notification_log_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(
      `ALTER TABLE "account" ADD CONSTRAINT "FK_account_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ledger_entry" ADD CONSTRAINT "FK_ledger_entry_account" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_transaction_idempotency_key" ON "transaction" ("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_transaction_from_created_at" ON "transaction" ("fromAccount", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_transaction_to_created_at" ON "transaction" ("toAccount", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_transaction_status_created_at" ON "transaction" ("status", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_account_owner_status" ON "account" ("ownerId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_account_status_created_at" ON "account" ("status", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_ledger_reference" ON "ledger_entry" ("reference")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_ledger_account_created_at" ON "ledger_entry" ("accountId", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_audit_user_created_at" ON "audit_log" ("userId", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_audit_action_created_at" ON "audit_log" ("action", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_audit_correlation_id" ON "audit_log" ("correlationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_notification_recipient_created_at" ON "notification_log" ("recipient", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_notification_status_provider" ON "notification_log" ("status", "provider")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_notification_correlation_id" ON "notification_log" ("correlationId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_notification_correlation_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_notification_status_provider"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_notification_recipient_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_correlation_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_audit_action_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_user_created_at"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_ledger_account_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ledger_reference"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_account_status_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_account_owner_status"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_transaction_status_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_transaction_to_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_transaction_from_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "ux_transaction_idempotency_key"`,
    );

    await queryRunner.query(
      `ALTER TABLE "ledger_entry" DROP CONSTRAINT IF EXISTS "FK_ledger_entry_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "FK_account_owner"`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "notification_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ledger_entry"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "account"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."ledger_entry_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."transaction_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."account_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."account_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
