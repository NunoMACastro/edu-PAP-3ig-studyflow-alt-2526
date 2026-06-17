# BK-MF3-07 - Agendar sessões de estudo coletivo.

## Header

- `doc_id`: `GUIA-BK-MF3-07`
- `bk_id`: `BK-MF3-07`
- `macro`: `MF3`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-05`
- `rf_rnf`: `RF43`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-08`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-07-agendar-sessoes-de-estudo-coletivo.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar sessões de estudo coletivo. O guia parte dos contratos canónicos de RF43, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF43 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Criar sessões futuras.
- Listar sessões do grupo.
- Validar membership e data futura.

#### Scope-out

- Calendário externo ICS.
- Notificações de envio externo.
- Presenças detalhadas.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `POST /api/study-groups/:groupId/sessions e GET /api/study-groups/:groupId/sessions`, DTO, backend, frontend, validações e handoff para `BK-MF3-08`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `POST /api/study-groups/:groupId/sessions e GET /api/study-groups/:groupId/sessions` é DERIVADO como contrato técnico mínimo para cumprir RF43 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF3-05` com membership de grupos.
- `RF43` com agendamento coletivo.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Sessão coletiva é um evento futuro ligado a um grupo.
- A data vem do formulário, mas o backend valida se é futura.
- A participação fica associada ao grupo para histórico e alertas.
- A sessão prepara a IA coletiva do BK seguinte.

##### Conceitos backend

- O controller recebe HTTP, mas não decide permissões.
- O service valida sessão, ownership ou membership antes de tocar em dados sensíveis.
- O DTO protege o service contra campos vazios, tipos errados e payloads demasiado grandes.
- O módulo NestJS liga controller, service, schemas e módulos herdados.

##### Conceitos frontend

- O componente React separa input, loading, erro, sucesso e vazio.
- O cliente API é tipado para alinhar payload e resposta.
- `credentials: 'include'` envia o cookie HttpOnly sem guardar tokens no browser.

##### Conceitos de segurança

- O frontend nunca envia `userId` como fonte de verdade.
- O backend valida membership ou ownership com services herdados.
- Erros negativos são controlados com `400`, `401`, `403`, `404`, `422` ou `503`, conforme a causa.

#### Arquitetura do BK

- Endpoint: `POST /api/study-groups/:groupId/sessions e GET /api/study-groups/:groupId/sessions`.
- Backend: `real_dev/api/src/modules/study-group-sessions`.
- Frontend: `real_dev/web/src/features/study-group-sessions`.
- DTO principal: `CreateStudyGroupSessionDto`.
- Service principal: `StudyGroupSessionsService`.
- Controller principal: `StudyGroupSessionsController`.
- Módulo principal: `StudyGroupSessionsModule`.
- Handoff: `BK-MF3-08`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/modules/study-group-sessions/dto/create-study-group-session.dto.ts`
- CRIAR: `real_dev/api/src/modules/study-group-sessions/schemas/study-group-session.schema.ts`
- CRIAR: `real_dev/api/src/modules/study-group-sessions/study-group-sessions.service.ts`
- CRIAR: `real_dev/api/src/modules/study-group-sessions/study-group-sessions.controller.ts`
- CRIAR: `real_dev/api/src/modules/study-group-sessions/study-group-sessions.module.ts`
- CRIAR: `real_dev/web/src/features/study-group-sessions/create-study-group-session.ts`
- CRIAR: `real_dev/web/src/features/study-group-sessions/study-group-sessions-panel.tsx`
- REVER: `real_dev/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear

### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/study-group-sessions/dto/create-study-group-session.dto.ts`
    - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-sessions/dto/create-study-group-session.dto.ts
