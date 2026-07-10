# BK-MF6-06 - Sessões com cookies HttpOnly + Secure + SameSite.

## Header

- `doc_id`: `GUIA-BK-MF6-06`
- `bk_id`: `BK-MF6-06`
- `macro`: `MF6`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF16`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-07`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais consolidar a política de cookies de sessão da StudyFlow. O login e o logout passam a usar as mesmas opções de cookie, com `HttpOnly`, `Secure` em produção, `SameSite=Lax`, `path=/` e duração alinhada com a sessão no backend.

No fim, a sessão continua opaca e a entrada Redis v2 guarda apenas `{ userId, sessionVersion }`. Cada pedido relê no MongoDB o papel, `accountStatus` e a versão atual; conta não `ACTIVE` ou versão divergente devolve `401 SESSION_REVOKED` e elimina a sessão.

`User` passa a ter `accountStatus: ACTIVE | DELETION_PENDING | DELETED` e `sessionVersion`. Mudança de papel e eliminação incrementam a versão dentro da transaction correspondente, revogando todas as sessões; o rollout invalida deliberadamente sessões antigas. O frontend representa `checking | authenticated | anonymous | unavailable`, e apenas `401` produz `anonymous`.

#### Importância

`RNF16` é CANONICO em `docs/RNF.md`: sessões devem usar cookies `HttpOnly`, `Secure` e `SameSite`. Este requisito reduz roubo de sessão por JavaScript, limita envio indevido de cookies e obriga a aplicação a tratar login/logout como um contrato de backend.

Este BK consome `BK-MF6-05`, porque a sessão só deve ser criada depois de as credenciais passarem pela autenticação segura. Também prepara `BK-MF6-07`, que reforça CSRF, headers e brute force.

#### Scope-in

- Criar uma política única de cookie em `apps/api/src/modules/auth/session-cookie.options.ts`.
- Usar essa política no login e no logout de `AuthController`.
- Rever o cliente real em `apps/web/src/lib/apiClient.ts`.
- Criar teste unitário para flags de sessão.
- Criar testes de múltiplas sessões, mudança concorrente de papel, conta eliminada, sessão antiga e `SESSION_REVOKED`.
- Validar que o cookie não é lido pelo JavaScript e que o frontend usa `credentials: "include"`.

#### Scope-out

- Criar novo endpoint de autenticação.
- Mudar o nome público do cookie `sf_sid`.
- Implementar MFA, rotação avançada de sessão ou gestão de dispositivos.
- Guardar sessão, token ou cookie em storage do browser.
- Resolver toda a proteção CSRF/brute force de `BK-MF6-07`.
- Exigir HTTPS local durante desenvolvimento.

#### Estado antes e depois

- Estado antes: `AuthController` já define e limpa o cookie, mas as opções de login e logout aparecem duplicadas dentro do controller.
- Estado depois: login e logout reutilizam uma política única de cookie e o cliente real de frontend mantém `credentials: "include"`.

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
- `docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/session.service.ts`
- `apps/web/src/lib/apiClient.ts`

#### Glossário

- **Sessão opaca:** identificador aleatório guardado no cookie, sem dados pessoais visíveis no browser.
- **Cookie HttpOnly:** cookie definido pelo servidor que JavaScript no browser não consegue ler.
- **Secure:** flag que impede envio do cookie fora de HTTPS. Neste BK fica ativa em produção.
- **SameSite=Lax:** política que reduz envio de cookies em navegação cross-site e mantém compatibilidade com fluxos normais.
- **TTL:** tempo de vida da sessão. O cookie deve durar o mesmo que a sessão no backend.
- **`credentials: "include"`:** opção `fetch` que permite ao browser enviar e receber cookies HttpOnly.
- **CSRF marker:** cabeçalho simples já usado pelo cliente para distinguir chamadas legítimas da UI.

#### Conceitos teóricos essenciais

