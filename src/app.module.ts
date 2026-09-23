import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { OzonModule } from './ozon-module/ozon.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [OzonModule, PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
