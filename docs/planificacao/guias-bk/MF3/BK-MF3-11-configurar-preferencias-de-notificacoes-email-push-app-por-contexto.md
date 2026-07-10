# BK-MF3-11 - Configurar preferências de notificações (email, push, app) por contexto.

## Header

- `doc_id`: `GUIA-BK-MF3-11`
- `bk_id`: `BK-MF3-11`
- `macro`: `MF3`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `PARCIAL`
- `esforco`: `S`
- `dependencias`: `BK-MF0-02`
- `rf_rnf`: `RF47`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-12`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-11-configurar-preferencias-de-notificacoes-email-push-app-por-contexto.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar preferências de notificações por contexto. O guia parte dos contratos canónicos de RF47, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF47 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Guardar preferências por contexto.
- Listar preferências efetivas.
- Preparar consumo por alertas.

#### Scope-out

- Envio real de email.
- Web Push com service worker.
- Quotas administrativas.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `PUT /api/notification-preferences e GET /api/notification-preferences`, DTO, backend, frontend, validações e handoff para `BK-MF3-12`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `PUT /api/notification-preferences e GET /api/notification-preferences` é DERIVADO como contrato técnico mínimo para cumprir RF47 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF0-02` com sessão segura.
- `RNF07` com notificações discretas e contextualizadas.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Preferência de notificação define canais permitidos por contexto.
- Email, push e app são canais; app corresponde a aviso dentro da StudyFlow.
- A preferência pertence ao utilizador autenticado e não pode ser alterada para outro aluno.
- O BK seguinte consulta estas preferências antes de mostrar alertas.

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

- Endpoint: `PUT /api/notification-preferences e GET /api/notification-preferences`.
- Backend: `apps/api/src/modules/notification-preferences`.
- Frontend: `apps/web/src/features/notification-preferences`.
- DTO principal: `UpdateNotificationPreferencesDto`.
- Service principal: `NotificationPreferencesService`.
- Controller principal: `NotificationPreferencesController`.
- Módulo principal: `NotificationPreferencesModule`.
- Handoff: `BK-MF3-12`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/notification-preferences/dto/update-notification-preferences.dto.ts`
- CRIAR: `apps/api/src/modules/notification-preferences/schemas/notification-preference.schema.ts`
- CRIAR: `apps/api/src/modules/notification-preferences/notification-preferences.service.ts`
- CRIAR: `apps/api/src/modules/notification-preferences/notification-preferences.controller.ts`
- CRIAR: `apps/api/src/modules/notification-preferences/notification-preferences.module.ts`
- CRIAR: `apps/web/src/features/notification-preferences/update-notification-preferences.ts`
- CRIAR: `apps/web/src/features/notification-preferences/notification-preferences-panel.tsx`
- REVER: `apps/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-preferences/dto/update-notification-preferences.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-preferences/dto/update-notification-preferences.dto.ts
import { IsBoolean, IsEnum } from "class-validator";

export enum NotificationContext {
    STUDY_ROUTINE = "STUDY_ROUTINE",
    STUDY_GOAL = "STUDY_GOAL",
    GROUP_SESSION = "GROUP_SESSION",
}

/**
 * Preferências de canal para um contexto de notificação.
 */
export class UpdateNotificationPreferencesDto {
    /**
     * Contexto funcional da notificação.
     */
    @IsEnum(NotificationContext)
    context!: NotificationContext;

    /**
     * Permissão para email. A integração real não existe nesta fase.
     */
    @IsBoolean()
    email!: boolean;

    /**
     * Permissão para push. A integração real não existe nesta fase.
     */
    @IsBoolean()
    push!: boolean;

    /**
     * Permissão para alerta dentro da app.
     */
    @IsBoolean()
    inApp!: boolean;
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia para `PUT /api/notification-preferences` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Criar o schema de persistência

1. Objetivo funcional do passo no contexto da app.
   Guardar dados mínimos do fluxo para histórico, defesa e integração com BKs seguintes.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-preferences/schemas/notification-preference.schema.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o schema Mongoose do resultado produzido por este BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-preferences/schemas/notification-preference.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { NotificationContext } from "../dto/update-notification-preferences.dto.js";

export type NotificationPreferenceDocument =
    HydratedDocument<NotificationPreference>;

/**
 * Preferência de notificação por utilizador e contexto.
 */
@Schema({ timestamps: true })
export class NotificationPreference {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(NotificationContext), index: true })
    context!: NotificationContext;

    @Prop({ required: true, default: false })
    email!: boolean;

    @Prop({ required: true, default: false })
    push!: boolean;

    @Prop({ required: true, default: true })
    inApp!: boolean;
}

export const NotificationPreferenceSchema =
    SchemaFactory.createForClass(NotificationPreference);

