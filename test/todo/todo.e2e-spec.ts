import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { UserStub } from '../stubs/user.stub';
import { EntityManager } from 'typeorm';
import { User } from '@/auth/entities/user.entity';
import { Todo } from '@/todo/entities/todo.entity';
import { TodoStub } from '../stubs/todo.stub';
import { CreateTodoDto } from '@/todo/dto/create-todo.dto';

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let entityManager: EntityManager;
  let req: request.SuperTest<request.Test>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    entityManager = moduleFixture.get<EntityManager>(EntityManager);

    req = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  let authHeaders;
  let authHeaders2;

  let user: User;
  let user2: User;

  beforeAll(async () => {
    user = await entityManager.save(
      User,
      UserStub({ username: 'test123', password: 'test123' }),
    );

    user2 = await entityManager.save(
      User,
      UserStub({ username: 'test123Alter', password: 'test123' }),
    );

    const resp = await req
      .post('/auth/login')
      .send({ username: 'test123', password: 'test123' });

    const token = resp.body.accessToken;

    authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const resp2 = await req
      .post('/auth/login')
      .send({ username: 'test123Alter', password: 'test123' });

    const token2 = resp2.body.accessToken;

    authHeaders2 = {
      Authorization: `Bearer ${token2}`,
    };

    await entityManager.save(Todo, [
      TodoStub({ title: 'test2', description: 'Todo 2 for test', user }),
      TodoStub({ title: 'test', description: 'Todo 1', user }),
      TodoStub({
        title: 'test user 2',
        description: 'Todo 3 for user 2',
        user: user2,
      }),
    ]);
  });

  describe('GET /todo', () => {
    const route = '/todo';

    it('should return status 200 and a list of todos', async () => {
      const { body } = await req
        .get(route)
        .set(authHeaders)
        .expect(HttpStatus.OK);

      expect(body.length).toEqual(2);

      expect(body).toEqual([
        {
          description: 'Todo 2 for test',
          id: expect.any(String),
          title: 'test2',
        },
        {
          description: 'Todo 1',
          id: expect.any(String),
          title: 'test',
        },
      ]);
    });

    it('should return a unique list of todos for each user', async () => {
      const { body } = await req
        .get(route)
        .set(authHeaders2)
        .expect(HttpStatus.OK);

      expect(body.length).toEqual(1);

      expect(body).toEqual([
        {
          description: 'Todo 3 for user 2',
          id: expect.any(String),
          title: 'test user 2',
        },
      ]);
    });

    it('should return 401 if the user is not authenticated', () => {
      return req.get(route).expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /todo/:id', () => {
    const route = (id: number | string) => `/todo/${id}`;

    it('should return 200 and a todo', async () => {
      const todo = await entityManager.save(
        Todo,
        TodoStub({ title: 'test123', user }),
      );

      return req
        .get(route(todo.id))
        .set(authHeaders)
        .expect(HttpStatus.OK)
        .expect({
          id: todo.id,
          title: todo.title,
          description: todo.description,
        });
    });

    it('should return 404 if the todo does not belong to the user', async () => {
      const todo = await entityManager.save(
        Todo,
        TodoStub({ title: 'test123', user: user2 }),
      );

      return req
        .get(route(todo.id))
        .set(authHeaders)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: 404,
          message: 'Todo not found',
          error: 'Not Found',
        });
    });

    it('should return 404 if the todo is not found', async () => {
      return req
        .get(route('impossibleMatch'))
        .set(authHeaders)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: 404,
          message: 'Todo not found',
          error: 'Not Found',
        });
    });

    it('should return 401 if the user is not authenticated', () => {
      return req
        .get(route('impossibleMatch'))
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });
  });

  describe('POST /todo', () => {
    const route = '/todo';

    it('should create a todo', async () => {
      const dto: CreateTodoDto = {
        description: 'created 1',
        title: 'created todo',
      };

      await req
        .post(route)
        .set(authHeaders2)
        .send(dto)
        .expect(HttpStatus.CREATED)
        .expect({ statusCode: 201, message: 'Todo created successfully' });

      const todo = await entityManager.findOne(Todo, {
        where: {
          title: dto.title,
          description: dto.description,
        },
      });

      expect(todo).toBeDefined();
      expect(todo.title).toEqual(dto.title);
      expect(todo.description).toEqual(dto.description);
    });

    it('should return 400 if the data is invalid or is not sent', () => {
      return req
        .post(route)
        .set(authHeaders)
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: 400,
          message: [
            'title should not be empty',
            'title must be a string',
            'description should not be empty',
            'description must be a string',
          ],
          error: 'Bad Request',
        });
    });

    it('should return 401 if the user is not authenticated', () => {
      return req
        .post(route)
        .send({ title: 'test', description: 'test' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PUT /todo/:id', () => {
    const route = (id: number | string) => `/todo/${id}`;

    it('should return 200 and update the todo', async () => {
      const todo = await entityManager.save(
        Todo,
        TodoStub({ title: 'test123', user }),
      );

      await req
        .put(route(todo.id))
        .set(authHeaders)
        .send({
          title: 'updated title',
          description: 'updated description',
        })
        .expect(HttpStatus.OK)
        .expect({ statusCode: 200, message: 'Todo updated successfully' });
    });

    it('should return 404 if the todo is not found', () => {
      return req
        .put(route('impossibleToMatch'))
        .set(authHeaders)
        .send({
          title: 'updated title',
          description: 'updated description',
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 if another user try to update a todo that does not belong to him', async () => {
      const todo = await entityManager.save(
        Todo,
        TodoStub({ title: 'test123', user: user2 }),
      );

      await req
        .put(route(todo.id))
        .set(authHeaders)
        .send({
          title: 'updated title',
          description: 'updated description',
        })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: 404,
          message: 'Todo not found',
          error: 'Not Found',
        });
    });

    it('should return 400 if the data is invalid or is not sent', () => {
      return req
        .put(route('someuuid'))
        .set(authHeaders)
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: 400,
          message: [
            'title should not be empty',
            'title must be a string',
            'description should not be empty',
            'description must be a string',
          ],
          error: 'Bad Request',
        });
    });

    it('should return 401 if the user is not authenticated', () => {
      return req
        .put(route(1))
        .send({ title: 'test', description: 'test' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /todo/:id', () => {
    const route = (id: number | string) => `/todo/${id}`;

    it('should return 200 and remove the todo', async () => {
      const todo = await entityManager.save(
        Todo,
        TodoStub({ title: 'test123', user }),
      );

      await req
        .delete(route(todo.id))
        .set(authHeaders)
        .expect(HttpStatus.OK)
        .expect({ statusCode: 200, message: 'Todo deleted successfully' });

      const aux = await entityManager.findOne(Todo, {
        where: {
          id: todo.id,
        },
      });

      expect(aux).toEqual(null);
    });

    it('should return 404 if the user try to remove a todo that does not belong to him', async () => {
      const todo = await entityManager.save(
        Todo,
        TodoStub({ title: 'test123', user: user2 }),
      );

      return req
        .delete(route(todo.id))
        .set(authHeaders)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: 404,
          message: 'Todo not found',
          error: 'Not Found',
        });
    });

    it('should return 404 if the todo is not found', async () => {
      return req
        .delete(route('impossibleToMatch'))
        .set(authHeaders)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: 404,
          message: 'Todo not found',
          error: 'Not Found',
        });
    });

    it('should return 401 if the user is not authenticated', async () => {
      return req
        .delete(route('impossibleToMatch'))
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });
  });
});
