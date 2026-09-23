import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './jwt-payload.type.js';
import { RequestWithUser } from '../../core/types/request-with-user.type.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const header = request.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      return false;
    }

    const token = header.split(' ')[1];
    let payload: JwtPayloadType;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayloadType>(token);
    } catch {
      return false;
    }

    request.userId = payload.userId;
    return true;
  }
}
