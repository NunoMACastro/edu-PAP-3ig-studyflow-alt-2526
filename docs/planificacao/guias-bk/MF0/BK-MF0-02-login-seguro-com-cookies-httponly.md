# BK-MF0-02 - Login seguro com cookies HttpOnly.

## Header

- `doc_id`: `GUIA-BK-MF0-02`
- `bk_id`: `BK-MF0-02`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF02`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-03`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md`
- `last_updated`: `2026-07-10`

## O que vamos fazer neste BK

Neste BK vamos construir o login seguro do StudyFlow. O aluno introduz email/password, o backend valida as credenciais e cria uma sessão web usando cookie HttpOnly. Este BK é separado do registo para que a equipa perceba bem a diferença entre criar uma conta e autenticar uma sessão.

O requisito RF02 é explícito: o login deve usar cookies HttpOnly. Isso significa que a sessão não deve ser guardada em `localStorage`, porque JavaScript no browser consegue ler `localStorage`, aumentando o impacto de XSS. O cookie HttpOnly é enviado pelo browser em pedidos HTTP, mas não fica acessível ao JavaScript da página.

O mockup existente cobre diretamente este BK: ecrã central com marca `StudyFlow`, campos `Email` e `Password`, botão `Entrar` e ligação para `Registar`. O guia usa essa referência para fluxo e nomenclatura, sem exigir pixel-perfect.

## Porque é que isto é importante

- Desbloqueia todas as rotas protegidas da app: perfil, áreas, materiais, histórico e IA.
- Introduz sessão segura reutilizável por BKs futuros.
- Reduz exposição de tokens no frontend ao usar cookies HttpOnly.
- Obriga a pensar em erros negativos: credenciais erradas, utilizador inexistente e cookie inválido.
- Prepara `GET /api/auth/me`, que o frontend usa para saber quem está autenticado.

## O que entra (scope)

- Estado esperado antes do BK: existe, ou fica previsto pelo BK-MF0-01, um `User` com `email` e `passwordHash`.
- Estado esperado depois do BK: aluno consegue entrar, receber cookie HttpOnly e consultar a própria sessão.
- Ficheiros a criar, assumindo scaffold ainda inexistente:
    - `apps/api/src/modules/auth/dto/login.dto.ts`
    - `apps/api/src/modules/auth/auth.controller.ts`
    - `apps/api/src/modules/auth/auth.service.ts`
    - `apps/api/src/modules/auth/session.service.ts`
    - `apps/api/src/common/guards/session.guard.ts`
    - `apps/api/src/common/middleware/csrf.middleware.ts`
    - `apps/web/src/pages/auth/LoginPage.tsx`
    - `apps/web/src/hooks/useSession.ts`
- Ficheiros a rever:
    - `docs/RF.md`
    - `docs/RNF.md`
    - `mockup/thumbnail.png`
- Dependências de BK anteriores: nenhuma canónica, mas deve reutilizar o contrato de `User` definido no BK-MF0-01 se esse BK já tiver sido implementado.
- Impacto na arquitetura: cria o contrato de sessão e o primeiro guard reutilizável.
- Impacto em frontend: login passa a atualizar estado de utilizador autenticado.
- Impacto em backend: cria endpoints derivados `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me`.
- Impacto em dados: sessão deve ter identificador opaco, expiração e ligação ao `userId`.
- Impacto em segurança: cookie `HttpOnly`, `Secure` em produção e `SameSite`.
- Impacto em testes: exige testes de credenciais válidas, inválidas e sessão expirada.
- Handoff: BK-MF0-03 deve proteger edição de perfil com `SessionGuard`.

## O que não entra (scope-out)

- Registo de aluno, coberto pelo BK-MF0-01.
- Recuperação de password, MFA ou confirmação de email, não definidos nos RF/RNF.
- Login social ou SSO escolar real, ainda bloqueado por falta de contrato.
- Gestão avançada de roles, pertencente a fases posteriores.
- CSRF completo para todos os formulários da app, que será reforçado em BKs de segurança, embora o padrão de proteção fique preparado.

## Como saber que isto ficou bem

- Login válido responde `200 OK` e define cookie HttpOnly.
- `GET /api/auth/me` devolve o aluno autenticado sem expor dados sensíveis.
- Login inválido devolve erro controlado e genérico.
- Logout remove/invalida a sessão.
- O frontend deixa de depender de tokens em `localStorage`.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `-` (CANONICO)
- Pre-condicoes: ter contrato `User` disponível ou criado no mesmo arranque técnico da MF0 (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AUTH-LOGIN`
- Fonte de verdade: `docs/RF.md`, `RF02` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-02` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Login seguro com cookie HttpOnly para sessão web (CANONICO)
- `rf_rnf`: `RF02` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar DTO de login.
- Validar credenciais no backend.
- Comparar password recebida com `passwordHash`.
- Criar sessão com expiração.
- Enviar cookie HttpOnly com flags seguras.
- Criar endpoint `GET /api/auth/me`.
- Criar `SessionGuard` reutilizável.
- Criar página de login alinhada ao mockup.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF02.
- `docs/RNF.md`: RNF16, RNF17, RNF25, RNF42.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linha `BK-MF0-02`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: linha `BK-MF0-02`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: exigências de testes P0.
- `mockup/thumbnail.png`: ecrã de login.
- BK-MF0-01: contrato `User`, se já estiver implementado.

## Glossário (rápido) (DERIVADO):

- **Login**: validação de credenciais para iniciar sessão.
- **Sessão**: estado que prova que o utilizador está autenticado.
- **Cookie HttpOnly**: cookie inacessível ao JavaScript do browser.
- **SameSite**: política que reduz envio de cookies em pedidos cross-site.
- **Secure**: flag que exige HTTPS para enviar o cookie.
- **Guard**: camada que bloqueia rotas sem sessão válida.
- **CSRF**: ataque que tenta usar cookies do utilizador sem consentimento.
- **Credenciais**: email e password submetidos no login.
- **Erro genérico**: mensagem que não revela se o email existe ou se a password falhou.

## Conceitos teóricos essenciais (DERIVADO):

**Cookies HttpOnly.** Um cookie HttpOnly é definido pelo servidor e enviado automaticamente pelo browser em pedidos para o mesmo domínio. Como JavaScript não o consegue ler, reduz o risco de roubo de sessão em caso de XSS.

**Sessão opaca.** A sessão deve ser representada por um identificador aleatório, não por dados pessoais. O backend consulta a sessão e decide quem é o utilizador. Assim, o frontend não precisa de guardar tokens sensíveis.

**Fluxo request -> controller -> service -> response.** O pedido chega ao controller, o controller chama o service, o service valida credenciais e o controller define o cookie na resposta. Esta separação deixa o código mais testável.

**Guard de autenticação.** O `SessionGuard` será usado por BKs seguintes. Se não houver cookie válido, devolve `401 Unauthorized`. Se houver sessão válida, anexa o utilizador ao request.

**CSRF e SameSite.** Cookies são enviados automaticamente, por isso há risco de CSRF. `SameSite=Lax` ou `Strict` reduz esse risco. Para ações sensíveis futuras, deve existir token CSRF, mas este BK prepara o padrão inicial.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-01 implementado com `User`, `UsersService` e `AuthModule`.
- Redis disponível através de `REDIS_URL`.
- `cookie-parser` configurado no bootstrap NestJS.
- Dependência Redis no backend, por exemplo `ioredis`, justificada pelo README.
- Dependência `bcrypt` disponível, herdada do BK-MF0-01.

### Contrato transversal de configuração local

Antes de implementar a autenticação, cria `apps/api/src/common/config/studyflow-config.ts` e faz a API e todos os scripts standalone chamarem `loadStudyFlowConfig()`. O loader valida tipos uma única vez e devolve pelo menos `deploymentScope`, `host`, `webOrigins`, `mongoUri`, `redisUrl` e `materialsStorageDir`. Para `deploymentScope="local-pap"`, aceita apenas `host="127.0.0.1"`, origens loopback explícitas, `trustProxy=false` e storage absoluto fora do checkout; wildcard, host público ou fallback implícito fazem o arranque falhar. Fixa ainda Node `24.11.1` e npm `11.6.2` em `engines`, `.node-version`, `.nvmrc` e `packageManager`.

### Passo 1 - Criar DTO de login

1. Explicação do objetivo.

    Neste passo vais criar DTO de login. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/dto/login.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export class LoginDto {
    email!: string;
    password!: string;
}
```

