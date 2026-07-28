import { PaymentsController } from './payments.controller';

describe('PaymentsController', () => {
  it('delegates transfer simulation to PaymentsService', () => {
    const paymentsService = {
      transfer: jest.fn().mockReturnValue({ status: 'SUCCESS' }),
    };
    const controller = new PaymentsController(paymentsService);

    expect(controller.transfer()).toEqual({ status: 'SUCCESS' });
    expect(paymentsService.transfer).toHaveBeenCalled();
  });
});
