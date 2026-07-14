/**
 * Testa o comportamento de mf3 http contracts spec ts e documenta os cenários de aceitação automatizados.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import { Duplex, Readable, Writable } from "node:stream";
import { SessionGuard } from "../common/guards/session.guard.js";
import { AuthenticatedUser } from "../common/types/authenticated-request.js";
import {
    SESSION_COOKIE_NAME,
    SessionService,
} from "./auth/session.service.js";
import { AdaptiveExplanationsController } from "./adaptive-explanations/adaptive-explanations.controller.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations/adaptive-explanations.service.js";
import { AiGuardrailsController } from "./ai-guardrails/ai-guardrails.controller.js";
import { AiGuardrailsService } from "./ai-guardrails/ai-guardrails.service.js";
import { AiGuardrailContextType } from "./ai-guardrails/dto/check-ai-guardrails.dto.js";
import { CurriculumNavigationController } from "./curriculum-navigation/curriculum-navigation.controller.js";
import { CurriculumNavigationService } from "./curriculum-navigation/curriculum-navigation.service.js";
import { ExternalKnowledgeAiController } from "./external-knowledge-ai/external-knowledge-ai.controller.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai/external-knowledge-ai.service.js";
import { NotificationContext } from "./notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesController } from "./notification-preferences/notification-preferences.controller.js";
import { NotificationPreferencesService } from "./notification-preferences/notification-preferences.service.js";
import { SourceGroundedAiController } from "./source-grounded-ai/source-grounded-ai.controller.js";
import { SourceGroundedAiService } from "./source-grounded-ai/source-grounded-ai.service.js";
import { StudyAlertsController } from "./study-alerts/study-alerts.controller.js";
import { StudyAlertsService } from "./study-alerts/study-alerts.service.js";
import { StudyGroupAiController } from "./study-group-ai/study-group-ai.controller.js";
import { StudyGroupAiService } from "./study-group-ai/study-group-ai.service.js";
import { StudyGroupMessagesController } from "./study-group-messages/study-group-messages.controller.js";
import { StudyGroupMessagesService } from "./study-group-messages/study-group-messages.service.js";
import { StudyGroupSessionsController } from "./study-group-sessions/study-group-sessions.controller.js";
import { StudyGroupSessionsService } from "./study-group-sessions/study-group-sessions.service.js";
import { UnifiedSearchController } from "./unified-search/unified-search.controller.js";
import { UnifiedSearchService } from "./unified-search/unified-search.service.js";

/**
 * Contrato de mf3 http contracts spec ts que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type HttpMethod = "GET" | "POST" | "PUT";

/**
 * Resposta tipada de mf3 http contracts spec ts devolvida pela API ou por um helper frontend.
 */
type HttpResponse = {
    status: number;
    body: Record<string, unknown> | Record<string, unknown>[] | null;
};

