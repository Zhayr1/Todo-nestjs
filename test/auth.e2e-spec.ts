import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    req = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    const route = '/auth/signup';

    it('should return status 201', async () => {
      const data = {
        username: 'test123',
        password: 'Abc12345@',
      };

      const { body } = await req
        .post(route)
        .send(data)
        .expect(HttpStatus.CREATED);

      expect(body).toEqual({
        status: 201,
        message: 'User created successfully',
      });
    });
  });

  describe('POST /auth/login', () => {
    const route = '/auth/login';

    const username = 'fakeUserName';
    const password = 'testPassword123';

    beforeAll(async () => {
      await req.post('/auth/signup').send({ username, password });
    });

    it('should return 200 and an accessToken', async () => {
      return req
        .post(route)
        .send({ username, password })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual({ accessToken: expect.any(String) });
        });
    });

    it('should return 401 if the credentials are invalid', async () => {
      return req
        .post(route)
        .send({ username: 'invalidUser', password: 'invalidPassword' })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });
  });
});
