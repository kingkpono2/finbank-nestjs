import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NibssService } from './nibss.service';

@ApiTags('NIBSS mock')
@Controller('nibss')
export class NibssController {
  constructor(private readonly nibssService: NibssService) {}

  @Get('name-enquiry')
  nameEnquiry(
    @Query('accountNumber') accountNumber: string,
    @Query('bankCode') bankCode: string,
  ) {
    return this.nibssService.nameEnquiry(accountNumber, bankCode);
  }
}