/**
 * Contrato de mf3 http contracts spec ts que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type HeaderValue = string | number | readonly string[];

/**
 * Contrato de mf3 http contracts spec ts que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type ExpressLikeApp = (
    request: Readable & {
        method: string;
        url: string;
        headers: Record<string, string>;
        socket: { remoteAddress: string; destroy(): void };
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

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};

const resourceId = "507f1f77bcf86cd799439013";
const jobId = "507f1f77bcf86cd799439014";

describe("MF3 HTTP contracts", () => {
    let app: INestApplication;
    let sessionService: { requireSession: jest.Mock };
    let adaptiveExplanationsService: { ask: jest.Mock };
    let guardrailsService: { check: jest.Mock };
    let curriculumNavigationService: { load: jest.Mock };
    let externalKnowledgeService: { ask: jest.Mock };
    let sourceGroundedService: { ask: jest.Mock };
    let groupAiService: { ask: jest.Mock };
    let messagesService: { createMessage: jest.Mock; listMessages: jest.Mock };
    let sessionsService: { createSession: jest.Mock; listGroupSessions: jest.Mock };
    let unifiedSearchService: { search: jest.Mock };
    let alertsService: { listAlerts: jest.Mock };
    let preferencesService: { listEffective: jest.Mock; upsert: jest.Mock };

    beforeEach(async () => {
        sessionService = { requireSession: jest.fn().mockResolvedValue(student) };
        adaptiveExplanationsService = {
            ask: jest.fn().mockResolvedValue({
                explanation: "Explicação adaptada ao perfil.",
                citations: [{ sourceLabel: "Fonte 1", locator: "p. 2" }],
            }),
        };
        guardrailsService = {
            check: jest.fn().mockResolvedValue({
                _id: "guardrail-check-1",
                contextType: AiGuardrailContextType.SOLO,
                resourceId,
                allowed: true,
                reasonCode: "CONTEXT_ALLOWED",
                reason: "O contexto foi validado e a IA pode avançar.",
            }),
        };
        curriculumNavigationService = {
            load: jest.fn().mockResolvedValue({
                topics: [{ title: "Mitose", sections: [{ title: "Fases" }] }],
            }),
        };
        externalKnowledgeService = {
            ask: jest.fn().mockResolvedValue({
                answer: "Resposta com fontes internas e nota externa limitada.",
                externalNote: "Nota externa geral.",
                citations: [{ sourceLabel: "Fonte 1", locator: "p. 1" }],
            }),
        };
        sourceGroundedService = {
            ask: jest.fn().mockResolvedValue({
                answer: "Resposta limitada às fontes.",
                citations: [{ label: "Fonte 1", locator: "p. 1" }],
            }),
        };
        groupAiService = {
            ask: jest.fn().mockResolvedValue({
                answer: "Resposta coletiva baseada nas fontes.",
                sources: [{ shareId: jobId, title: "Partilha" }],
            }),
        };
        messagesService = {
            createMessage: jest.fn().mockResolvedValue({
                kind: "MESSAGE",
                text: "Nota do grupo",
            }),
            listMessages: jest.fn().mockResolvedValue([
                { kind: "NOTE", text: "Resumo coletivo" },
            ]),
        };
        sessionsService = {
            createSession: jest.fn().mockResolvedValue({
                title: "Sessão de estudo",
                startsAt: "2026-06-20T10:00:00.000Z",
            }),
            listGroupSessions: jest.fn().mockResolvedValue([
                { title: "Sessão de estudo" },
            ]),
        };
        unifiedSearchService = {
            search: jest.fn().mockResolvedValue({
                query: "mitose",
                results: [{ jobId, title: "Mitose", snippet: "Divisão celular." }],
            }),
        };
        alertsService = {
            listAlerts: jest.fn().mockResolvedValue([
                { type: "STUDY_ROUTINE", title: "Rotina de estudo" },
            ]),
        };
        preferencesService = {
            listEffective: jest.fn().mockResolvedValue([
                { context: NotificationContext.STUDY_ROUTINE, inApp: true },
            ]),
            upsert: jest.fn().mockImplementation(async (_userId, body) => body),
        };

        const moduleRef = await Test.createTestingModule({
            controllers: [
                AdaptiveExplanationsController,
                AiGuardrailsController,
                CurriculumNavigationController,
                ExternalKnowledgeAiController,
                SourceGroundedAiController,
                StudyGroupAiController,
                StudyGroupMessagesController,
                StudyGroupSessionsController,
                UnifiedSearchController,
                StudyAlertsController,
                NotificationPreferencesController,
            ],
            providers: [
                SessionGuard,
                { provide: SessionService, useValue: sessionService },
                {
                    provide: AdaptiveExplanationsService,
                    useValue: adaptiveExplanationsService,
                },
                { provide: AiGuardrailsService, useValue: guardrailsService },
                {
                    provide: CurriculumNavigationService,
                    useValue: curriculumNavigationService,
                },
                {
                    provide: ExternalKnowledgeAiService,
                    useValue: externalKnowledgeService,
                },
                { provide: SourceGroundedAiService, useValue: sourceGroundedService },
                { provide: StudyGroupAiService, useValue: groupAiService },
                { provide: StudyGroupMessagesService, useValue: messagesService },
                { provide: StudyGroupSessionsService, useValue: sessionsService },
                { provide: UnifiedSearchService, useValue: unifiedSearchService },
                { provide: StudyAlertsService, useValue: alertsService },
                {
                    provide: NotificationPreferencesService,
                    useValue: preferencesService,
                },
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
            }),
        );
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("bloqueia endpoints MF3 sem cookie de sessão", async () => {
        const response = await dispatchJson(app, "POST", "/api/search", {
            query: "mitose",
            jobIds: [jobId],
        });

        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({ code: "UNAUTHENTICATED" });
        expect(unifiedSearchService.search).not.toHaveBeenCalled();
    });

    it("valida DTOs antes de chegar aos services", async () => {
        const response = await dispatchJson(
            app,
            "POST",
            "/api/ai/source-grounded-answers",
            { sourceJobIds: ["invalido"], question: "abc" },
            true,
        );

        expect(response.status).toBe(400);
        expect(sourceGroundedService.ask).not.toHaveBeenCalled();
    });

    it("encaminha guardrails com ator autenticado e payload tipado", async () => {
        const payload = {
            contextType: AiGuardrailContextType.SOLO,
            resourceId,
            prompt: "Explica este conteúdo com base nas minhas fontes.",
        };

        const response = await dispatchJson(
            app,
            "POST",
            "/api/ai/guardrails/check",
            payload,
            true,
        );

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            allowed: true,
            reasonCode: "CONTEXT_ALLOWED",
        });
        expect(guardrailsService.check).toHaveBeenCalledWith(student, payload);
    });

    it("mantém o contrato HTTP de conhecimento externo limitado", async () => {
        const payload = {
            studyAreaId: resourceId,
            question: "Explica este conceito com as minhas fontes.",
            allowExternalKnowledge: true,
        };

        const response = await dispatchJson(
            app,
            "POST",
            "/api/ai/external-knowledge-answers",
            payload,
            true,
        );

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            answer: "Resposta com fontes internas e nota externa limitada.",
        });
        expect(externalKnowledgeService.ask).toHaveBeenCalledWith(student, payload);
    });

    it("mantém o contrato HTTP de explicações adaptadas ao perfil", async () => {
        const payload = {
            studyAreaId: resourceId,
            question: "Adapta esta explicação ao meu perfil.",
        };

        const response = await dispatchJson(
            app,
            "POST",
            "/api/ai/adaptive-explanations",
            payload,
            true,
        );

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            explanation: "Explicação adaptada ao perfil.",
        });
        expect(adaptiveExplanationsService.ask).toHaveBeenCalledWith(
            student,
            payload,
        );
    });

    it("mantém os contratos HTTP de mensagens e notas coletivas", async () => {
        const created = await dispatchJson(
            app,
            "POST",
            `/api/study-groups/${resourceId}/messages`,
            { kind: "MESSAGE", text: "Nota do grupo" },
            true,
        );
        const listed = await dispatchJson(
            app,
            "GET",
            `/api/study-groups/${resourceId}/messages`,
            null,
            true,
        );

        expect(created.status).toBe(201);
        expect(listed.status).toBe(200);
        expect(messagesService.createMessage).toHaveBeenCalledWith(student, resourceId, {
            kind: "MESSAGE",
            text: "Nota do grupo",
        });
        expect(messagesService.listMessages).toHaveBeenCalledWith(
            student,
            resourceId,
        );
    });

    it("mantém os contratos HTTP de sessões coletivas", async () => {
        const payload = {
            title: "Sessão de estudo",
            startsAt: "2026-06-20T10:00:00.000Z",
            durationMinutes: 45,
            goal: "Preparar o teste.",
        };
        const created = await dispatchJson(
            app,
            "POST",
            `/api/study-groups/${resourceId}/sessions`,
            payload,
            true,
        );
        const listed = await dispatchJson(
            app,
            "GET",
            `/api/study-groups/${resourceId}/sessions`,
            null,
            true,
        );

        expect(created.status).toBe(201);
        expect(listed.status).toBe(200);
        expect(sessionsService.createSession).toHaveBeenCalledWith(
            student,
            resourceId,
            payload,
        );
        expect(sessionsService.listGroupSessions).toHaveBeenCalledWith(
            student,
            resourceId,
        );
    });

    it("mantém o contrato HTTP da IA coletiva de grupo", async () => {
        const payload = {
            question: "Ajuda o grupo a rever este tópico.",
            sourceShareIds: [jobId],
        };

        const response = await dispatchJson(
            app,
            "POST",
            `/api/study-groups/${resourceId}/group-ai/questions`,
            payload,
            true,
        );

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            answer: "Resposta coletiva baseada nas fontes.",
        });
        expect(groupAiService.ask).toHaveBeenCalledWith(student, resourceId, payload);
    });

    it("mantém o contrato HTTP de pesquisa unificada", async () => {
        const response = await dispatchJson(
            app,
            "POST",
            "/api/search",
            { query: "mitose", jobIds: [jobId] },
            true,
        );

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ query: "mitose" });
        expect(unifiedSearchService.search).toHaveBeenCalledWith(student, {
            query: "mitose",
            jobIds: [jobId],
        });
    });

    it("mantém o contrato HTTP de navegação curricular", async () => {
        const payload = { jobIds: [jobId] };

        const response = await dispatchJson(
            app,
            "POST",
            "/api/curriculum/navigation",
            payload,
            true,
        );

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            topics: [{ title: "Mitose" }],
        });
        expect(curriculumNavigationService.load).toHaveBeenCalledWith(
            student,
            payload,
        );
    });

    it("rejeita DTOs inválidos nos controllers MF3 adicionais", async () => {
        const invalidSession = await dispatchJson(
            app,
            "POST",
            `/api/study-groups/${resourceId}/sessions`,
            {
                title: "ok",
                startsAt: "not-a-date",
                durationMinutes: 5,
            },
            true,
        );
        const invalidGroupAi = await dispatchJson(
            app,
            "POST",
            `/api/study-groups/${resourceId}/group-ai/questions`,
            { question: "abc", sourceShareIds: ["invalid"] },
            true,
        );

        expect(invalidSession.status).toBe(400);
        expect(invalidGroupAi.status).toBe(400);
        expect(sessionsService.createSession).not.toHaveBeenCalled();
        expect(groupAiService.ask).not.toHaveBeenCalled();
    });

    it("transforma query booleana de alertas e rejeita valores inválidos", async () => {
        const ok = await dispatchJson(
            app,
            "GET",
            "/api/study-alerts?onlyUpcoming=true",
            null,
            true,
        );
        const invalid = await dispatchJson(
            app,
            "GET",
            "/api/study-alerts?onlyUpcoming=talvez",
            null,
            true,
        );

        expect(ok.status).toBe(200);
        expect(alertsService.listAlerts).toHaveBeenCalledWith(student, {
            onlyUpcoming: true,
        });
        expect(invalid.status).toBe(400);
    });

    it("mantém o contrato HTTP de preferências de notificação", async () => {
        const listed = await dispatchJson(
            app,
            "GET",
            "/api/notification-preferences",
            null,
            true,
        );
        const response = await dispatchJson(
            app,
            "PUT",
            "/api/notification-preferences",
            {
                context: NotificationContext.GROUP_SESSION,
                email: false,
                push: false,
                inApp: true,
            },
            true,
        );

        expect(listed.status).toBe(200);
        expect(response.status).toBe(200);
        expect(preferencesService.listEffective).toHaveBeenCalledWith(student.id);
        expect(preferencesService.upsert).toHaveBeenCalledWith(student.id, {
            context: NotificationContext.GROUP_SESSION,
            email: false,
            push: false,
            inApp: true,
        });
    });
});

/**
 * Executa uma chamada contra a app Express criada pelo Nest sem abrir sockets.
 *
 * @param app Aplicação Nest já inicializada.
 * @param method Método HTTP do contrato testado.
 * @param path Caminho completo, incluindo query string.
 * @param body Corpo JSON ou `null` para pedidos sem body.
 * @param authenticated Define se o cookie de sessão deve ser enviado.
 * @returns Status e corpo JSON resultantes da pipeline HTTP real.
 */
