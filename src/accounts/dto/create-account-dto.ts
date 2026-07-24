import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @IsEnum(AccountType)
  type: AccountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;
}