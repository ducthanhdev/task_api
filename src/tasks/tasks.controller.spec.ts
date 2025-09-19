import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus, TaskPriority } from './schemas/task.schema';
import { TaskNotFoundException, InvalidStatusTransitionException } from '../common/exceptions/custom.exceptions';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

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

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    hardDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
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

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto);

      expect(service.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const mockResult = {
        data: [mockTask],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockTasksService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 20, TaskStatus.TODO, TaskPriority.HIGH, 'search');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        search: 'search',
      });
      expect(result).toEqual(mockResult);
    });

    it('should return tasks with default parameters', async () => {
      const mockResult = {
        data: [mockTask],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockTasksService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({
        page: NaN,
        limit: NaN,
        status: undefined,
        priority: undefined,
        search: undefined,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne('uuid-1');

      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(mockTask);
    });

    it('should throw TaskNotFoundException when task not found', async () => {
      mockTasksService.findOne.mockRejectedValue(new TaskNotFoundException('uuid-1'));

      await expect(controller.findOne('uuid-1')).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, title: 'Updated Task' };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update('uuid-1', updateTaskDto);

      expect(service.update).toHaveBeenCalledWith('uuid-1', updateTaskDto);
      expect(result).toEqual(updatedTask);
    });

    it('should throw TaskNotFoundException when task not found', async () => {
      const updateTaskDto = { title: 'Updated Task' };
      mockTasksService.update.mockRejectedValue(new TaskNotFoundException('uuid-1'));

      await expect(controller.update('uuid-1', updateTaskDto)).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-1');

      expect(service.remove).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw TaskNotFoundException when task not found', async () => {
      mockTasksService.remove.mockRejectedValue(new TaskNotFoundException('uuid-1'));

      await expect(controller.remove('uuid-1')).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a deleted task', async () => {
      mockTasksService.restore.mockResolvedValue(mockTask);

      const result = await controller.restore('uuid-1');

      expect(service.restore).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a task', async () => {
      mockTasksService.hardDelete.mockResolvedValue(undefined);

      await controller.hardDelete('uuid-1');

      expect(service.hardDelete).toHaveBeenCalledWith('uuid-1');
    });
  });
});
