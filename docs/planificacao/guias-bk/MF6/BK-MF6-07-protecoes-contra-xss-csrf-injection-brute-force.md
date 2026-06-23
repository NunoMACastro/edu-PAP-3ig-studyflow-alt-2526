# BK-MF6-07 - Proteções contra XSS, CSRF, Injection, brute force.

## Header

- `doc_id`: `GUIA-BK-MF6-07`
- `bk_id`: `BK-MF6-07`
- `macro`: `MF6`
- `owner`: `Daniel`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF17`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-08`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md`
- `last_updated`: `2026-06-23`

#### Objetivo

Neste BK vais consolidar a defesa transversal da API StudyFlow contra quatro riscos de `RNF17`: XSS refletido em respostas HTTP, CSRF em pedidos com cookies, injection por campos extra nos DTOs e brute force no login.

No fim, a API fica com cabeçalhos defensivos próprios, mantém o middleware CSRF antes dos controllers, mantém validação global com `whitelist` e `forbidNonWhitelisted`, e confirma que o login usa limite de tentativas por email e IP.

#### Importância

`RNF17` é CANONICO em `docs/RNF.md`: a StudyFlow tem de ter proteções contra XSS, CSRF, Injection e brute force. Este BK é importante porque a aplicação já usa cookies HttpOnly, materiais privados, dados de alunos, dados de professores, salas, turmas e IA. Um erro transversal nesta camada pode expor dados ou permitir ações indevidas antes de qualquer regra de domínio ser executada.

Este BK consome `BK-MF6-06`, porque os cookies de sessão tornam CSRF uma preocupação real. Também prepara `BK-MF6-08`, porque processamento de documentos e URLs só deve avançar depois de a API ter proteções base contra pedidos indevidos e payloads inesperados.

#### Scope-in

- Criar `apps/api/src/common/middleware/security-headers.middleware.ts`.
- Integrar `securityHeadersMiddleware` no bootstrap da API.
- Rever que `csrfMiddleware` continua ativo antes dos controllers.
- Rever que `ValidationPipe` rejeita campos extra com `forbidNonWhitelisted`.
- Rever que `LoginAttemptsService` limita brute force por email e IP.
- Criar teste unitário para os cabeçalhos defensivos.
- Validar negativos de CSRF, campos extra e brute force sem expor cookies, emails em claro ou dados pessoais.

#### Scope-out

- Adicionar dependências novas como `helmet` sem aprovação.
- Implementar WAF, bot detection avançado, MFA ou CAPTCHA.
- Alterar o nome do cookie de sessão definido em `BK-MF6-06`.
- Mover decisões de autorização, ownership, membership ou role para o frontend.
- Trocar DTOs ou endpoints de domínio fora de `RNF17`.
- Resolver observabilidade completa de MF7.

#### Estado antes e depois

- Estado antes: `BK-MF6-06` deixa login/logout com cookie HttpOnly, Secure em produção, SameSite e cliente frontend com `credentials: "include"`.
- Estado depois: a API aplica cabeçalhos defensivos, mantém CSRF, rejeita campos inesperados em DTOs e confirma rate limit de login antes de validar credenciais.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md`
- `apps/api/src/main.ts`
- `apps/api/src/common/middleware/csrf.middleware.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/login-attempts.service.ts`
- `apps/api/src/common/validation/mf0-validation-exception.factory.ts`

#### Glossário

- **XSS:** injeção de script no browser. Neste BK, a API reduz impacto com cabeçalhos como `Content-Security-Policy`, mas a UI continua responsável por não renderizar HTML perigoso.
- **CSRF:** pedido de escrita disparado por outro site usando cookies do browser. O middleware bloqueia pedidos sem origem segura ou sem marcador `x-studyflow-csrf`.
- **Injection por campos extra:** tentativa de enviar propriedades não previstas no DTO. O `ValidationPipe` com `whitelist` e `forbidNonWhitelisted` rejeita esses campos.
- **Brute force:** repetição de tentativas de login até acertar credenciais. `LoginAttemptsService` limita falhas por email e IP.
- **Defesa em profundidade:** várias proteções pequenas trabalham em conjunto. Nenhuma substitui autenticação, autorização, ownership ou membership.
- **Rate limit:** limite temporário de tentativas para reduzir abuso sem guardar emails ou IPs em claro.
- **Evidence:** prova técnica com comando, output e interpretação, sem copiar cookies, valores de sessão, emails completos ou dados pessoais.

