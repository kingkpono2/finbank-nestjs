import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ada.okafor.demo@finbank.test' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password1' })
  @IsString()
  password: string;
}
