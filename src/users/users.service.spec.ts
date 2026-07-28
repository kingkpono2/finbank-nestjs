import { UsersService } from './users.service';

describe('UsersService', () => {
  it('creates a user through the repository', async () => {
    const repository = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: 'user-1', ...data })),
    };
    const service = new UsersService(repository as any);

    await expect(
      service.create({ email: 'demo@finbank.test' } as any),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'demo@finbank.test',
    });
  });
});
