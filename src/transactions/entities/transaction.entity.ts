import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Index('idx_transaction_from_created_at', ['fromAccount', 'createdAt'])
@Index('idx_transaction_to_created_at', ['toAccount', 'createdAt'])
@Index('idx_transaction_status_created_at', ['status', 'createdAt'])
@Index('ux_transaction_idempotency_key', ['idempotencyKey'], {
  unique: true,
  where: '"idempotencyKey" IS NOT NULL',
})
@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column({ nullable: true })
  idempotencyKey?: string;

  @Column()
  fromAccount: string;

  @Column()
  toAccount: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