#### Conceitos teóricos essenciais

- **Middleware backend:** função executada antes dos controllers. Neste BK, headers e CSRF entram neste ponto para proteger todos os endpoints sem repetir código.
- **Cabeçalhos defensivos:** instruções HTTP que reduzem risco de execução indevida no browser. `X-Frame-Options` evita enquadramento malicioso, `X-Content-Type-Options` evita sniffing, e `Content-Security-Policy` limita origens aceites.
- **Cookie HttpOnly e CSRF:** o JavaScript não lê o cookie, mas o browser envia-o automaticamente. Por isso, pedidos de escrita precisam de validação adicional.
- **DTO e validação global:** os DTOs dizem que campos são aceites. A validação global impede que campos extra entrem nos services e sejam usados por engano.
- **Brute force no login:** a API deve verificar o limite antes de validar credenciais e registar falhas sem guardar email ou IP em claro.
- **Privacidade e logs:** erros públicos devem explicar a falha sem mostrar sessão, hash, cookie, prompt privado, resposta IA privada ou dados de outro utilizador.
- **Limite deste BK:** headers reduzem impacto de XSS refletido, mas não substituem escaping em React, revisão de componentes nem autorização backend.

#### Arquitetura do BK

- Middleware novo: `apps/api/src/common/middleware/security-headers.middleware.ts`.
- Bootstrap editado: `apps/api/src/main.ts`.
- Middleware existente revisto: `apps/api/src/common/middleware/csrf.middleware.ts`.
- Serviço existente revisto: `apps/api/src/modules/auth/login-attempts.service.ts`.
- Controller existente revisto: `apps/api/src/modules/auth/auth.controller.ts`.
- Validação existente revisto: `apps/api/src/common/validation/mf0-validation-exception.factory.ts`.
- Teste novo: `apps/api/src/common/middleware/security-headers.middleware.spec.ts`.
- Endpoints afetados: todos os endpoints passam por headers e validação; `POST /api/auth/login` mantém proteção contra brute force; métodos de escrita passam por CSRF.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/middleware/security-headers.middleware.ts`
- EDITAR: `apps/api/src/main.ts`
- CRIAR: `apps/api/src/common/middleware/security-headers.middleware.spec.ts`
- REVER: `apps/api/src/common/middleware/csrf.middleware.ts`
- REVER: `apps/api/src/common/middleware/csrf.middleware.spec.ts`
- REVER: `apps/api/src/modules/auth/auth.controller.ts`
- REVER: `apps/api/src/modules/auth/login-attempts.service.ts`
- REVER: `apps/api/src/modules/auth/login-attempts.service.spec.ts`
- REVER: `apps/api/src/common/validation/mf0-validation-exception.factory.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega `RNF17` sem alterar metadados canónicos, endpoints de domínio ou regras de ownership/membership.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linha `RNF17` e linha de `BK-MF6-07`.

3. Instruções do que fazer.

Confirma que `RNF17` fala de XSS, CSRF, Injection e brute force. Mantém `bk_id`, `owner`, `apoio`, `prioridade`, `sprint`, `rf_rnf` e `proximo_bk` do header. Se encontrares divergência de owner entre matriz e contrato de campos, segue a matriz e regista a divergência no relatório.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental porque fixa o contrato antes de mexer na API.

5. Explicação do código.

Não há código porque primeiro tens de fechar a fonte de verdade. Isto evita mudar requisitos, trocar owners ou criar funcionalidades que não pertencem a `RNF17`.

6. Validação do passo.

Confirma que o header continua com `RNF17`, `P0`, `S10`, `Reforco` e `proximo_bk: BK-MF6-08`.

7. Cenário negativo/erro esperado.

Se o guia tentar trocar `RNF17` por outro RNF ou alterar a sequência para outro BK, a revisão deve bloquear a alteração.

