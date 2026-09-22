import { Module } from '@nestjs/common';
import { OzonService } from './application/ozon.service.js';
import { OzonController } from './infrastructure/ozon.controller.js';

@Module({
  providers: [OzonService],
  controllers: [OzonController],
})
export class OzonModule {}
