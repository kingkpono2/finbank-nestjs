import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('returns a mock gateway reference and allowed status', () => {
    const service = new PaymentsService();
    const result = service.transfer();

    expect(result.gatewayReference).toMatch(/^FLW-/);
    expect(['SUCCESS', 'FAILED', 'PENDING']).toContain(result.status);
  });
});
