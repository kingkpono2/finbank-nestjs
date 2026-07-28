import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SmsService } from './sms.service';

@ApiTags('mock sms')
@Controller('mock/sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  @ApiBody({
    schema: {
      example: {
        phone: '+2348012345678',
        message: 'Your FinBank demo transfer of NGN 2,500.00 was successful.',
      },
    },
  })
  send(@Body() body: any) {
    return this.smsService.send(body.phone, body.message, body.correlationId);
  }
}