- **Cookie vs sessão.** O cookie guarda só o identificador `sf_sid`; os dados do utilizador ficam no servidor, associados à sessão guardada por `SessionService`.
- **HttpOnly.** Impede que scripts no browser leiam o cookie. Isto reduz impacto de XSS, mas não substitui `BK-MF6-07`.
- **Secure.** Em produção, o cookie só deve atravessar HTTPS. Esta regra depende do canal seguro preparado em `BK-MF6-04`.
- **SameSite.** Define quando o browser envia cookies em navegação entre sites. `Lax` é uma decisão `DERIVADO` porque reduz risco de CSRF sem bloquear o fluxo normal da PAP.
- **Login e logout simétricos.** O mesmo nome, path e flags devem ser usados para criar e limpar o cookie. Se forem diferentes, o browser pode manter uma sessão antiga.
- **Cliente API centralizado.** O frontend real usa `apps/web/src/lib/apiClient.ts`. Criar outro cliente com caminho diferente causa chamadas desalinhadas e aumenta risco de esquecer `credentials: "include"`.
- **Privacidade da evidence.** Prints de `Set-Cookie` podem mostrar flags, mas não devem mostrar o valor real de `sf_sid`.

#### Arquitetura do BK

- Endpoints mantidos: `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me`.
- Service existente: `SessionService`, que cria e destrói sessões opacas.
- Helper novo: `apps/api/src/modules/auth/session-cookie.options.ts`.
- Controller editado: `apps/api/src/modules/auth/auth.controller.ts`.
- Cliente frontend revisto: `apps/web/src/lib/apiClient.ts`.
- Teste novo: `apps/api/src/modules/auth/session-cookie.options.spec.ts`.
- Regra de segurança: o backend define flags de cookie; o frontend apenas envia pedidos com credenciais incluídas.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/auth/session-cookie.options.ts`
- EDITAR: `apps/api/src/modules/auth/auth.controller.ts`
- CRIAR: `apps/api/src/modules/auth/session-cookie.options.spec.ts`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/api/src/modules/auth/session.service.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e handoff anterior

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-06` entrega `RNF16` e consome o fluxo de autenticação seguro deixado por `BK-MF6-05`.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md`
    - LOCALIZAÇÃO: linhas de `RNF16`, linha canónica de `BK-MF6-06` e handoff de `BK-MF6-05`.

3. Instruções do que fazer.

Confirma que o BK mantém `P0`, `S10`, `Reforco`, `proximo_bk: BK-MF6-07` e que não altera os endpoints de auth.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita quebrar a sequência da MF.

5. Explicação do código.

Não há código porque o objetivo é fixar escopo. Este BK não decide se o login é válido; isso já vem de `AuthService.validateLogin`. Este BK decide como a sessão validada é entregue ao browser.

6. Validação do passo.

O contrato fica correto se `RNF16` estiver alinhado em RNF, matriz, backlog e contrato de campos.

7. Cenário negativo/erro esperado.

Se o guia tentar criar outro endpoint de login ou mudar o nome do cookie sem contrato, a revisão deve bloquear a alteração.

### Passo 2 - Rever sessão, cookie e cliente real

1. Objetivo funcional do passo no contexto da app.

Identificar os pontos reais que já existem antes de centralizar a política de cookie.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/session.service.ts`
    - REVER: `apps/api/src/modules/auth/auth.controller.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: constantes `SESSION_COOKIE_NAME`, `SESSION_TTL_SECONDS`, métodos `login`, `logout` e função `requestJson`.

3. Instruções do que fazer.

Confirma que `SESSION_COOKIE_NAME` é `sf_sid`, que `SessionService` cria uma sessão opaca e que o cliente real é `apps/web/src/lib/apiClient.ts`. Não cries outro cliente API paralelo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura técnica.

5. Explicação do código.

Não há código porque estás a localizar contratos. O backend cria e limpa a sessão; o frontend apenas envia pedidos com cookies incluídos. Se o caminho do cliente frontend estiver errado, os alunos podem alterar um ficheiro que a app não usa.

6. Validação do passo.

Executa uma pesquisa de ficheiro:

```bash
find apps/web/src -path '*apiClient.ts' -print
```

O resultado esperado é `apps/web/src/lib/apiClient.ts`.

7. Cenário negativo/erro esperado.

Se aparecer outro cliente API que também faça login/logout, não dupliques chamadas. Centraliza a revisão no cliente já usado pelas páginas.

### Passo 3 - Criar política única de cookie

1. Objetivo funcional do passo no contexto da app.

Criar funções reutilizáveis para criar e limpar o cookie de sessão com as mesmas flags.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/auth/session-cookie.options.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém a decisão `secure` dependente de `NODE_ENV === "production"` para não bloquear desenvolvimento local.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/auth/session-cookie.options.ts
/**
 * Define a política única dos cookies de sessão StudyFlow.
 */
import { CookieOptions } from "express";
import { SESSION_TTL_SECONDS } from "./session.service.js";

/**
 * Devolve as opções usadas para criar o cookie de sessão.
 *
 * @returns Opções Express com flags alinhadas com RNF16.
 */
export function sessionCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_SECONDS * 1000,
        path: "/",
    };
}

/**
 * Devolve as opções usadas para limpar o cookie de sessão.
 *
 * @returns Opções sem `maxAge`, mantendo nome/path/flags compatíveis.
 */
export function clearSessionCookieOptions(): CookieOptions {
    const { maxAge: _maxAge, ...options } = sessionCookieOptions();

    // Limpar com as mesmas flags evita deixar um cookie antigo preso no browser.
    return options;
}
```

