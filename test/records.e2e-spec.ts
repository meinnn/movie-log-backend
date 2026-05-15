import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_USER = {
  email: 'records-e2e@test.com',
  password: 'password123!',
  nickname: 'e2e-tester',
};

const OTHER_USER = {
  email: 'records-e2e-other@test.com',
  password: 'password123!',
  nickname: 'e2e-other',
};

describe('Records (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let otherToken: string;
  let userId: number;
  let otherUserId: number;
  let recordId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await request(app.getHttpServer()).post('/auth/signup').send(TEST_USER);
    await request(app.getHttpServer()).post('/auth/signup').send(OTHER_USER);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    accessToken = (loginRes.body as { accessToken: string }).accessToken;

    const otherLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: OTHER_USER.email, password: OTHER_USER.password });
    otherToken = (otherLoginRes.body as { accessToken: string }).accessToken;

    const user = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });
    const otherUser = await prisma.user.findUnique({
      where: { email: OTHER_USER.email },
    });
    userId = user!.id;
    otherUserId = otherUser!.id;
  });

  afterAll(async () => {
    await prisma.record.deleteMany({ where: { userId } });
    await prisma.record.deleteMany({ where: { userId: otherUserId } });
    await prisma.user.deleteMany({
      where: { email: { in: [TEST_USER.email, OTHER_USER.email] } },
    });
    await app.close();
  });

  describe('POST /records', () => {
    it('토큰 없이 요청하면 401을 반환한다', () => {
      return request(app.getHttpServer())
        .post('/records')
        .send({ tmdbMovieId: 1, watchedAt: '2026-04-01' })
        .expect(401);
    });

    it('유효하지 않은 body는 400을 반환한다', () => {
      return request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ tmdbMovieId: 1, watchedAt: '2026-04-01', rating: 6 })
        .expect(400);
    });

    it('기록을 생성하고 201을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tmdbMovieId: 100,
          watchedAt: '2026-04-15',
          rating: 4.5,
          memo: '재미있었다',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        tmdbMovieId: 100,
        userId,
        rating: 4.5,
        memo: '재미있었다',
      });
      recordId = (res.body as { id: number }).id;
    });
  });

  describe('GET /records', () => {
    it('토큰 없이 요청하면 401을 반환한다', () => {
      return request(app.getHttpServer())
        .get('/records?startDate=2026-04-01&endDate=2026-04-30')
        .expect(401);
    });

    it('날짜 범위 내 기록 목록을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .get('/records?startDate=2026-04-01&endDate=2026-04-30')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as { id: number }[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.some((r) => r.id === recordId)).toBe(true);
    });

    it('범위 밖 날짜 조회 시 빈 배열을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .get('/records?startDate=2026-03-01&endDate=2026-03-31')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /records/:id', () => {
    it('토큰 없이 요청하면 401을 반환한다', () => {
      return request(app.getHttpServer())
        .get(`/records/${recordId}`)
        .expect(401);
    });

    it('기록을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .get(`/records/${recordId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect((res.body as { id: number }).id).toBe(recordId);
    });

    it('존재하지 않는 id는 404를 반환한다', () => {
      return request(app.getHttpServer())
        .get('/records/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('다른 유저의 기록은 403을 반환한다', () => {
      return request(app.getHttpServer())
        .get(`/records/${recordId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('PATCH /records/:id', () => {
    it('토큰 없이 요청하면 401을 반환한다', () => {
      return request(app.getHttpServer())
        .patch(`/records/${recordId}`)
        .expect(401);
    });

    it('기록을 수정하고 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/records/${recordId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ memo: '수정된 메모' })
        .expect(200);

      expect((res.body as { memo: string }).memo).toBe('수정된 메모');
    });

    it('존재하지 않는 id는 404를 반환한다', () => {
      return request(app.getHttpServer())
        .patch('/records/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ memo: '수정' })
        .expect(404);
    });

    it('다른 유저의 기록은 403을 반환한다', () => {
      return request(app.getHttpServer())
        .patch(`/records/${recordId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ memo: '수정' })
        .expect(403);
    });
  });

  describe('DELETE /records/:id', () => {
    it('토큰 없이 요청하면 401을 반환한다', () => {
      return request(app.getHttpServer())
        .delete(`/records/${recordId}`)
        .expect(401);
    });

    it('존재하지 않는 id는 404를 반환한다', () => {
      return request(app.getHttpServer())
        .delete('/records/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('다른 유저의 기록은 403을 반환한다', () => {
      return request(app.getHttpServer())
        .delete(`/records/${recordId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    it('기록을 삭제하고 { id }를 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/records/${recordId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({ id: recordId });
    });
  });
});
