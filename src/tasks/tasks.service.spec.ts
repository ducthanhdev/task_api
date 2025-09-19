import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { TaskStatus, TaskPriority } from './schemas/task.schema';
import { TaskNotFoundException, InvalidStatusTransitionException } from '../common/exceptions/custom.exceptions';

const mockTask = {
  _id: 'uuid-1',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
};

const mockTaskModel = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
  countDocuments: jest.fn().mockResolvedValue(0),
  findById: jest.fn().mockResolvedValue(mockTask),
  findByIdAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockTask),
  }),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockTask),
  save: jest.fn().mockResolvedValue(mockTask),
};

// Mock constructor
const MockTaskModel = jest.fn().mockImplementation((dto) => ({
  ...dto,
  save: jest.fn().mockResolvedValue(mockTask),
}));

// Copy static methods
Object.assign(MockTaskModel, mockTaskModel);

describe('TasksService', () => {
  let service: TasksService;
  let taskModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken('Task'), useValue: MockTaskModel },
      ],
    }).compile();
    service = module.get<TasksService>(TasksService);
    taskModel = module.get(getModelToken('Task'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      };

      const result = await service.create(createTaskDto);

      expect(taskModel).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with default parameters', async () => {
      const mockResult = {
        data: [mockTask],
        total: 1,
        page: 1,
        limit: 20,
      };

      taskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTask]),
      });
      taskModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.total).toBe(1);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should return tasks with filters', async () => {
      const mockResult = {
        data: [mockTask],
        total: 1,
        page: 1,
        limit: 10,
      };

      taskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTask]),
      });
      taskModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        search: 'test',
      });

      expect(result.total).toBe(1);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockTask);
    });

    it('should throw TaskNotFoundException when task not found', async () => {
      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('uuid-1')).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const updateTaskDto = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, title: 'Updated Task' };

      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });
      taskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTask),
      });

      const result = await service.update('uuid-1', updateTaskDto);

      expect(result).toEqual(updatedTask);
    });

    it('should throw TaskNotFoundException when task not found', async () => {
      const updateTaskDto = { title: 'Updated Task' };

      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('uuid-1', updateTaskDto)).rejects.toThrow(TaskNotFoundException);
    });

    it('should validate status transition', async () => {
      const updateTaskDto = { status: TaskStatus.DONE };
      const existingTask = { ...mockTask, status: TaskStatus.TODO };

      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingTask),
      });

      await expect(service.update('uuid-1', updateTaskDto)).rejects.toThrow(InvalidStatusTransitionException);
    });
  });

  describe('remove', () => {
    it('should soft delete a task', async () => {
      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });
      taskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      await service.remove('uuid-1');

      expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith('uuid-1', {
        isDeleted: true,
        deletedAt: expect.any(Date),
      });
    });

    it('should throw TaskNotFoundException when task not found', async () => {
      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('uuid-1')).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a deleted task', async () => {
      const deletedTask = { ...mockTask, isDeleted: true };
      const restoredTask = { ...mockTask, isDeleted: false };

      taskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedTask),
      });
      taskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(restoredTask),
      });

      const result = await service.restore('uuid-1');

      expect(result).toEqual(restoredTask);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a task', async () => {
      taskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });
      taskModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      await service.hardDelete('uuid-1');

      expect(taskModel.findByIdAndDelete).toHaveBeenCalledWith('uuid-1');
    });
  });
});