### Passo 2 - Mapear as defesas que já existem

1. Objetivo funcional do passo no contexto da app.

Identificar que peças já existem desde MF0 a MF6 para não duplicar autenticação, sessão, validação ou rate limit.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/main.ts`
    - REVER: `apps/api/src/common/middleware/csrf.middleware.ts`
    - REVER: `apps/api/src/modules/auth/auth.controller.ts`
    - REVER: `apps/api/src/modules/auth/login-attempts.service.ts`
    - REVER: `apps/api/src/common/validation/mf0-validation-exception.factory.ts`
    - LOCALIZAÇÃO: bootstrap da API, middleware CSRF, método `login`, service de tentativas e configuração do `ValidationPipe`.

3. Instruções do que fazer.

Faz uma lista com quatro proteções: headers contra XSS refletido, CSRF, DTO whitelist contra campos extra e rate limit contra brute force. Neste BK só vais criar a peça que falta, os headers defensivos, e vais confirmar que as outras continuam ligadas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura técnica e preparação.

5. Explicação do código.

Não há código porque o objetivo é evitar duplicação. `csrfMiddleware`, `ValidationPipe` e `LoginAttemptsService` já são contratos da app; este BK consolida a camada transversal em vez de inventar outro login ou outro sistema de sessão.

6. Validação do passo.

Confirma que `main.ts` usa `cookieParser`, `csrfMiddleware` e `ValidationPipe`, e que `AuthController.login` chama `LoginAttemptsService` antes de validar credenciais.

7. Cenário negativo/erro esperado.

Se não encontrares uma das quatro proteções, não marques o BK como concluído. Regressa ao passo técnico correspondente e completa o contrato.

### Passo 3 - Criar middleware de cabeçalhos defensivos

1. Objetivo funcional do passo no contexto da app.

Criar uma defesa transversal simples, sem dependência nova, para adicionar cabeçalhos HTTP a todas as respostas da API.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/middleware/security-headers.middleware.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. A política é `DERIVADO`: é a menor solução coerente com a PAP sem adicionar uma biblioteca nova. A política não substitui CSRF, DTOs, rate limit nem autorização backend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/middleware/security-headers.middleware.ts
import { NextFunction, Request, Response } from "express";

/**
 * Aplica cabeçalhos defensivos transversais nas respostas HTTP da API.
 *
 * Estes cabeçalhos reduzem risco de XSS refletido, clickjacking, sniffing de
 * conteúdo e exposição desnecessária de capacidades do browser. A política é
 * intencionalmente pequena para caber no MVP sem adicionar dependências novas.
 *
 * @param _request Pedido HTTP recebido pela API.
 * @param response Resposta HTTP onde os cabeçalhos são aplicados.
 * @param next Função que continua a cadeia de middlewares.
 * @returns Nada; a função apenas configura cabeçalhos e passa o pedido adiante.
 */
export function securityHeadersMiddleware(
    _request: Request,
    response: Response,
    next: NextFunction,
): void {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "same-origin");
    response.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
    );
    response.setHeader(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "form-action 'self'",
        ].join("; "),
    );

    // Os headers reduzem impacto no browser, mas não substituem validação nem autorização backend.
    next();
}
```

5. Explicação do código.

O ficheiro exporta uma função Express compatível com Nest. A entrada é o pedido HTTP e a resposta que ainda vai seguir para o controller. A saída observável são cabeçalhos como `X-Frame-Options` e `Content-Security-Policy`. Isto cumpre a parte de XSS/clickjacking de `RNF17`, prepara evidence objetiva e evita adicionar dependência sem justificação. A função termina com `next()` para não bloquear pedidos válidos.

6. Validação do passo.

Executa `npm --prefix apps/api run build` depois de integrares o middleware no passo seguinte.

7. Cenário negativo/erro esperado.

Se `next()` for removido, os pedidos ficam presos no middleware e os controllers deixam de responder. Esse erro confirma porque o middleware deve sempre passar o controlo após configurar os headers.

### Passo 4 - Integrar headers, CSRF e validação global no bootstrap

