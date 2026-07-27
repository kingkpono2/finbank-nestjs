import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({
    type: RegisterDto,
    examples: {
      customer: {
        summary: 'Register a demo customer',
        value: {
          firstName: 'Kpono-Abasi',
          lastName: 'Akpabio',
          email: 'kingkpono@gmail.com',
          phone: '+2348011112299',
          password: 'Password1',
        },
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiBody({
    type: LoginDto,
    examples: {
      customer: {
        summary: 'Login with the demo customer',
        value: {
          email: 'kingkpono@gmail.com',
          password: 'Password1',
        },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      refreshToken: {
        summary: 'Refresh access token',
        value: {
          refreshToken: 'paste-refresh-token-from-login-response',
        },
      },
    },
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }
}
