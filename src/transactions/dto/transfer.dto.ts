import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({ example: '1000000001' })
  @IsString()
  fromAccount: string;

  @ApiProperty({ example: '1000000002' })
  @IsString()
  toAccount: string;

  @ApiProperty({ example: 2500, minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'Demo transfer for Swagger testing' })
  @IsString()
  narration: string;

  @ApiPropertyOptional({
    example: 'demo-transfer-20260727-001',
    description: 'Client-generated key used to safely retry a transfer request without creating a duplicate debit.',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  idempotencyKey?: string;
}
