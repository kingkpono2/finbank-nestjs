import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('registers a new user and publishes an event', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhone: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'user-1',
        firstName: 'Kpono-Abasi',
        lastName: 'Akpabio',
        email: 'demo@finbank.test',
        phone: '+2348012345678',
        password: 'hashed',
      }),
    };
    const eventsService = {
      publishUserRegistered: jest.fn().mockResolvedValue(undefined),
    };
    const service = new AuthService(
      usersService as any,
      {} as any,
      eventsService as any,
    );

    const result = await service.register({
      firstName: 'Kpono-Abasi',
      lastName: 'Akpabio',
      email: 'DEMO@FINBANK.TEST',
      phone: '+2348012345678',
      password: 'Password1',
    });

    expect(result).not.toHaveProperty('password');
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'demo@finbank.test' }),
    );
    expect(eventsService.publishUserRegistered).toHaveBeenCalled();
  });
});
