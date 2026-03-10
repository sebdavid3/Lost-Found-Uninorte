import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(_: ForbiddenException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    response.status(HttpStatus.FORBIDDEN).json({
      seguridad: 'Acceso denegado a la evidencia solicitada',
      timestamp: new Date().toISOString(),
    });
  }
}