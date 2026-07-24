import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

 @Post("transfer")
    @UseGuards(JwtAuthGuard)
    transfer(

    @Req() req,

    @Body() dto:TransferDto,

    ){

    return this.transactionsService.transfer(
    req,
    dto,
    );

    }
}