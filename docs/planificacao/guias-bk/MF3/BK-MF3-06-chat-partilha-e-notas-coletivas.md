# BK-MF3-06 - Chat, partilha e notas coletivas.

## Header

- `doc_id`: `GUIA-BK-MF3-06`
- `bk_id`: `BK-MF3-06`
- `macro`: `MF3`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-05`
- `rf_rnf`: `RF42`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-07`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar mensagens e notas coletivas de grupo. O guia parte dos contratos canónicos de RF42, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF42 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Criar mensagens e notas.
- Listar histórico do grupo.
- Validar membership em todas as operações.

#### Scope-out

- Chat em tempo real por WebSocket.
- Anexos binários.
- Moderação automática.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `POST /api/study-groups/:groupId/messages e GET /api/study-groups/:groupId/messages`, DTO, backend, frontend, validações e handoff para `BK-MF3-07`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `POST /api/study-groups/:groupId/messages e GET /api/study-groups/:groupId/messages` é DERIVADO como contrato técnico mínimo para cumprir RF42 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF3-05` com `StudyGroupsService.ensureMember`.
- `BK-MF1-03` com materiais e apontamentos partilhados.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Mensagem é comunicação curta dentro do grupo.
- Nota coletiva é conteúdo partilhado que fica consultável pelos membros.
- Membership é validada antes de escrever ou ler mensagens.
- O texto guardado deve ser limitado para reduzir abuso e manter a UI rápida.

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

- Endpoint: `POST /api/study-groups/:groupId/messages e GET /api/study-groups/:groupId/messages`.
- Backend: `real_dev/api/src/modules/study-group-messages`.
- Frontend: `real_dev/web/src/features/study-group-messages`.
- DTO principal: `CreateStudyGroupMessageDto`.
- Service principal: `StudyGroupMessagesService`.
- Controller principal: `StudyGroupMessagesController`.
- Módulo principal: `StudyGroupMessagesModule`.
- Handoff: `BK-MF3-07`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/modules/study-group-messages/dto/create-study-group-message.dto.ts`
- CRIAR: `real_dev/api/src/modules/study-group-messages/schemas/study-group-message.schema.ts`
- CRIAR: `real_dev/api/src/modules/study-group-messages/study-group-messages.service.ts`
- CRIAR: `real_dev/api/src/modules/study-group-messages/study-group-messages.controller.ts`
- CRIAR: `real_dev/api/src/modules/study-group-messages/study-group-messages.module.ts`
- CRIAR: `real_dev/web/src/features/study-group-messages/create-study-group-message.ts`
- CRIAR: `real_dev/web/src/features/study-group-messages/study-group-messages-panel.tsx`
- REVER: `real_dev/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/study-group-messages/dto/create-study-group-message.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-messages/dto/create-study-group-message.dto.ts
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export type StudyGroupMessageKind = "MESSAGE" | "NOTE";

/**
 * Dados para mensagem ou nota coletiva no grupo.
 */
export class CreateStudyGroupMessageDto {
    /**
     * Tipo de conteúdo colaborativo.
     */
    @IsIn(["MESSAGE", "NOTE"])
    kind!: StudyGroupMessageKind;

    /**
     * Texto curto de chat ou nota coletiva.
     */
    @IsString()
    @MinLength(1)
    @MaxLength(4000)
    text!: string;
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia para `POST /api/study-groups/:groupId/messages` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Criar o schema de persistência

1. Objetivo funcional do passo no contexto da app.
   Guardar dados mínimos do fluxo para histórico, defesa e integração com BKs seguintes.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/study-group-messages/schemas/study-group-message.schema.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o schema Mongoose do resultado produzido por este BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-messages/schemas/study-group-message.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { StudyGroupMessageKind } from "../dto/create-study-group-message.dto.js";

export type StudyGroupMessageDocument = HydratedDocument<StudyGroupMessage>;

/**
 * Mensagem ou nota persistida dentro de um grupo de estudo.
 */
@Schema({ timestamps: true })
export class StudyGroupMessage {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    groupId!: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, index: true })
    authorStudentId!: Types.ObjectId;

    @Prop({ required: true, enum: ["MESSAGE", "NOTE"], index: true })
    kind!: StudyGroupMessageKind;

    @Prop({ required: true })
    text!: string;
}

export const StudyGroupMessageSchema =
    SchemaFactory.createForClass(StudyGroupMessage);
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
   - CRIAR: `real_dev/api/src/modules/study-group-messages/study-group-messages.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-messages/study-group-messages.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import {
    CreateStudyGroupMessageDto,
    StudyGroupMessageKind,
} from "./dto/create-study-group-message.dto.js";
import {
    StudyGroupMessage,
    StudyGroupMessageDocument,
} from "./schemas/study-group-message.schema.js";

