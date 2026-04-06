"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const audit_action_decorator_1 = require("../decorators/audit-action.decorator");
let AuditLogInterceptor = class AuditLogInterceptor {
    reflector;
    client;
    constructor(reflector, client) {
        this.reflector = reflector;
        this.client = client;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const action = this.reflector.get(audit_action_decorator_1.AUDIT_ACTION_KEY, context.getHandler());
        if (!action) {
            return next.handle();
        }
        const entityId = request.params.id || request.body?.id || 'unknown';
        return next.handle().pipe((0, operators_1.tap)((response) => {
            this.publishAuditEvent(request, action, entityId, response, 'SUCCESS');
        }), (0, operators_1.catchError)((error) => {
            const result = error instanceof common_1.ForbiddenException ? 'DENIED' : 'FAILURE';
            this.publishAuditEvent(request, action, entityId, { error: error.message }, result, error.message);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    publishAuditEvent(request, action, entityId, payload, result, details) {
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
        this.client.emit('audit.event.created', eventData);
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AUDIT_SERVICE')),
    __metadata("design:paramtypes", [core_1.Reflector,
        microservices_1.ClientProxy])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map