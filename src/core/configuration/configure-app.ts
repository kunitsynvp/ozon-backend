import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../exceptions/exception.filter.js';
import cookieParser from 'cookie-parser';

export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(cookieParser());
  // сюда же будущие: app.enableCors(...), /api префикс, helmet и т.д.
}