async function dispatchJson(
    app: INestApplication,
    method: HttpMethod,
    path: string,
    body: Record<string, unknown> | null,
    authenticated = false,
): Promise<HttpResponse> {
    const payload = body ? JSON.stringify(body) : "";
    const headers: Record<string, string> = {};

    if (payload) {
        headers["content-type"] = "application/json";
        headers["content-length"] = String(Buffer.byteLength(payload));
    }

    if (authenticated) {
        headers.cookie = `${SESSION_COOKIE_NAME}=test-session`;
    }

    const request = Object.assign(
        new Readable({
            /**
             * Executa a operação read no domínio de mf3 http contracts spec ts com contrato explícito.
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
        body: raw ? (JSON.parse(raw) as HttpResponse["body"]) : null,
    };
}

/**
 * Cria um socket local em memória para o parser HTTP do Nest.
 *
 * @returns Stream duplex mínimo, sem abertura de portas.
 */
function makeSocket() {
    return Object.assign(
        new Duplex({
            /**
             * Executa a operação read no domínio de mf3 http contracts spec ts com contrato explícito.
             *
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            read() {},
            /**
             * Executa a operação write no domínio de mf3 http contracts spec ts com contrato explícito.
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
 * Cria a parte mínima de `ServerResponse` que o Express/Nest usa nos testes.
 *
 * @param chunks Buffer onde o corpo de resposta será acumulado.
 * @returns Writable compatível com handlers Express.
 */
function makeWritableResponse(chunks: Buffer[]) {
    const headers: Record<string, HeaderValue> = {};
    return Object.assign(
        new Writable({
            /**
             * Executa a operação write no domínio de mf3 http contracts spec ts com contrato explícito.
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
             * Executa a operação set header no domínio de mf3 http contracts spec ts com contrato explícito.
             *
             * @param name Valor de name usado pela função para executar set header com dados explícitos.
             * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            setHeader(name: string, value: HeaderValue) {
                headers[name.toLowerCase()] = value;
            },
            /**
             * Carrega mf3 http contracts spec ts no formato necessário ao próximo passo do fluxo.
             *
             * @param name Valor de name usado pela função para executar get header com dados explícitos.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            getHeader(name: string) {
                return headers[name.toLowerCase()];
            },
                        /**
             * Carrega mf3 http contracts spec ts no formato necessário ao próximo passo do fluxo.
             * @returns Entidade de mf3 http contracts spec ts já filtrada pelo contexto recebido.
             */
            getHeaders() {
                return { ...headers };
            },
            /**
             * Remove mf3 http contracts spec ts apenas depois das validações de acesso aplicáveis.
             *
             * @param name Valor de name usado pela função para executar remove header com dados explícitos.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            removeHeader(name: string) {
                delete headers[name.toLowerCase()];
            },
            /**
             * Executa a operação write head no domínio de mf3 http contracts spec ts com contrato explícito.
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
