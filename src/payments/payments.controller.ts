import { Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('mock/payments')
export class PaymentsController {

constructor(
private readonly paymentsService:PaymentsService,
){}

@Post("transfer")
transfer(){

return this.paymentsService.transfer();

}

}