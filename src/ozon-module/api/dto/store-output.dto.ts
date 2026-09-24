import type { OzonStatusType } from '../../application/ozon-status.js';

/**
 * Витрина магазина для наружу.
 * ГЛАВНОЕ ПРАВИЛО: apiKey (даже зашифрованный) НИКОГДА не покидает бэкенд.
 */
export class StoreDto {
  id: string;
  name: string | null;
  clientId: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
}

export class CreateStoreOutputDto {
  status: OzonStatusType;
  store: StoreDto | null; // null, когда проверка не прошла и мы ничего не сохранили
}
