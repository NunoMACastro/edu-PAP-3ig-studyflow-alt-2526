/**
 * Expõe os endpoints HTTP de auth e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { PublicUserDto } from "../users/users.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterStudentDto } from "./dto/register-student.dto.js";
import {
    clearSessionCookieOptions,
    sessionCookieOptions,
} from "./session-cookie.options.js";
import {
    SESSION_COOKIE_NAME,
    SessionService,
} from "./session.service.js";
import { AuthService } from "./auth.service.js";
import { LoginAttemptsService } from "./login-attempts.service.js";

/**
 * Controller de autenticação da MF0.
 *
 * Expõe os endpoints derivados dos BKs: registo, login, logout e consulta da
 * sessão atual. O cookie de sessão é HttpOnly e não há tokens em localStorage.
 */
@Controller("api/auth")
export class AuthController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param authService Service injetado para reutilizar regras de auth sem duplicar validações.
     * @param sessionService Service injetado para reutilizar regras de session sem duplicar validações.
     * @param loginAttemptsService Service injetado para reutilizar regras de login attempts sem duplicar validações.
     */
    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
        private readonly loginAttemptsService: LoginAttemptsService,
    ) {}

    /**
     * Cria uma conta local de aluno.
     *
     * @param body Dados do formulário de registo.
     * @returns Utilizador público recém-criado.
     */
    @Post("register")
    register(@Body() body: RegisterStudentDto) {
        return this.authService.registerStudent(body);
    }

    /**
     * Valida credenciais e define o cookie HttpOnly.
     *
     * @param request Pedido Express usado para obter o IP.
     * @param body Credenciais locais.
     * @param response Resposta Express usada para configurar o cookie.
     * @returns Utilizador público autenticado.
     */
    @Post("login")
    @HttpCode(200)
    async login(
        @Req() request: Request,
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const clientIp = this.getClientIp(request);
        await this.loginAttemptsService.assertCanAttempt(body.email, clientIp);

        let user: PublicUserDto;
        try {
            user = await this.authService.validateLogin(body);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                await this.loginAttemptsService.recordFailedLogin(
                    body.email,
                    clientIp,
                );
            }
            throw error;
        }

        await this.loginAttemptsService.clearEmailFailures(body.email);
        const sessionId = await this.sessionService.createSession(user);
        this.setSessionCookie(response, sessionId);
        return user;
    }

    /**
     * Devolve a sessão atual já validada pelo guard.
     *
     * @param request Pedido autenticado.
     * @returns Utilizador da sessão.
     */
    @Get("me")
    @UseGuards(SessionGuard)
    me(@Req() request: AuthenticatedRequest) {
        return request.user;
    }

    /**
     * Invalida a sessão atual e limpa o cookie no browser.
     *
     * @param request Pedido que pode conter o cookie de sessão.
     * @param response Resposta Express usada para limpar o cookie.
     * @returns Estado simples de sucesso.
     */
    @Post("logout")
    @HttpCode(200)
    async logout(
        @Req() request: AuthenticatedRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME];
        if (sessionId) {
            await this.sessionService.destroySession(sessionId);
        }

        response.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions());

        return { ok: true };
    }

    /**
     * Aplica o cookie de sessão com flags seguras.
     *
     * @param response Resposta Express.
     * @param sessionId Identificador opaco da sessão.
     * @returns Nada; apenas modifica os headers da resposta.
     */
    private setSessionCookie(response: Response, sessionId: string): void {
        response.cookie(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());
    }

    /**
     * Resolve o IP usado no rate limit sem confiar em dados vindos do body.
     *
     * @param request Pedido Express.
     * @returns IP observado ou marcador estável quando indisponível.
     */
    private getClientIp(request: Request): string {
        return request.ip ?? request.socket.remoteAddress ?? "unknown";
    }
}
