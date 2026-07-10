# BK-MF3-05 - Criar grupos de estudo.

## Header

- `doc_id`: `GUIA-BK-MF3-05`
- `bk_id`: `BK-MF3-05`
- `macro`: `MF3`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RF41`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-06`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-05-criar-grupos-de-estudo.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar grupos de estudo sobre salas StudyRoom. O guia parte dos contratos canónicos de RF41, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF41 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Criar grupo como sala livre ou por disciplina.
- Listar grupos do aluno.
- Preparar endpoint para chat, sessões e IA coletiva.

#### Scope-out

- Convites avançados.
- Moderação administrativa.
- Turmas oficiais.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `POST /api/study-groups e GET /api/study-groups`, DTO, backend, frontend, validações e handoff para `BK-MF3-06`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `POST /api/study-groups e GET /api/study-groups` é DERIVADO como contrato técnico mínimo para cumprir RF41 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF1-02` com `StudyRoomsService.create` e `StudyRoomsService.listForMember`.
- `BK-MF0-02` com sessão autenticada.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Grupo de estudo é uma fachada de produto sobre a sala de estudo criada em RF14.
- O criador entra como membro inicial através do service de salas.
- A listagem mostra apenas grupos onde o aluno tem membership.
- Esta decisão evita duas entidades diferentes para a mesma colaboração.

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

- Endpoint: `POST /api/study-groups e GET /api/study-groups`.
- Backend: `apps/api/src/modules/study-groups`.
- Frontend: `apps/web/src/features/study-groups`.
- DTO principal: `CreateStudyGroupDto`.
- Service principal: `StudyGroupsService`.
- Controller principal: `StudyGroupsController`.
- Módulo principal: `StudyGroupsModule`.
- Handoff: `BK-MF3-06`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/study-groups/dto/create-study-group.dto.ts`
- REVER: `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`
- CRIAR: `apps/api/src/modules/study-groups/study-groups.service.ts`
- CRIAR: `apps/api/src/modules/study-groups/study-groups.controller.ts`
- CRIAR: `apps/api/src/modules/study-groups/study-groups.module.ts`
- CRIAR: `apps/web/src/features/study-groups/create-study-group.ts`
- CRIAR: `apps/web/src/features/study-groups/study-groups-panel.tsx`
- REVER: `apps/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-groups/dto/create-study-group.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-groups/dto/create-study-group.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Dados para criar um grupo de estudo sobre salas existentes.
 */
export class CreateStudyGroupDto {
    /**
     * Nome visível do grupo.
     */
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    /**
     * Disciplina ou tema associado quando o grupo não é livre.
     */
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    disciplineName?: string;

    /**
     * Objetivo curto do grupo.
     */
    @IsOptional()
    @IsString()
    @MaxLength(600)
    description?: string;
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia para `POST /api/study-groups` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Reutilizar o modelo StudyRoom

1. Objetivo funcional do passo no contexto da app.
   Evitar criar uma entidade paralela para grupos de estudo.
2. Ficheiros envolvidos:
   - REVER: `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`
   - LOCALIZAÇÃO: `schema StudyRoom criado em BK-MF1-02`
3. Instruções do que fazer.
   Confirma que o grupo de estudo será criado através do service de salas, mantendo uma única fonte de verdade para membership.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-rooms/schemas/study-room.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyRoomDocument = HydratedDocument<StudyRoom>;
export type StudyRoomType = "FREE" | "SUBJECT";

/**
 * Sala colaborativa entre alunos.
 */
@Schema({ timestamps: true, collection: "study_rooms" })
export class StudyRoom {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    ownerStudentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, enum: ["FREE", "SUBJECT"], default: "FREE" })
    type!: StudyRoomType;

    @Prop({ trim: true, maxlength: 120 })
    disciplineName?: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    memberIds!: Types.ObjectId[];
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });
```

5. Explicação do código.
   Este passo protege a arquitetura: grupo de estudo é uma vista de produto sobre StudyRoom. O próximo BK pode reutilizar a mesma membership para mensagens.
6. Validação do passo.
   Confirma que não foi criado ficheiro `study-group.schema.ts`.
7. Cenário negativo/erro esperado.
   Criar outro schema para a mesma colaboração partiria permissões e listagens.

### Passo 3 - Implementar o service de aplicação

1. Objetivo funcional do passo no contexto da app.
   Concentrar regras de negócio, ownership, membership, erros e efeitos de persistência num ponto testável.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-groups/study-groups.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-groups/study-groups.service.ts
