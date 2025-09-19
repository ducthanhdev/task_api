import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TaskStatus, TaskPriority } from '../src/tasks/schemas/task.schema';

describe('Task API (e2e)', () => {
  let app: INestApplication;
  let createdTaskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Add validation pipe for E2E tests
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Basic Health Check', () => {
    it('/ (GET) - should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('/health (GET) - should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.timestamp).toBeDefined();
          expect(res.body.uptime).toBeDefined();
        });
    });
  });

  describe('Tasks CRUD Operations', () => {
    it('POST /tasks - should create a new task', async () => {
      const createTaskDto = {
        title: 'E2E Test Task',
        description: 'This is a test task for E2E testing',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: '2024-12-31T23:59:59.000Z',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(createTaskDto.title);
      expect(response.body.description).toBe(createTaskDto.description);
      expect(response.body.status).toBe(createTaskDto.status);
      expect(response.body.priority).toBe(createTaskDto.priority);
      expect(response.body.isDeleted).toBe(false);

      createdTaskId = response.body._id;
    });

    it('GET /tasks - should return paginated tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /tasks - should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ status: TaskStatus.TODO })
        .expect(200);

      expect(response.body.data.every((task: any) => task.status === TaskStatus.TODO)).toBe(true);
    });

    it('GET /tasks - should search by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ search: 'E2E Test' })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /tasks/:id - should return a specific task', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(200);

      expect(response.body._id).toBe(createdTaskId);
      expect(response.body.title).toBe('E2E Test Task');
    });

    it('GET /tasks/:id - should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .get('/tasks/non-existent-id')
        .expect(404);
    });

    it('PATCH /tasks/:id - should update a task', async () => {
      const updateData = {
        title: 'Updated E2E Test Task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.priority).toBe(updateData.priority);
    });

    it('PATCH /tasks/:id - should validate status transition', async () => {
      // First, set task to TODO status
      await request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({ status: TaskStatus.TODO })
        .expect(200);

      // Then try invalid transition from TODO to DONE
      const updateData = {
        status: TaskStatus.DONE, // Invalid transition from TODO to DONE
      };

      await request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send(updateData)
        .expect(400);
    });

    it('DELETE /tasks/:id - should soft delete a task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${createdTaskId}`)
        .expect(200);

      // Verify task is soft deleted
      await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(404);
    });

    it('PUT /tasks/:id/restore - should restore a deleted task', async () => {
      const response = await request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}/restore`)
        .expect(200);

      expect(response.body._id).toBe(createdTaskId);
      expect(response.body.isDeleted).toBe(false);

      // Verify task is restored
      await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(200);
    });

    it('DELETE /tasks/:id/hard - should permanently delete a task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${createdTaskId}/hard`)
        .expect(200);

      // Verify task is permanently deleted
      await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(404);
    });
  });

  describe('Validation Tests', () => {
    it('POST /tasks - should validate required fields', async () => {
      const invalidTask = {
        description: 'Task without title',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(invalidTask)
        .expect(400);

      expect(JSON.stringify(response.body.message)).toContain('title');
    });

    it('POST /tasks - should validate title length', async () => {
      const invalidTask = {
        title: 'A'.repeat(121), // Exceeds max length
        description: 'Valid description',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(invalidTask)
        .expect(400);

      expect(JSON.stringify(response.body.message)).toContain('title');
    });

    it('POST /tasks - should validate enum values', async () => {
      const invalidTask = {
        title: 'Valid title',
        status: 'INVALID_STATUS',
        priority: 'INVALID_PRIORITY',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(invalidTask)
        .expect(400);

      expect(JSON.stringify(response.body.message)).toContain('status');
    });
  });
});