5. Explicação do código.

`sessionCookieOptions` concentra a política de criação do cookie. `httpOnly: true` impede leitura por JavaScript. `secure` fica ligado apenas em produção, porque `BK-MF6-04` trata o canal seguro real e o desenvolvimento local pode não ter TLS. `sameSite: "lax"` reduz risco de envio cross-site sem quebrar navegação normal.

`clearSessionCookieOptions` remove `maxAge`, mas mantém as outras opções. Isto é importante porque o browser só limpa corretamente o cookie se path e flags forem compatíveis com o cookie criado.

6. Validação do passo.

Confirma que o ficheiro importa `SESSION_TTL_SECONDS` de `session.service.js` e exporta as duas funções.

7. Cenário negativo/erro esperado.

Se o logout usar `path` diferente do login, o cookie pode não desaparecer. O teste do passo 6 deve proteger essa regressão.

### Passo 4 - Integrar a política no AuthController

1. Objetivo funcional do passo no contexto da app.

Usar a política única no login e no logout, sem mudar o contrato dos endpoints.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/auth/auth.controller.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o conteúdo de `auth.controller.ts` pela versão abaixo. A mudança principal é remover a duplicação de opções dentro do controller.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/auth/auth.controller.ts
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
import { SESSION_COOKIE_NAME, SessionService } from "./session.service.js";
import { AuthService } from "./auth.service.js";
import { LoginAttemptsService } from "./login-attempts.service.js";

/**
 * Controller de autenticação da MF0.
 *
 * Expõe registo, login, logout e consulta da sessão atual. O cookie de sessão
 * é HttpOnly e não há tokens guardados pelo frontend.
 */
@Controller("api/auth")
export class AuthController {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param authService Service de autenticação local.
     * @param sessionService Service de sessões opacas.
     * @param loginAttemptsService Service de controlo de tentativas de login.
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

