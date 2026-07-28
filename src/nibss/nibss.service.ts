import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class NibssService {
  nameEnquiry(accountNumber: string, bankCode: string) {
    if (!accountNumber || !bankCode) {
      throw new BadRequestException('accountNumber and bankCode are required');
    }

    return {
      responseCode: '00',
      sessionId: `NIBSS-${Date.now()}`,
      bankCode,
      accountNumber,
      accountName: 'Demo Beneficiary',
      kycLevel: '2',
    };
  }
}
