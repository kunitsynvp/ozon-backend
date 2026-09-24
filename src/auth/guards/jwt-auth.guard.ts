import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './jwt-payload.type.js';
import { RequestWithUser } from '../../core/types/request-with-user.type.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadType>(
        header.split(' ')[1],
      );

      request.userId = payload.userId;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
