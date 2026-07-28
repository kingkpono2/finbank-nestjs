import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: TransferDto,
    examples: {
      transfer: {
        summary: 'Transfer between two demo accounts',
        description:
          'Create two accounts first, then replace the account numbers with the created accountNumber values.',
        value: {
          fromAccount: '20583521311',
          toAccount: '20883530386',
          amount: 2500,
          narration: 'Live Swagger demo transfer',
        },
      },
    },
  })
  transfer(@Req() req: any, @Body() dto: TransferDto) {
    return this.transactionsService.transfer(req, dto);
  }
}
