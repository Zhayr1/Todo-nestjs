import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const jwtConstants = {
          secret: process.env.JWT_SECRET,
          expirationTime: process.env.JWT_EXPIRATION_TIME,
        };
        return {
          secret: jwtConstants.secret,
          signOptions: { expiresIn: jwtConstants.expirationTime },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, LocalStrategy],
  exports: [UserService, TypeOrmModule],
})
export class AuthModule {}