import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import { CreateStudyGroupDto } from "./dto/create-study-group.dto.js";

export type StudyGroupView = {
    _id: string;
    ownerStudentId: string;
    title: string;
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    createdAt?: Date;
};

/**
 * Fachada de grupos de estudo sobre `StudyRoom`.
 *
 * Mantém a membership numa única entidade, permitindo que chat, sessões e IA
 * coletiva reutilizem o contrato já validado em MF1.
 */
@Injectable()
export class StudyGroupsService {
    constructor(private readonly studyRoomsService: StudyRoomsService) {}

    /**
     * Cria um grupo e adiciona automaticamente o criador como membro.
     *
     * @param actor Aluno autenticado.
     * @param input Dados do grupo.
     * @returns Grupo público.
     */
    async createGroup(
        actor: AuthenticatedUser,
        input: CreateStudyGroupDto,
    ): Promise<StudyGroupView> {
        const room = await this.studyRoomsService.createRoom(actor, {
            name: input.title,
            type: input.disciplineName ? "SUBJECT" : "FREE",
            disciplineName: input.disciplineName,
            description: input.description,
        });
        return this.toGroupView(room);
    }

    /**
     * Lista os grupos onde o aluno autenticado é membro.
     *
     * @param actor Aluno autenticado.
     * @returns Grupos acessíveis.
     */
    async listMyGroups(actor: AuthenticatedUser): Promise<StudyGroupView[]> {
        const rooms = await this.studyRoomsService.listMyRooms(actor);
        return rooms.map((room) => this.toGroupView(room));
    }

    /**
     * Confirma membership no grupo.
     *
     * @param studentId Aluno autenticado.
     * @param groupId Grupo/sala.
     * @returns Grupo validado.
     */
    async ensureMember(
        studentId: string,
        groupId: string,
    ): Promise<StudyGroupView> {
        const room = await this.studyRoomsService.ensureMember(studentId, groupId);
        return this.toGroupView(room);
    }

