import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly eventsService: EventsService,
  ) {}

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.usersService.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      phone: dto.phone?.trim(),
      password: hashedPassword,
    });

    try {
      await this.eventsService.publishUserRegistered({
        userId: createdUser.id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        phone: createdUser.phone,
        timestamp: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('User registration event publish failed:', message);
    }

    const { password, ...safeUser } = createdUser;

    return safeUser;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(
      email.trim().toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.refreshToken) {
      throw new UnauthorizedException();
    }
    const valid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!valid) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user);

    const hash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, hash);

    return tokens;
  }

  async logout(id: string) {
    await this.usersService.updateRefreshToken(id, null);

    return {
      message: 'Logged out',
    };
  }
}
