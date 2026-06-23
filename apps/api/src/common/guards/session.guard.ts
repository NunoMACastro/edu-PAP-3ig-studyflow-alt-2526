/**
 * Protege endpoints autenticados e normaliza o utilizador da sessão.
 */
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthenticatedRequest } from "../types/authenticated-request.js";
import {
    SESSION_COOKIE_NAME,
    SessionService,
} from "../../modules/auth/session.service.js";

/**
 * Guarda de autenticação baseada em sessão opaca.
 *
 * O guard lê o cookie HttpOnly definido pelo login, valida a sessão no Redis e
 * anexa `request.user` para os controllers seguintes. Assim, cada BK obtém o
 * ownership a partir da sessão e não de campos enviados pelo cliente.
 */
@Injectable()
export class SessionGuard implements CanActivate {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param sessionService Service injetado para reutilizar regras de session sem duplicar validações.
     */
    constructor(private readonly sessionService: SessionService) {}

    /**
     * Valida se o pedido atual tem sessão ativa.
     *
     * @param context Contexto NestJS do pedido HTTP.
     * @returns `true` quando a sessão existe e foi anexada ao request.
     * @throws UnauthorizedException quando o cookie não existe ou expirou.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME];

        if (!sessionId) {
            throw new UnauthorizedException({
                code: "UNAUTHENTICATED",
                message: "Inicia sessão para continuar.",
            });
        }

        // A partir daqui os controllers confiam em request.user, não em IDs enviados pelo frontend.
        request.user = await this.sessionService.requireSession(sessionId);
        return true;
    }
}