    /**
     * Converte o contrato de sala no contrato público de grupos.
     *
     * @param room Sala validada.
     * @returns Grupo público.
     */
    private toGroupView(room: {
        _id: string;
        ownerStudentId: string;
        name: string;
        disciplineName?: string;
        description?: string;
        memberIds: string[];
        createdAt?: Date;
    }): StudyGroupView {
        return {
            _id: room._id,
            ownerStudentId: room.ownerStudentId,
            title: room.name,
            disciplineName: room.disciplineName,
            description: room.description,
            memberIds: room.memberIds,
            createdAt: room.createdAt,
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
   Ligar `POST /api/study-groups e GET /api/study-groups` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-groups/study-groups.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-groups/study-groups.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupDto } from "./dto/create-study-group.dto.js";
import { StudyGroupsService } from "./study-groups.service.js";

/**
 * Endpoints de grupos de estudo.
 */
@Controller("api/study-groups")
@UseGuards(SessionGuard)
export class StudyGroupsController {
    constructor(private readonly studyGroupsService: StudyGroupsService) {}

    /**
     * Lista grupos acessíveis ao aluno.
     *
     * @param request Pedido autenticado.
     * @returns Grupos do aluno.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.studyGroupsService.listMyGroups(request.user!);
    }

    /**
     * Cria um grupo de estudo.
     *
     * @param request Pedido autenticado.
     * @param body Dados do grupo.
     * @returns Grupo criado.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateStudyGroupDto,
    ) {
        return this.studyGroupsService.createGroup(request.user!, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz pedidos sem cookie para `POST /api/study-groups` e `GET /api/study-groups` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-groups/study-groups.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `StudyGroupsModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-groups/study-groups.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { StudyGroupsController } from "./study-groups.controller.js";
import { StudyGroupsService } from "./study-groups.service.js";

/**
 * Módulo MF3 de grupos de estudo.
 */
@Module({
    imports: [AuthModule, StudyRoomsModule],
    controllers: [StudyGroupsController],
    providers: [StudyGroupsService],
    exports: [StudyGroupsService],
})
export class StudyGroupsModule {}
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
   - CRIAR: `apps/web/src/features/study-groups/create-study-group.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/study-groups/create-study-group.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type StudyGroup = {
    _id: string;
    ownerStudentId: string;
    title: string;
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    createdAt?: string;
};

/**
 * Lista grupos do aluno.
 *
 * @returns Grupos acessíveis.
 */
export function listStudyGroups(): Promise<StudyGroup[]> {
    return requestMf3Json<StudyGroup[]>("/api/study-groups");
}

/**
 * Cria um grupo de estudo.
 *
 * @param input Dados do grupo.
 * @returns Grupo criado.
 */
export function createStudyGroup(input: {
    title: string;
    disciplineName?: string;
    description?: string;
}): Promise<StudyGroup> {
    return requestMf3Json<StudyGroup>("/api/study-groups", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
```

5. Explicação do código.
   `credentials: 'include'` envia o cookie de sessão sem guardar tokens no `localStorage`. `createStudyGroup` cobre a criação e `listStudyGroups` cobre a leitura de grupos do aluno autenticado, mantendo o contrato de `POST` e `GET` separado e testável.
6. Validação do passo.
   Força a API a devolver erro e confirma que o componente recebe uma exceção.
7. Cenário negativo/erro esperado.
   Não uses `localStorage` para tokens de autenticação.

### Passo 7 - Montar a interface mínima

1. Objetivo funcional do passo no contexto da app.
   Dar ao aluno um ecrã simples para testar o endpoint sem ferramentas externas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/study-groups/study-groups-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/study-groups/study-groups-panel.tsx
import { FormEvent, useEffect, useState } from "react";
import { createStudyGroup, listStudyGroups, StudyGroup } from "./create-study-group.js";

/**
 * Painel de criação e listagem de grupos de estudo.
 *
 * @returns UI de grupos.
 */
export function StudyGroupsPanel() {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [title, setTitle] = useState("");
    const [disciplineName, setDisciplineName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        setGroups(await listStudyGroups());
    }

    useEffect(() => {
        refresh()
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar."),
            )
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createStudyGroup({
                title,
                disciplineName: disciplineName || undefined,
                description,
            });
            setTitle("");
            setDisciplineName("");
            setDescription("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar grupo.");
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Grupos de estudo</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Nome
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="block">
                    Disciplina
                    <input value={disciplineName} onChange={(event) => setDisciplineName(event.target.value)} />
                </label>
                <label className="block">
                    Descrição
                    <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={title.trim().length < 3}>
                    Criar grupo
                </button>
            </form>
            {loading ? <p className="text-sm text-slate-600">A carregar grupos...</p> : null}
            {!loading && groups.length === 0 ? (
                <p className="text-sm text-slate-600">Ainda não tens grupos.</p>
            ) : null}
            <div className="grid gap-2">
                {groups.map((group) => (
                    <a className="rounded-md border border-slate-200 p-3 text-sm" href={`/app/comunidade?grupo=${encodeURIComponent(group._id)}`} key={group._id}>
                        <strong>{group.title}</strong>
                        <span className="block text-slate-600">{group.memberIds.length} membros</span>
                    </a>
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
   - REVER: `apps/api/src/modules/mf3-http-contracts.spec.ts`
   - LOCALIZAÇÃO: `teste de contrato MF3 e teste unitário do módulo`
3. Instruções do que fazer.
   Revê os testes Jest já configurados para a MF3 e confirma o cenário deste BK sem adicionar dependências novas.
4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação: usa os testes Jest existentes em `apps/api/src/modules/mf3-http-contracts.spec.ts` e o teste unitário do módulo correspondente, sem adicionar dependências novas.

5. Explicação do código.
   A validação usa Jest e os testes de contrato existentes da MF3 para confirmar rota, autenticação, DTO e cenário negativo sem introduzir dependências HTTP externas.
6. Validação do passo.
   Executa os testes unitários da API e confirma que o ficheiro `apps/api/src/modules/mf3-http-contracts.spec.ts` cobre o endpoint documentado.
7. Cenário negativo/erro esperado.
   Não marques o BK como concluído sem pelo menos um negativo de autenticação/autorização e um negativo de validação.

#### Critérios de aceite

##### Expected results

- Pedido válido para `POST /api/study-groups` devolve `201 Created`; pedido válido para `GET /api/study-groups` devolve `200 OK`.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `POST /api/study-groups e GET /api/study-groups` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-06` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X POST http://localhost:3000/api/study-groups \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Grupo de Matemática", "disciplineName": "Matemática", "description": "Preparar teste de funções." }'
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
- Referência ao requisito `RF41` e ao próximo BK `BK-MF3-06`.

#### Handoff

- Este BK entrega `StudyGroupsModule`, `StudyGroupsService`, `StudyGroupsController` e cliente frontend tipado.
- O próximo BK é `BK-MF3-06`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
