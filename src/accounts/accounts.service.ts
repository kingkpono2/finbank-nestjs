import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account-dto';
import { Account } from './entities/account.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
    private readonly redisService: RedisService,
  ) {}

  private generateAccountNumber(): string {
    return `20${Math.floor(100000000 + Math.random() * 900000000)}`;
  }

  async findByAccountNumber(accountNumber: string) {
    const key = `account:${accountNumber}`;
    const cached = await this.redisService.get<Account>(key);

    if (cached) {
      console.log('Redis Cache HIT');
      return cached;
    }

    console.log('Redis Cache MISS');

    const account = await this.repository.findOne({
      where: {
        accountNumber,
      },
    });

    if (account) {
      await this.redisService.set(key, account, 60);
    }

    return account;
  }

  async findMine(userId: string) {
    return this.repository.find({
      where: {
        owner: {
          id: userId,
        },
      },
      relations: {
        owner: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async create(dto: CreateAccountDto, owner: User) {
    const account = this.repository.create({
      accountNumber: this.generateAccountNumber(),
      type: dto.type,
      balance: dto.initialBalance ?? 0,
      owner,
    });

    return this.repository.save(account);
  }
}
