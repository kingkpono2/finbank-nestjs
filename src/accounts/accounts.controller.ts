import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account-dto';
import { AccountsService } from './accounts.service';
import { AccountType } from './entities/account.entity';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: CreateAccountDto,
    examples: {
      savings: {
        summary: 'Create funded savings account',
        value: {
          type: AccountType.SAVINGS,
          initialBalance: 50000,
        },
      },
      current: {
        summary: 'Create current account',
        value: {
          type: AccountType.CURRENT,
          initialBalance: 10000,
        },
      },
    },
  })
  create(@Req() req: any, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: any) {
    return this.accountsService.findMine(req.user.id);
  }
}
