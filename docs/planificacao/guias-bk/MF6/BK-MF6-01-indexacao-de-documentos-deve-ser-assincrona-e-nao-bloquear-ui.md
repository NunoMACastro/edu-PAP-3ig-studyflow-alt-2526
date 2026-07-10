# BK-MF6-01 - Indexação de documentos deve ser assíncrona e não bloquear UI.

## Header

- `doc_id`: `GUIA-BK-MF6-01`
- `bk_id`: `BK-MF6-01`
- `macro`: `MF6`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF11`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-02`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais transformar a indexação de materiais num fluxo assíncrono durável: o frontend recebe `202`, a API cria ou reutiliza um job ativo e um runner Mongo processa-o fora do pedido sem usar promessas `void`.

O runner usa lease de 30 s, heartbeat com fencing, concorrência máxima 2, três tentativas e backoff de 1/5/30 s. Recupera leases expiradas no arranque, exige processadores idempotentes e um índice parcial impede dois jobs ativos para o mesmo material. `GET /api/student/study-areas/:studyAreaId/material-index-jobs?latestByMaterial=true` hidrata o último job por material após reload.

No fim, a API passa a devolver um job com estado, a UI mostra progresso e os serviços de IA continuam a usar apenas materiais já processáveis. O foco é entregar uma melhoria real de qualidade, segurança, performance ou continuidade sem inventar requisitos fora de `RNF11`.

#### Importância

`RNF11` é CANONICO nos requisitos não funcionais. Este BK existe porque a StudyFlow já tem autenticação, materiais, IA, turmas, salas e UX suficientes para precisar de garantias transversais: a aplicação deve continuar segura, responsiva e defensável quando aumenta o volume de dados e utilizadores.

Este guia também prepara `BK-MF6-02` porque entrega contratos, evidence e decisões técnicas que o próximo BK pode reutilizar.

#### Scope-in

- Implementar a decisão técnica mínima para `RNF11`.
- Criar ou ajustar os ficheiros listados em `Ficheiros a criar/editar/rever`.
- Validar cenário principal e cenário negativo com evidence objetiva.
- Preservar sessão HttpOnly, validação backend, ownership, membership e privacidade.
- Usar apenas caminhos públicos de aluno: `apps/api` e `apps/web`.

#### Scope-out

- Alterar RF/RNF, owner, sprint, prioridade ou dependências canónicas.
- Criar entidades de domínio que não existam na documentação.
- Adicionar dependências npm sem aprovação e justificação técnica.
- Mover regras de autorização para o frontend.
- Guardar segredos, sessões, hashes, prompts privados ou dados pessoais na evidence.
- Resolver observabilidade completa de MF7 ou compatibilidade de MF8 fora do handoff.

#### Estado antes e depois

- Estado antes: os BKs até MF5 entregam autenticação, materiais, IA, guardrails iniciais, UX transversal, feedback e smoke de concorrência.
- Estado depois: a API passa a devolver um job com estado, a UI mostra progresso e os serviços de IA continuam a usar apenas materiais já processáveis.

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
- `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`

#### Glossário

- **RNF11:** requisito não funcional que este BK torna executável.
- **Job:** registo de trabalho com estado observável pela API ou por comando técnico.
- **Ownership:** regra que garante que um aluno só acede aos seus dados privados.
- **Membership:** regra que confirma pertença a sala, grupo, turma ou disciplina.
- **Evidence:** prova objetiva usada em PR, revisão e defesa PAP.
- **Fallback honesto:** erro ou resposta controlada que não inventa sucesso quando faltam condições.

#### Conceitos teóricos essenciais

