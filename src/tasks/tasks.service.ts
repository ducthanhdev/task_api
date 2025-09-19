import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  PaginatedResult,
  PaginationOptions,
} from '../common/interfaces/pagination.interface';
import { Task, TaskDocument, TaskStatus, TaskPriority } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskNotFoundException, InvalidStatusTransitionException } from '../common/exceptions/custom.exceptions';
import { APP_CONSTANTS, TASK_STATUS_TRANSITIONS } from '../common/constants/app.constants';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) { }


  async create(dto: CreateTaskDto): Promise<Task> {
    const created = new this.taskModel(dto);
    return created.save();
  }


  async findAll(
    opts?: PaginationOptions & {
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
    },
  ): Promise<PaginatedResult<Task>> {
    const page = Math.max(APP_CONSTANTS.DEFAULT_PAGE, Number(opts?.page ?? APP_CONSTANTS.DEFAULT_PAGE));
    const limit = Math.min(
      APP_CONSTANTS.MAX_LIMIT,
      Math.max(APP_CONSTANTS.MIN_LIMIT, Number(opts?.limit ?? APP_CONSTANTS.DEFAULT_LIMIT))
    );

    const query: FilterQuery<TaskDocument> = { isDeleted: false };

    if (opts?.status) query.status = opts.status;
    if (opts?.priority) query.priority = opts.priority;
    if (opts?.search) {
      query.$or = [
        { title: { $regex: opts.search, $options: 'i' } },
        { description: { $regex: opts.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.taskModel
        .find(query)
        .sort({ [APP_CONSTANTS.DEFAULT_SORT_FIELD]: APP_CONSTANTS.DEFAULT_SORT_ORDER })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.taskModel.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }


  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!task) throw new TaskNotFoundException(id);
    return task;
  }


  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.taskModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!existingTask) throw new TaskNotFoundException(id);

    // Validate status transition
    if (dto.status && dto.status !== existingTask.status) {
      this.validateStatusTransition(existingTask.status, dto.status);
    }

    // Set completedAt if status is DONE
    const updateData = { ...dto };
    if (dto.status === TaskStatus.DONE && existingTask.status !== TaskStatus.DONE) {
      updateData.completedAt = new Date().toISOString();
    }

    const updated = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) throw new TaskNotFoundException(id);
    return updated;
  }


  async remove(id: string): Promise<void> {
    const task = await this.taskModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!task) throw new TaskNotFoundException(id);

    await this.taskModel.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    }).exec();
  }

  async restore(id: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, isDeleted: true }).exec();
    if (!task) throw new TaskNotFoundException(id);

    const restored = await this.taskModel.findByIdAndUpdate(id, {
      isDeleted: false,
      deletedAt: null,
    }, { new: true }).exec();

    if (!restored) throw new TaskNotFoundException(id);
    return restored;
  }

  async hardDelete(id: string): Promise<void> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new TaskNotFoundException(id);

    await this.taskModel.findByIdAndDelete(id).exec();
  }

  private validateStatusTransition(currentStatus: TaskStatus, targetStatus: TaskStatus): void {
    const allowedTransitions = TASK_STATUS_TRANSITIONS[currentStatus as keyof typeof TASK_STATUS_TRANSITIONS];
    if (allowedTransitions && !(allowedTransitions as readonly TaskStatus[]).includes(targetStatus)) {
      throw new InvalidStatusTransitionException(currentStatus, targetStatus);
    }
  }
}
