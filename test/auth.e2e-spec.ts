import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/core/configuration/configure-app.js';

/**
 * E2E-тесты авторизации.
 *
 * Требования к окружению:
 *  - поднятый Postgres из docker-compose (docker compose up -d)
 *  - валидный .env (JWT_SECRET, DATABASE_URL и т.д.)
 *
 * Тесты генерируют уникальный email на каждый прогон,
 * поэтому их можно запускать повторно без чистки БД.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app); // тот же конвейер, что и в main.ts: pipes, фильтры
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueEmail = () =>
    `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.ru`;

  describe('POST /auth/register', () => {
    it('новый пользователь → 204 без тела', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail(), password: 'secret123' });

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('повторная регистрация того же email → 400', async () => {
      const email = uniqueEmail();
      const payload = { email, password: 'secret123' };

      await request(app.getHttpServer()).post('/auth/register').send(payload);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('This email is already registered');
    });

    it('кривой email → 400 от ValidationPipe со списком ошибок', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'secret123' });

      expect(response.status).toBe(400);
      // мапер склеивает массив ValidationPipe в одну строку
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('POST /auth/login', () => {
    it('верные креды → 200 и токен', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'secret123' });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'secret123' });

      expect(response.status).toBe(200);
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('неверный пароль → 401', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'secret123' });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('несуществующий email → 401 с той же фразой (анти-enumeration)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: uniqueEmail(), password: 'whatever123' });

      expect(response.status).toBe(401);
      // контракт: сообщение то же, что и при неверном пароле —
      // по ответу нельзя понять, существует ли email
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
