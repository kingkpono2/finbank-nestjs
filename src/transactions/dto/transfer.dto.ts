import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

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
}
