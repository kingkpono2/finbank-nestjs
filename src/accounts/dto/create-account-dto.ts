import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ enum: AccountType, example: AccountType.SAVINGS })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional({ example: 50000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;
}
