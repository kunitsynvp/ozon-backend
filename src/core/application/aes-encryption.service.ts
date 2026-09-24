import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Обратимое шифрование секретов (AES-256-GCM) — для apiKey магазинов.
 *
 * НЕ путать с EncryptionService (bcrypt) — пароли хэшируются необратимо,
 * потому что их нужно только СРАВНИТЬ. ApiKey нужно ВОССТАНОВИТЬ,
 * чтобы подставлять в заголовки каждого запроса к Ozon.
 *
 * Формат хранения: "iv:tag:ciphertext", каждая часть — base64.
 * - iv (initialization vector) — соль шифрования, случайная на каждый шифр
 * - tag — подпись целостности GCM: если данные подменят, decrypt кинет ошибку
 * - ciphertext — сами зашифрованные данные
 */
@Injectable()
export class AesEncryptionService {
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.APP_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('No encryption key provided in env files');
    }

    this.key = Buffer.from(encryptionKey, 'base64');
    if (this.key.length !== 32) {
      throw new Error('APP_ENCRYPTION_KEY must be 32 bytes in base64');
    }
  }

  encryptSecret(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plain, 'utf-8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
  }

  decryptSecret(packed: string): string {
    const [ivPart, tagPart, dataPart] = packed.split(':');
    if (
      typeof ivPart !== 'string' ||
      typeof tagPart !== 'string' ||
      typeof dataPart !== 'string'
    ) {
      throw new Error(
        'Upcoming string secret must be a string with format "string:string:string"',
      );
    }
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(ivPart, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64'));

    return Buffer.concat([
      decipher.update(dataPart, 'base64'),
      decipher.final(),
    ]).toString('utf-8');
  }
}
