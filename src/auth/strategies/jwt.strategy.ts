import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log("JWT Strategy initialized with secret:", process.env.JWT_SECRET);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-finbank-key',
    });

  }

  async validate(payload: any) {
      console.log('JWT VALIDATED', payload);

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}