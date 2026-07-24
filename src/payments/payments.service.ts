import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {

  transfer(){

    const statuses=[
      "SUCCESS",
      "FAILED",
      "PENDING",
    ];

    return{

      gatewayReference:
      "FLW-"+Date.now(),

      status:
      statuses[Math.floor(Math.random()*3)],

    };

  }

}