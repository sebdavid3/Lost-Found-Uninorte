import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
export declare class AuditLogInterceptor implements NestInterceptor {
    private reflector;
    private client;
    constructor(reflector: Reflector, client: ClientProxy);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private publishAuditEvent;
}
