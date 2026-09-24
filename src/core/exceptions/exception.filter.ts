import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { mapExceptionToResponse } from './exception.mapper.js';

@Catch() // пустые скобки = ловим ВСЁ, включая не-HttpException
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, message } = mapExceptionToResponse(exception);

    if (statusCode >= 500) {
      this.logger.error(exception);
    }

    response.status(statusCode).json({ statusCode, message });
  }
}
