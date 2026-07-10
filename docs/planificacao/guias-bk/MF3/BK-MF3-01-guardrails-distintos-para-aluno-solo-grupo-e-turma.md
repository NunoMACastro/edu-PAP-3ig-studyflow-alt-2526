# BK-MF3-01 - Guardrails distintos para aluno solo, grupo e turma.

## Header

- `doc_id`: `GUIA-BK-MF3-01`
- `bk_id`: `BK-MF3-01`
- `macro`: `MF3`
- `owner`: `Natalia`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-11`
- `rf_rnf`: `RF37`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-02`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar guardrails IA por contexto. O guia parte dos contratos canónicos de RF37, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF37 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Criar um endpoint único para validar se um pedido IA pode avançar.
- Validar `SOLO`, `STUDY_ROOM` e `CLASS_SUBJECT` sem misturar dados.
- Guardar decisão e razão de bloqueio.
- Expor cliente e painel mínimo para teste manual.

#### Scope-out

- Gerar resposta IA.
- Alterar materiais, salas, disciplinas ou perfis já criados.
- Criar quotas administrativas de IA.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `POST /api/ai/guardrails/check`, DTO, backend, frontend, validações e handoff para `BK-MF3-02`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `POST /api/ai/guardrails/check` é DERIVADO como contrato técnico mínimo para cumprir RF37 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF2-11` com IA privada por área de estudo.
- `BK-MF1-02` com `StudyRoomsService.ensureMember`.
- `BK-MF1-08` com `SubjectsService.findSubjectForStudent`.
- `BK-MF0-02` com `SessionGuard` e `AuthenticatedUser`.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Um guardrail é uma regra que corre antes da IA e decide se o pedido pode avançar.
- O contexto `SOLO` valida ownership de uma área de estudo do aluno.
- O contexto `STUDY_ROOM` valida membership de sala ou grupo antes de usar dados partilhados.
- O contexto `CLASS_SUBJECT` valida inscrição na disciplina/turma antes de usar materiais oficiais.
- A decisão é guardada para defesa técnica e para diagnóstico de pedidos bloqueados.

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

- Endpoint: `POST /api/ai/guardrails/check`.
- Backend: `apps/api/src/modules/ai-guardrails`.
- Frontend: `apps/web/src/features/ai-guardrails`.
- DTO principal: `CheckAiGuardrailsDto`.
- Service principal: `AiGuardrailsService`.
- Controller principal: `AiGuardrailsController`.
- Módulo principal: `AiGuardrailsModule`.
- Handoff: `BK-MF3-02`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai-guardrails/dto/check-ai-guardrails.dto.ts`
- CRIAR: `apps/api/src/modules/ai-guardrails/schemas/ai-guardrail-check.schema.ts`
- CRIAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- CRIAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`
- CRIAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.module.ts`
- CRIAR: `apps/web/src/features/mf3/request-mf3-json.ts`
- CRIAR: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- CRIAR: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- REVER: `apps/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-guardrails/dto/check-ai-guardrails.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/dto/check-ai-guardrails.dto.ts
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export enum AiGuardrailContextType {
    SOLO = "SOLO",
    STUDY_ROOM = "STUDY_ROOM",
    CLASS_SUBJECT = "CLASS_SUBJECT",
}

/**
 * Dados recebidos pelo endpoint que decide se um pedido de IA pode avançar.
 *
 * O `userId` não existe no DTO porque a fonte de verdade é sempre a sessão
 * autenticada. Isto evita que o frontend consiga simular ownership ou
 * membership de outro aluno.
 */
export class CheckAiGuardrailsDto {
    /**
     * Contexto funcional onde a IA será usada.
     */
    @IsEnum(AiGuardrailContextType)
    contextType!: AiGuardrailContextType;

    /**
     * Área, sala/grupo ou disciplina a validar.
     */
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    resourceId!: string;

    /**
     * Pergunta ou instrução original do aluno.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(2000)
    prompt!: string;
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia para `POST /api/ai/guardrails/check` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Criar o schema de persistência

1. Objetivo funcional do passo no contexto da app.
   Guardar dados mínimos do fluxo para histórico, defesa e integração com BKs seguintes.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-guardrails/schemas/ai-guardrail-check.schema.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o schema Mongoose do resultado produzido por este BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/schemas/ai-guardrail-check.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AiGuardrailContextType } from "../dto/check-ai-guardrails.dto.js";

export type AiGuardrailCheckDocument = HydratedDocument<AiGuardrailCheck>;

/**
 * Registo mínimo de uma decisão de guardrails.
 *
 * O documento guarda apenas metadados necessários para auditoria técnica,
 * sem persistir respostas de IA nem material privado.
 */
@Schema({ timestamps: true })
export class AiGuardrailCheck {
    _id!: { toString(): string };

    @Prop({ required: true, index: true })
    actorId!: string;

    @Prop({ required: true, enum: Object.values(AiGuardrailContextType), index: true })
    contextType!: AiGuardrailContextType;

    @Prop({ required: true, index: true })
    resourceId!: string;

    @Prop({ required: true })
    allowed!: boolean;

    @Prop({ required: true })
    reasonCode!: string;

    @Prop({ required: true })
    reason!: string;
}

export const AiGuardrailCheckSchema =
    SchemaFactory.createForClass(AiGuardrailCheck);
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
   - CRIAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    AiGuardrailContextType,
    CheckAiGuardrailsDto,
} from "./dto/check-ai-guardrails.dto.js";
import {
    AiGuardrailCheck,
    AiGuardrailCheckDocument,
} from "./schemas/ai-guardrail-check.schema.js";

export type AiGuardrailDecision = {
    _id: string;
    contextType: AiGuardrailContextType;
    resourceId: string;
    allowed: boolean;
    reasonCode: string;
    reason: string;
    checkedAt?: Date;
};

/**
 * Serviço de guardrails IA por contexto.
 *
 * A regra central é simples: validar contexto no backend antes de qualquer IA.
 * Cada ramo usa o service de domínio que já conhece ownership ou membership.
 */
@Injectable()
export class AiGuardrailsService {
    constructor(
        @InjectModel(AiGuardrailCheck.name)
        private readonly checkModel: Model<AiGuardrailCheckDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Verifica se o pedido IA pode avançar sem misturar contextos.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @param input Payload validado.
     * @returns Decisão persistida e pronta para o frontend.
     */
    async check(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<AiGuardrailDecision> {
        if (actor.role !== "STUDENT") {
            return this.persistDecision(actor, input, false, "STUDENT_ROLE_REQUIRED");
        }

        try {
            if (input.contextType === AiGuardrailContextType.SOLO) {
                await this.studyAreasService.getMyStudyArea(actor.id, input.resourceId);
            }

            if (input.contextType === AiGuardrailContextType.STUDY_ROOM) {
                await this.studyRoomsService.ensureMember(actor.id, input.resourceId);
            }

            if (input.contextType === AiGuardrailContextType.CLASS_SUBJECT) {
                await this.subjectsService.findSubjectForStudent(
                    actor.id,
                    input.resourceId,
                );
            }

            return this.persistDecision(actor, input, true, "CONTEXT_ALLOWED");
        } catch (error) {
            if (error instanceof ForbiddenException) {
                return this.persistDecision(actor, input, false, "CONTEXT_FORBIDDEN");
            }
            return this.persistDecision(actor, input, false, "CONTEXT_NOT_AVAILABLE");
        }
    }

    /**
     * Persiste a decisão sem guardar qualquer excerto do prompt.
     *
     * O prompt pode conter dados pessoais ou material privado; para auditoria
     * técnica bastam o contexto validado, a decisão e a razão estável.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido original validado.
     * @param allowed Resultado do guardrail.
     * @param reasonCode Código estável para UI e testes.
     * @returns Decisão pública.
     */
    private async persistDecision(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
        allowed: boolean,
        reasonCode: string,
    ): Promise<AiGuardrailDecision> {
        const reason = this.reasonFor(reasonCode);
        const check = await this.checkModel.create({
            actorId: actor.id,
            contextType: input.contextType,
            resourceId: input.resourceId,
            allowed,
            reasonCode,
            reason,
        });
        const created = check.toObject() as { createdAt?: Date };
        return {
            _id: String(check._id),
            contextType: check.contextType,
            resourceId: check.resourceId,
            allowed: check.allowed,
            reasonCode: check.reasonCode,
            reason: check.reason,
            checkedAt: created.createdAt,
        };
    }

    /**
     * Traduz códigos técnicos para mensagens PT-PT seguras.
     *
     * @param code Código interno da decisão.
     * @returns Mensagem pública sem revelar dados de outro contexto.
     */
    private reasonFor(code: string): string {
        const reasons: Record<string, string> = {
            CONTEXT_ALLOWED: "O contexto foi validado e a IA pode avançar.",
            CONTEXT_FORBIDDEN:
                "O pedido foi bloqueado porque não tens acesso a este contexto.",
            CONTEXT_NOT_AVAILABLE:
                "O pedido foi bloqueado porque o contexto não está disponível.",
            STUDENT_ROLE_REQUIRED:
                "Este guardrail só valida pedidos IA feitos por alunos.",
        };
        return reasons[code] ?? "O pedido foi bloqueado por regra de segurança.";
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
   Ligar `POST /api/ai/guardrails/check` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.controller.ts
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import { CheckAiGuardrailsDto } from "./dto/check-ai-guardrails.dto.js";

/**
 * Endpoint de validação de guardrails antes de pedidos IA.
 */
@Controller("api/ai/guardrails")
@UseGuards(SessionGuard)
export class AiGuardrailsController {
    constructor(private readonly guardrailsService: AiGuardrailsService) {}

    /**
     * Verifica se o contexto informado é seguro para uso de IA.
     *
     * @param request Pedido autenticado por cookie.
     * @param body Dados validados pelo DTO.
     * @returns Decisão de guardrail persistida.
     */
    @Post("check")
    check(
        @Req() request: AuthenticatedRequest,
        @Body() body: CheckAiGuardrailsDto,
    ) {
        return this.guardrailsService.check(request.user!, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz um pedido sem cookie para `POST /api/ai/guardrails/check` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `AiGuardrailsModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { AiGuardrailsController } from "./ai-guardrails.controller.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import {
    AiGuardrailCheck,
    AiGuardrailCheckSchema,
} from "./schemas/ai-guardrail-check.schema.js";