1. Objetivo funcional do passo no contexto da app.

Garantir que headers, cookies, CSRF e validação global entram antes dos controllers receberem pedidos.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/main.ts`
    - REVER: `apps/api/src/common/middleware/csrf.middleware.ts`
    - REVER: `apps/api/src/common/validation/mf0-validation-exception.factory.ts`
    - LOCALIZAÇÃO: ficheiro completo `apps/api/src/main.ts`.

3. Instruções do que fazer.

Substitui ou confirma o conteúdo de `main.ts` com a versão abaixo. Mantém `securityHeadersMiddleware` antes de `csrfMiddleware`, e mantém `ValidationPipe` com `whitelist`, `forbidNonWhitelisted`, `transform` e `exceptionFactory`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/main.ts
/**
 * Arranca a aplicação e liga a configuração global necessária ao runtime.
 */
import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { csrfMiddleware } from "./common/middleware/csrf.middleware.js";
import { securityHeadersMiddleware } from "./common/middleware/security-headers.middleware.js";
import { mf0ValidationExceptionFactory } from "./common/validation/mf0-validation-exception.factory.js";

/**
 * Arranca a API StudyFlow com proteções transversais de sessão e validação.
 *
 * @returns Promise resolvida quando o servidor HTTP estiver pronto.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    // Headers defensivos devem ser globais para cobrir todos os endpoints da API.
    app.use(securityHeadersMiddleware);
    app.use(cookieParser());
    app.use(csrfMiddleware);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            // A factory mantém mensagens de validação controladas e sem expor dados sensíveis.
            exceptionFactory: mf0ValidationExceptionFactory,
        }),
    );
    app.enableCors({
        origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
        credentials: true,
    });

    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
}

void bootstrap();
```

5. Explicação do código.

`securityHeadersMiddleware` aplica a parte de XSS/clickjacking. `cookieParser` lê o cookie opaco criado no BK anterior. `csrfMiddleware` bloqueia pedidos de escrita sem origem segura ou sem marcador. `ValidationPipe` rejeita campos extra e transforma DTOs antes dos controllers. `enableCors` mantém credenciais porque o frontend usa cookies HttpOnly. Esta ordem evita o erro comum de validar CSRF depois de o controller já ter executado uma ação.

6. Validação do passo.

Executa `npm --prefix apps/api run build`. Depois confirma que um pedido `POST` sem `x-studyflow-csrf` para um endpoint de escrita devolve `403` com `code: "CSRF_CHECK_FAILED"`.

7. Cenário negativo/erro esperado.

Se `forbidNonWhitelisted` ficar `false`, um payload com campo extra pode atravessar a validação. Esse cenário deve ser rejeitado antes de chegar ao service.

### Passo 5 - Confirmar CSRF e brute force no backend

1. Objetivo funcional do passo no contexto da app.

Garantir que as duas proteções já existentes continuam explícitas no guia: CSRF para pedidos com cookies e brute force para login.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/common/middleware/csrf.middleware.ts`
    - REVER: `apps/api/src/modules/auth/auth.controller.ts`
    - REVER: `apps/api/src/modules/auth/login-attempts.service.ts`
    - LOCALIZAÇÃO: ficheiro completo do middleware CSRF e métodos `assertCanAttempt`, `recordFailedLogin`, `clearEmailFailures` do service.

3. Instruções do que fazer.

Confirma que `csrf.middleware.ts` corresponde ao contrato abaixo e que `AuthController.login` chama `assertCanAttempt` antes de `validateLogin`, `recordFailedLogin` quando a password falha e `clearEmailFailures` quando o login é bem-sucedido.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/middleware/csrf.middleware.ts
/**
 * Aplica middleware transversal antes dos controllers processarem pedidos.
 */
import { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Aplica uma proteção CSRF mínima compatível com cookies HttpOnly.
 *
 * @param request Pedido HTTP recebido pelo Nest/Express.
 * @param response Resposta HTTP usada para terminar pedidos bloqueados.
 * @param next Função que passa o pedido para o próximo middleware.
 * @returns Nada; termina a resposta quando o pedido falha a validação.
 */
export function csrfMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (SAFE_METHODS.has(request.method)) {
        next();
        return;
    }

    const csrfHeader = request.header("x-studyflow-csrf");
    const origin = request.header("origin");
    const host = request.header("host");
    const sameOrigin = isSameOrigin(origin, host);

    if (csrfHeader === "1" || sameOrigin) {
        next();
        return;
    }

    // A mensagem pública explica o bloqueio sem revelar cookies ou identificadores da sessão.
    response.status(403).json({
        code: "CSRF_CHECK_FAILED",
        message: "Pedido bloqueado por proteção CSRF.",
    });
}

/**
 * Compara o host recebido com o host parseado do Origin.
 *
 * @param origin Cabeçalho Origin enviado pelo browser.
 * @param host Cabeçalho Host do pedido.
 * @returns Verdadeiro apenas quando os hosts são exatamente iguais.
 */
function isSameOrigin(origin?: string, host?: string): boolean {
    if (!origin || !host) return false;

    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}
```

