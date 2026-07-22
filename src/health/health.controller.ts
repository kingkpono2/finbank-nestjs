import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {

@Get()

health(){

return{

status:'UP',

application:'FinBank Pro',

timestamp:new Date(),

};

}

}