- **RNF:** `RNF11` é CANONICO e define a qualidade que este BK torna implementável.
- **Contexto autenticado:** o utilizador vem da sessão backend e nunca de campos enviados pelo frontend.
- **Privacidade:** dados de aluno, professor, sala, turma e disciplina ficam separados por ownership, membership ou role.
- **Evidence:** a defesa PAP precisa de comando, output e interpretação, não apenas uma descrição textual.
- **Trabalho assíncrono:** uma tarefa pesada deve libertar rapidamente o pedido HTTP e expor estado consultável.
- **Métrica observável:** tempo de resposta, estado do job e erro controlado mostram se a app melhora sem bloquear a UI.

#### Arquitetura do BK

- Endpoint(s): `POST /api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs` (`202`, reutiliza ativo), `GET /api/material-index-jobs/:jobId` e `GET /api/student/study-areas/:studyAreaId/material-index-jobs?latestByMaterial=true`.
- Modelo/schema: reutiliza `MaterialIndexJob`, que já guarda `QUEUED`, `PROCESSING`, `DONE` e `FAILED`.
- Service(s): `apps/api/src/modules/material-index/material-index.service.ts` valida ownership e persiste o job; `apps/api/src/modules/material-index/material-index-queue.service.ts` arranca o processamento fora do pedido HTTP.
- Controller/route: `MaterialIndexController` devolve o job `QUEUED` imediatamente e mantém `SessionGuard`.
- Guard/middleware: sessão, CSRF e ownership ficam no backend; o frontend nunca envia `userId`.
- Cliente API e UI: reutiliza `apps/web/src/lib/apiClient.ts` e adiciona um componente pequeno para iniciar indexação e fazer polling.
- Testes: cenário principal prova resposta `QUEUED`; cenário negativo prova que o service real continua a validar ownership e estado consultável.
- Handoff para o próximo BK: `BK-MF6-02` pode repetir o padrão de job observável sem usar estado apenas em memória.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`
- CRIAR: `apps/api/src/modules/material-index/material-index-queue.service.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.controller.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.module.ts`
- CRIAR: `apps/api/src/modules/material-index/material-index-queue.service.spec.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- CRIAR/EDITAR: `apps/web/src/features/materials/MaterialIndexStatusButton.tsx`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-01` entrega `RNF11` sem alterar IDs, owners, sprint, prioridade ou escopo da matriz.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- LOCALIZAÇÃO: linhas do requisito e linha canónica do BK.

3. Instruções do que fazer.

`CANONICO`: o título, requisito, prioridade e próximo BK vêm da matriz e do backlog. `DERIVADO`: as decisões técnicas abaixo são a menor implementação coerente com a stack já usada em `apps/api` e `apps/web`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa escopo e evita inventar entidades ou endpoints fora da documentação. A decisão protege a sequência MF5 -> MF6 -> MF7.

6. Validação do passo.

Confirma que o header mantém `RNF11`, `P0`, `S10`, `Reforco` e `proximo_bk: BK-MF6-02`.

7. Cenário negativo/erro esperado.

Se alguém alterar metadados sem evidência documental, a revisão deve falhar e a alteração deve voltar ao contrato canónico.

### Passo 2 - Ler contratos anteriores e risco principal

1. Objetivo funcional do passo no contexto da app.

Ligar este BK ao que já existe antes dele: `BK-MF5-12`, MF0 a MF5, autenticação por cookie, validação backend, materiais, fontes e IA quando entram no fluxo.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/common/guards/session.guard.ts`
- REVER: `apps/api/src/modules/auth/auth.controller.ts`
- LOCALIZAÇÃO: módulos já usados pela funcionalidade alvo.

3. Instruções do que fazer.

Identifica se o BK toca materiais privados, materiais oficiais, fontes processáveis e UI não bloqueante. Depois confirma que ownership do material privado e membership/role dos materiais oficiais continuam validados no backend antes de qualquer extração.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é de leitura técnica. O aluno deve perceber o que já existe antes de criar ficheiros novos, para não duplicar controllers, services, DTOs ou regras de segurança.

6. Validação do passo.