```ts
// apps/api/src/modules/auth/login-attempts.service.ts
/**
 * Implementa as regras de negócio de auth e concentra validações do domínio.
 */
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { SESSION_REDIS } from "./session.service.js";
import { SessionStore } from "./session-store.js";

const LOGIN_ATTEMPT_TTL_SECONDS = 15 * 60;
const MAX_FAILURES_BY_EMAIL = 5;
const MAX_FAILURES_BY_IP = 50;

/**
 * Controla tentativas falhadas de login com chaves Redis de curta duração.
 */
@Injectable()
export class LoginAttemptsService {
    /**
     * Recebe o store de sessão para guardar contadores temporários.
     *
     * @param redis Store Redis ou equivalente usado pela app para estado efémero.
     */
    constructor(@Inject(SESSION_REDIS) private readonly redis: SessionStore) {}

    /**
     * Bloqueia novas tentativas quando email ou IP excederam o limite.
     *
     * @param email Email recebido no login.
     * @param ip Endereço IP observado pelo servidor.
     * @returns Promise resolvida quando a tentativa pode continuar.
     */
    async assertCanAttempt(email: string, ip: string): Promise<void> {
        const [emailFailures, ipFailures] = await Promise.all([
            this.getCount(this.emailKey(email)),
            this.getCount(this.ipKey(ip)),
        ]);

        if (
            emailFailures >= MAX_FAILURES_BY_EMAIL ||
            ipFailures >= MAX_FAILURES_BY_IP
        ) {
            throw new HttpException(
                {
                    code: "LOGIN_RATE_LIMITED",
                    message:
                        "Demasiadas tentativas falhadas. Tenta novamente mais tarde.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    /**
     * Regista uma tentativa falhada por email e por IP.
     *
     * @param email Email recebido no login.
     * @param ip Endereço IP observado pelo servidor.
     * @returns Promise resolvida depois de atualizar os contadores.
     */
    async recordFailedLogin(email: string, ip: string): Promise<void> {
        await Promise.all([
            this.incrementWithTtl(this.emailKey(email)),
            this.incrementWithTtl(this.ipKey(ip)),
        ]);
    }

    /**
     * Limpa falhas associadas ao email depois de autenticação bem-sucedida.
     *
     * @param email Email autenticado.
     * @returns Promise resolvida depois de remover o contador do email.
     */
    async clearEmailFailures(email: string): Promise<void> {
        await this.redis.del(this.emailKey(email));
    }

    /**
     * Obtém o contador atual para uma chave.
     *
     * @param key Chave interna sem email ou IP em claro.
     * @returns Número de falhas registadas.
     */
    private async getCount(key: string): Promise<number> {
        const value = await this.redis.get(key);
        return Number.parseInt(value ?? "0", 10) || 0;
    }

    /**
     * Incrementa um contador e aplica TTL quando a chave é criada.
     *
     * @param key Chave interna sem dados pessoais em claro.
     * @returns Promise resolvida depois de atualizar a chave.
     */
    private async incrementWithTtl(key: string): Promise<void> {
        const count = await this.redis.incr(key);
        if (count === 1) {
            // O TTL impede bloqueios permanentes e reduz retenção de dados técnicos.
            await this.redis.expire(key, LOGIN_ATTEMPT_TTL_SECONDS);
        }
    }

    /**
     * Cria chave Redis sem guardar o email em claro.
     *
     * @param email Email recebido no login.
     * @returns Chave namespaced e anonimizada.
     */
    private emailKey(email: string): string {
        return `studyflow:login-attempts:email:${this.hash(
            email.trim().toLowerCase(),
        )}`;
    }

    /**
     * Cria chave Redis sem guardar o IP em claro.
     *
     * @param ip Endereço IP recebido.
     * @returns Chave namespaced e anonimizada.
     */
    private ipKey(ip: string): string {
        return `studyflow:login-attempts:ip:${this.hash(ip)}`;
    }

    /**
     * Hash determinístico usado apenas para chaves técnicas de rate limit.
     *
     * @param value Valor sensível a anonimizar.
     * @returns SHA-256 hexadecimal.
     */
    private hash(value: string): string {
        return createHash("sha256").update(value).digest("hex");
    }
}
```

