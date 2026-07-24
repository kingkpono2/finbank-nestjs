import {

Body,

Controller,

Post,
Req,
UseGuards

} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';

import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Controller('auth')

export class AuthController{

constructor(

private readonly authService:AuthService,

){}

@Post('register')

register(

@Body() dto:RegisterDto,

){

return this.authService.register(dto);

}

@Post('login')

login(

@Body() dto:LoginDto,

){

return this.authService.login(

dto.email,

dto.password,

);

}

@Post('refresh')
refresh(
    @Body() dto: RefreshTokenDto,
){
    return this.authService.refresh(
        dto.refreshToken,
    );
}



@Post('logout')
@UseGuards(JwtAuthGuard)
logout(@Req() req: any) {
  return this.authService.logout(req.user.id);
}

}