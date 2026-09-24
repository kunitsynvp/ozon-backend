import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/core/configuration/configure-app.js';
import { OzonConnectionService } from '../src/ozon-module/application/ozon-connection.service.js';
import { OzonStatus, type OzonStatusType } from '../src/ozon-module/application/ozon-status.js';

/**
 * E2E-тесты магазинов (/ozon/stores).
 *
 * ESM-нюанс: в ESM-режиме jest НЕ инжектит глобальный объект `jest`
 * (describe/it — инжектит, jest — нет), поэтому ВСЁ импортируется
 * из '@jest/globals' явно. Смешивать глобалы и импорты нельзя.
 *
 * Ключевой приём: OzonConnectionService подменяется моком через
 * overrideProvider — тесты НЕ ходят в реальный Ozon API. E2E проверяет
 * НАШУ логику (guard, маппинг статусов, сохранение, upsert),
 * а внешний мир заглушён на границе приложения.
 *
 * Требования: поднятый Postgres (docker compose up -d), валидный .env.
 * Каждый тест регистрирует своего пользователя — изоляция без чистки БД.
 */
describe('Ozon stores (e2e)', () => {
  let app: INestApplication;
  const ozonConnectionMock = { checkCredentials: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OzonConnectionService)
      .useValue(ozonConnectionMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app); // тот же конвейер, что и в main.ts
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    ozonConnectionMock.checkCredentials.mockReset();
  });

  const uniqueEmail = () =>
    `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.ru`;

  /** Полный e2e-путь к токену: регистрация + логин через реальные эндпоинты. */
  const createUserAndGetToken = async (): Promise<string> => {
    const credentials = { email: uniqueEmail(), password: 'secret123' };
    await request(app.getHttpServer()).post('/auth/register').send(credentials);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials);
    return login.body.token as string;
  };

  const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

  describe('защита JwtAuthGuard', () => {
    it('без токена → 401', async () => {
      const response = await request(app.getHttpServer()).get('/ozon/stores');
      expect(response.status).toBe(401);
    });

    it('с мусорным токеном → 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/ozon/stores')
        .set(authHeaders('not-a-jwt'));
      expect(response.status).toBe(401);
    });
  });

  describe('GET /ozon/stores', () => {
    it('у нового пользователя — пустой список', async () => {
      const token = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .get('/ozon/stores')
        .set(authHeaders(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /ozon/stores', () => {
    it('проверка успешна → 200, магазин сохранён и активен, секрет не утёк', async () => {
      ozonConnectionMock.checkCredentials.mockResolvedValue(OzonStatus.Connected);
      const token = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .post('/ozon/stores')
        .set(authHeaders(token))
        .send({
          name: 'Мой магазин',
          clientId: 'client-1',
          apiKey: 'super-secret-api-key',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('connected');
      expect(response.body.store).toMatchObject({
        clientId: 'client-1',
        name: 'Мой магазин',
        isActive: true, // первый магазин пользователя — активный
      });
      // ГЛАВНАЯ проверка безопасности: сырой apiKey не встречается нигде в ответе
      expect(JSON.stringify(response.body)).not.toContain('super-secret-api-key');

      const list = await request(app.getHttpServer())
        .get('/ozon/stores')
        .set(authHeaders(token));
      expect(list.body).toHaveLength(1);
    });

    it.each([
      ['authError', OzonStatus.AuthError],
      ['unavailable', OzonStatus.Unavailable],
    ])(
      'проверка вернула %s → статус отдан, магазин НЕ сохраняется',
      async (_label, status: OzonStatusType) => {
        ozonConnectionMock.checkCredentials.mockResolvedValue(status);
        const token = await createUserAndGetToken();

        const response = await request(app.getHttpServer())
          .post('/ozon/stores')
          .set(authHeaders(token))
          .send({ clientId: 'client-x', apiKey: 'some-key' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status, store: null });

        const list = await request(app.getHttpServer())
          .get('/ozon/stores')
          .set(authHeaders(token));
        expect(list.body).toHaveLength(0); // мёртвые креды не сохраняем
      },
    );

    it('повторное подключение того же clientId → upsert, а не дубликат', async () => {
      ozonConnectionMock.checkCredentials.mockResolvedValue(OzonStatus.Connected);
      const token = await createUserAndGetToken();

      await request(app.getHttpServer())
        .post('/ozon/stores')
        .set(authHeaders(token))
        .send({ name: 'Старое имя', clientId: 'client-dup', apiKey: 'key-1' });

      const second = await request(app.getHttpServer())
        .post('/ozon/stores')
        .set(authHeaders(token))
        .send({ name: 'Новое имя', clientId: 'client-dup', apiKey: 'key-2' });

      expect(second.status).toBe(200);

      const list = await request(app.getHttpServer())
        .get('/ozon/stores')
        .set(authHeaders(token));
      expect(list.body).toHaveLength(1); // один магазин, не два
      expect(list.body[0].name).toBe('Новое имя'); // и он обновлён
    });

    it('второй магазин не отбирает активность у первого', async () => {
      ozonConnectionMock.checkCredentials.mockResolvedValue(OzonStatus.Connected);
      const token = await createUserAndGetToken();

      for (const clientId of ['store-a', 'store-b']) {
        await request(app.getHttpServer())
          .post('/ozon/stores')
          .set(authHeaders(token))
          .send({ clientId, apiKey: 'key' });
      }

      const list = await request(app.getHttpServer())
        .get('/ozon/stores')
        .set(authHeaders(token));

      expect(list.body).toHaveLength(2);
      const active = list.body.filter((store: { isActive: boolean }) => store.isActive);
      expect(active).toHaveLength(1);
      expect(active[0].clientId).toBe('store-a');
    });

    it('кривое тело → 400 от ValidationPipe, внешний сервис не дёргается', async () => {
      const token = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .post('/ozon/stores')
        .set(authHeaders(token))
        .send({ clientId: '' }); // apiKey отсутствует, clientId пустой

      expect(response.status).toBe(400);
      expect(ozonConnectionMock.checkCredentials).not.toHaveBeenCalled(); // pipe отсёк до сервиса
    });
  });
});