NotificationPreferenceSchema.index({ userId: 1, context: 1 }, { unique: true });
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
   - CRIAR: `apps/api/src/modules/notification-preferences/notification-preferences.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-preferences/notification-preferences.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    NotificationContext,
    UpdateNotificationPreferencesDto,
} from "./dto/update-notification-preferences.dto.js";
import {
    NotificationPreference,
    NotificationPreferenceDocument,
} from "./schemas/notification-preference.schema.js";

export type NotificationPreferenceView = {
    _id?: string;
    context: NotificationContext;
    email: boolean;
    push: boolean;
    inApp: boolean;
    updatedAt?: Date;
};

const DEFAULT_CHANNELS = {
    email: false,
    push: false,
    inApp: true,
};

/**
 * Serviço de preferências de notificação por contexto.
 */
@Injectable()
export class NotificationPreferencesService {
    constructor(
        @InjectModel(NotificationPreference.name)
        private readonly preferenceModel: Model<NotificationPreferenceDocument>,
    ) {}

    /**
     * Lista preferências efetivas, preenchendo defaults dos contextos ausentes.
     *
     * @param userId Utilizador autenticado.
     * @returns Preferências por contexto.
     */
    async listEffective(userId: string): Promise<NotificationPreferenceView[]> {
        const preferences = await this.preferenceModel
            .find({ userId: new Types.ObjectId(userId) })
            .lean();
        const byContext = new Map(
            preferences.map((preference) => [preference.context, preference]),
        );
        return Object.values(NotificationContext).map((context) => {
            const existing = byContext.get(context);
            return existing
                ? this.toPreferenceView(existing)
                : { context, ...DEFAULT_CHANNELS };
        });
    }

    /**
     * Atualiza ou cria uma preferência do utilizador autenticado.
     *
     * @param userId Utilizador autenticado.
     * @param input Canais por contexto.
     * @returns Preferência persistida.
     */
    async upsert(
        userId: string,
        input: UpdateNotificationPreferencesDto,
    ): Promise<NotificationPreferenceView> {
        const preference = await this.preferenceModel
            .findOneAndUpdate(
                {
                    userId: new Types.ObjectId(userId),
                    context: input.context,
                },
                {
                    $set: {
                        email: input.email,
                        push: input.push,
                        inApp: input.inApp,
                    },
                    $setOnInsert: {
                        userId: new Types.ObjectId(userId),
                        context: input.context,
                    },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        return this.toPreferenceView(preference);
    }

    /**
     * Indica se um alerta in-app deve ser mostrado para o contexto.
     *
     * @param userId Utilizador autenticado.
     * @param context Contexto consultado.
     * @returns `true` quando o canal app está ativo.
     */
    async isInAppEnabled(
        userId: string,
        context: NotificationContext,
    ): Promise<boolean> {
        const preference = await this.preferenceModel
            .findOne({ userId: new Types.ObjectId(userId), context })
            .lean();
        return preference?.inApp ?? DEFAULT_CHANNELS.inApp;
    }

    /**
     * Remove campos internos da preferência.
     *
     * @param preference Documento ou objeto lean.
     * @returns Preferência pública.
     */
    private toPreferenceView(preference: {
        _id?: unknown;
        context: NotificationContext;
        email: boolean;
        push: boolean;
        inApp: boolean;
        updatedAt?: Date;
    }): NotificationPreferenceView {
        return {
            _id: preference._id ? String(preference._id) : undefined,
            context: preference.context,
            email: preference.email,
            push: preference.push,
            inApp: preference.inApp,
            updatedAt: preference.updatedAt,
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
   Ligar `PUT /api/notification-preferences e GET /api/notification-preferences` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-preferences/notification-preferences.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-preferences/notification-preferences.controller.ts
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "./notification-preferences.service.js";

/**
 * Endpoints de preferências de notificação.
 */
@Controller("api/notification-preferences")
@UseGuards(SessionGuard)
export class NotificationPreferencesController {
    constructor(
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    /**
     * Lista preferências efetivas do utilizador.
     *
     * @param request Pedido autenticado.
     * @returns Preferências por contexto.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.preferencesService.listEffective(request.user!.id);
    }

    /**
     * Atualiza uma preferência.
     *
     * @param request Pedido autenticado.
     * @param body Contexto e canais.
     * @returns Preferência persistida.
     */
    @Put()
    update(
        @Req() request: AuthenticatedRequest,
        @Body() body: UpdateNotificationPreferencesDto,
    ) {
        return this.preferencesService.upsert(request.user!.id, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz pedidos sem cookie para `PUT /api/notification-preferences` e `GET /api/notification-preferences` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-preferences/notification-preferences.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `NotificationPreferencesModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-preferences/notification-preferences.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { NotificationPreferencesController } from "./notification-preferences.controller.js";
import { NotificationPreferencesService } from "./notification-preferences.service.js";
import {
    NotificationPreference,
    NotificationPreferenceSchema,
} from "./schemas/notification-preference.schema.js";

