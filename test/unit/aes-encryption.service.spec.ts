import { AesEncryptionService } from '../../src/core/application/aes-encryption.service.js';

/**
 * Юнит-тесты AesEncryptionService.
 *
 * Герметичность: ключ задаётся самим тестом и восстанавливается после —
 * результат не зависит от содержимого .env разработчика.
 * Ни БД, ни Nest, ни сети — только класс и node:crypto.
 */

// Детерминированный ключ ровно 32 байта (256 бит) в base64
const VALID_KEY = Buffer.alloc(32, 42).toString('base64');

describe('AesEncryptionService (unit)', () => {
  let service: AesEncryptionService;
  const originalKey = process.env.APP_ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.APP_ENCRYPTION_KEY = VALID_KEY;
    service = new AesEncryptionService();
  });

  afterAll(() => {
    if (originalKey === undefined) {
      delete process.env.APP_ENCRYPTION_KEY;
    } else {
      process.env.APP_ENCRYPTION_KEY = originalKey;
    }
  });

  describe('шифрование ↔ расшифрование', () => {
    it.each([
      ['латиница', 'simple-secret'],
      ['кириллица и эмодзи', 'ключ-с-кириллицей-и-эмодзи-🔑'],
      ['512 символов', 'x'.repeat(512)],
      ['пустая строка', ''],
    ])('roundtrip: %s — восстанавливается', (_label, secret) => {
      expect(service.decryptSecret(service.encryptSecret(secret))).toBe(secret);
    });
  });

  it('один и тот же секрет даёт разный упакованный вид (свежий iv на каждое шифрование)', () => {
    const first = service.encryptSecret('same-secret');
    const second = service.encryptSecret('same-secret');

    expect(first).not.toBe(second);
  });

  describe('целостность (GCM-тег ловит подмену)', () => {
    // Подменяем на уровне БАЙТОВ (декод → инверсия → код),
    // а не символов base64: последний символ бывает набивкой '=',
    // его смена не меняет байтов, и подмена остаётся невидимой
    const tamper = (part: string) => {
      const bytes = Buffer.from(part, 'base64');
      bytes[bytes.length - 1] ^= 0xff;
      return bytes.toString('base64');
    };

    it('подменённый ciphertext → ошибка', () => {
      const [iv, tag, data] = service.encryptSecret('secret').split(':');

      expect(() =>
        service.decryptSecret(`${iv}:${tag}:${tamper(data)}`),
      ).toThrow();
    });

    it('подменённый тег → ошибка', () => {
      const [iv, tag, data] = service.encryptSecret('secret').split(':');

      expect(() =>
        service.decryptSecret(`${iv}:${tamper(tag)}:${data}`),
      ).toThrow();
    });

    it('подменённый iv → ошибка', () => {
      const [iv, tag, data] = service.encryptSecret('secret').split(':');

      expect(() =>
        service.decryptSecret(`${tamper(iv)}:${tag}:${data}`),
      ).toThrow();
    });
  });

  describe('битый упакованный вход', () => {
    it('строка без двоеточий → понятная ошибка формата', () => {
      expect(() => service.decryptSecret('garbage')).toThrow(/format/);
    });

    it('две части вместо трёх → понятная ошибка формата', () => {
      expect(() => service.decryptSecret('only:two')).toThrow(/format/);
    });
  });

  describe('конструктор (валидация ключа)', () => {
    afterEach(() => {
      process.env.APP_ENCRYPTION_KEY = VALID_KEY;
    });

    it('ключ отсутствует → приложение падает на старте с внятной причиной', () => {
      delete process.env.APP_ENCRYPTION_KEY;

      expect(() => new AesEncryptionService()).toThrow(/No encryption key/);
    });

    it.each([31, 33])('ключ %i байт вместо 32 → падает на старте', (bytes) => {
      process.env.APP_ENCRYPTION_KEY = Buffer.alloc(bytes, 1).toString('base64');

      expect(() => new AesEncryptionService()).toThrow(/32 bytes/);
    });
  });
});
