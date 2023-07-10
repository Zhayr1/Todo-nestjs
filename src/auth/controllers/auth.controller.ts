import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '../entities/user.entity';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SignUpDto } from '../dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private usersService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    await this.usersService.signup(signUpDto);
    return {
      status: HttpStatus.CREATED,
      message: 'User created successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: { user: User }) {
    return this.usersService.login(req.user);
  }
}
