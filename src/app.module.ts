import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { TodoModule } from '@/todo/todo.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const env = configService.get('NODE_ENV');
        const isTest = env === 'test';

        if (isTest) {
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            logging: false,
            synchronize: true,
          };
        }
        return {
          type: 'sqlite',
          database: 'todoDB',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    TodoModule,
  ],
})
export class AppModule {}