        // Só o identificador opaco vai para o browser; os dados ficam no servidor.
        response.cookie(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());
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
            // Primeiro invalida a sessão no servidor; depois remove o cookie do browser.
            await this.sessionService.destroySession(sessionId);
        }

        response.clearCookie(
            SESSION_COOKIE_NAME,
            clearSessionCookieOptions(),
        );

        return { ok: true };
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
```

5. Explicação do código.

O controller continua a expor os mesmos endpoints. O login valida credenciais, aplica controlo de tentativas, cria sessão opaca e define o cookie com `sessionCookieOptions`. O logout destrói a sessão no servidor e limpa o cookie com `clearSessionCookieOptions`.

O frontend não recebe o conteúdo da sessão; recebe apenas o cookie HttpOnly no browser. A decisão de `Secure` fica no backend e depende do ambiente. A regra evita duplicação entre login e logout e prepara `BK-MF6-07`, onde CSRF e headers ficam mais explícitos.

6. Validação do passo.

Confirma que `auth.controller.ts` já não importa `SESSION_TTL_SECONDS` diretamente e que usa `sessionCookieOptions` e `clearSessionCookieOptions`.

7. Cenário negativo/erro esperado.

Se o logout limpar o cookie com opções diferentes das usadas no login, o browser pode manter `sf_sid`. O teste do passo 6 deve apanhar divergência em `path`, `sameSite`, `secure` e `httpOnly`.

### Passo 5 - Rever o cliente API real

1. Objetivo funcional do passo no contexto da app.

Confirmar que o frontend envia pedidos autenticados sem ler o cookie HttpOnly.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: função `requestJson`.

3. Instruções do que fazer.

Não cries outro cliente API. Confirma que `requestJson` usa `credentials: "include"` e que não guarda sessão em storage do browser.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/apiClient.ts
/**
 * Executa um pedido JSON para a API mantendo cookies HttpOnly.
 *
 * @param path Caminho relativo começado por `/api`.
 * @param options Opções fetch adicionais.
 * @returns JSON parseado no tipo pedido pelo chamador.
 */
async function requestJson<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    // O CSRF marker acompanha chamadas autenticadas sem expor o cookie ao JavaScript.
    headers.set("x-studyflow-csrf", "1");

    const response = await fetch(path, {
        ...options,
        // Sem credentials include, o browser não envia nem recebe o cookie HttpOnly.
        credentials: "include",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Ocorreu um erro inesperado.",
        }));
        throw new Error(error.message ?? "Ocorreu um erro inesperado.");
    }

    return response.json() as Promise<T>;
}
```

5. Explicação do código.

Este cliente não lê o cookie; apenas pede ao browser para o enviar. O cookie continua inacessível ao JavaScript por causa de `HttpOnly`. O cabeçalho `x-studyflow-csrf` mantém o padrão de chamadas autenticadas e será aprofundado em `BK-MF6-07`.

O caminho correto é `apps/web/src/lib/apiClient.ts`, já usado pelas páginas de autenticação e pelas rotas protegidas. Criar outro ficheiro para a mesma responsabilidade deixaria chamadas contraditórias.

6. Validação do passo.

Pesquisa por `credentials: "include"` em `apps/web/src/lib/apiClient.ts` e confirma que login, logout e `/api/auth/me` usam `requestJson`.

7. Cenário negativo/erro esperado.

Se removeres `credentials: "include"`, o login pode responder, mas chamadas seguintes a `/api/auth/me` falham como não autenticadas. Esse erro deve ser tratado como regressão.

### Passo 6 - Adicionar teste da política de cookie

1. Objetivo funcional do passo no contexto da app.

Provar que as flags de cookie seguem `RNF16` em desenvolvimento e produção.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/auth/session-cookie.options.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele não precisa de iniciar servidor; valida a função que o controller vai usar.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/auth/session-cookie.options.spec.ts
/**
 * Testa a política RNF16 dos cookies de sessão.
 */
import {
    clearSessionCookieOptions,
    sessionCookieOptions,
} from "./session-cookie.options.js";
import { SESSION_TTL_SECONDS } from "./session.service.js";

describe("sessionCookieOptions", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
            return;
        }

        process.env.NODE_ENV = originalNodeEnv;
    });

    it("ativa HttpOnly, SameSite e duração da sessão", () => {
        process.env.NODE_ENV = "test";

        const options = sessionCookieOptions();

        // Em testes locais o cookie não exige HTTPS, mas mantém proteção HttpOnly.
        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: SESSION_TTL_SECONDS * 1000,
            path: "/",
        });
    });

    it("ativa Secure em produção", () => {
        process.env.NODE_ENV = "production";

        const options = sessionCookieOptions();

        // Em produção, RNF16 exige que o cookie seja enviado apenas por canal seguro.
        expect(options.secure).toBe(true);
    });

    it("limpa o cookie com as mesmas flags e sem maxAge", () => {
        process.env.NODE_ENV = "production";

        const options = clearSessionCookieOptions();

        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/",
        });
        expect(options).not.toHaveProperty("maxAge");
    });
});
```

5. Explicação do código.

O teste valida a política sem abrir servidor. O primeiro caso confirma `HttpOnly`, `SameSite=Lax`, `path=/` e TTL alinhado com `SESSION_TTL_SECONDS`. O segundo confirma que produção ativa `Secure`. O terceiro confirma que o logout limpa o cookie com as mesmas flags, mas sem `maxAge`.

O `afterEach` repõe `NODE_ENV` para evitar que um teste influencie outro. Isto é importante porque `secure` depende do ambiente.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit`. A suite deve incluir `session-cookie.options.spec.ts` e passar.

