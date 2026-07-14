/** Mantém mutações HTTP autenticadas dentro da barreira da respetiva conta. */
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";
import { AccountLifecycleBarrierService } from "./account-lifecycle-barrier.service.js";
import { ACCOUNT_DELETION_EXCLUSIVE_METADATA } from "./account-lifecycle.decorator.js";

const MUTATING_HTTP_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Interceptor global, limitado a pedidos mutáveis com ator autenticado. */
@Injectable()
export class AccountLifecycleInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly barrier: AccountLifecycleBarrierService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (context.getType() !== "http") return next.handle();
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        if (
            !request.user?.id ||
            !MUTATING_HTTP_METHODS.has(request.method.toUpperCase()) ||
            this.reflector.getAllAndOverride<boolean>(
                ACCOUNT_DELETION_EXCLUSIVE_METADATA,
                [context.getHandler(), context.getClass()],
            )
        ) {
            return next.handle();
        }

        const release = this.barrier.enterMutation(request.user.id);
        try {
            return next.handle().pipe(finalize(release));
        } catch (error) {
            release();
            throw error;
        }
    }
}