/**
 * Módulo MF3 para separar guardrails de IA por contexto.
 */
@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        StudyRoomsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: AiGuardrailCheck.name, schema: AiGuardrailCheckSchema },
        ]),
    ],
    controllers: [AiGuardrailsController],
    providers: [AiGuardrailsService],
    exports: [AiGuardrailsService],
})
export class AiGuardrailsModule {}
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
   - CRIAR: `apps/web/src/features/mf3/request-mf3-json.ts`
   - CRIAR: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
   - LOCALIZAÇÃO: `ficheiros completos`
3. Instruções do que fazer.
   Cria primeiro o helper HTTP partilhado da MF3 e depois a função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/mf3/request-mf3-json.ts
/**
 * Executa pedidos JSON dos painéis MF3 mantendo cookies HttpOnly.
 *
 * @param path Caminho relativo da API.
 * @param options Opções fetch.
 * @returns JSON parseado.
 */
export async function requestMf3Json<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    headers.set("x-studyflow-csrf", "1");

    const response = await fetch(path, {
        ...options,
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

```ts
// apps/web/src/features/ai-guardrails/check-ai-guardrails.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AiGuardrailContextType = "SOLO" | "STUDY_ROOM" | "CLASS_SUBJECT";

export type AiGuardrailDecision = {
    _id: string;
    contextType: AiGuardrailContextType;
    resourceId: string;
    allowed: boolean;
    reasonCode: string;
    reason: string;
    checkedAt?: string;
};

/**
 * Valida guardrails IA por contexto.
 *
 * @param input Contexto, recurso e prompt.
 * @returns Decisão do backend.
 */
export function checkAiGuardrails(input: {
    contextType: AiGuardrailContextType;
    resourceId: string;
    prompt: string;
}): Promise<AiGuardrailDecision> {
    return requestMf3Json<AiGuardrailDecision>("/api/ai/guardrails/check", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
```

5. Explicação do código.
   `requestMf3Json` centraliza `credentials: 'include'`, cabeçalho CSRF e parsing de erro sem guardar tokens no `localStorage`. O cliente `checkAiGuardrails` fica pequeno e os BKs seguintes reutilizam o mesmo helper para evitar URLs, headers e tratamento de erro duplicados.
6. Validação do passo.
   Força a API a devolver erro e confirma que o componente recebe uma exceção.
7. Cenário negativo/erro esperado.
   Não uses `localStorage` para tokens de autenticação.

### Passo 7 - Montar a interface mínima

1. Objetivo funcional do passo no contexto da app.
   Dar ao aluno um ecrã simples para testar o endpoint sem ferramentas externas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx
import { FormEvent, useState } from "react";
import {
    AiGuardrailContextType,
    AiGuardrailDecision,
    checkAiGuardrails,
} from "./check-ai-guardrails.js";

/**
 * Painel manual para validar guardrails IA.
 *
 * @returns Formulário e decisão do backend.
 */
export function AiGuardrailsPanel() {
    const [contextType, setContextType] =
        useState<AiGuardrailContextType>("SOLO");
    const [resourceId, setResourceId] = useState("");
    const [prompt, setPrompt] = useState("");
    const [decision, setDecision] = useState<AiGuardrailDecision | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            setDecision(await checkAiGuardrails({ contextType, resourceId, prompt }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao validar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Guardrails IA</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Contexto
                    <select
                        value={contextType}
                        onChange={(event) =>
                            setContextType(event.target.value as AiGuardrailContextType)
                        }
                    >
                        <option value="SOLO">Solo</option>
                        <option value="STUDY_ROOM">Grupo</option>
                        <option value="CLASS_SUBJECT">Disciplina</option>
                    </select>
                </label>
                <label className="block">
                    Recurso
                    <input value={resourceId} onChange={(event) => setResourceId(event.target.value)} />
                </label>
                <label className="block">
                    Pedido
                    <textarea rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || prompt.trim().length < 5}>
                    {loading ? "A validar..." : "Validar"}
                </button>
            </form>
            {decision ? (
                <div className="rounded-md border border-slate-200 p-3 text-sm">
                    <p className={decision.allowed ? "text-emerald-700" : "text-red-700"}>
                        {decision.allowed ? "Permitido" : "Bloqueado"}
                    </p>
                    <p className="text-slate-700">{decision.reason}</p>
                </div>
            ) : null}
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

- Pedido válido para `POST /api/ai/guardrails/check` devolve `201 Created` com a decisão guardada.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `POST /api/ai/guardrails/check` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-02` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X POST http://localhost:3000/api/ai/guardrails/check \
  -H 'Content-Type: application/json' \
  -d '{ "contextType": "SOLO", "resourceId": "area_123", "prompt": "Explica mitose com base na minha área." }'
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
- Referência ao requisito `RF37` e ao próximo BK `BK-MF3-02`.

#### Handoff

- Este BK entrega `AiGuardrailsModule`, `AiGuardrailsService`, `AiGuardrailsController`, `requestMf3Json` e cliente frontend tipado.
- O próximo BK é `BK-MF3-02`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
