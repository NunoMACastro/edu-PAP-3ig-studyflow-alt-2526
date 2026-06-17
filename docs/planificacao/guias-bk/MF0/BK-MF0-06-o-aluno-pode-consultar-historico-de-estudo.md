# BK-MF0-06 - O aluno pode consultar histórico de estudo.

## Header

- `doc_id`: `GUIA-BK-MF0-06`
- `bk_id`: `BK-MF0-06`
- `macro`: `MF0`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF06`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF0-07`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md`
- `last_updated`: `2026-06-01`

## O que vamos fazer neste BK

Neste BK vamos criar o histórico de estudo individual do aluno. O histórico deve permitir consultar eventos relevantes, como criação de rotina, conclusão de objetivo, upload de material ou geração de resumo, à medida que esses eventos forem surgindo nos BKs seguintes.

Nesta fase, o histórico pode começar com eventos simples e controlados, sem inventar métricas avançadas. O objetivo é criar o contrato técnico reutilizável: qualquer módulo futuro pode registar um evento de estudo associado ao aluno autenticado.

Como não há código nem mockup específico, este guia define uma estrutura simples com filtros básicos, lista cronológica e estado vazio. O design final pode evoluir sem alterar o contrato base.

## Porque é que isto é importante

- Dá continuidade ao estudo individual.
- Prepara evidência para progresso e métricas futuras.
- Cria um padrão de eventos reutilizável por materiais e IA.
- Ajuda o aluno a perceber o que já fez.
- Mantém isolamento de dados por aluno.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado e perfil disponível; rotinas podem ou não existir.
- Estado esperado depois do BK: aluno vê lista cronológica dos seus eventos de estudo.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/study/schemas/study-event.schema.ts`
    - `apps/api/src/modules/study/history.controller.ts`
    - `apps/api/src/modules/study/history.service.ts`
    - `apps/api/src/modules/study/dto/study-event.dto.ts`
    - `apps/web/src/pages/student/StudyHistoryPage.tsx`
    - `apps/web/src/components/study/StudyHistoryList.tsx`
- Ficheiros a rever: BK-MF0-03, BK-MF0-04, BK-MF0-05.
- Dependências de BK anteriores: perfil do BK-MF0-03; rotinas do BK-MF0-05 se já existirem.
- Impacto na arquitetura: cria padrão `StudyEvent`.
- Impacto em frontend: cria lista com filtros simples.
- Impacto em backend: cria endpoint derivado `GET /api/study/history`.
- Impacto em dados: eventos ligados a `userId` e opcionalmente a `studyAreaId`.
- Impacto em segurança: aluno só consulta o próprio histórico.
- Impacto em testes: validar ordenação e ownership.
- Handoff: BK-MF0-07 e BK-MF0-08 devem registar eventos.

## O que não entra (scope-out)

- Estatísticas avançadas ou gráficos complexos.
- Histórico de turma, grupo ou professor.
- Exportação de dados pessoais, que pertence a fase de RGPD.
- Algoritmos de recomendação.
- Auditoria administrativa completa.

## Como saber que isto ficou bem

