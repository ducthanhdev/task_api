import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/api.types';
import { ValidationError } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.constructor.name;
      } else {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.constructor.name;
      }
    } else if (exception instanceof Error && exception.name === 'ValidationError') {
      // Handle Mongoose validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Dữ liệu không hợp lệ';
      error = 'Validation Error';
    } else if (exception instanceof Error && exception.message.includes('validation failed')) {
      // Handle Mongoose validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Dữ liệu không hợp lệ';
      error = 'Validation Error';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Lỗi hệ thống';
      error = 'Internal Server Error';
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error for debugging
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(errorResponse);
  }
}