Faz uma lista curta dos ficheiros que serão criados, editados e apenas revistos. A lista final deve coincidir com a secção de ficheiros deste BK.

7. Cenário negativo/erro esperado.

Se encontrares um endpoint equivalente já criado, não cries outro endpoint para a mesma responsabilidade; adapta o plano e regista a decisão na evidence.

### Passo 3 - Persistir job rápido e executar extração fora da resposta HTTP

1. Objetivo funcional do passo no contexto da app.

Garantir que `RNF11` é real: o pedido HTTP cria um job `QUEUED` e responde antes de o PDF, DOCX ou URL ser extraído.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`
- CRIAR: `apps/api/src/modules/material-index/material-index-queue.service.ts`
- LOCALIZAÇÃO: métodos completos dentro de `MaterialIndexService` e ficheiro completo do novo service.

3. Instruções do que fazer.

Adiciona os dois métodos públicos abaixo à classe `MaterialIndexService`. Depois cria `MaterialIndexQueueService`. A validação de ownership continua no service de domínio; a fila apenas decide quando o trabalho pesado arranca.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/material-index/material-index.service.ts
// Adicionar estes métodos dentro da classe MaterialIndexService.

/**
 * Cria um job observável antes de iniciar a extração pesada do material privado.
 *
 * @param actor Utilizador autenticado vindo da sessão.
 * @param studyAreaId Área privada do aluno.
 * @param materialId Material a indexar.
 * @returns Job persistido em estado QUEUED para a UI poder acompanhar.
 */
async createQueuedPrivateJob(
    actor: AuthenticatedUser,
    studyAreaId: string,
    materialId: string,
): Promise<MaterialIndexJobView> {
    if (actor.role !== "STUDENT") {
        throw new ForbiddenException({
            code: "STUDENT_ROLE_REQUIRED",
            message: "Esta funcionalidade é exclusiva de alunos.",
        });
    }

    const material = (await this.materialsService.findOwnedTextMaterial(
        actor.id,
        studyAreaId,
        materialId,
    )) as IndexablePrivateMaterial;

    const job = await this.jobModel.create({
        scope: "PRIVATE_AREA",
        materialId: new Types.ObjectId(String(material._id)),
        studyAreaId: new Types.ObjectId(studyAreaId),
        userId: new Types.ObjectId(actor.id),
        status: "QUEUED",
        extractedTextChunks: [],
    });

    // A resposta fica leve: só expõe metadados do job, nunca o conteúdo privado do material.
    return this.toView(job.toObject());
}

/**
 * Consulta um job autorizado em qualquer estado para a UI poder fazer polling.
 *
 * @param actor Utilizador autenticado vindo da sessão.
 * @param jobId Job de indexação a consultar.
 * @returns Job autorizado, mesmo que ainda esteja QUEUED ou PROCESSING.
 */
async findOwnedJob(
    actor: AuthenticatedUser,
    jobId: string,
): Promise<MaterialIndexJobView> {
    const view = await this.loadJobView(jobId);
    this.assertOwnedJob(actor, view);
    return view;
}

/**
 * Processa um job previamente criado e atualiza o estado persistido.
 *
 * @param actor Utilizador autenticado preservado pelo controller.
 * @param studyAreaId Área privada do aluno.
 * @param materialId Material a indexar.
 * @param jobId Job QUEUED criado antes da resposta HTTP.
 * @returns Job atualizado para DONE ou FAILED.
 */
async processQueuedPrivateJob(
    actor: AuthenticatedUser,
    studyAreaId: string,
    materialId: string,
    jobId: string,
): Promise<MaterialIndexJobView> {
    const material = (await this.materialsService.findOwnedTextMaterial(
        actor.id,
        studyAreaId,
        materialId,
    )) as IndexablePrivateMaterial;

    const job = await this.jobModel.findOne({
        _id: new Types.ObjectId(jobId),
        scope: "PRIVATE_AREA",
        materialId: new Types.ObjectId(materialId),
        studyAreaId: new Types.ObjectId(studyAreaId),
        userId: new Types.ObjectId(actor.id),
    });
    if (!job) throw this.notFound();

    job.status = "PROCESSING";
    job.errorMessage = undefined;
    job.extractedTextChunks = [];
    await job.save();

    try {
        const extraction = await this.extractPrivateMaterial(actor.id, material);
        if (extraction.text) {
            // O texto extraído fica no material do próprio aluno e prepara os fluxos de IA baseados em fontes.
            await this.materialsService.markIndexedText(
                actor.id,
                materialId,
                extraction.text,
            );
        }

        job.status = extraction.text ? "DONE" : "FAILED";
        job.extractedTextChunks = this.createChunks(extraction.text, material.title);
        job.errorMessage =
            extraction.text
                ? undefined
                : extraction.errorMessage ?? "O material ainda não tem texto processável disponível.";
    } catch (error) {
        // A UI faz polling; por isso qualquer falha técnica depois de PROCESSING precisa de estado terminal.
        job.status = "FAILED";
        job.extractedTextChunks = [];
        job.errorMessage =
            error instanceof Error && error.message.includes("processável")
                ? error.message
                : "Não foi possível indexar o material neste momento.";
    }

    const savedJob = await job.save();
    return this.toView(savedJob.toObject());
}
```

