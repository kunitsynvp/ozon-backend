import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '../../prisma/db.js';
import { PRISMA_CLIENT } from '../../prisma/prisma.provider.js';
import type { PlainStore } from '../../prisma/types/prisma.types.js';
import { OzonStatus } from '../application/ozon-status.js';

@Injectable()
export class StoresRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  /**
   * Создать или обновить магазин по паре (userId, clientId):
   * тот же clientId у того же пользователя = переподключение с новым ключом,
   * а не второй магазин. Стиль запросов — по образцу auth.repository.
   */
  async upsertByClientId(
    userId: string,
    data: { clientId: string; apiKeyEncrypted: string; name?: string },
  ): Promise<PlainStore> {
    // Попытка №1: обновить. null = строки не было — это не ошибка, это ветка create
    const updated = await this.prisma.orm.public.Store.where({
      userId,
      clientId: data.clientId,
    }).update({ name: data.name, apiKeyEncrypted: data.apiKeyEncrypted });

    if (updated) return updated;

    // Строки не было — создаём. Первый магазин пользователя становится активным
    const userStores = await this.findByUserId(userId);
    return this.prisma.orm.public.Store.create({
      name: data.name,
      clientId: data.clientId,
      apiKeyEncrypted: data.apiKeyEncrypted,
      userId,
      status: OzonStatus.Connected,
      isActive: userStores.length === 0, // ← сейчас у тебя isActive: true всегда —
    }); //   три магазина = три «активных»
  }

  async findByUserId(userId: string): Promise<PlainStore[]> {
    return this.prisma.orm.public.Store.where({ userId: userId }).all();
  }
}
