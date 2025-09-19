import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Tiêu đề của task',
    example: 'Hoàn thành báo cáo tuần',
    maxLength: APP_CONSTANTS.TASK_TITLE_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty({ message: 'title không được rỗng' })
  @MaxLength(APP_CONSTANTS.TASK_TITLE_MAX_LENGTH)
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết của task',
    example: 'Viết báo cáo tổng kết công việc tuần này',
    maxLength: APP_CONSTANTS.TASK_DESCRIPTION_MAX_LENGTH,
  })
  @IsString()
  @IsOptional()
  @MaxLength(APP_CONSTANTS.TASK_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái của task',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Mức độ ưu tiên của task',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Ngày hết hạn của task',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