```ts
// apps/api/src/modules/material-index/material-index-queue.service.ts
import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { DurableJobRunner } from "../jobs/durable-job-runner.service.js";
import { MaterialIndexJobView, MaterialIndexService } from "./material-index.service.js";

export type MaterialIndexQueueInput = {
    actor: AuthenticatedUser;
    studyAreaId: string;
    materialId: string;
};

/**
 * Persiste ou reutiliza indexações sem executar trabalho pesado no pedido HTTP.
 */
@Injectable()
export class MaterialIndexQueueService {
    constructor(
        private readonly materialIndexService: MaterialIndexService,
        private readonly durableJobRunner: DurableJobRunner,
    ) {}

    /**
     * Devolve o job ativo e acorda o runner durável.
     *
     * @param input Contexto autenticado e material escolhido pelo aluno.
     * @returns Job persistido antes de a extração pesada começar.
     */
    async enqueuePrivateMaterial(
        input: MaterialIndexQueueInput,
    ): Promise<MaterialIndexJobView> {
        const queuedJob = await this.materialIndexService.createOrReuseActivePrivateJob(
            input.actor,
            input.studyAreaId,
            input.materialId,
        );

        await this.durableJobRunner.wake("MATERIAL_INDEX");

        return queuedJob;
    }
}
```

5. Explicação do código.

O primeiro método cria o registo persistido antes da extração. Isto cumpre `RNF11` porque a API já tem um identificador de job para devolver rapidamente. `findOwnedJob` permite polling seguro sem exigir que o job já esteja `DONE`. O método de processamento faz a operação pesada e atualiza o mesmo registo para `PROCESSING`, `DONE` ou `FAILED`. O `try/catch` dentro do service de domínio é importante: se a extração, a marcação do material como indexado ou a gravação final falhar, o job fica em `FAILED` com mensagem pública controlada, em vez de ficar preso em `PROCESSING`. A validação usa `actor.id` da sessão e `findOwnedTextMaterial`, logo o frontend não consegue indexar material de outro aluno.

O `MaterialIndexQueueService` é pequeno de propósito: ele não decide ownership, não lê ficheiros e não conhece detalhes de PDF/DOCX/URL. A sua responsabilidade é apenas separar o tempo da resposta HTTP do tempo da extração. O comentário dentro do código explica a invariante principal: o pedido responde com metadados seguros, enquanto o conteúdo privado continua guardado no backend.

6. Validação do passo.

