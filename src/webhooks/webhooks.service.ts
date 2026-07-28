import { BadRequestException, Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly redisService: RedisService) {}

  async processPaymentWebhook(params: {
    body: any;
    signature?: string;
    timestamp?: string;
    eventId?: string;
  }) {
    const { body, signature, timestamp, eventId } = params;

    if (!signature || !timestamp || !eventId) {
      return { verified: false, reason: 'Missing webhook security headers' };
    }

    const timestampMs = Number(timestamp);
    if (!Number.isFinite(timestampMs)) {
      return { verified: false, reason: 'Invalid webhook timestamp' };
    }

    const ageMs = Math.abs(Date.now() - timestampMs);
    if (ageMs > 5 * 60 * 1000) {
      return {
        verified: false,
        reason: 'Webhook timestamp is outside replay window',
      };
    }

    const replayKey = `webhook:payment:${eventId}`;
    const isNew = await this.redisService.setIfNotExists(
      replayKey,
      '1',
      10 * 60,
    );
    if (!isNew) {
      throw new BadRequestException('Duplicate webhook event');
    }

    const expected = this.sign(timestamp, body);
    if (!this.safeCompare(signature, expected)) {
      return { verified: false, reason: 'Invalid webhook signature' };
    }

    return {
      verified: true,
      received: true,
      eventId,
      provider: body.provider,
      reference: body.reference,
      status: body.status,
    };
  }

  sign(timestamp: string, body: any) {
    const secret = process.env.WEBHOOK_SECRET || 'local-webhook-secret';
    const payload = `${timestamp}.${JSON.stringify(body)}`;
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  private safeCompare(a: string, b: string) {
    const left = Buffer.from(a);
    const right = Buffer.from(b);

    if (left.length !== right.length) {
      return false;
    }

    return timingSafeEqual(left, right);
  }
}
