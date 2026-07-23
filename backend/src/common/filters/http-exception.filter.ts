import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpExceptionResponse } from './dto/http-exception.filter.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Errore interno del server';

    // ← aggiunto: logga sempre l'errore reale
    console.error('Exception caught:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as HttpExceptionResponse;
        const raw = body.message;
        message = Array.isArray(raw) ? raw.join(', ') : (raw ?? message);
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}