5. Explicação do código.

O middleware CSRF protege pedidos de escrita com cookies. Métodos seguros avançam sem bloqueio porque não alteram estado. Pedidos `POST`, `PATCH` ou `DELETE` precisam de origem segura ou de `x-studyflow-csrf: 1`. O service de tentativas usa Redis para contar falhas e faz hash do email/IP antes de criar chaves. Isto reduz brute force e evita guardar dados pessoais em claro. O `AuthController` deve chamar este service antes de validar credenciais para que o atacante não consiga gastar recursos infinitos no login.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit -- csrf.middleware.spec.ts` se a tua configuração permitir filtrar testes. Executa também a suite geral com `npm --prefix apps/api run test:unit`.

7. Cenário negativo/erro esperado.

Um pedido `POST` sem origin same-host e sem `x-studyflow-csrf` deve devolver `403`. Depois de falhas repetidas de login, o endpoint deve devolver `429` com `code: "LOGIN_RATE_LIMITED"`.

### Passo 6 - Criar teste dos cabeçalhos defensivos

1. Objetivo funcional do passo no contexto da app.

Criar evidence automatizada para a peça nova deste BK.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/middleware/security-headers.middleware.spec.ts`
    - REVER: `apps/api/src/common/middleware/csrf.middleware.spec.ts`
    - REVER: `apps/api/src/modules/auth/login-attempts.service.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo do teste novo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele valida os headers principais e confirma que `next()` é chamado exatamente uma vez.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/middleware/security-headers.middleware.spec.ts
/**
 * Testa os cabeçalhos defensivos aplicados antes dos controllers.
 */
import { NextFunction, Request, Response } from "express";
import { securityHeadersMiddleware } from "./security-headers.middleware.js";

describe("securityHeadersMiddleware", () => {
    /**
     * Confirma que a resposta recebe headers de hardening e continua o fluxo.
     */
    it("aplica cabeçalhos defensivos e chama next", () => {
        const headers = new Map<string, string>();
        const next: NextFunction = jest.fn();
        const response = createResponse(headers);

        securityHeadersMiddleware({} as Request, response, next);

        expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(headers.get("X-Frame-Options")).toBe("DENY");
        expect(headers.get("Referrer-Policy")).toBe("same-origin");
        expect(headers.get("Content-Security-Policy")).toContain(
            "frame-ancestors 'none'",
        );
        expect(next).toHaveBeenCalledTimes(1);
    });
});

/**
 * Cria uma resposta mínima para observar chamadas a `setHeader`.
 *
 * @param headers Mapa onde o teste guarda os headers configurados.
 * @returns Response parcial compatível com Express.
 */
function createResponse(headers: Map<string, string>): Response {
    const response: Pick<Response, "setHeader"> = {
        setHeader(name: string, value: number | string | readonly string[]) {
            headers.set(name, Array.isArray(value) ? value.join(",") : String(value));
            return response as Response;
        },
    };

    // O cast passa por unknown para manter o teste tipado sem recorrer a `any`.
    return response as unknown as Response;
}
```

