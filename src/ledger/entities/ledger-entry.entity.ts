import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { Account } from '../../accounts/entities/account.entity';

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Index('idx_ledger_reference', ['reference'])
@Index('idx_ledger_account_created_at', ['account', 'createdAt'])
@Entity()
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account)
  account: Account;

  @Column({
    type: 'enum',
    enum: EntryType,
  })
  type: EntryType;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  amount: number;

  @Column()
  reference: string;

  @Column()
  narration: string;

  @CreateDateColumn()
  createdAt: Date;
}
