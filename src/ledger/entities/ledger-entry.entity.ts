import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Account } from '../../accounts/entities/account.entity';

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

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