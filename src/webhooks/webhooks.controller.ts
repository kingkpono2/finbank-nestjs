import { Body, Controller, Post } from '@nestjs/common';

@Controller('webhooks')
export class WebhooksController {

@Post('payment')
paymentWebhook(@Body() body:any){

console.log("Webhook Received");

console.log(body);

return{

received:true,

};

}

}