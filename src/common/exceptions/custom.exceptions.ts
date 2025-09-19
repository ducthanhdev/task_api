import { HttpException, HttpStatus } from '@nestjs/common';

export class TaskNotFoundException extends HttpException {
  constructor(id?: string) {
    const message = id 
      ? `Task với ID ${id} không tồn tại`
      : 'Task không tồn tại';
    super(message, HttpStatus.NOT_FOUND);
  }
}


export class InvalidStatusTransitionException extends HttpException {
  constructor(currentStatus: string, targetStatus: string) {
    const message = `Không thể chuyển từ trạng thái ${currentStatus} sang ${targetStatus}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}


 //Custom exception for validation errors

export class ValidationException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        details,
        error: 'Validation Error',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

 //Custom exception for business logic errors
export class BusinessLogicException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
  }
}