export type StudyGroupMessageView = {
    _id: string;
    groupId: string;
    authorStudentId: string;
    kind: StudyGroupMessageKind;
    text: string;
    createdAt?: Date;
};

/**
 * Serviço de chat assíncrono e notas coletivas.
 */
@Injectable()
export class StudyGroupMessagesService {
    constructor(
        @InjectModel(StudyGroupMessage.name)
        private readonly messageModel: Model<StudyGroupMessageDocument>,
        private readonly studyGroupsService: StudyGroupsService,
    ) {}

    /**
     * Cria uma mensagem ou nota após validar membership.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @param input Conteúdo validado.
     * @returns Mensagem pública.
     */
    async createMessage(
        actor: AuthenticatedUser,
        groupId: string,
        input: CreateStudyGroupMessageDto,
    ): Promise<StudyGroupMessageView> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const message = await this.messageModel.create({
            groupId: new Types.ObjectId(groupId),
            authorStudentId: new Types.ObjectId(actor.id),
            kind: input.kind,
            text: input.text.trim(),
        });
        return this.toMessageView(message.toObject());
    }

    /**
     * Lista histórico do grupo visível apenas a membros.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @returns Mensagens ordenadas.
     */
    async listMessages(
        actor: AuthenticatedUser,
        groupId: string,
    ): Promise<StudyGroupMessageView[]> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const messages = await this.messageModel
            .find({ groupId: new Types.ObjectId(groupId) })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        return messages.map((message) => this.toMessageView(message));
    }

    /**
     * Converte documento interno em contrato público.
     *
     * @param message Documento ou objeto lean.
     * @returns Mensagem pública.
     */
    private toMessageView(message: {
        _id: unknown;
        groupId: unknown;
        authorStudentId: unknown;
        kind: StudyGroupMessageKind;
        text: string;
        createdAt?: Date;
    }): StudyGroupMessageView {
        return {
            _id: String(message._id),
            groupId: String(message.groupId),
            authorStudentId: String(message.authorStudentId),
            kind: message.kind,
            text: message.text,
            createdAt: message.createdAt,
        };
    }
}
```

5. Explicação do código.
   O service recebe o actor autenticado, valida o contexto com services de BKs anteriores e só depois lê, grava ou chama IA. Isto impede que a UI contorne regras de segurança.
6. Validação do passo.
   Cria testes unitários para sessão válida, contexto proibido e dados insuficientes.
7. Cenário negativo/erro esperado.
   Não faças consultas diretas por ID sem validar owner ou membership.

### Passo 4 - Expor o endpoint no controller

1. Objetivo funcional do passo no contexto da app.
   Ligar `POST /api/study-groups/:groupId/messages e GET /api/study-groups/:groupId/messages` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/study-group-messages/study-group-messages.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-messages/study-group-messages.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupMessageDto } from "./dto/create-study-group-message.dto.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

/**
 * Endpoints de mensagens e notas coletivas de grupos.
 */
@Controller("api/study-groups/:groupId/messages")
@UseGuards(SessionGuard)
export class StudyGroupMessagesController {
    constructor(private readonly messagesService: StudyGroupMessagesService) {}

    /**
     * Lista o histórico do grupo.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @returns Mensagens e notas.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
    ) {
        return this.messagesService.listMessages(request.user!, groupId);
    }

    /**
     * Cria mensagem ou nota.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @param body Conteúdo validado.
     * @returns Mensagem criada.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
        @Body() body: CreateStudyGroupMessageDto,
    ) {
        return this.messagesService.createMessage(request.user!, groupId, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz pedidos sem cookie para `POST /api/study-groups/:groupId/messages` e `GET /api/study-groups/:groupId/messages` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/study-group-messages/study-group-messages.module.ts`
   - EDITAR: `real_dev/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `StudyGroupMessagesModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/study-group-messages/study-group-messages.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import {
    StudyGroupMessage,
    StudyGroupMessageSchema,
} from "./schemas/study-group-message.schema.js";
import { StudyGroupMessagesController } from "./study-group-messages.controller.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

/**
 * Módulo MF3 para chat e notas coletivas.
 */
