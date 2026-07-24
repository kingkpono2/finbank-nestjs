import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TransactionStatus {
  PENDING='PENDING',
  SUCCESS='SUCCESS',
  FAILED='FAILED',
}

@Entity()
export class Transaction {

  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Column({unique:true})
  reference:string;

  @Column()
  fromAccount:string;

  @Column()
  toAccount:string;

  @Column({
      type:'decimal',
      precision:18,
      scale:2,
  })
  amount:number;

  @Column({
      type:'enum',
      enum:TransactionStatus,
      default:TransactionStatus.PENDING,
  })
  status:TransactionStatus;

  @CreateDateColumn()
  createdAt:Date;
}