7. Cenário negativo/erro esperado.

Se alterares `sameSite` num lado e não no outro, ou se esqueceres `path: "/"`, o teste deve falhar. Não ignores essa falha, porque ela indica risco real de logout incompleto.

### Passo 7 - Validar evidence e preparar BK-MF6-07

1. Objetivo funcional do passo no contexto da app.

Fechar `RNF16` com prova objetiva e preparar a camada de proteção seguinte.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md`
    - LOCALIZAÇÃO: secções `Validação final`, `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista comandos, expected result e interpretação. Se mostrares cabeçalhos, oculta sempre o valor de `sf_sid`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo organiza validação e handoff.

5. Explicação do código.

Não há código porque a implementação ficou nos passos anteriores. A evidence deve provar flags e comportamento sem expor sessão real.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit
npm --prefix apps/web run build
```

Resultado esperado:

- Build backend sem erro.
- Testes unitários backend passam.
- Build frontend passa e confirma que `apps/web/src/lib/apiClient.ts` continua válido.

7. Cenário negativo/erro esperado.

Se `GET /api/auth/me` sem cookie devolver `200`, a sessão está insegura. O esperado sem cookie é `401 UNAUTHENTICATED`.

#### Critérios de aceite

- `sessionCookieOptions` existe e é usado no login.
- `clearSessionCookieOptions` existe e é usado no logout.
- Login e logout partilham `httpOnly`, `sameSite`, `secure` e `path`.
- `Secure` fica ativo em produção.
- `apps/web/src/lib/apiClient.ts` mantém `credentials: "include"`.
- A app não cria outro cliente API paralelo para autenticação.
- Os testes provam flags principais e cenário de limpeza do cookie.
- A evidence não expõe valor real de `sf_sid`.

#### Validação final

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit
npm --prefix apps/web run build
```

Resultado esperado:

- Backend compila.
- Testes unitários passam.
- Frontend compila.
- Pesquisa em `apps/web/src/lib/apiClient.ts` confirma `credentials: "include"`.
- Login devolve `Set-Cookie` com `HttpOnly` e `SameSite=Lax`; em produção, também `Secure`.

#### Evidence para PR/defesa

- Comando de build backend e resultado observado.
- Comando de testes backend e resultado observado.
- Comando de build frontend e resultado observado.
- Trecho controlado de `Set-Cookie` com valor ocultado: `sf_sid=[oculto]; HttpOnly; SameSite=Lax; Path=/`.
- Confirmação de que produção ativa `Secure`.
- Confirmação de que o frontend usa `credentials: "include"` e não lê o cookie.

#### Handoff

- Entrega para `BK-MF6-07`: a sessão já usa cookie HttpOnly centralizado; o próximo BK deve reforçar CSRF, headers defensivos, validação contra injection e brute force.
- `BK-MF6-07` deve manter `x-studyflow-csrf` no cliente e aprofundar a validação no backend sem quebrar `credentials: "include"`.
- Decisão `DERIVADO`: `SameSite=Lax` e `Secure` dependente de produção preservam segurança e desenvolvimento local executável.
- Risco residual: a prova real de `Secure` depende de ambiente com HTTPS, alinhado com `BK-MF6-04`.

#### Changelog

- `2026-06-23`: guia corrigido para usar `apps/web/src/lib/apiClient.ts`, centralizar opções de cookie no backend, integrar login/logout no `AuthController`, adicionar teste com imports e preparar `BK-MF6-07`.
