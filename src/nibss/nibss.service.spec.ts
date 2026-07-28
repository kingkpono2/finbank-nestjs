import { BadRequestException } from '@nestjs/common';
import { NibssService } from './nibss.service';

describe('NibssService', () => {
  const service = new NibssService();

  it('returns a successful name enquiry response', () => {
    expect(service.nameEnquiry('0123456789', '044')).toMatchObject({
      responseCode: '00',
      accountNumber: '0123456789',
      bankCode: '044',
      accountName: 'Demo Beneficiary',
    });
  });

  it('requires account number and bank code', () => {
    expect(() => service.nameEnquiry('', '044')).toThrow(BadRequestException);
  });
});