5. Explicação do código.

O DTO aceita apenas credenciais. O aluno nunca pode enviar `role`, `userId` ou qualquer campo de sessão.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

Os gateways WebSocket reutilizam exatamente `SessionService.getUserFromSession` no handshake e voltam a chamá-lo em cada `join` e `send`. Uma versão divergente fecha a operação com ack `{ ok: false, code: "SESSION_REVOKED" }`; alterar papel ou eliminar conta não pode deixar um socket antigo autorizado. O rollout para Redis v2 invalida deliberadamente todas as sessões legadas.

### Passo 2 - Criar tipo de request autenticado

1. Explicação do objetivo.

    Neste passo vais criar tipo de request autenticado. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/common/types/authenticated-request.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Request } from "express";

export type AuthenticatedUser = {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
};

export type AuthenticatedRequest = Request & {
    user?: AuthenticatedUser;
};
```

5. Explicação do código.

Este tipo documenta o que o `SessionGuard` acrescenta ao pedido. Os BKs seguintes vão ler `request.user.id` em vez de aceitar `userId` vindo do cliente.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar SessionService com Redis

1. Explicação simples do objetivo.

    Neste passo vais criar SessionService com Redis. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/session.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomBytes } from "crypto";
import Redis from "ioredis";
import { loadStudyFlowConfig } from "../../common/config/studyflow-config";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { User, UserDocument } from "./schemas/user.schema";

export const SESSION_REDIS = Symbol("SESSION_REDIS");
export const SESSION_COOKIE_NAME = "sf_sid";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
    userId: string;
    sessionVersion: number;
};

@Injectable()
export class SessionService {
    constructor(
        @Inject(SESSION_REDIS) private readonly redis: Redis,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async createSession(userId: string, sessionVersion: number): Promise<string> {
        // Redis v2 guarda apenas identidade e versão; papel/estado são relidos no Mongo.
        const sessionId = randomBytes(32).toString("hex");
        const payload: SessionPayload = { userId, sessionVersion };

        await this.redis.setex(
            this.key(sessionId),
            SESSION_TTL_SECONDS,
            JSON.stringify(payload),
        );
        return sessionId;
    }

    async getUserFromSession(
        sessionId: string | undefined,
    ): Promise<AuthenticatedUser> {
        if (!sessionId) {
            throw new UnauthorizedException({
                code: "UNAUTHENTICATED",
                message: "Inicia sessão para continuar.",
            });
        }

        const raw = await this.redis.get(this.key(sessionId));
        if (!raw) {
            throw new UnauthorizedException({
                code: "UNAUTHENTICATED",
                message: "Sessão expirada ou inválida.",
            });
        }

        const payload = JSON.parse(raw) as SessionPayload;
        if (!Types.ObjectId.isValid(payload.userId) || !Number.isInteger(payload.sessionVersion)) {
            await this.redis.del(this.key(sessionId));
            throw this.revoked();
        }

        const user = await this.userModel
            .findById(payload.userId)
            .select("email role accountStatus sessionVersion")
            .lean();
        if (
            !user ||
            user.accountStatus !== "ACTIVE" ||
            user.sessionVersion !== payload.sessionVersion
        ) {
            await this.redis.del(this.key(sessionId));
            throw this.revoked();
        }

        return { id: String(user._id), email: user.email, role: user.role };
    }

    async destroySession(sessionId: string | undefined): Promise<void> {
        if (sessionId) {
            await this.redis.del(this.key(sessionId));
        }
    }

    getCookieOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: SESSION_TTL_SECONDS * 1000,
            path: "/",
        };
    }

    private key(sessionId: string): string {
        return `studyflow:sessions:v2:${sessionId}`;
    }

    private revoked(): UnauthorizedException {
        return new UnauthorizedException({
            code: "SESSION_REVOKED",
            message: "A sessão foi revogada. Inicia sessão novamente.",
        });
    }
}
```

