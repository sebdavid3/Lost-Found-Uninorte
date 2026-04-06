import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { AUDIT_ACTION_KEY } from '../decorators/audit-action.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject('AUDIT_SERVICE') private client: ClientProxy,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Retrieve the semantic action from metadata using @AuditAction decorator
    const action = this.reflector.get<string>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!action) {
      return next.handle(); // If no action is defined, ignore auditing
    }

    // Determine Entity ID (e.g. from params)
    const entityId = request.params.id || request.body?.id || 'unknown';

    return next.handle().pipe(
      tap((response) => {
        // Success case
        this.publishAuditEvent(request, action, entityId, response, 'SUCCESS');
      }),
      catchError((error) => {
        // Exception Case
        const result =
          error instanceof ForbiddenException ? 'DENIED' : 'FAILURE';
        
        this.publishAuditEvent(
          request,
          action,
          entityId,
          { error: error.message },
          result,
          error.message,
        );

        // Re-throw the error so standard exception filters handle it
        return throwError(() => error);
      }),
    );
  }

  private publishAuditEvent(
    request: any,
    action: string,
    entityId: string,
    payload: any,
    result: string,
    details?: string,
  ) {
    // Determine entity type based on endpoint or context
    const url = request.url;
    let entityType = 'CLAIM';
    if (url.includes('/evidences')) {
      entityType = 'EVIDENCE';
    }

    const eventData = {
      action,
      entityType,
      entityId,
      actorId: request.headers['x-user-id'] || 'system',
      actorRole: request.headers['x-user-role'] || 'unknown',
      ipAddress: request.ip || request.connection.remoteAddress || 'unknown',
      payload: { ...request.body, ...payload },
      result,
      details,
    };

    // Emit event asynchronously
    this.client.emit('audit.event.created', eventData);
  }
}
