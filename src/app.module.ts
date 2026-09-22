import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { OzonModule } from './ozon-module/ozon.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [OzonModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