5. Explicação do código.

O cookie guarda apenas `sf_sid`; os dados da sessão ficam no Redis. Isto cumpre RNF16 e reduz exposição em caso de XSS.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Editar AuthService

1. Explicação simples do objetivo.

    Neste passo vais editar AuthService. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/auth/auth.service.ts`
- LOCALIZAÇÃO: dentro da classe `AuthService`, depois do método `registerStudent`.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

async login(input: LoginDto) {
  const email = String(input.email ?? '').trim().toLowerCase();
  const user = await this.usersService.findByEmail(email);

  // A mensagem é sempre genérica para não revelar se o email existe.
  if (!user) {
    throw new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
      message: 'Email ou password inválidos.',
    });
  }

  const passwordMatches = await bcrypt.compare(String(input.password ?? ''), user.passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
      message: 'Email ou password inválidos.',
    });
  }

  if (user.accountStatus !== 'ACTIVE') {
    throw new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
      message: 'Email ou password inválidos.',
    });
  }

  return {
    ...this.usersService.toPublicUser(user),
    sessionVersion: user.sessionVersion,
  };
}
```

5. Explicação do código.

Este método compara a password recebida com o hash criado no BK-MF0-01. O erro `401` é igual para email inexistente e password errada, evitando enumeração de contas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Substituir AuthController por versão completa

