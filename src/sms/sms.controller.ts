import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('mock/sms')
export class SmsController {

constructor(
private readonly smsService:SmsService,
){}

@Post()
send(@Body() body:any){

return this.smsService.send(
body.phone,
body.message,
);

}

}