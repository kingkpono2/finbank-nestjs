import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account-dto';
import { AccountsService } from './accounts.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
constructor(
  private readonly accountsService: AccountsService,
) {}
@Post()
@UseGuards(JwtAuthGuard)
create(
  @Req() req: any,
  @Body() dto: CreateAccountDto,
) {
  return this.accountsService.create(
    dto,
    req.user,
  );
}

@Get()
@UseGuards(JwtAuthGuard)
findMine(
  @Req() req: any,
) {
  return this.accountsService.findMine(
    req.user.id,
  );
}

}