1. Explicação simples do objetivo.

    Neste passo vais substituir AuthController por versão completa. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/auth/auth.controller.ts`
- LOCALIZAÇÃO: substituir o ficheiro completo por esta versão.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
} from "@nestjs/common";
import { Response } from "express";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { SESSION_COOKIE_NAME, SessionService } from "./session.service";
import { PublicUser } from "../users/users.service";

@Controller("api/auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
    ) {}

    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: RegisterStudentDto): Promise<PublicUser> {
        return this.authService.registerStudent(body);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<PublicUser> {
        const user = await this.authService.login(body);
        const sessionId = await this.sessionService.createSession(
            user.id,
            user.sessionVersion,
        );

        response.cookie(
            SESSION_COOKIE_NAME,
            sessionId,
            this.sessionService.getCookieOptions(),
        );
        const { sessionVersion: _internalVersion, ...publicUser } = user;
        return publicUser;
    }

    @Post("logout")
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @Req() request: AuthenticatedRequest,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await this.sessionService.destroySession(
            request.cookies?.[SESSION_COOKIE_NAME],
        );
        response.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    }

    @Get("me")
    async me(@Req() request: AuthenticatedRequest): Promise<PublicUser> {
        return this.sessionService.getUserFromSession(
            request.cookies?.[SESSION_COOKIE_NAME],
        );
    }
}
```

5. Explicação do código.

O login cria a sessão e define o cookie HttpOnly. O logout remove a sessão no Redis e limpa o cookie no browser. O endpoint `/me` permite ao frontend saber quem está autenticado.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Criar SessionGuard

1. Explicação simples do objetivo.

    Neste passo vais criar SessionGuard. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/common/guards/session.guard.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthenticatedRequest } from "../types/authenticated-request";
