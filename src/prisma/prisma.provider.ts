import { Provider } from '@nestjs/common';
import { db } from './db.js';

// Токен, по которому NestJS будет находить клиент
export const PRISMA_CLIENT = 'PRISMA_CLIENT';

// Провайдер значения: просто отдаем готовый объект db
export const PrismaProvider: Provider = {
  provide: PRISMA_CLIENT,
  useValue: db, // <-- Внедряем готовое значение, а не класс
};
