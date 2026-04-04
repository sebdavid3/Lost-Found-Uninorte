import { ArgumentsHost, ExceptionFilter, ForbiddenException } from '@nestjs/common';
export declare class ForbiddenExceptionFilter implements ExceptionFilter {
    catch(_: ForbiddenException, host: ArgumentsHost): void;
}