import {
    SESSION_COOKIE_NAME,
    SessionService,
} from "../../modules/auth/session.service";

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private readonly sessionService: SessionService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();

        // O guard transforma cookie válido em request.user para os próximos BKs.
        request.user = await this.sessionService.getUserFromSession(
            request.cookies?.[SESSION_COOKIE_NAME],
        );
        return true;
    }
}
```

5. Explicação do código.

Este guard será aplicado em perfil, áreas, materiais, histórico e IA. Sem cookie válido, devolve `401 Unauthorized`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 7 - Editar AuthModule

1. Explicação simples do objetivo.

    Neste passo vais editar AuthModule. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/auth/auth.module.ts`
- LOCALIZAÇÃO: substituir o ficheiro completo por esta versão.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import Redis from "ioredis";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SESSION_REDIS, SessionService } from "./session.service";
import { User, UserSchema } from "./schemas/user.schema";
import { UsersService } from "../users/users.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        UsersService,
        SessionService,
        SessionGuard,
        {
            provide: SESSION_REDIS,
            useFactory: () => new Redis(loadStudyFlowConfig().redisUrl),
        },
    ],
    exports: [AuthService, UsersService, SessionService, SessionGuard],
})
export class AuthModule {}
```

5. Explicação do código.

O módulo torna `SessionGuard` exportável para os BKs seguintes. A URL local é apenas fallback de desenvolvimento; produção deve definir `REDIS_URL`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 8 - Editar cliente API

1. Explicação simples do objetivo.

    Neste passo vais editar cliente API. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro criado no BK-MF0-01.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type LoginPayload = {
    email: string;
    password: string;
};

export async function login(payload: LoginPayload): Promise<PublicUser> {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível iniciar sessão.");
    }

    return data as PublicUser;
}

export async function getCurrentUser(): Promise<PublicUser | null> {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error("Não foi possível validar a sessão.");
    return (await response.json()) as PublicUser;
}

export async function logout(): Promise<void> {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });
}
```

5. Explicação do código.

O ponto crítico é `credentials: 'include'`: sem isto, o browser não envia/recebe corretamente cookies em chamadas `fetch`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 9 - Criar hook de sessão

1. Explicação simples do objetivo.

    Neste passo vais criar hook de sessão. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/hooks/useSession.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { useEffect, useState } from "react";
import { getCurrentUser, PublicUser } from "../lib/apiClient";

