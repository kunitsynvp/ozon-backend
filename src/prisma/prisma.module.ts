import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaProvider } from './prisma.provider.js';
import { db } from './db.js';

@Global()
@Module({
  providers: [PrismaProvider],
})
export class PrismaModule implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    // Закрываем соединение при остановке приложения (SIGTERM/SIGINT)
    await db.close();
    console.log(`Prisma disconnected on signal: ${signal}`);
  }
}
