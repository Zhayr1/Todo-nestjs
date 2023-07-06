import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(user: User): Promise<User> {
    const salt = await bcrypt.genSalt();

    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
    user.role = 'USER';

    return await this.userService.save(user);
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const foundUser = await this.userService.findOne({ where: { username } });

      if (await bcrypt.compare(password, foundUser.password)) {
        const { password, ...result } = foundUser;
        return result;
      }
    } catch (e) {
      return null;
    }

    return null;
  }
  async login(user: User) {
    const payload = { username: user.username, sub: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