export function useSession() {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        getCurrentUser()
            .then((currentUser) => {
                if (active) setUser(currentUser);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return { user, isLoading, isAuthenticated: Boolean(user) };
}
```

5. Explicação do código.

Este hook será reutilizado por rotas protegidas. Ele consulta `/me` e transforma `401` em sessão ausente.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 10 - Criar página de login

1. Explicação simples do objetivo.

    Neste passo vais criar página de login. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/auth/LoginPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { FormEvent, useState } from "react";
import { login } from "../../lib/apiClient";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email, password });
            window.location.assign("/app/estudo");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Email ou password inválidos.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10">
            <form
                aria-label="Login StudyFlow"
                className="mx-auto flex max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow"
                onSubmit={handleSubmit}
            >
                <h1 className="text-2xl font-semibold text-slate-900">
                    StudyFlow
                </h1>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Email
                    <input
                        autoComplete="email"
                        className="rounded border border-slate-300 px-3 py-2"
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        type="email"
                        value={email}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Password
                    <input
                        autoComplete="current-password"
                        className="rounded border border-slate-300 px-3 py-2"
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                    />
                </label>

                {error && (
                    <p className="rounded bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <button
                    className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
                    disabled={isSubmitting}
                    type="submit"
                >
                    {isSubmitting ? "A entrar..." : "Entrar"}
                </button>
            </form>
        </main>
    );
}
```

5. Explicação do código.

A página nunca usa `localStorage`. A sessão fica exclusivamente no cookie HttpOnly criado pelo backend.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Endpoints `login`, `logout` e `me` criados.
    - Cookie HttpOnly criado no login.
    - `SessionGuard` criado.
- Verificações:
    - Login válido responde `200`.
    - Credenciais inválidas respondem `401`.
    - Logout invalida sessão.
- Qualidade:
    - Controller, service e session service separados.
    - Erros são explícitos e genéricos para autenticação.
- Continuidade:
    - BK-MF0-03 consegue obter `request.user`.
    - BKs futuros podem proteger rotas com o mesmo guard.
- Evidência:
    - PR inclui cabeçalho `Set-Cookie` e testes negativos.

## Validação final

### Requests e responses esperados

Login válido:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "aluno@example.com",
  "password": "password-segura"
}
```

Resposta esperada:

```http
200 OK
Set-Cookie: sf_sid=<valor-opaco>; HttpOnly; SameSite=Lax; Path=/

{
  "id": "665f0f1a2d2e6f001234abcd",
  "email": "aluno@example.com",
  "role": "STUDENT"
}
```

Erros esperados:

- `400`: payload malformado.
- `401 INVALID_CREDENTIALS`: email inexistente ou password errada.
- `401 UNAUTHENTICATED`: `/me` sem cookie, cookie expirado ou cookie inválido.

### Como validar o BK

- Fazer login com conta criada no BK-MF0-01 e confirmar `200`.
- Confirmar no browser que existe cookie `sf_sid` com `HttpOnly` e `SameSite=Lax`.
- Executar `GET /api/auth/me` e confirmar `200` com `id`, `email`, `role`.
- Fazer logout e confirmar que `/me` passa a devolver `401`.
- Confirmar que `localStorage` não contém token/sessão.

### Teste mínimo de sessão

Ficheiro: `apps/api/src/modules/auth/session.service.spec.ts`
Ação: `CRIAR`
Onde colocar: ficheiro completo.

```ts
import Redis from "ioredis";
import { SessionService } from "./session.service";

describe("SessionService", () => {
    const redis = {
        setex: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("cria sessão opaca em Redis", async () => {
        const users = {} as never;
        const service = new SessionService(redis, users);
        const sessionId = await service.createSession("507f1f77bcf86cd799439011", 3);

        expect(sessionId).toHaveLength(64);
        expect(redis.setex).toHaveBeenCalledWith(
            expect.stringContaining("studyflow:sessions:"),
            expect.any(Number),
            JSON.stringify({
                userId: "507f1f77bcf86cd799439011",
                sessionVersion: 3,
            }),
        );
    });

    it("define opções seguras para cookie", () => {
        const service = new SessionService(redis, {} as never);
        const options = service.getCookieOptions();

        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("lax");
        expect(options.path).toBe("/");
    });
});
```

O teste valida o contrato de sessão sem precisar de Redis real. O e2e do projeto deve confirmar o cabeçalho `Set-Cookie` quando o scaffold de testes estiver disponível.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_EXECUTION_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, execução IA não configurada e output IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Print do `Set-Cookie` com `HttpOnly` e `SameSite`.
- Output de `/api/auth/me -> 200`.
- Output de login inválido `401 INVALID_CREDENTIALS`.
- Screenshot do login.
- Nota no PR: sessão guardada em Redis; frontend não usa `localStorage`.

## Handoff para BK-MF0-03

- Todos os endpoints privados do BK-MF0-03 devem usar `@UseGuards(SessionGuard)`.
- O perfil deve obter o aluno por `request.user.id`, nunca por `userId` enviado pelo cliente.
- O estado `401 UNAUTHENTICATED` é o comportamento esperado para pedidos sem sessão.

## Changelog

- `2026-05-24`: guia refinado para execução concreta, com sessão HttpOnly, guard reutilizável e validações negativas.
- `2026-05-25`: alinhada a gestão de sessões com Redis como decisão canónica da stack.
