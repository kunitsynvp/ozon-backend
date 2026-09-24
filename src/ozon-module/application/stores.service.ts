import { Injectable } from '@nestjs/common';
import { AesEncryptionService } from '../../core/application/aes-encryption.service.js';
import { StoresRepository } from '../infrastructure/stores.repository.js';
import { OzonConnectionService } from './ozon-connection.service.js';
import { OzonStatus } from './ozon-status.js';
import type { CreateStoreInputDto } from '../api/dto/create-store-input.dto.js';
import { CreateStoreOutputDto, StoreDto } from '../api/dto/store-output.dto.js';
import type { PlainStore } from '../../prisma/types/prisma.types.js';

@Injectable()
export class StoresService {
  constructor(
    private readonly ozonConnectionService: OzonConnectionService,
    private readonly aesEncryptionService: AesEncryptionService,
    private readonly storesRepository: StoresRepository,
  ) {}

  async createStore(
    userId: string,
    dto: CreateStoreInputDto,
  ): Promise<CreateStoreOutputDto> {
    const { clientId, apiKey, name } = dto;
    const status = await this.ozonConnectionService.checkCredentials(
      dto.clientId,
      dto.apiKey,
    );
    if (status !== OzonStatus.Connected) {
      return { status, store: null };
    }
    const apiKeyEncrypted = this.aesEncryptionService.encryptSecret(apiKey);
    const createdStore = await this.storesRepository.upsertByClientId(userId, {
      clientId,
      apiKeyEncrypted,
      name,
    });
    return { status, store: this.toStoreDto(createdStore) };
  }

  async getStores(userId: string): Promise<StoreDto[]> {
    const stores = await this.storesRepository.findByUserId(userId);
    return stores.map((store) => this.toStoreDto(store));
  }

  /** PlainStore (строка БД) → StoreDto (витрина без секретов). */
  private toStoreDto(store: PlainStore): StoreDto {
    const { id, name, clientId, status, isActive, createdAt } = store;
    return {
      id,
      name,
      clientId,
      status,
      isActive,
      // Temporal.Instant (новый API дат от Prisma) → классический Date для JSON
      createdAt: new Date(createdAt.epochMilliseconds),
    };
  }
}
