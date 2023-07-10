import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from '@/common/classes/generic-crud-controller';

export const GetUser = createParamDecorator(
  (data: 'id' | 'username' | 'role', ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();

    if (request && request.user) {
      return data ? request.user[data] : request.user;
    }
    console.log(request.user);
    throw new UnauthorizedException('Invalid Token');
  },
);