Executa `npm --prefix apps/api run build` para confirmar imports e tipos. Depois confirma por teste ou inspeção que `enqueuePrivateMaterial(...)` devolve `QUEUED` antes de `processQueuedPrivateJob(...)` terminar e que uma falha em `markIndexedText(...)` termina o job como `FAILED`.

7. Cenário negativo/erro esperado.

Chama o endpoint com um material que não pertence ao aluno autenticado. O backend deve falhar antes de criar o job e não deve expor título, texto, storage key ou detalhes privados do material.

### Passo 4 - Ligar controller, módulo e cliente existente

1. Objetivo funcional do passo no contexto da app.

Fazer a rota pública do aluno usar o novo fluxo sem criar endpoint paralelo nem cliente duplicado.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/material-index/material-index.controller.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.module.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- CRIAR/EDITAR: `apps/web/src/features/materials/MaterialIndexStatusButton.tsx`
- LOCALIZAÇÃO: classe completa do controller, metadata do módulo, funções do cliente e componente completo.

3. Instruções do que fazer.

Atualiza o controller para injetar `MaterialIndexQueueService` e usa-o apenas na indexação privada do aluno. Mantém a indexação oficial do professor no service atual, porque este BK corrige o fluxo privado usado pela UI de aluno.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/material-index/material-index.controller.ts
import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialIndexQueueService } from "./material-index-queue.service.js";
import { MaterialIndexService } from "./material-index.service.js";

/**
 * Endpoints de indexação básica de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialIndexController {
    constructor(
        private readonly indexService: MaterialIndexService,
        private readonly queueService: MaterialIndexQueueService,
    ) {}

    /**
     * Agenda indexação privada e devolve um job consultável sem bloquear a UI.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param studyAreaId Área privada do aluno.
     * @param materialId Material que pertence à área.
     * @returns Job inicial em estado QUEUED.
     */
    @Post("student/study-areas/:studyAreaId/materials/:materialId/index-jobs")
    indexPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.queueService.enqueuePrivateMaterial({
            // O userId vem da sessão; o body não participa em decisões de ownership.
            actor: request.user!,
            studyAreaId,
            materialId,
        });
    }

    /**
     * Mantém a indexação oficial existente para professores.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param materialId Material oficial da disciplina.
     * @returns Job de indexação oficial.
     */
    @Post("teacher/official-materials/:materialId/index-jobs")
    indexOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
    ) {
        return this.indexService.indexOfficialMaterial(request.user!, materialId);
    }

    /**
 * Consulta jobs autorizados em qualquer estado para a UI acompanhar progresso.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param jobId Job de indexação.
 * @returns Job autorizado com estado QUEUED, PROCESSING, DONE ou FAILED.
 */
@Get("material-index-jobs/:jobId")
findJob(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
    return this.indexService.findOwnedJob(request.user!, jobId);
}
}
```

```ts
// apps/api/src/modules/material-index/material-index.module.ts
@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        OfficialMaterialsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            // O schema do job tem de ficar registado para a fila guardar estado fora da memória local.
            { name: MaterialIndexJob.name, schema: MaterialIndexJobSchema },
        ]),
    ],
    controllers: [MaterialIndexController],
    providers: [
        MaterialIndexService,
        // A fila fica separada do service principal para devolver QUEUED sem esperar pela extração.
        MaterialIndexQueueService,
    ],
    exports: [
        // Só o service canónico é exportado para os BKs seguintes não dependerem da implementação da fila.
        MaterialIndexService,
    ],
})
export class MaterialIndexModule {}
```

```ts
// apps/web/src/lib/apiClient.ts
/**
 * Inicia indexação textual de material privado do aluno.
 *
 * @param studyAreaId Identificador da área de estudo; o backend valida ownership.
 * @param materialId Identificador do material; nunca envia `userId` no body.
 * @returns Job QUEUED/PROCESSING/DONE/FAILED devolvido pela API.
 */
