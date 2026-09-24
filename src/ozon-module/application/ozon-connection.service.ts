import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { OzonStatus, type OzonStatusType } from './ozon-status.js';

/**
 * Проверка кредов магазина против реального Ozon Seller API.
 */
@Injectable()
export class OzonConnectionService {
  /**
   * ВАЖНО: axios-клиент НЕ в конструкторе, а в теле метода.
   * У OzonService (продукты) клиент один на модуль — потому что креды из .env.
   * Здесь креды у каждого магазина свои → клиент собирается на каждый запрос.
   * Это же ждёт OzonService в фазе 4.
   */
  async checkCredentials(
    clientId: string,
    apiKey: string,
  ): Promise<OzonStatusType> {
    try {
      await axios.post(
        'https://api-seller.ozon.ru/v1/seller/info',
        {},
        {
          method: 'POST',
          headers: { 'Client-Id': clientId, 'Api-Key': apiKey },
        },
      );
      return OzonStatus.Connected;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          return OzonStatus.AuthError;
        }
      }

      return OzonStatus.Unavailable;
    }
  }
}
