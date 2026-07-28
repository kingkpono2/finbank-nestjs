import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async send(phone: string, message: string, correlationId?: string) {
    const provider = process.env.SMS_PROVIDER || 'mock';

    if (provider === 'termii' && process.env.TERMII_API_KEY) {
      return this.sendWithTermii(phone, message, correlationId);
    }

    this.logger.log(
      JSON.stringify({
        provider: 'mock',
        phone,
        message,
        correlationId,
      }),
    );

    return {
      status: 'QUEUED',
      provider: 'MOCK',
      correlationId,
    };
  }

  private async sendWithTermii(
    phone: string,
    message: string,
    correlationId?: string,
  ) {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        from: process.env.TERMII_SENDER_ID || 'FinBank',
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
      }),
    });

    const body = await response.text();

    if (!response.ok) {
      throw new Error(`Termii SMS failed (${response.status}): ${body}`);
    }

    return {
      status: 'QUEUED',
      provider: 'TERMII',
      correlationId,
      response: body ? JSON.parse(body) : {},
    };
  }
}