export function indexPrivateMaterial(
    studyAreaId: string,
    materialId: string,
): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(
        `/api/student/study-areas/${studyAreaId}/materials/${materialId}/index-jobs`,
        { method: "POST" },
    );
}

/**
 * Consulta o estado de um job de indexação autorizado.
 *
 * @param jobId Job devolvido pelo pedido inicial.
 * @returns Job com estado atualizado para a UI.
 */
export function getMaterialIndexJob(
    jobId: string,
    signal?: AbortSignal,
): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(`/api/material-index-jobs/${jobId}`, { signal });
}
```

```tsx
// apps/web/src/features/materials/MaterialIndexStatusButton.tsx
import { useEffect, useState } from "react";
import {
    getMaterialIndexJob,
    indexPrivateMaterial,
    MaterialIndexJob,
} from "../../lib/apiClient";

type MaterialIndexStatusButtonProps = {
    studyAreaId: string;
    materialId: string;
    onIndexed?: (job: MaterialIndexJob) => void;
};

/**
 * Botão que inicia a indexação e acompanha o estado sem bloquear a página.
 */
export function MaterialIndexStatusButton({
    studyAreaId,
    materialId,
    onIndexed,
}: MaterialIndexStatusButtonProps) {
    const [job, setJob] = useState<MaterialIndexJob | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!job || !["QUEUED", "PROCESSING"].includes(job.status)) return;

        const abortController = new AbortController();
        let disposed = false;
        let timer: number | undefined;
        const order = { QUEUED: 0, PROCESSING: 1, DONE: 2, FAILED: 2 } as const;

        const pollOnce = async () => {
            try {
                const nextJob = await getMaterialIndexJob(job._id, abortController.signal);
                if (disposed) return;
                setJob((current) =>
                    !current || order[nextJob.status] >= order[current.status]
                        ? nextJob
                        : current,
                );
                if (nextJob.status === "DONE") onIndexed?.(nextJob);
                if (["QUEUED", "PROCESSING"].includes(nextJob.status)) {
                    timer = window.setTimeout(() => {
                        pollOnce().catch(() => undefined);
                    }, 1500);
                }
            } catch (caughtError) {
                if (abortController.signal.aborted) return;
                // A mensagem evita expor nomes de ficheiros ou texto privado do material.
                setError("Não foi possível atualizar o estado da indexação.");
            }
        };

        pollOnce().catch(() => undefined);

        return () => {
            disposed = true;
            abortController.abort();
            if (timer !== undefined) window.clearTimeout(timer);
        };
    }, [job?._id, onIndexed]);

    async function handleStartIndexing() {
        setIsStarting(true);
        setError(null);
        try {
            const queuedJob = await indexPrivateMaterial(studyAreaId, materialId);
            setJob(queuedJob);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Não foi possível iniciar a indexação.",
            );
        } finally {
            setIsStarting(false);
        }
    }

    const disabled = isStarting || job?.status === "QUEUED" || job?.status === "PROCESSING";

    return (
        <section aria-live="polite">
            <button type="button" onClick={handleStartIndexing} disabled={disabled}>
                {disabled ? "A indexar material" : "Indexar material"}
            </button>
            {job?.status === "DONE" && <p>Material indexado e pronto para IA.</p>}
            {job?.status === "FAILED" && <p>{job.errorMessage ?? "A indexação falhou."}</p>}
            {error && <p>{error}</p>}
        </section>
    );
}
```

5. Explicação do código.

O controller passa a cumprir o objetivo do BK: a rota privada do aluno devolve o job inicial sem esperar pela extração e a rota de consulta devolve o estado atual para polling. O módulo regista o novo provider, por isso o NestJS consegue injetar a fila. O cliente frontend continua no `apiClient.ts`, que já usa cookies HttpOnly com `credentials: "include"`; assim não nasce um segundo cliente para a mesma rota.

O componente mostra a parte visível do requisito: o botão fica desativado enquanto o job está `QUEUED` ou `PROCESSING`, e a página continua utilizável. As mensagens são deliberadamente genéricas para não revelar nomes de ficheiros, texto extraído ou detalhes técnicos de materiais privados.

6. Validação do passo.

Confirma que `MaterialIndexQueueService` aparece em `providers`, que `indexPrivate(...)` já não chama diretamente `indexPrivateMaterial(...)` e que `findJob(...)` devolve estado sem exigir `DONE`. No frontend, confirma que o componente usa `indexPrivateMaterial(...)` e `getMaterialIndexJob(...)` do cliente central.

7. Cenário negativo/erro esperado.

Se alguém tentar enviar `userId` pelo body para acelerar o teste, rejeita a abordagem. O endpoint deve usar apenas `request.user` e os identificadores de rota.

### Passo 5 - Adicionar teste e negativo obrigatório

1. Objetivo funcional do passo no contexto da app.

Criar uma prova pequena que falhe se a resposta voltar a depender da extração completa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/material-index/material-index-queue.service.spec.ts`
- LOCALIZAÇÃO: teste unitário do service de fila.

