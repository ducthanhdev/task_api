import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  PaginatedResult,
  PaginationOptions,
} from '../common/interfaces/pagination.interface';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const created = new this.taskModel(dto);
    return created.save();
  }

  async findAll(
    opts?: PaginationOptions & { status?: TaskStatus },
  ): Promise<PaginatedResult<Task>> {
    const page = Math.max(1, Number(opts?.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(opts?.limit ?? 20)));

    const query: FilterQuery<TaskDocument> = {};
    if (opts?.status) query.status = opts.status;

    const [data, total] = await Promise.all([
      this.taskModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.taskModel.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task không tồn tại');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const updated = await this.taskModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Task không tồn tại');
    return updated;
  }

  async remove(id: string) {
    const res = await this.taskModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Task không tồn tại');
  }
}
