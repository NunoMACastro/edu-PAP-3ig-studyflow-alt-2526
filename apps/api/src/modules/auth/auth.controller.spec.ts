/**
 * Testa o contrato HTTP de autenticação sem abrir sockets de rede.
 */
import {
    HttpException,
    HttpStatus,
    INestApplication,
    ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import { Duplex, Readable, Writable } from "node:stream";
import { csrfMiddleware } from "../../common/middleware/csrf.middleware.js";
import { securityHeadersMiddleware } from "../../common/middleware/security-headers.middleware.js";
import { mf0ValidationExceptionFactory } from "../../common/validation/mf0-validation-exception.factory.js";
import { PublicUserDto } from "../users/users.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { LoginAttemptsService } from "./login-attempts.service.js";
import { SessionService } from "./session.service.js";

type HttpResponse = {
    status: number;
    body: Record<string, unknown> | null;
    headers: Record<string, HeaderValue>;
};

type HeaderValue = string | number | readonly string[];

type ExpressLikeApp = (
    request: Readable & {
        method: string;
        url: string;
        headers: Record<string, string>;
        socket: { remoteAddress: string };
    },
    response: Writable & {
        statusCode: number;
        headers: Record<string, HeaderValue>;
        setHeader(name: string, value: HeaderValue): void;
        getHeader(name: string): HeaderValue | undefined;
        getHeaders(): Record<string, HeaderValue>;
        removeHeader(name: string): void;
        writeHead(statusCode: number, headers?: Record<string, HeaderValue>): void;
    },
) => void;

const validLogin = {
    email: "aluno@example.test",
    password: "password-segura",
};

const publicUser: PublicUserDto = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};

describe("AuthController HTTP security contract", () => {
    let app: INestApplication;
    let authService: {
        validateLogin: jest.Mock;
        registerStudent: jest.Mock;
    };
    let loginAttemptsService: {
        assertCanAttempt: jest.Mock;
        consumeRegistrationAttempt: jest.Mock;
        recordFailedLogin: jest.Mock;
        clearEmailFailures: jest.Mock;
    };
    let sessionService: {
        createSession: jest.Mock;
        destroySession: jest.Mock;
    };

    beforeEach(async () => {
        authService = {
            validateLogin: jest.fn().mockResolvedValue(publicUser),
            registerStudent: jest.fn(),
        };
        loginAttemptsService = {
            assertCanAttempt: jest.fn().mockResolvedValue(undefined),
            consumeRegistrationAttempt: jest.fn().mockResolvedValue(undefined),
            recordFailedLogin: jest.fn().mockResolvedValue(undefined),
            clearEmailFailures: jest.fn().mockResolvedValue(undefined),
        };
        sessionService = {
            createSession: jest.fn().mockResolvedValue("session-id"),
            destroySession: jest.fn().mockResolvedValue(undefined),
        };

        const moduleRef = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: SessionService, useValue: sessionService },
                { provide: LoginAttemptsService, useValue: loginAttemptsService },
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        app.use(securityHeadersMiddleware);
        app.use(cookieParser());
        app.use(csrfMiddleware);
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                exceptionFactory: mf0ValidationExceptionFactory,
            }),
        );
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("bloqueia login sem marcador CSRF antes do controller", async () => {
        const response = await dispatchJson(app, "POST", "/api/auth/login", {
            body: validLogin,
        });

        expect(response.status).toBe(403);
        expect(response.body).toMatchObject({ code: "CSRF_CHECK_FAILED" });
        expect(response.headers["x-frame-options"]).toBe("DENY");
        expect(loginAttemptsService.assertCanAttempt).not.toHaveBeenCalled();
        expect(authService.validateLogin).not.toHaveBeenCalled();
    });

    it("rejeita campos extra do login antes de executar rate limit ou auth", async () => {
        const response = await dispatchJson(app, "POST", "/api/auth/login", {
            body: { ...validLogin, role: "ADMIN" },
            csrf: true,
        });

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({ code: "FORBIDDEN_PROFILE_FIELD" });
        expect(loginAttemptsService.assertCanAttempt).not.toHaveBeenCalled();
        expect(authService.validateLogin).not.toHaveBeenCalled();
    });

    it("devolve LOGIN_RATE_LIMITED pelo endpoint antes de validar credenciais", async () => {
        loginAttemptsService.assertCanAttempt.mockRejectedValueOnce(
            new HttpException(
                {
                    code: "LOGIN_RATE_LIMITED",
                    message:
                        "Demasiadas tentativas falhadas. Tenta novamente mais tarde.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            ),
        );

        const response = await dispatchJson(app, "POST", "/api/auth/login", {
            body: validLogin,
            csrf: true,
        });

        expect(response.status).toBe(429);
        expect(response.body).toMatchObject({ code: "LOGIN_RATE_LIMITED" });
        expect(loginAttemptsService.assertCanAttempt).toHaveBeenCalledTimes(1);
        expect(authService.validateLogin).not.toHaveBeenCalled();
    });

    it("aplica rate limit por IP antes de registar uma conta", async () => {
        authService.registerStudent.mockResolvedValueOnce(publicUser);
        const response = await dispatchJson(app, "POST", "/api/auth/register", {
            body: {
                email: "novo@example.test",
                password: "password-segura",
                confirmPassword: "password-segura",
            },
            csrf: true,
        });

        expect(response.status).toBe(201);
        expect(loginAttemptsService.consumeRegistrationAttempt).toHaveBeenCalledWith(
            "127.0.0.1",
        );
        expect(authService.registerStudent).toHaveBeenCalledTimes(1);
    });
});

