import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller.js';
import { AuthService } from './application/auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { EncryptionService } from '../core/application/encryption.service.js';
import { AuthRepository } from './infrastructure/auth.repository.js';
import { AesEncryptionService } from '../core/application/aes-encryption.service.js';

@Module({
  imports: [
    JwtModule.register({
      global: true, //Сделали глобальным чтобы озон модуль получал его без лишних импортов
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d', //Пока нет рефреш токенов, это хорошее решение
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EncryptionService,
    AuthRepository,
    AesEncryptionService,
  ],
})
export class AuthModule {}
