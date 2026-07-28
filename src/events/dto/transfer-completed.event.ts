export class TransferCompletedEvent {
  reference: string;

  amount: number;

  fromAccount: string;

  toAccount: string;

  senderEmail: string;

  senderPhone: string;

  narration: string;

  timestamp: Date;
}
