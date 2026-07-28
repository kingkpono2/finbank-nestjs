import { Controller, Get, Query } from '@nestjs/common';

@Controller('mock')
export class MockController {
  @Get('name-enquiry')
  nameEnquiry(
    @Query('accountNumber') accountNumber: string,
    @Query('bankCode') bankCode: string,
  ) {
    return {
      responseCode: '00',
      accountNumber,
      bankCode,
      accountName: 'John Doe',
    };
  }
}
