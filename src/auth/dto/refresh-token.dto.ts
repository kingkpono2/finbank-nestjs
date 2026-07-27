import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'paste-refresh-token-from-login-response' })
  @IsString()
  refreshToken: string;
}
