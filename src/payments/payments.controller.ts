import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('mock payments')
@Controller('mock/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('transfer')
  @ApiOperation({
    summary: 'Simulate an external payment gateway transfer response. No request body required.',
  })
  transfer() {
    return this.paymentsService.transfer();
  }
}