/**
 * Executa JSON contra a app Express criada pelo Nest sem abrir portas TCP.
 *
 * @param app Aplicação Nest inicializada.
 * @param method Método HTTP simulado.
 * @param path Caminho absoluto do endpoint.
 * @param options Corpo e flags de segurança do pedido.
 * @returns Status, headers e corpo JSON devolvidos pela pipeline HTTP real.
 */
async function dispatchJson(
    app: INestApplication,
    method: "POST",
    path: string,
    options: {
        body: Record<string, unknown>;
        csrf?: boolean;
    },
): Promise<HttpResponse> {
    const payload = JSON.stringify(options.body);
    const headers: Record<string, string> = {
        "content-type": "application/json",
        "content-length": String(Buffer.byteLength(payload)),
    };

    if (options.csrf) {
        headers["x-studyflow-csrf"] = "1";
    }

    const request = Object.assign(
        new Readable({
            /**
             * Executa o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            read() {
                this.push(payload);
                this.push(null);
            },
        }),
        {
            method,
            url: path,
            headers,
            socket: makeSocket(),
        },
    );

    const chunks: Buffer[] = [];
    const response = makeWritableResponse(chunks);
    const expressApp = app.getHttpAdapter().getInstance() as ExpressLikeApp;

    await new Promise<void>((resolve, reject) => {
        request.on("error", reject);
        response.on("error", reject);
        const originalEnd = response.end.bind(response);
        response.end = ((chunk?: string | Buffer) => {
            if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            originalEnd();
            resolve();
            return response;
        }) as typeof response.end;
        expressApp(request, response);
    });

    const raw = Buffer.concat(chunks).toString("utf8");
    return {
        status: response.statusCode,
        body: raw ? (JSON.parse(raw) as Record<string, unknown>) : null,
        headers: response.headers,
    };
}

/**
 * Cria um socket local minimo para a pipeline Express/Nest.
 *
 * @returns Stream duplex com `remoteAddress` observável pelo controller.
 */
function makeSocket() {
    return Object.assign(
        new Duplex({
            /**
             * Executa o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            read() {},
            /**
             * Executa o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @param _chunk Valor de chunk usado pela função para executar write com dados explícitos.
             * @param _encoding Valor de encoding usado pela função para executar write com dados explícitos.
             * @param callback Callback chamado pela API externa para concluir a operação assíncrona simulada.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            write(_chunk, _encoding, callback) {
                callback();
            },
        }),
        {
            remoteAddress: "127.0.0.1",
        },
    );
}

/**
 * Cria uma resposta em memória compatível com o que Express usa nestes testes.
 *
 * @param chunks Buffer onde o corpo da resposta é acumulado.
 * @returns Writable com API parcial de `ServerResponse`.
 */
function makeWritableResponse(chunks: Buffer[]) {
    const headers: Record<string, HeaderValue> = {};
    return Object.assign(
        new Writable({
            /**
             * Executa o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @param chunk Valor de chunk usado pela função para executar write com dados explícitos.
             * @param _encoding Valor de encoding usado pela função para executar write com dados explícitos.
             * @param callback Callback chamado pela API externa para concluir a operação assíncrona simulada.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            write(chunk, _encoding, callback) {
                chunks.push(Buffer.from(chunk));
                callback();
            },
        }),
        {
            statusCode: 200,
            headers,
            /**
             * Executa o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @param name Valor de name usado pela função para executar set header com dados explícitos.
             * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            setHeader(name: string, value: HeaderValue) {
                headers[name.toLowerCase()] = value;
            },
            /**
             * Obtém o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @param name Valor de name usado pela função para executar get header com dados explícitos.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            getHeader(name: string) {
                return headers[name.toLowerCase()];
            },
            /**
             * Obtém o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            getHeaders() {
                return { ...headers };
            },
            /**
             * Remove o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @param name Valor de name usado pela função para executar remove header com dados explícitos.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            removeHeader(name: string) {
                delete headers[name.toLowerCase()];
            },
            /**
             * Executa o apoio de teste para autenticação, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
             *
             * @param statusCode Valor de statusCode usado pela função para executar write head com dados explícitos.
             * @param nextHeaders Valor de nextHeaders usado pela função para executar write head com dados explícitos.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            writeHead(statusCode: number, nextHeaders?: Record<string, HeaderValue>) {
                this.statusCode = statusCode;
                if (!nextHeaders) return;
                for (const [name, value] of Object.entries(nextHeaders)) {
                    this.setHeader(name, value);
                }
            },
        },
    );
}
