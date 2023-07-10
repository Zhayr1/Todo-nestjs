import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants/constants';
import { UserService } from './services/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException();
    }

    const foundUser = await this.userService.findOne({
      where: {
        id: payload.id,
        username: payload.username,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException();
    }
    return {
      id: foundUser.id,
      username: foundUser.username,
      role: foundUser.role,
    };
  }
}
