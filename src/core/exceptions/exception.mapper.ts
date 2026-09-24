import { HttpException } from '@nestjs/common';

export type ExceptionResponseType = {
  statusCode: number;
  message: string;
};

export function mapExceptionToResponse(
  exception: unknown,
): ExceptionResponseType {
  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    const body = exception.getResponse(); // string | {message?: string | string[]}

    if (typeof body === 'string') {
      return { statusCode, message: body };
    }

    if (typeof body === 'object' && !('message' in body)) {
      return { statusCode, message: 'Some error occurred.' };
    }

    if (typeof body === 'object' && 'message' in body) {
      if (typeof body.message === 'string') {
        return { statusCode, message: body.message };
      }
      if (Array.isArray(body.message)) {
        return { statusCode, message: body.message.join(', ') };
      }
    }
  }
  return { statusCode: 500, message: 'Internal Server Error' };
}
