import { Module } from '@nestjs/common';
import { OzonService } from './application/ozon.service';
import { OzonController } from './infrastructure/ozon.controller';

@Module({
  providers: [OzonService],
  controllers: [OzonController],
})
export class OzonModule {}