- Aluno autenticado vê histórico ordenado do mais recente para o mais antigo.
- Aluno sem eventos vê empty state.
- Evento de rotina/objetivo aparece quando existir integração.
- Pedido sem sessão devolve `401`.
- Tentativa de consultar eventos de outro aluno falha.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `S` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Kaua` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: perfil autenticado e domínio `study` disponível (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Core` (CANONICO)
- Flow ID: `FLOW-MF0-STUDY-HISTORY`
- Fonte de verdade: `docs/RF.md`, `RF06` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-06` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Histórico cronológico de estudo individual (CANONICO)
- `rf_rnf`: `RF06` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `StudyEvent`.
- Criar service para registar e listar eventos.
- Criar endpoint protegido de histórico.
- Criar UI com lista e empty state.
- Ordenar eventos por data descendente.
- Preparar tipos de eventos para rotinas, materiais e IA.
- Garantir que só o dono vê os eventos.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF06, RF05, RF08, RF11.
- `docs/RNF.md`: RNF03, RNF20, RNF23, RNF42, RNF43.
- BK-MF0-03: perfil.
- BK-MF0-05: rotinas e objetivos.
- `PLANO-SPRINTS.md`: testes P1.

## Glossário (rápido) (DERIVADO):

- **Histórico**: lista de ações passadas do aluno.
- **Evento**: registo individual de uma ação.
- **Timeline**: lista ordenada cronologicamente.
- **Filtro**: forma de limitar resultados, por tipo ou data.
- **Paginação**: dividir resultados em páginas para não carregar tudo.
- **Owner**: dono do evento, neste caso o aluno.
- **Auditoria**: registo técnico de ações sensíveis, mais amplo que este histórico.

## Conceitos teóricos essenciais (DERIVADO):

**Event log funcional.** O histórico pode ser modelado como eventos. Cada evento tem tipo, data, descrição e dono. Isto é mais flexível do que criar uma coleção diferente para cada tipo de atividade.

**Histórico vs auditoria.** Este histórico é para o aluno consultar a sua atividade. Auditoria administrativa completa é outro requisito e deve ter regras mais rigorosas, logs e permissões próprias.

**Paginação.** Mesmo que no MVP haja poucos eventos, a API deve preparar `limit` e `cursor` ou `page`, para evitar carregar milhares de registos no futuro.

**Privacidade.** Eventos de estudo podem revelar hábitos e dificuldades. Por isso, o backend filtra sempre por `userId` da sessão.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-02 com `SessionGuard`.
- BK-MF0-05 pode existir, mas o histórico deve funcionar vazio.
- Eventos de materiais e IA serão adicionados pelos BKs seguintes.

### Passo 1 - Criar tipos de evento

1. Explicação simples do objetivo.

    Neste passo vais criar tipos de evento. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/dto/study-event.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export const STUDY_EVENT_TYPES = [
    "ROUTINE_CREATED",
    "ROUTINE_ARCHIVED",
    "GOAL_CREATED",
    "STUDY_AREA_CREATED",
    "MATERIAL_SUBMITTED",
    "AI_PROFILE_CREATED",
    "SUMMARY_GENERATED",
    "STUDY_TOOL_GENERATED",
] as const;

export type StudyEventType = (typeof STUDY_EVENT_TYPES)[number];

export type RecordStudyEventDto = {
    type: StudyEventType;
    title: string;
    metadata?: Record<string, unknown>;
};
```

5. Explicação do código.

A lista evita tipos inventados em cada service. Novos tipos devem ser adicionados aqui quando um BK precisar.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar schema

1. Explicação simples do objetivo.

    Neste passo vais criar schema. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/schemas/study-event.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { STUDY_EVENT_TYPES, StudyEventType } from "../dto/study-event.dto";

export type StudyEventDocument = HydratedDocument<StudyEvent>;

@Schema({ timestamps: true, collection: "study_events" })
export class StudyEvent {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: STUDY_EVENT_TYPES })
    type!: StudyEventType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    metadata?: Record<string, unknown>;
}

export const StudyEventSchema = SchemaFactory.createForClass(StudyEvent);
StudyEventSchema.index({ userId: 1, createdAt: -1 });
```

5. Explicação do código.

O índice `{ userId, createdAt }` torna eficiente listar eventos recentes do próprio aluno.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/history.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RecordStudyEventDto, STUDY_EVENT_TYPES } from "./dto/study-event.dto";
import { StudyEvent, StudyEventDocument } from "./schemas/study-event.schema";

@Injectable()
export class HistoryService {
    constructor(
        @InjectModel(StudyEvent.name)
        private readonly eventModel: Model<StudyEventDocument>,
    ) {}

    async listMyHistory(userId: string, limit = 30) {
        const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
        return this.eventModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(safeLimit)
            .lean();
    }

    async recordStudyEvent(userId: string, event: RecordStudyEventDto) {
        if (!STUDY_EVENT_TYPES.includes(event.type)) {
            throw new BadRequestException({
                code: "INVALID_EVENT_TYPE",
                message: "Tipo de evento inválido.",
            });
        }
        if (!event.title?.trim()) {
            throw new BadRequestException({
                code: "EVENT_TITLE_REQUIRED",
                message: "O evento precisa de título.",
            });
        }

        return this.eventModel.create({
            userId: new Types.ObjectId(userId),
            type: event.type,
            title: event.title.trim(),
            metadata: event.metadata ?? {},
        });
    }
}
```

5. Explicação do código.

O service aceita apenas tipos controlados e nunca recebe `targetUserId` do cliente.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/history.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { HistoryService } from "./history.service";

