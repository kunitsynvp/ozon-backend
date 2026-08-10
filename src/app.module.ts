import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OzonModule } from './ozon-module/ozon.module';

@Module({
  imports: [OzonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
