import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
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

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// tối ưu truy vấn list
TaskSchema.index({ status: 1, createdAt: -1 });
