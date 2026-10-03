import {
  Catch,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

/** P2023: a value that is not a valid ObjectId reached an `id` filter. */
const MALFORMED_ID = 'P2023';
/** P2002: a write collided with a unique index. */
const UNIQUE_VIOLATION = 'P2002';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      throw error;
    }
    const response = host.switchToHttp().getResponse<Response>();

    if (error.code === MALFORMED_ID) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid id',
        error: 'Bad Request',
      });
      return;
    }
    if (error.code === UNIQUE_VIOLATION) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'That value is already in use',
        error: 'Conflict',
      });
      return;
    }

    this.logger.error(error.message, error.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
