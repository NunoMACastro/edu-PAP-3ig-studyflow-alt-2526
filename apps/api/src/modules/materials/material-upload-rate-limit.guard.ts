/**
 * Rate limit Redis aplicado antes de o Multer carregar o ficheiro em memória.
 */
import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { SessionStore } from "../auth/session-store.js";
import { SESSION_REDIS } from "../auth/session.service.js";

const UPLOAD_WINDOW_SECONDS = 60 * 60;
const MAX_UPLOADS_PER_USER = 20;

/** Impõe no máximo vinte tentativas de upload por hora e por utilizador. */
@Injectable()
export class MaterialUploadRateLimitGuard implements CanActivate {
    constructor(@Inject(SESSION_REDIS) private readonly redis: SessionStore) {}

    /**
     * Consome a tentativa antes do interceptor multipart, reduzindo abuso de CPU
     * e memória mesmo quando o ficheiro acaba por ser inválido.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const userId = request.user?.id;
        if (!userId) {
            throw new UnauthorizedException({
                code: "AUTH_REQUIRED",
                message: "Autenticação necessária.",
            });
        }

        const key = `studyflow:material-uploads:user:${createHash("sha256")
            .update(userId)
            .digest("hex")}`;
        const count = await this.redis.incr(key);
        if (count === 1) await this.redis.expire(key, UPLOAD_WINDOW_SECONDS);
        if (count > MAX_UPLOADS_PER_USER) {
            throw new HttpException(
                {
                    code: "MATERIAL_UPLOAD_RATE_LIMITED",
                    message:
                        "Foram efetuados demasiados uploads. Tenta novamente mais tarde.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
        return true;
    }
}