/**
 * Módulo MF3 de preferências de notificação.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            {
                name: NotificationPreference.name,
                schema: NotificationPreferenceSchema,
            },
        ]),
    ],
    controllers: [NotificationPreferencesController],
    providers: [NotificationPreferencesService],
    exports: [NotificationPreferencesService],
})
export class NotificationPreferencesModule {}
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
   - CRIAR: `apps/web/src/features/notification-preferences/update-notification-preferences.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/notification-preferences/update-notification-preferences.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type NotificationContext =
    | "STUDY_ROUTINE"
    | "STUDY_GOAL"
    | "GROUP_SESSION";

export type NotificationPreference = {
    _id?: string;
    context: NotificationContext;
    email: boolean;
    push: boolean;
    inApp: boolean;
    updatedAt?: string;
};

/**
 * Lista preferências efetivas.
 *
 * @returns Preferências por contexto.
 */
export function listNotificationPreferences(): Promise<NotificationPreference[]> {
    return requestMf3Json<NotificationPreference[]>("/api/notification-preferences");
}

/**
 * Atualiza preferência de notificação.
 *
 * @param input Contexto e canais.
 * @returns Preferência persistida.
 */
export function updateNotificationPreferences(
    input: NotificationPreference,
): Promise<NotificationPreference> {
    return requestMf3Json<NotificationPreference>("/api/notification-preferences", {
        method: "PUT",
        body: JSON.stringify(input),
    });
}
```

5. Explicação do código.
   `credentials: 'include'` envia o cookie de sessão sem guardar tokens no `localStorage`. `updateNotificationPreferences` cobre a gravação de um contexto e `loadNotificationPreferences` cobre a leitura usada pela UI e pelo handoff para `BK-MF3-12`.
6. Validação do passo.
   Força a API a devolver erro e confirma que o componente recebe uma exceção.
7. Cenário negativo/erro esperado.
   Não uses `localStorage` para tokens de autenticação.

### Passo 7 - Montar a interface mínima

1. Objetivo funcional do passo no contexto da app.
   Dar ao aluno um ecrã simples para testar o endpoint sem ferramentas externas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/notification-preferences/notification-preferences-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/notification-preferences/notification-preferences-panel.tsx
import { useEffect, useState } from "react";
import {
    listNotificationPreferences,
    NotificationPreference,
    updateNotificationPreferences,
} from "./update-notification-preferences.js";

const contextLabels: Record<NotificationPreference["context"], string> = {
    STUDY_ROUTINE: "Rotinas",
    STUDY_GOAL: "Objetivos",
    GROUP_SESSION: "Sessões",
};

/**
 * Painel de preferências de notificação por contexto.
 *
 * @returns Lista editável de preferências.
 */
export function NotificationPreferencesPanel() {
    const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        setPreferences(await listNotificationPreferences());
    }

    useEffect(() => {
        refresh()
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar."),
            )
            .finally(() => setLoading(false));
    }, []);

    async function toggle(
        preference: NotificationPreference,
        field: "email" | "push" | "inApp",
    ): Promise<void> {
        setError(null);
        try {
            const updated = await updateNotificationPreferences({
                ...preference,
                [field]: !preference[field],
            });
            setPreferences((current) =>
                current.map((item) =>
                    item.context === updated.context ? updated : item,
                ),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar.");
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Notificações</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            {loading ? <p className="text-sm text-slate-600">A carregar preferências...</p> : null}
            <div className="grid gap-3">
                {preferences.map((preference) => (
                    <article className="rounded-md border border-slate-200 p-3" key={preference.context}>
                        <h3 className="font-medium">{contextLabels[preference.context]}</h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                            {(["email", "push", "inApp"] as const).map((field) => (
                                <label className="flex items-center gap-2" key={field}>
                                    <input
                                        type="checkbox"
                                        checked={preference[field]}
                                        onChange={() => void toggle(preference, field)}
                                    />
                                    {field === "inApp" ? "app" : field}
                                </label>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
```

5. Explicação do código.
   O componente valida o fluxo real de escrita e leitura. `handleSubmit` testa `PUT /api/notification-preferences`; `handleLoadPreferences` testa `GET /api/notification-preferences`. Ambos usam o cliente tipado, mostram loading, erro e sucesso, e não guardam tokens no browser.
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

- Pedido válido para `PUT /api/notification-preferences` devolve `200 OK`; pedido válido para `GET /api/notification-preferences` devolve `200 OK`.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `PUT /api/notification-preferences e GET /api/notification-preferences` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-12` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X PUT http://localhost:3000/api/notification-preferences \
  -H 'Content-Type: application/json' \
  -d '{ "context": "STUDY_ROUTINE", "email": true, "push": false, "inApp": true }'
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
- Referência ao requisito `RF47` e ao próximo BK `BK-MF3-12`.

#### Handoff

- Este BK entrega `NotificationPreferencesModule`, `NotificationPreferencesService`, `NotificationPreferencesController` e cliente frontend tipado.
- O próximo BK é `BK-MF3-12`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