@Module({
    imports: [
        AuthModule,
        StudyGroupsModule,
        MongooseModule.forFeature([
            { name: StudyGroupMessage.name, schema: StudyGroupMessageSchema },
        ]),
    ],
    controllers: [StudyGroupMessagesController],
    providers: [StudyGroupMessagesService],
})
export class StudyGroupMessagesModule {}
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
   - CRIAR: `real_dev/web/src/features/study-group-messages/create-study-group-message.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/src/features/study-group-messages/create-study-group-message.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type StudyGroupMessage = {
    _id: string;
    groupId: string;
    authorStudentId: string;
    kind: "MESSAGE" | "NOTE";
    text: string;
    createdAt?: string;
};

/**
 * Lista mensagens e notas do grupo.
 *
 * @param groupId Grupo alvo.
 * @returns Histórico colaborativo.
 */
export function listStudyGroupMessages(
    groupId: string,
): Promise<StudyGroupMessage[]> {
    return requestMf3Json<StudyGroupMessage[]>(
        `/api/study-groups/${groupId}/messages`,
    );
}

/**
 * Cria mensagem ou nota coletiva.
 *
 * @param groupId Grupo alvo.
 * @param input Tipo e conteúdo.
 * @returns Mensagem criada.
 */
export function createStudyGroupMessage(
    groupId: string,
    input: { kind: "MESSAGE" | "NOTE"; text: string },
): Promise<StudyGroupMessage> {
    return requestMf3Json<StudyGroupMessage>(
        `/api/study-groups/${groupId}/messages`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
```

5. Explicação do código.
   `credentials: 'include'` envia o cookie de sessão sem guardar tokens no `localStorage`. A criação envia apenas `kind` e `text` no body; o `groupId` fica no URL para o backend validar membership. A função de listagem cobre o `GET` documentado sem duplicar regras de segurança no frontend.
6. Validação do passo.
   Força a API a devolver erro e confirma que o componente recebe uma exceção.
7. Cenário negativo/erro esperado.
   Não uses `localStorage` para tokens de autenticação.

### Passo 7 - Montar a interface mínima

1. Objetivo funcional do passo no contexto da app.
   Dar ao aluno um ecrã simples para testar o endpoint sem ferramentas externas.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/web/src/features/study-group-messages/study-group-messages-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/features/study-group-messages/study-group-messages-panel.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    createStudyGroupMessage,
    listStudyGroupMessages,
    StudyGroupMessage,
} from "./create-study-group-message.js";

type StudyGroupMessagesPanelProps = {
    initialGroupId?: string | null;
};

/**
 * Painel de mensagens e notas coletivas.
 *
 * @param props Grupo selecionado pela página agregadora.
 * @returns Formulário e histórico.
 */
export function StudyGroupMessagesPanel({ initialGroupId }: StudyGroupMessagesPanelProps) {
    const [groupId, setGroupId] = useState(initialGroupId ?? "");
    const [kind, setKind] = useState<"MESSAGE" | "NOTE">("MESSAGE");
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<StudyGroupMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refresh(targetGroupId = groupId): Promise<void> {
        if (!targetGroupId) return;
        setMessages(await listStudyGroupMessages(targetGroupId));
    }

    useEffect(() => {
        const nextGroupId = initialGroupId ?? "";
        setGroupId(nextGroupId);
        if (nextGroupId) void refresh(nextGroupId);
    }, [initialGroupId]);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await createStudyGroupMessage(groupId, { kind, text });
            setText("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Mensagens e notas</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Grupo
                    <input value={groupId} onBlur={() => void refresh()} onChange={(event) => setGroupId(event.target.value)} />
                </label>
                <label className="block">
                    Tipo
                    <select value={kind} onChange={(event) => setKind(event.target.value as "MESSAGE" | "NOTE")}>
                        <option value="MESSAGE">Mensagem</option>
                        <option value="NOTE">Nota</option>
                    </select>
                </label>
                <label className="block">
                    Conteúdo
                    <textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || text.trim().length === 0}>
                    Guardar
                </button>
            </form>
            {messages.length === 0 ? <p className="text-sm text-slate-600">Sem histórico.</p> : null}
            <div className="grid gap-2">
                {messages.map((message) => (
                    <article className="rounded-md border border-slate-200 p-3 text-sm" key={message._id}>
                        <strong>{message.kind === "NOTE" ? "Nota" : "Mensagem"}</strong>
                        <p className="whitespace-pre-line text-slate-700">{message.text}</p>
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
   - LOCALIZAÇÃO: `teste de contrato MF3 e teste unitário do módulo`
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

- Pedido válido para `POST /api/study-groups/:groupId/messages` devolve `201 Created`; pedido válido para `GET /api/study-groups/:groupId/messages` devolve `200 OK`.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `POST /api/study-groups/:groupId/messages e GET /api/study-groups/:groupId/messages` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-07` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X POST http://localhost:3000/api/study-groups/:groupId/messages \
  -H 'Content-Type: application/json' \
  -d '{ "kind": "NOTE", "text": "Rever exercício 4 antes da sessão." }'
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
- Referência ao requisito `RF42` e ao próximo BK `BK-MF3-07`.

#### Handoff

- Este BK entrega `StudyGroupMessagesModule`, `StudyGroupMessagesService`, `StudyGroupMessagesController` e cliente frontend tipado.
- O próximo BK é `BK-MF3-07`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