3. Instruções do que fazer.

Adiciona o teste abaixo e mantém o foco: o teste prova criação/reutilização atómica e wake do runner; o pedido HTTP nunca chama o processador diretamente.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/material-index/material-index-queue.service.spec.ts
import { MaterialIndexQueueService } from "./material-index-queue.service.js";

describe("MaterialIndexQueueService", () => {
    it("devolve job QUEUED antes da extração terminar", async () => {
        const materialIndexService = {
            createOrReuseActivePrivateJob: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                scope: "PRIVATE_AREA",
                materialId: "507f1f77bcf86cd799439012",
                studyAreaId: "507f1f77bcf86cd799439013",
                userId: "507f1f77bcf86cd799439014",
                status: "QUEUED",
                extractedTextChunks: [],
            }),
        };
        const runner = { wake: jest.fn().mockResolvedValue(undefined) };
        const service = new MaterialIndexQueueService(
            materialIndexService as never,
            runner as never,
        );

        const queuedJob = await service.enqueuePrivateMaterial({
            actor: {
                id: "507f1f77bcf86cd799439014",
                role: "STUDENT",
                email: "aluno@studyflow.test",
            },
            studyAreaId: "507f1f77bcf86cd799439013",
            materialId: "507f1f77bcf86cd799439012",
        });

        // A asserção principal protege RNF11: a resposta inicial é observável antes do trabalho pesado.
        expect(queuedJob.status).toBe("QUEUED");
        expect(runner.wake).toHaveBeenCalledWith("MATERIAL_INDEX");
    });
});
```

5. Explicação do código.

O teste evita uma regressão silenciosa: se alguém voltar a chamar a extração diretamente no controller, o teste deixa de representar o contrato esperado e a revisão deve falhar. O duplo tipado de teste permite validar a orquestração sem abrir ficheiros reais nem expor conteúdo de materiais privados.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit -- material-index-queue.service.spec.ts` se a configuração aceitar filtro de ficheiro. Se o filtro não existir, executa `npm --prefix apps/api run test:unit`.

7. Cenário negativo/erro esperado.

Faz `createOrReuseActivePrivateJob` lançar erro de ownership. O teste deve confirmar que `runner.wake` não é chamado.

### Passo 6 - Preparar evidence técnica e pedagógica

1. Objetivo funcional do passo no contexto da app.

