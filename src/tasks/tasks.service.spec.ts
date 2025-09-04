import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { TaskStatus } from './schemas/task.schema';

const mockTaskModel = () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
  countDocuments: jest.fn().mockResolvedValue(0),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: 'uuid-1', title: 'A', status: TaskStatus.TODO }),
  findByIdAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ _id: 'uuid-1', title: 'B' }),
  }),
  findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'uuid-1' }),
});

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken('Task'), useFactory: mockTaskModel },
      ],
    }).compile();
    service = module.get<TasksService>(TasksService);
  });

  it('findAll trả danh sách rỗng & tổng 0', async () => {
    const res = await service.findAll({ page: 1, limit: 10 });
    expect(res.total).toBe(0);
    expect(Array.isArray(res.data)).toBe(true);
  });
  it('update trả về bản ghi đã cập nhật', async () => {
    const updated = await service.update('uuid-1', { title: 'B' });
    expect(updated.title).toBe('B');
  });
});
