import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from '../../../core/types/request-with-user.type.js';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedException('User unauthorized');
    }

    return userId;
  },
);
