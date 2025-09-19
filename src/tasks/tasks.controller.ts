import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus, TaskPriority } from './schemas/task.schema';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo task mới' })
  @ApiCreatedResponse({ type: Task, description: 'Task đã được tạo thành công' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tasks với phân trang và filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng items/trang (mặc định: 20, tối đa: 100)' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'priority', required: false, enum: TaskPriority, description: 'Lọc theo mức độ ưu tiên' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo title hoặc description' })
  @ApiOkResponse({ type: [Task], description: 'Danh sách tasks' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('search') search?: string,
  ) {
    return this.tasksService.findAll({
      page: Number(page),
      limit: Number(limit),
      status,
      priority,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy task theo ID' })
  @ApiParam({ name: 'id', description: 'ID của task' })
  @ApiOkResponse({ type: Task, description: 'Thông tin task' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật task' })
  @ApiParam({ name: 'id', description: 'ID của task' })
  @ApiOkResponse({ type: Task, description: 'Task đã được cập nhật' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa task (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID của task' })
  @ApiOkResponse({ description: 'Task đã được xóa thành công' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Khôi phục task đã bị xóa' })
  @ApiParam({ name: 'id', description: 'ID của task' })
  @ApiOkResponse({ type: Task, description: 'Task đã được khôi phục' })
  restore(@Param('id') id: string) {
    return this.tasksService.restore(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Xóa vĩnh viễn task' })
  @ApiParam({ name: 'id', description: 'ID của task' })
  @ApiOkResponse({ description: 'Task đã được xóa vĩnh viễn' })
  hardDelete(@Param('id') id: string) {
    return this.tasksService.hardDelete(id);
  }
}