5. Explicação do código.

O teste cria uma resposta mínima e observa os headers definidos pelo middleware. Isto valida a parte nova de `RNF17` sem iniciar servidor HTTP. O teste também confirma que `next()` é chamado, porque um middleware que não continua o fluxo bloqueia toda a API. A função auxiliar usa `unknown` para adaptar a resposta parcial ao tipo Express sem perder a intenção do teste.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit` e confirma que os testes de `securityHeadersMiddleware`, `csrfMiddleware` e `LoginAttemptsService` passam.

7. Cenário negativo/erro esperado.

Se removeres `X-Frame-Options`, o teste deve falhar. Se removeres `next()`, o teste também deve falhar.

### Passo 7 - Fechar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-08` recebe uma API com proteções transversais antes de processar documentos e URLs.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md`
    - LOCALIZAÇÃO: secções `Critérios de aceite`, `Validação final`, `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista evidence com comandos e resultados. Não copies valores de cookies, IDs de sessão, emails completos, IPs completos, prompts privados ou respostas IA privadas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha prova e continuidade.

5. Explicação do código.

Não há código porque a implementação ficou nos passos anteriores. O objetivo agora é provar que as quatro famílias de `RNF17` foram tratadas: headers, CSRF, DTO whitelist e brute force.

6. Validação do passo.

Guarda os resultados de `npm --prefix apps/api run build`, `npm --prefix apps/api run test:unit`, pesquisa por termos proibidos e `bash scripts/validate-planificacao.sh`.

7. Cenário negativo/erro esperado.

Se algum teste de CSRF, headers, rate limit ou validação global falhar, não avances para `BK-MF6-08`.

#### Critérios de aceite

- `securityHeadersMiddleware` existe e é usado em `main.ts`.
- `csrfMiddleware` continua ativo antes dos controllers.
- `ValidationPipe` mantém `whitelist: true` e `forbidNonWhitelisted: true`.
- `LoginAttemptsService` bloqueia brute force por email e IP.
- O login não guarda email ou IP em claro nas chaves de rate limit.
- O teste de headers passa.
- Os testes de CSRF e brute force continuam a passar.
- A evidence não expõe cookies, sessões, hashes, emails completos, IPs completos, prompts privados ou dados pessoais.

#### Validação final

- `npm --prefix apps/api run build`
- `npm --prefix apps/api run test:unit`
- Pedido `POST` sem marcador CSRF devolve `403` com `CSRF_CHECK_FAILED`.
- Payload com campo extra num DTO devolve erro de validação.
- Tentativas repetidas de login falham com `429` e `LOGIN_RATE_LIMITED`.
- Pesquisa textual final sem ocorrências de caminhos privados, raízes de referência internas, casts inseguros ou tipos de payload soltos.

#### Evidence para PR/defesa

- `npm --prefix apps/api run build` com sucesso.
- `npm --prefix apps/api run test:unit` com sucesso.
- Prova de headers: resposta com `X-Frame-Options: DENY` e `Content-Security-Policy`.
- Prova negativa CSRF: `403 CSRF_CHECK_FAILED`.
- Prova negativa brute force: `429 LOGIN_RATE_LIMITED`.
- Prova negativa DTO: campo extra rejeitado pelo backend.
- Nota de privacidade: evidence sem cookies, sessões, emails completos, IPs completos ou dados pessoais.

#### Handoff

- Entrega para `BK-MF6-08`: a API passa a ter headers defensivos, CSRF ativo, validação global contra campos extra e rate limit de login.
- `BK-MF6-08` pode focar-se no processamento seguro de ficheiros e URLs sem repetir autenticação, sessão ou CSRF.
- Decisão `DERIVADO`: usar middleware manual de headers sem dependência nova.
- Risco residual: esta camada reduz XSS refletido em respostas HTTP, mas a UI continua responsável por não renderizar HTML perigoso.

#### Changelog

- `2026-06-23`: guia corrigido para cobrir `RNF17` de forma completa: headers, CSRF, validation pipe, brute force, testes, negativos e handoff para `BK-MF6-08`.
