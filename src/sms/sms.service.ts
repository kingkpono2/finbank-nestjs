import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {

private logger=new Logger(SmsService.name);

send(phone:string,message:string){

this.logger.log(
`SMS TO ${phone}: ${message}`,
);

return{

status:"QUEUED",

};

}

}