@Controller("api/study/history")
@UseGuards(SessionGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @Get()
    listHistory(
        @Req() request: AuthenticatedRequest,
        @Query("limit") limit?: string,
    ) {
        return this.historyService.listMyHistory(
            request.user!.id,
            Number(limit),
        );
    }
}
```

5. Explicação do código.

Mesmo que o cliente envie `userId` na query, o controller ignora-o. Só a sessão decide o dono dos eventos.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Editar cliente API e criar UI

1. Explicação simples do objetivo.

    Neste passo vais editar cliente API e criar UI. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type StudyEvent = {
    _id: string;
    type: string;
    title: string;
    createdAt: string;
};

export async function listStudyHistory(): Promise<StudyEvent[]> {
    const response = await fetch("/api/study/history?limit=30", {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Não foi possível carregar o histórico.");
    return (await response.json()) as StudyEvent[];
}
```

- CRIAR: `apps/web/src/components/study/StudyHistoryList.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { StudyEvent } from "../../lib/apiClient";

export function StudyHistoryList({ events }: { events: StudyEvent[] }) {
    if (events.length === 0) {
        return (
            <p className="rounded border bg-white p-4">
                Ainda não existem eventos de estudo.
            </p>
        );
    }

    return (
        <ol className="space-y-3">
            {events.map((event) => (
                <li className="rounded border bg-white p-4" key={event._id}>
                    <strong>{event.title}</strong>
                    <p className="text-sm text-slate-600">{event.type}</p>
                    <time
                        className="text-sm text-slate-500"
                        dateTime={event.createdAt}
                    >
                        {new Intl.DateTimeFormat("pt-PT").format(
                            new Date(event.createdAt),
                        )}
                    </time>
                </li>
            ))}
        </ol>
    );
}
```

- CRIAR: `apps/web/src/pages/student/StudyHistoryPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { useEffect, useState } from "react";
import { StudyHistoryList } from "../../components/study/StudyHistoryList";
import { listStudyHistory, StudyEvent } from "../../lib/apiClient";

export function StudyHistoryPage() {
    const [events, setEvents] = useState<StudyEvent[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listStudyHistory()
            .then(setEvents)
            .catch((err) => setError(err.message));
    }, []);

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-semibold">Histórico de estudo</h1>
            {error ? (
                <p className="mt-4 rounded bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            ) : (
                <StudyHistoryList events={events} />
            )}
        </main>
    );
}
```

5. Explicação do código.

A UI usa datas em `pt-PT` e mostra empty state em vez de tratar ausência de eventos como erro.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schema Mongoose `StudyEvent`.
    - Endpoint `GET /api/study/history`.
    - Página de histórico.
- Verificações:
    - Lista vazia responde `200`.
    - Eventos aparecem ordenados.
- Qualidade:
    - Tipos de evento são derivados dos BKs existentes.
    - Service reutilizável para BKs futuros.
- Continuidade:
    - BK-MF0-07, BK-MF0-08, BK-MF0-11 e BK-MF0-12 podem registar eventos.
- Evidência:
    - PR inclui histórico vazio, histórico com eventos e 2 negativos.

## Validação final

### Requests e responses esperados

- `GET /api/study/history?limit=30 -> 200 []` para aluno sem eventos.
- `GET /api/study/history -> 200` com eventos ordenados por `createdAt desc`.
- `401 UNAUTHENTICATED` sem sessão.
- Query `userId=outro` deve ser ignorada.

### Como validar o BK e cenários negativos

- Histórico vazio: esperado `200 []`.
- Dois eventos criados: esperado ordem descendente.
- Pedido sem cookie: esperado `401`.
- Tentar filtrar por outro `userId`: esperado ignorar e manter eventos do aluno autenticado.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_PROVIDER_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, provider IA não configurado e JSON IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Screenshot do histórico vazio.
- Output de histórico com eventos.
- Output sem sessão `401`.
- Nota: histórico funcional não substitui auditoria administrativa.

## Handoff para BK-MF0-07 e BK-MF0-08

- BK-MF0-07 deve chamar `recordStudyEvent(userId, { type: 'STUDY_AREA_CREATED', ... })`.
- BK-MF0-08 deve chamar `MATERIAL_SUBMITTED`.

## Changelog

- `2026-05-24`: guia refinado para histórico individual com eventos, privacidade e continuidade com materiais/IA.
- `2026-05-25`: histórico atualizado para coleção MongoDB e schema Mongoose.
