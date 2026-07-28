import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('delegates registration to AuthService', async () => {
    const authService = {
      register: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };
    const controller = new AuthController(authService as any);

    await expect(
      controller.register({
        firstName: 'Kpono-Abasi',
        lastName: 'Akpabio',
        email: 'demo@finbank.test',
        password: 'Password1',
      } as any),
    ).resolves.toEqual({ id: 'user-1' });
    expect(authService.register).toHaveBeenCalled();
  });
});
