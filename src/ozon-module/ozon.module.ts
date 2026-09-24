import { Module } from '@nestjs/common';
import { OzonService } from './application/ozon.service.js';
import { OzonConnectionService } from './application/ozon-connection.service.js';
import { StoresService } from './application/stores.service.js';
import { StoresRepository } from './infrastructure/stores.repository.js';
import { AesEncryptionService } from '../core/application/aes-encryption.service.js';
import { OzonController } from './infrastructure/ozon.controller.js';
import { StoresController } from './api/stores.controller.js';

@Module({
  providers: [
    OzonService,
    OzonConnectionService,
    StoresService,
    StoresRepository,
    AesEncryptionService,
  ],
  controllers: [OzonController, StoresController],
})
export class OzonModule {}
