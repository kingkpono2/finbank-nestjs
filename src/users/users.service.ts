import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(user: Partial<User>) {
    const entity = this.repository.create(user);
    return this.repository.save(entity);
  }

  async findByEmail(email: string) {
    return this.repository.findOne({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.repository.findOne({
      where: { id },
    });
  }

 

async updateRefreshToken(
    id:string,
    refreshToken:string|null,
){
    await this.repository.update(id,{
        refreshToken,
    });
}
}