import {
    IsISO8601,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";

/**
 * Dados para agendar uma sessão coletiva de estudo.
 */
export class CreateStudyGroupSessionDto {
    /**
     * Título visível da sessão.
     */
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    /**
     * Início em ISO-8601.
     */
    @IsISO8601()
    startsAt!: string;

    /**
     * Duração prevista em minutos.
     */
    @IsInt()
    @Min(10)
    @Max(480)
    durationMinutes!: number;

    /**
     * Objetivo pedagógico curto.
     */
    @IsOptional()
    @IsString()
    @MaxLength(500)
    goal?: string;
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia para `POST /api/study-groups/:groupId/sessions` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Criar o schema de persistência

1. Objetivo funcional do passo no contexto da app.
   Guardar dados mínimos do fluxo para histórico, defesa e integração com BKs seguintes.
2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/study-group-sessions/schemas/study-group-session.schema.ts`
    - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o schema Mongoose do resultado produzido por este BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-sessions/schemas/study-group-session.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyGroupSessionDocument = HydratedDocument<StudyGroupSession>;

/**
 * Sessão de estudo coletivo agendada para um grupo.
 */
@Schema({ timestamps: true })
export class StudyGroupSession {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    groupId!: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, index: true })
    createdByStudentId!: Types.ObjectId;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true, index: true })
    startsAt!: Date;

    @Prop({ required: true })
    durationMinutes!: number;

    @Prop()
    goal?: string;
}

export const StudyGroupSessionSchema =
    SchemaFactory.createForClass(StudyGroupSession);
```

5. Explicação do código.
   O schema evita respostas soltas: a app guarda quem executou o fluxo, que dados foram usados e que resultado foi devolvido. Isto permite testes e continuidade.
6. Validação do passo.
   Arranca a API depois do módulo e confirma que o schema é registado pelo NestJS.
7. Cenário negativo/erro esperado.
   Não guardes segredos, tokens ou dados de outros contextos neste documento.

### Passo 3 - Implementar o service de aplicação

1. Objetivo funcional do passo no contexto da app.
   Concentrar regras de negócio, ownership, membership, erros e efeitos de persistência num ponto testável.
2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/study-group-sessions/study-group-sessions.service.ts`
    - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-sessions/study-group-sessions.service.ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { CreateStudyGroupSessionDto } from "./dto/create-study-group-session.dto.js";
import {
    StudyGroupSession,
    StudyGroupSessionDocument,
} from "./schemas/study-group-session.schema.js";

export type StudyGroupSessionView = {
    _id: string;
    groupId: string;
    createdByStudentId: string;
    title: string;
    startsAt: Date;
    durationMinutes: number;
    goal?: string;
    createdAt?: Date;
};

/**
 * Serviço de sessões coletivas de estudo.
 */
@Injectable()
export class StudyGroupSessionsService {
    constructor(
        @InjectModel(StudyGroupSession.name)
        private readonly sessionModel: Model<StudyGroupSessionDocument>,
        private readonly studyGroupsService: StudyGroupsService,
    ) {}

    /**
     * Agenda uma sessão para membros do grupo.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @param input Dados da sessão.
     * @returns Sessão criada.
     */
    async createSession(
        actor: AuthenticatedUser,
        groupId: string,
        input: CreateStudyGroupSessionDto,
    ): Promise<StudyGroupSessionView> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const startsAt = new Date(input.startsAt);
        if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
            throw new BadRequestException({
                code: "SESSION_STARTS_AT_INVALID",
                message: "Agenda a sessão para uma data futura.",
            });
        }

        const session = await this.sessionModel.create({
            groupId: new Types.ObjectId(groupId),
            createdByStudentId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            startsAt,
            durationMinutes: input.durationMinutes,
            goal: input.goal?.trim(),
        });
        return this.toSessionView(session.toObject());
    }

    /**
     * Lista sessões de um grupo validando membership.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @returns Sessões ordenadas por data.
     */
    async listGroupSessions(
        actor: AuthenticatedUser,
        groupId: string,
    ): Promise<StudyGroupSessionView[]> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const sessions = await this.sessionModel
            .find({ groupId: new Types.ObjectId(groupId) })
            .sort({ startsAt: 1 })
            .lean();
        return sessions.map((session) => this.toSessionView(session));
    }

    /**
     * Lista próximas sessões de todos os grupos do aluno.
     *
     * @param actor Aluno autenticado.
     * @returns Sessões futuras acessíveis ao aluno.
     */
    async listUpcomingForStudent(
        actor: AuthenticatedUser,
    ): Promise<StudyGroupSessionView[]> {
        const groups = await this.studyGroupsService.listMyGroups(actor);
        if (groups.length === 0) return [];
        const groupIds = groups.map((group) => new Types.ObjectId(group._id));
        const sessions = await this.sessionModel
            .find({ groupId: { $in: groupIds }, startsAt: { $gte: new Date() } })
            .sort({ startsAt: 1 })
            .limit(20)
            .lean();
        return sessions.map((session) => this.toSessionView(session));
    }

    /**
     * Converte documento interno em contrato público.
     *
     * @param session Documento ou objeto lean.
     * @returns Sessão pública.
     */
    private toSessionView(session: {
        _id: unknown;
        groupId: unknown;
        createdByStudentId: unknown;
        title: string;
        startsAt: Date;
        durationMinutes: number;
        goal?: string;
        createdAt?: Date;
    }): StudyGroupSessionView {
        return {
            _id: String(session._id),
            groupId: String(session.groupId),
            createdByStudentId: String(session.createdByStudentId),
            title: session.title,
            startsAt: session.startsAt,
            durationMinutes: session.durationMinutes,
            goal: session.goal,
            createdAt: session.createdAt,
        };
    }
}
```

5. Explicação do código.
   O service recebe o actor autenticado, valida membership através de `StudyGroupsService` e só depois cria ou lê sessões. O método `listUpcomingForStudent` prepara diretamente `BK-MF3-12`, porque os alertas precisam de sessões futuras sem voltar a descobrir grupos no frontend. A query usa apenas grupos devolvidos por `StudyGroupsService.list(actor)`, evitando consultar sessões de grupos onde o aluno não participa.
6. Validação do passo.
   Cria testes unitários para sessão válida, contexto proibido e dados insuficientes.
7. Cenário negativo/erro esperado.
   Não faças consultas diretas por ID sem validar owner ou membership.

### Passo 4 - Expor o endpoint no controller

1. Objetivo funcional do passo no contexto da app.
   Ligar `POST /api/study-groups/:groupId/sessions e GET /api/study-groups/:groupId/sessions` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/study-group-sessions/study-group-sessions.controller.ts`
    - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-sessions/study-group-sessions.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupSessionDto } from "./dto/create-study-group-session.dto.js";
import { StudyGroupSessionsService } from "./study-group-sessions.service.js";

/**
 * Endpoints de sessões de estudo coletivo.
 */
@Controller("api/study-groups/:groupId/sessions")
@UseGuards(SessionGuard)
export class StudyGroupSessionsController {
    constructor(private readonly sessionsService: StudyGroupSessionsService) {}

    /**
     * Lista sessões do grupo.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @returns Sessões acessíveis.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
    ) {
        return this.sessionsService.listGroupSessions(request.user!, groupId);
    }

    /**
     * Agenda uma sessão no grupo.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @param body Dados validados.
     * @returns Sessão criada.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
        @Body() body: CreateStudyGroupSessionDto,
    ) {
        return this.sessionsService.createSession(request.user!, groupId, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz pedidos sem cookie para `POST /api/study-groups/:groupId/sessions` e `GET /api/study-groups/:groupId/sessions` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/study-group-sessions/study-group-sessions.module.ts`
    - EDITAR: `real_dev/api/src/app.module.ts`
    - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `StudyGroupSessionsModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-sessions/study-group-sessions.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import {
    StudyGroupSession,
    StudyGroupSessionSchema,
} from "./schemas/study-group-session.schema.js";
import { StudyGroupSessionsController } from "./study-group-sessions.controller.js";
import { StudyGroupSessionsService } from "./study-group-sessions.service.js";

/**
 * Módulo MF3 de sessões coletivas.
 */
@Module({
    imports: [
        AuthModule,
        StudyGroupsModule,
        MongooseModule.forFeature([
            { name: StudyGroupSession.name, schema: StudyGroupSessionSchema },
        ]),
    ],
    controllers: [StudyGroupSessionsController],
    providers: [StudyGroupSessionsService],
    exports: [StudyGroupSessionsService],
})
export class StudyGroupSessionsModule {}
```

5. Explicação do código.
   O módulo explicita dependências. Se algum import falhar, o erro aparece no arranque da API em vez de surgir no meio do fluxo do aluno.
6. Validação do passo.
   Arranca a API e confirma que o módulo resolve todos os providers.
7. Cenário negativo/erro esperado.
   Não declares outro provider de IA nem dupliques módulos herdados.

### Passo 6 - Criar o cliente frontend tipado

1. Objetivo funcional do passo no contexto da app.
   Isolar a chamada HTTP para que o componente não tenha URLs, métodos ou parsing espalhados.
2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/features/study-group-sessions/create-study-group-session.ts`
    - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/src/features/study-group-sessions/create-study-group-session.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type StudyGroupSession = {
    _id: string;
    groupId: string;
    createdByStudentId: string;
    title: string;
    startsAt: string;
    durationMinutes: number;
    goal?: string;
    createdAt?: string;
};

/**
 * Lista sessões de um grupo.
 *
 * @param groupId Grupo alvo.
 * @returns Sessões agendadas.
 */
export function listStudyGroupSessions(
    groupId: string,
): Promise<StudyGroupSession[]> {
    return requestMf3Json<StudyGroupSession[]>(
        `/api/study-groups/${groupId}/sessions`,
    );
}

/**
 * Agenda uma sessão coletiva.
 *
 * @param groupId Grupo alvo.
 * @param input Dados da sessão.
 * @returns Sessão criada.
 */
export function createStudyGroupSession(
    groupId: string,
    input: {
        title: string;
        startsAt: string;
        durationMinutes: number;
        goal?: string;
    },
): Promise<StudyGroupSession> {
    return requestMf3Json<StudyGroupSession>(
        `/api/study-groups/${groupId}/sessions`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
```

5. Explicação do código.
   `credentials: 'include'` envia o cookie de sessão sem guardar tokens no `localStorage`. A função de criação envia `title`, `startsAt` e `durationMinutes`; a função de listagem usa o mesmo `groupId` no URL para o backend aplicar membership antes de devolver sessões.
6. Validação do passo.
   Força a API a devolver erro e confirma que o componente recebe uma exceção.
7. Cenário negativo/erro esperado.
   Não uses `localStorage` para tokens de autenticação.

### Passo 7 - Montar a interface mínima

1. Objetivo funcional do passo no contexto da app.
   Dar ao aluno um ecrã simples para testar o endpoint sem ferramentas externas.
2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/features/study-group-sessions/study-group-sessions-panel.tsx`
    - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/features/study-group-sessions/study-group-sessions-panel.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    createStudyGroupSession,
    listStudyGroupSessions,
    StudyGroupSession,
} from "./create-study-group-session.js";

type StudyGroupSessionsPanelProps = {
    initialGroupId?: string | null;
};

/**
 * Painel de sessões coletivas.
 *
 * @param props Grupo selecionado pela página agregadora.
 * @returns Formulário e lista de sessões.
 */
export function StudyGroupSessionsPanel({ initialGroupId }: StudyGroupSessionsPanelProps) {
    const [groupId, setGroupId] = useState(initialGroupId ?? "");
    const [title, setTitle] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(45);
    const [goal, setGoal] = useState("");
    const [sessions, setSessions] = useState<StudyGroupSession[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function refresh(targetGroupId = groupId): Promise<void> {
        if (!targetGroupId) return;
        setSessions(await listStudyGroupSessions(targetGroupId));
    }

    useEffect(() => {
        const nextGroupId = initialGroupId ?? "";
        setGroupId(nextGroupId);
        if (nextGroupId) void refresh(nextGroupId);
    }, [initialGroupId]);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createStudyGroupSession(groupId, {
                title,
                startsAt: new Date(startsAt).toISOString(),
                durationMinutes,
                goal,
            });
            setTitle("");
            setGoal("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao agendar.");
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Sessões coletivas</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Grupo
                    <input value={groupId} onBlur={() => void refresh()} onChange={(event) => setGroupId(event.target.value)} />
                </label>
                <label className="block">
                    Título
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="block">
                    Início
                    <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                </label>
                <label className="block">
                    Minutos
                    <input type="number" min={10} max={480} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
                </label>
                <label className="block">
                    Objetivo
                    <textarea rows={2} value={goal} onChange={(event) => setGoal(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={!groupId || title.trim().length < 3 || !startsAt}>
                    Agendar
                </button>
            </form>
            <div className="grid gap-2">
                {sessions.map((session) => (
                    <article className="rounded-md border border-slate-200 p-3 text-sm" key={session._id}>
                        <strong>{session.title}</strong>
                        <p className="text-slate-600">{new Date(session.startsAt).toLocaleString("pt-PT")}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
```

5. Explicação do código.
   O componente valida o fluxo real: envia dados pelo cliente tipado, mostra erros e apresenta a resposta sem expor dados sensíveis.
6. Validação do passo.
   Preenche o formulário, submete e confirma que o resultado aparece sem reload da página.
7. Cenário negativo/erro esperado.
   Não escondas erros; feedback silencioso faz o aluno pensar que a app não respondeu.

### Passo 8 - Fechar validação do BK

1. Objetivo funcional do passo no contexto da app.
   Registar o contrato mínimo que a equipa deve cobrir com testes e evidência.
2. Ficheiros envolvidos:
    - REVER: `real_dev/api/src/modules/mf3-http-contracts.spec.ts`
    - REVER: `real_dev/api/src/modules/study-group-sessions/study-group-sessions.module.ts`
    - LOCALIZAÇÃO: `teste de contrato completo`
3. Instruções do que fazer.
   Revê os testes Jest já configurados para a MF3 e confirma o cenário deste BK sem adicionar dependências novas.
4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação: usa os testes Jest existentes em `real_dev/api/src/modules/mf3-http-contracts.spec.ts` e o teste unitário do módulo correspondente, sem adicionar dependências novas.

5. Explicação do código.
   A validação usa Jest e os testes de contrato existentes da MF3 para confirmar rota, autenticação, DTO e cenário negativo sem introduzir dependências HTTP externas.
6. Validação do passo.
   Executa os testes unitários da API e confirma que o ficheiro `real_dev/api/src/modules/mf3-http-contracts.spec.ts` cobre o endpoint documentado.
7. Cenário negativo/erro esperado.
   Não marques o BK como concluído sem pelo menos um negativo de autenticação/autorização e um negativo de validação.

#### Critérios de aceite

##### Expected results

- Pedido válido para `POST /api/study-groups/:groupId/sessions` devolve `201 Created`; pedido válido para `GET /api/study-groups/:groupId/sessions` devolve `200 OK`.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `POST /api/study-groups/:groupId/sessions e GET /api/study-groups/:groupId/sessions` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-08` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X POST http://localhost:3000/api/study-groups/:groupId/sessions \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Sessão sobre matrizes", "startsAt": "2026-06-20T15:00:00.000Z", "durationMinutes": 60 }'
```

##### Negativos obrigatórios

- Sem cookie de sessão: `401 Unauthorized`.
- Campo obrigatório em falta: `400 Bad Request`.
- Recurso de outro aluno, grupo ou turma: `403 Forbidden` ou `404 Not Found`.
- Fonte inexistente ou não processável: `422 Unprocessable Entity` nos fluxos que usam fontes.

#### Evidence para PR/defesa

- Output do smoke test com payload válido.
- Output de pelo menos dois cenários negativos.
- Screenshot ou vídeo curto do painel frontend com sucesso e erro.
- Nota no PR com os documentos canónicos consultados e os requisitos cobertos.
- Referência ao requisito `RF43` e ao próximo BK `BK-MF3-08`.

#### Handoff

- Este BK entrega `StudyGroupSessionsModule`, `StudyGroupSessionsService`, `StudyGroupSessionsController` e cliente frontend tipado.
- O próximo BK é `BK-MF3-08`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