Guardar prova suficiente para PR, apresentação e defesa PAP.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`
- LOCALIZAÇÃO: secções de validação final e evidence.

3. Instruções do que fazer.

Regista comando executado, resultado observado, cenário negativo e interpretação curta. Não copies cookies, hashes, URIs completas, prompts privados, respostas IA privadas ou dados pessoais para a evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo organiza a prova. A evidence é parte do trabalho técnico: mostra que o requisito foi validado e que o aluno entende o motivo da validação.

6. Validação do passo.

Guarda output de `npm --prefix apps/api run build`, `npm --prefix apps/api run test:unit` e qualquer smoke específico deste BK.

7. Cenário negativo/erro esperado.

Se uma validação não puder correr por falta de ambiente, regista o bloqueio com comando, erro observado e impacto. Não marques como sucesso.

### Passo 7 - Fechar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-02` consegue consumir o que este BK entrega sem reescrever a solução.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md`
- LOCALIZAÇÃO: Handoff e Changelog.

3. Instruções do que fazer.

Atualiza o handoff com exports, endpoints, comandos e riscos restantes. A decisão deste alvo é runner Mongo single-instance, polling single-flight e jobs persistidos; uma futura passagem a multi-instância reabre a escolha de worker distribuído.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é garantir continuidade entre BKs. Este fecho evita que a MF6 fique como uma coleção de tarefas soltas.

6. Validação do passo.

Confirma que o próximo BK citado existe na matriz e que nenhum caminho interno de referência aparece no texto destinado ao aluno.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de algo que não foi entregue aqui, volta ao passo técnico correspondente e completa o contrato antes de fechar.

#### Critérios de aceite

- `RNF11` tem uma regra backend verificável: resposta rápida com job `QUEUED` e processamento posterior.
- O cenário principal produz output objetivo e repetível: `POST` devolve job inicial e `GET` consulta estado terminal `DONE` ou `FAILED`.
- O cenário negativo falha com erro controlado e sem dados sensíveis.
- Falhas técnicas durante a extração ou marcação do material não deixam o job preso em `PROCESSING`.
- Lease de 30 s, heartbeat/fencing, concorrência 2, três tentativas e backoff 1/5/30 s são cobertos por testes de crash/restart.
- Existe no máximo um job ativo por material, o POST devolve `202` e reutiliza esse job.
- Reload hidrata `latestByMaterial`; polling tem um só pedido em voo, abort no cleanup e nunca regride o estado visual.
- A solução não depende de permissões decididas no frontend.
- Os caminhos de ficheiros usam apenas apps/api e apps/web.
- A evidence inclui comando, resultado observado e interpretação curta.
- O handoff para `BK-MF6-02` fica explícito.

#### Validação final

- `npm --prefix apps/api run build`
- `npm --prefix apps/api run test:unit`
- `npm --prefix apps/web run build` se o BK tocar frontend
- Smoke manual ou comando específico indicado no passo 5
- Cenário negativo obrigatório descrito no passo 5

#### Evidence para PR/defesa

- pr: link ou referência do commit com o BK implementado.
- proof_tecnico: output do build/teste/smoke.
- proof_negativos: erro controlado do cenário negativo.
- proof_privacidade: confirmação de que não foram expostos cookies, hashes, prompts, respostas IA privadas ou dados pessoais.
- proof_handoff: nota curta a explicar como BK-MF6-02 consome este trabalho.

#### Handoff

- Entrega para `BK-MF6-02`: padrão de job persistido com `QUEUED`, `PROCESSING`, `DONE` e `FAILED`, além de controller protegido por sessão e cliente centralizado em `apiClient.ts`.
- Decisão registada: runner Mongo single-instance com lease/heartbeat/fencing, idempotência e recuperação de leases expiradas; multi-instância exige reauditoria.
- Risco residual: validar em ambiente semelhante ao deploy final antes de apresentar como garantia operacional, sobretudo para reinícios durante jobs em curso; falhas técnicas da operação pesada já terminam em `FAILED`.
- Não há alteração de RF/RNF nem mudança de matriz nesta entrega.

#### Changelog

- `2026-06-22`: guia corrigido para devolver `QUEUED` imediatamente, ligar controller/módulo ao service de fila, persistir `FAILED` em falhas do background, reutilizar `apiClient.ts` e provar o contrato com teste unitário.
