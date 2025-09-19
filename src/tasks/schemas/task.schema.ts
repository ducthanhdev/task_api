import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

@Schema({ 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'tasks'
})
export class Task {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Prop({
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Prop({ default: null })
  dueDate: Date;

  @Prop({ default: null })
  completedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Database indexes for performance optimization
TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ priority: 1, createdAt: -1 });
TaskSchema.index({ isDeleted: 1, createdAt: -1 });
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ dueDate: 1 });
