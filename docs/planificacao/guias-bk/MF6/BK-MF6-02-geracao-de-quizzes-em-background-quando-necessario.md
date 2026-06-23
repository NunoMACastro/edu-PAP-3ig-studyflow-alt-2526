# BK-MF6-02 - Geração de quizzes em background quando necessário.

## Header

- `doc_id`: `GUIA-BK-MF6-02`
- `bk_id`: `BK-MF6-02`
- `macro`: `MF6`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF12`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-03`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais separar a criação de quizzes mais pesados do pedido imediato do aluno, devolvendo um job e mostrando estados de progresso.

No fim, a IA gera quizzes sem prender a interface e bloqueia o fluxo quando não existem fontes processáveis suficientes. O foco é entregar uma melhoria real de qualidade, segurança, performance ou continuidade sem inventar requisitos fora de `RNF12`.

#### Importância

`RNF12` é CANONICO nos requisitos não funcionais. Este BK existe porque a StudyFlow já tem autenticação, materiais, IA, turmas, salas e UX suficientes para precisar de garantias transversais: a aplicação deve continuar segura, responsiva e defensável quando aumenta o volume de dados e utilizadores.

Este guia também prepara `BK-MF6-03` porque entrega contratos, evidence e decisões técnicas que o próximo BK pode reutilizar.

#### Scope-in

- Implementar a decisão técnica mínima para `RNF12`.
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
- Estado depois: a IA gera quizzes sem prender a interface e bloqueia o fluxo quando não existem fontes processáveis suficientes.

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md`

#### Glossário

- **RNF12:** requisito não funcional que este BK torna executável.
- **Job:** registo de trabalho com estado observável pela API ou por comando técnico.
- **Ownership:** regra que garante que um aluno só acede aos seus dados privados.
- **Membership:** regra que confirma pertença a sala, grupo, turma ou disciplina.
- **Evidence:** prova objetiva usada em PR, revisão e defesa PAP.
- **Fallback honesto:** erro ou resposta controlada que não inventa sucesso quando faltam condições.

#### Conceitos teóricos essenciais

- **RNF:** `RNF12` é CANONICO e define a qualidade que este BK torna implementável.
- **Contexto autenticado:** o utilizador vem da sessão backend e nunca de campos enviados pelo frontend.
- **Privacidade:** dados de aluno, professor, sala, turma e disciplina ficam separados por ownership, membership ou role.
- **Evidence:** a defesa PAP precisa de comando, output e interpretação, não apenas uma descrição textual.
- **Trabalho assíncrono:** uma tarefa pesada deve libertar rapidamente o pedido HTTP e expor estado consultável.
- **Métrica observável:** tempo de resposta, estado do job e erro controlado mostram se a app melhora sem bloquear a UI.

#### Arquitetura do BK

- Endpoint(s): `POST /api/study-areas/:id/study-tools/quiz-jobs`, `GET /api/study-areas/:id/study-tools/quiz-jobs/:jobId`.
- Modelo/schema: `QuizGenerationJob` guarda estado do job e referência ao artefacto `QUIZ` final.
- Service(s): `apps/api/src/modules/ai/study-tools.service.ts` valida ownership/fontes antes do job e `apps/api/src/modules/ai/quiz-generation-jobs.service.ts` cria o job, chama `StudyToolsService.generateStudyTool(... type: "QUIZ")` em background e persiste `DONE` ou `FAILED`.
- Controller/route: estende o controller real `StudyToolsController`, preservando o prefixo existente `api/study-areas/:id/study-tools`.
- Guard/middleware: sessão, ownership da área e bloqueio sem fontes continuam no backend através de `StudyToolsService`.
- Cliente API: usa `apps/web/src/lib/apiClient.ts`, que já centraliza `credentials: "include"`.
- Testes: cenário principal prova job `QUEUED`; cenário negativo prova ausência de fontes processáveis e ausência de `userId` vindo do frontend.
- Handoff para o próximo BK: `BK-MF6-03` recebe um padrão de job persistido, adequado a escala horizontal futura.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai/dto/create-quiz-job.dto.ts`
- CRIAR: `apps/api/src/modules/ai/schemas/quiz-generation-job.schema.ts`
- EDITAR: `apps/api/src/modules/ai/study-tools.service.ts`
- CRIAR: `apps/api/src/modules/ai/quiz-generation-jobs.service.ts`
- EDITAR: `apps/api/src/modules/ai/study-tools.controller.ts`
- EDITAR: `apps/api/src/modules/ai/ai.module.ts`
- CRIAR: `apps/api/src/modules/ai/quiz-generation-jobs.service.spec.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- CRIAR/EDITAR: `apps/web/src/features/ai/QuizGenerationPanel.tsx`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-02` entrega `RNF12` sem alterar IDs, owners, sprint, prioridade ou escopo da matriz.

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

Confirma que o header mantém `RNF12`, `P1`, `S11`, `Core` e `proximo_bk: BK-MF6-03`.

7. Cenário negativo/erro esperado.

Se alguém alterar metadados sem evidência documental, a revisão deve falhar e a alteração deve voltar ao contrato canónico.

### Passo 2 - Ler contratos anteriores e risco principal

1. Objetivo funcional do passo no contexto da app.

Ligar este BK ao que já existe antes dele: `BK-MF6-01`, MF0 a MF5, autenticação por cookie, validação backend, materiais, fontes e IA quando entram no fluxo.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/common/guards/session.guard.ts`
- REVER: `apps/api/src/modules/auth/auth.controller.ts`
- LOCALIZAÇÃO: módulos já usados pela funcionalidade alvo.

3. Instruções do que fazer.

Identifica se o BK toca quizzes personalizados, fontes processáveis, IA privada e feedback de progresso. Depois confirma que o job usa o aluno autenticado e as fontes do seu contexto; não aceita userId vindo do frontend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é de leitura técnica. O aluno deve perceber o que já existe antes de criar ficheiros novos, para não duplicar controllers, services, DTOs ou regras de segurança.

6. Validação do passo.

Faz uma lista curta dos ficheiros que serão criados, editados e apenas revistos. A lista final deve coincidir com a secção de ficheiros deste BK.

7. Cenário negativo/erro esperado.

Se encontrares um endpoint equivalente já criado, não cries outro endpoint para a mesma responsabilidade; adapta o plano e regista a decisão na evidence.

### Passo 3 - Criar DTO, schema e service de jobs de quiz

1. Objetivo funcional do passo no contexto da app.

Implementar `RNF12` com estado persistido e geração real de quiz através do `StudyToolsService`, sem aceitar fontes escolhidas pelo frontend como prova de ownership.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/ai/dto/create-quiz-job.dto.ts`
- CRIAR: `apps/api/src/modules/ai/schemas/quiz-generation-job.schema.ts`
- EDITAR: `apps/api/src/modules/ai/study-tools.service.ts`
- CRIAR: `apps/api/src/modules/ai/quiz-generation-jobs.service.ts`
- LOCALIZAÇÃO: ficheiros completos, com imports, JSDoc e comentários didáticos.

3. Instruções do que fazer.

Cria um DTO mínimo, um schema persistido e um service que valida primeiro se a área do aluno pode gerar quiz, cria job `QUEUED`, chama `StudyToolsService.generateStudyTool(userId, studyAreaId, { type: "QUIZ" })` em background e atualiza o estado para `DONE` ou `FAILED`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/dto/create-quiz-job.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Pedido para iniciar um quiz em background.
 *
 * O frontend pode sugerir um tópico, mas não escolhe fontes nem envia userId.
 */
export class CreateQuizJobDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}
```

```ts
// apps/api/src/modules/ai/schemas/quiz-generation-job.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type QuizGenerationJobDocument = HydratedDocument<QuizGenerationJob>;
export type QuizGenerationJobStatus =
    | "QUEUED"
    | "PROCESSING"
    | "DONE"
    | "FAILED";

/**
 * Job persistido para geração de quizzes privados.
 */
@Schema({ timestamps: true, collection: "quiz_generation_jobs" })
export class QuizGenerationJob {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: ["QUEUED", "PROCESSING", "DONE", "FAILED"], default: "QUEUED" })
    status!: QuizGenerationJobStatus;

    @Prop({ type: Types.ObjectId })
    artifactId?: Types.ObjectId;

    @Prop({ trim: true, maxlength: 120 })
    topic?: string;

    @Prop({ trim: true, maxlength: 1000 })
    errorMessage?: string;
}

export const QuizGenerationJobSchema =
    SchemaFactory.createForClass(QuizGenerationJob);
QuizGenerationJobSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
```

```ts
// apps/api/src/modules/ai/study-tools.service.ts
// Adicionar este método público dentro da classe StudyToolsService.

/**
 * Confirma que a área privada tem condições mínimas para iniciar um job de quiz.
 *
 * @param userId Identificador vindo da sessão autenticada.
 * @param studyAreaId Área privada onde o quiz será gerado.
 * @throws UnprocessableEntityException quando não existem fontes processáveis.
 */
async assertQuizGenerationReady(
    userId: string,
    studyAreaId: string,
): Promise<void> {
    // A validação reutiliza services reais para bloquear áreas de outro aluno antes de criar job.
    await this.areasService.getMyStudyArea(userId, studyAreaId);
    const profile = await this.profileService.prepareProfile(userId, studyAreaId);
    const sources = await this.getProcessableSources(userId, studyAreaId);

    if (profile.status !== "READY_FOR_GENERATION" || sources.length === 0) {
        // A rejeição acontece antes do job para a UI não prometer progresso sem fontes reais.
        throw new UnprocessableEntityException({
            code: "NO_PROCESSABLE_SOURCES",
            message:
                "Este material ainda não tem texto processável para gerar conteúdo de estudo.",
        });
    }
}
```

```ts
// apps/api/src/modules/ai/quiz-generation-jobs.service.ts
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateQuizJobDto } from "./dto/create-quiz-job.dto.js";
import {
    QuizGenerationJob,
    QuizGenerationJobDocument,
    QuizGenerationJobStatus,
} from "./schemas/quiz-generation-job.schema.js";
import { StudyToolsService } from "./study-tools.service.js";

export type QuizGenerationJobView = {
    _id: string;
    studyAreaId: string;
    status: QuizGenerationJobStatus;
    artifactId?: string;
    topic?: string;
    errorMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type QuizGenerationJobLean = QuizGenerationJob & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * Porta tipada para o service canónico sem perder o token runtime do NestJS.
 */
export type QuizGenerationStudyToolsPort = Pick<
    StudyToolsService,
    "assertQuizGenerationReady" | "generateStudyTool"
>;

/**
 * Gere jobs persistidos de quizzes sem prender o pedido HTTP à chamada ao provider de IA.
 */
@Injectable()
export class QuizGenerationJobsService {
    private readonly logger = new Logger(QuizGenerationJobsService.name);

    constructor(
        @InjectModel(QuizGenerationJob.name)
        private readonly jobModel: Model<QuizGenerationJobDocument>,
        @Inject(StudyToolsService)
        private readonly studyToolsService: QuizGenerationStudyToolsPort,
    ) {}

    /**
     * Cria um job QUEUED e inicia a geração real do quiz em background.
     *
     * @param userId Utilizador autenticado vindo da sessão.
     * @param studyAreaId Área privada onde o quiz será criado.
     * @param input Pedido validado pelo DTO.
     * @returns Job inicial consultável pela UI.
     */
    async createQuizJob(
        userId: string,
        studyAreaId: string,
        input: CreateQuizJobDto,
    ): Promise<QuizGenerationJobView> {
        await this.studyToolsService.assertQuizGenerationReady(userId, studyAreaId);

        const job = await this.jobModel.create({
            userId: this.parseObjectId(userId),
            studyAreaId: this.parseObjectId(studyAreaId),
            status: "QUEUED",
            topic: input.topic,
        });
        const view = this.toView(job.toObject() as QuizGenerationJobLean);

        // A pré-validação já confirmou ownership e fontes; a geração pesada continua fora da resposta HTTP.
        void this.processQuizJob(userId, studyAreaId, view._id, input);

        return view;
    }

    /**
     * Consulta um job que pertence ao aluno autenticado e à área indicada.
     *
     * @param userId Utilizador autenticado vindo da sessão.
     * @param studyAreaId Área privada do aluno.
     * @param jobId Job a consultar.
     * @returns Estado público do job.
     */
    async findQuizJob(
        userId: string,
        studyAreaId: string,
        jobId: string,
    ): Promise<QuizGenerationJobView> {
        const job = await this.jobModel
            .findOne({
                _id: this.parseObjectId(jobId),
                userId: this.parseObjectId(userId),
                studyAreaId: this.parseObjectId(studyAreaId),
            })
            .lean();
        if (!job) throw this.notFound();
        return this.toView(job as QuizGenerationJobLean);
    }

    /**
     * Gera o quiz usando o service canónico de ferramentas de estudo.
     *
     * @param userId Utilizador autenticado vindo da sessão.
     * @param studyAreaId Área privada do aluno.
     * @param jobId Job persistido antes da geração.
     * @param input Pedido inicial do aluno.
     */
    private async processQuizJob(
        userId: string,
        studyAreaId: string,
        jobId: string,
        input: CreateQuizJobDto,
    ): Promise<void> {
        const query = {
            _id: this.parseObjectId(jobId),
            userId: this.parseObjectId(userId),
            studyAreaId: this.parseObjectId(studyAreaId),
        };
        await this.jobModel.findOneAndUpdate(query, {
            $set: { status: "PROCESSING" },
            $unset: { errorMessage: "" },
        });

        try {
            const artifact = await this.studyToolsService.generateStudyTool(
                userId,
                studyAreaId,
                { type: "QUIZ", topic: input.topic },
            );
            await this.jobModel.findOneAndUpdate(query, {
                $set: {
                    status: "DONE",
                    artifactId: this.parseObjectId(artifact._id),
                },
                $unset: { errorMessage: "" },
            });
        } catch (error) {
            this.logger.warn(
                `Falha controlada ao gerar quiz em background para job ${jobId}.`,
            );
            // A mensagem pública evita expor prompts, fontes privadas ou detalhes do provider.
            await this.jobModel.findOneAndUpdate(query, {
                $set: {
                    status: "FAILED",
                    errorMessage: this.toPublicErrorMessage(error),
                },
            });
        }
    }

    /**
     * Valida ObjectId antes de construir queries MongoDB.
     *
     * @param value Valor recebido por rota ou sessão.
     * @returns ObjectId seguro para query.
     */
    private parseObjectId(value: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(value)) throw this.notFound();
        return new Types.ObjectId(value);
    }

    /**
     * Converte o documento interno para contrato público de polling.
     *
     * @param job Documento persistido do job.
     * @returns Vista sem dados privados nem conteúdo do quiz.
     */
    private toView(job: QuizGenerationJobLean): QuizGenerationJobView {
        return {
            _id: String(job._id),
            studyAreaId: String(job.studyAreaId),
            status: job.status,
            artifactId: job.artifactId ? String(job.artifactId) : undefined,
            topic: job.topic,
            errorMessage: job.errorMessage,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }

    /**
     * Garante que erros internos do provider não expõem prompts ou respostas privadas.
     *
     * @param error Erro recebido da geração.
     * @returns Mensagem pública segura.
     */
    private toPublicErrorMessage(error: unknown): string {
        if (error instanceof Error && error.message.includes("processável")) {
            return error.message;
        }
        return "Não foi possível gerar o quiz neste momento.";
    }

    /**
     * Cria erro uniforme para jobs inexistentes ou fora do ownership do aluno.
     *
     * @returns Nunca retorna; lança exceção.
     */
    private notFound(): never {
        throw new NotFoundException({
            code: "QUIZ_JOB_NOT_FOUND",
            message: "Job de quiz não encontrado.",
        });
    }
}
```

5. Explicação do código.

O DTO impede que o frontend envie `userId` ou lista de fontes como autoridade. O schema persiste o estado, o que evita perder jobs num simples refresh de página. `assertQuizGenerationReady` valida ownership, perfil IA e fontes processáveis antes de criar o job; se faltar uma condição, a API falha de forma controlada e não promete um `QUEUED` falso. Depois dessa pré-validação, o service cria `QUEUED`, passa por `PROCESSING` e chama `StudyToolsService.generateStudyTool` com `type: "QUIZ"`.

O token explícito `@Inject(StudyToolsService)` mantém a porta tipada sem quebrar a injeção do NestJS em runtime. Esta solução também prepara `BK-MF6-03`: quando a arquitetura evoluir para múltiplas instâncias, o estado já não depende de memória local. O erro público é sanitizado para não expor prompts, respostas IA privadas, conteúdo de materiais ou detalhes do provider.

6. Validação do passo.

Executa `npm --prefix apps/api run build` para validar imports, schema e injeção de dependências. Depois confirma que `assertQuizGenerationReady(...)` corre antes de `jobModel.create(...)` e que o job criado fica `QUEUED` quando a geração ainda não terminou.

7. Cenário negativo/erro esperado.

Numa área sem materiais processáveis, o `POST` deve falhar antes de criar job. Se as fontes ficarem indisponíveis depois da pré-validação, o background deve terminar o job em `FAILED` com mensagem pública controlada. Não deve gerar quiz vazio, não deve inventar conteúdo factual e não deve expor fontes privadas.

### Passo 4 - Integrar controller, módulo, cliente e UI

1. Objetivo funcional do passo no contexto da app.

Ligar o job de quiz ao contrato real de ferramentas de estudo e oferecer uma UI simples de início/polling sem bloquear a página.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/ai/study-tools.controller.ts`
- EDITAR: `apps/api/src/modules/ai/ai.module.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- CRIAR/EDITAR: `apps/web/src/features/ai/QuizGenerationPanel.tsx`
- LOCALIZAÇÃO: controller real, metadata do módulo, funções de cliente e componente completo.

3. Instruções do que fazer.

Adiciona os endpoints ao `StudyToolsController` existente. Não cries uma rota paralela fora do prefixo real, porque a aplicação já usa `api/study-areas/:id/study-tools` para ferramentas privadas.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/study-tools.controller.ts
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateQuizAttemptDto } from "./dto/create-quiz-attempt.dto.js";
import { CreateQuizJobDto } from "./dto/create-quiz-job.dto.js";
import { CreateStudyToolDto } from "./dto/create-study-tool.dto.js";
import { QuizGenerationJobsService } from "./quiz-generation-jobs.service.js";
import { StudyToolsService } from "./study-tools.service.js";

/**
 * Controller de ferramentas de estudo geradas por IA.
 */
@Controller("api/study-areas/:id/study-tools")
@UseGuards(SessionGuard)
export class StudyToolsController {
    constructor(
        private readonly studyToolsService: StudyToolsService,
        private readonly quizJobsService: QuizGenerationJobsService,
    ) {}

    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Query("type") type?: string,
    ) {
        return this.studyToolsService.listTools(request.user!.id, id, type);
    }

    @Post()
    generate(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateStudyToolDto,
    ) {
        return this.studyToolsService.generateStudyTool(request.user!.id, id, body);
    }

    /**
     * Inicia geração de quiz em background para uma área privada do aluno.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param body Pedido opcional com tópico.
     * @returns Job inicial em estado QUEUED.
     */
    @Post("quiz-jobs")
    createQuizJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateQuizJobDto,
    ) {
        // O backend usa request.user.id para impedir acesso cruzado a áreas de outro aluno.
        return this.quizJobsService.createQuizJob(request.user!.id, id, body);
    }

    /**
     * Consulta o estado de um job de quiz da área privada.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param jobId Job a consultar.
     * @returns Estado público do job.
     */
    @Get("quiz-jobs/:jobId")
    getQuizJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("jobId") jobId: string,
    ) {
        return this.quizJobsService.findQuizJob(request.user!.id, id, jobId);
    }

    @Post(":artifactId/quiz-attempts")
    submitQuizAttempt(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("artifactId") artifactId: string,
        @Body() body: CreateQuizAttemptDto,
    ) {
        return this.studyToolsService.submitQuizAttempt(
            request.user!.id,
            id,
            artifactId,
            body,
        );
    }
}
```

```ts
// apps/api/src/modules/ai/ai.module.ts
@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        MaterialsModule,
        HistoryModule,
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
            { name: AiQuizAttempt.name, schema: AiQuizAttemptSchema },
            { name: LearningProfile.name, schema: LearningProfileSchema },
            { name: AdaptiveExplanation.name, schema: AdaptiveExplanationSchema },
            // O job de quiz fica persistido para sobreviver a refresh da UI e a múltiplas instâncias da API.
            { name: QuizGenerationJob.name, schema: QuizGenerationJobSchema },
        ]),
    ],
    controllers: [
        AiAreaProfileController,
        SummariesController,
        StudyToolsController,
        AdaptiveLearningController,
    ],
    providers: [
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        // O service de jobs coordena a fila sem guardar estado em memória local do processo.
        QuizGenerationJobsService,
        AdaptiveLearningService,
        { provide: AI_PROVIDER, useFactory: createAiProvider },
    ],
    exports: [
        AI_PROVIDER,
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        // Exportar este service prepara MF7 para observar jobs sem duplicar a lógica de geração.
        QuizGenerationJobsService,
        AdaptiveLearningService,
    ],
})
export class AiModule {}
```

```ts
// apps/web/src/lib/apiClient.ts
export type QuizGenerationJob = {
    _id: string;
    studyAreaId: string;
    status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
    artifactId?: string;
    topic?: string;
    errorMessage?: string;
    createdAt?: string;
    updatedAt?: string;
};

/**
 * Inicia geração de quiz em background.
 *
 * @param studyAreaId Área privada do aluno autenticado.
 * @param input Tópico opcional; o backend escolhe fontes processáveis da área.
 * @returns Job inicial para polling.
 */
export function createQuizGenerationJob(
    studyAreaId: string,
    input: { topic?: string } = {},
): Promise<QuizGenerationJob> {
    return requestJson<QuizGenerationJob>(
        `/api/study-areas/${studyAreaId}/study-tools/quiz-jobs`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Consulta estado de geração de quiz.
 *
 * @param studyAreaId Área privada do aluno autenticado.
 * @param jobId Job devolvido pela criação.
 * @returns Estado público do job.
 */
export function getQuizGenerationJob(
    studyAreaId: string,
    jobId: string,
): Promise<QuizGenerationJob> {
    return requestJson<QuizGenerationJob>(
        `/api/study-areas/${studyAreaId}/study-tools/quiz-jobs/${jobId}`,
    );
}
```

```tsx
// apps/web/src/features/ai/QuizGenerationPanel.tsx
import { useEffect, useState } from "react";
import {
    createQuizGenerationJob,
    getQuizGenerationJob,
    QuizGenerationJob,
} from "../../lib/apiClient";

type QuizGenerationPanelProps = {
    studyAreaId: string;
    topic?: string;
    onQuizReady?: (artifactId: string) => void;
};

/**
 * Painel que inicia e acompanha um quiz gerado em background.
 */
export function QuizGenerationPanel({
    studyAreaId,
    topic,
    onQuizReady,
}: QuizGenerationPanelProps) {
    const [job, setJob] = useState<QuizGenerationJob | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!job || !["QUEUED", "PROCESSING"].includes(job.status)) return;

        const timer = window.setInterval(async () => {
            try {
                const nextJob = await getQuizGenerationJob(studyAreaId, job._id);
                setJob(nextJob);
                if (nextJob.status === "DONE" && nextJob.artifactId) {
                    onQuizReady?.(nextJob.artifactId);
                }
            } catch {
                // A UI não mostra detalhes técnicos que possam revelar fontes privadas.
                setError("Não foi possível atualizar o estado do quiz.");
            }
        }, 1500);

        return () => window.clearInterval(timer);
    }, [job, onQuizReady, studyAreaId]);

    async function handleStartQuiz() {
        setIsStarting(true);
        setError(null);
        try {
            const nextJob = await createQuizGenerationJob(studyAreaId, { topic });
            setJob(nextJob);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Não foi possível iniciar o quiz.",
            );
        } finally {
            setIsStarting(false);
        }
    }

    const disabled = isStarting || job?.status === "QUEUED" || job?.status === "PROCESSING";

    return (
        <section aria-live="polite">
            <button type="button" onClick={handleStartQuiz} disabled={disabled}>
                {disabled ? "A preparar quiz" : "Gerar quiz"}
            </button>
            {job?.status === "DONE" && <p>Quiz pronto para resolver.</p>}
            {job?.status === "FAILED" && <p>{job.errorMessage ?? "Não foi possível gerar o quiz."}</p>}
            {error && <p>{error}</p>}
        </section>
    );
}
```

5. Explicação do código.

O controller fica no caminho real das ferramentas de estudo e continua protegido por `SessionGuard`. A rota de criação usa `request.user!.id`; por isso o aluno não consegue criar job em nome de outro utilizador. O módulo regista schema e provider para o NestJS conseguir persistir jobs e injetar o service.

No frontend, as funções ficam no cliente central para herdar `credentials: "include"` e CSRF marker. O componente faz polling simples, mostra estados compreensíveis e evita expor detalhes técnicos. O frontend não decide se há fontes processáveis: essa regra continua no backend.

6. Validação do passo.

Confirma que não existe import para ficheiro inexistente, que a rota documentada bate certo com o prefixo do controller e que `QuizGenerationJobsService` está em `providers`.

7. Cenário negativo/erro esperado.

Se a área não tiver fontes processáveis, o pedido inicial deve terminar com erro controlado antes de existir job. Esse erro vem do backend; a UI não deve fabricar sucesso, criar perguntas inventadas nem iniciar polling para um job inexistente.

### Passo 5 - Adicionar teste e negativo obrigatório

1. Objetivo funcional do passo no contexto da app.

Criar uma prova pequena de que o job responde `QUEUED` e que a geração real é delegada para `StudyToolsService`.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/ai/quiz-generation-jobs.service.spec.ts`
- LOCALIZAÇÃO: teste unitário do service de jobs.

3. Instruções do que fazer.

Adiciona o teste abaixo. Ele não testa o provider de IA externo; testa o contrato deste BK: persistir job, responder rápido e chamar o service canónico de ferramentas.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/quiz-generation-jobs.service.spec.ts
import { Model, Types } from "mongoose";
import {
    QuizGenerationJobsService,
    QuizGenerationStudyToolsPort,
} from "./quiz-generation-jobs.service.js";
import { QuizGenerationJobDocument } from "./schemas/quiz-generation-job.schema.js";

describe("QuizGenerationJobsService", () => {
    it("valida fontes, devolve QUEUED e delega geração real de quiz", async () => {
        const userId = "507f1f77bcf86cd799439014";
        const studyAreaId = "507f1f77bcf86cd799439013";
        const jobId = new Types.ObjectId("507f1f77bcf86cd799439011");
        const artifactId = "507f1f77bcf86cd799439099";

        const jobModel = {
            create: jest.fn().mockResolvedValue({
                toObject: () => ({
                    _id: jobId,
                    userId: new Types.ObjectId(userId),
                    studyAreaId: new Types.ObjectId(studyAreaId),
                    status: "QUEUED",
                }),
            }),
            findOneAndUpdate: jest.fn().mockResolvedValue(null),
        } as Model<QuizGenerationJobDocument>;
        const studyToolsService: jest.Mocked<QuizGenerationStudyToolsPort> = {
            assertQuizGenerationReady: jest.fn().mockResolvedValue(undefined),
            generateStudyTool: jest.fn().mockResolvedValue({ _id: artifactId }),
        };
        const service = new QuizGenerationJobsService(jobModel, studyToolsService);

        const queuedJob = await service.createQuizJob(userId, studyAreaId, {
            topic: "fotossíntese",
        });
        await Promise.resolve();
        await Promise.resolve();

        // O job inicial prova que a UI pode responder antes de a IA terminar.
        expect(studyToolsService.assertQuizGenerationReady).toHaveBeenCalledWith(
            userId,
            studyAreaId,
        );
        expect(queuedJob.status).toBe("QUEUED");
        expect(studyToolsService.generateStudyTool).toHaveBeenCalledWith(
            userId,
            studyAreaId,
            { type: "QUIZ", topic: "fotossíntese" },
        );
    });

    it("não cria job quando a área não tem fontes processáveis", async () => {
        const userId = "507f1f77bcf86cd799439014";
        const studyAreaId = "507f1f77bcf86cd799439013";
        const jobModel = {
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
        } as Model<QuizGenerationJobDocument>;
        const studyToolsService: jest.Mocked<QuizGenerationStudyToolsPort> = {
            assertQuizGenerationReady: jest
                .fn()
                .mockRejectedValue(new Error("Sem fontes processáveis.")),
            generateStudyTool: jest.fn(),
        };
        const service = new QuizGenerationJobsService(jobModel, studyToolsService);

        // A validação de ownership/fontes acontece antes de a UI receber um job QUEUED.
        await expect(
            service.createQuizJob(userId, studyAreaId, {}),
        ).rejects.toThrow("Sem fontes processáveis.");
        expect(jobModel.create).not.toHaveBeenCalled();
        expect(studyToolsService.generateStudyTool).not.toHaveBeenCalled();
    });
});
```

5. Explicação do código.

O teste cobre o contrato novo sem depender de rede, provider externo ou conteúdo privado. O `jobModel` simula apenas o que o service usa: criação do job e atualização de estado. A chamada a `assertQuizGenerationReady` prova que ownership/fontes são validados antes de existir `QUEUED`; a chamada a `generateStudyTool` prova que a geração não ficou parada num objeto local sem produzir quiz. O segundo teste impede regressão de segurança: sem fontes processáveis, a API não deve criar job nem iniciar provider de IA.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit -- quiz-generation-jobs.service.spec.ts` se a configuração aceitar filtro de ficheiro. Se não aceitar, executa `npm --prefix apps/api run test:unit`.

7. Cenário negativo/erro esperado.

Configura `assertQuizGenerationReady` para rejeitar com mensagem de ausência de fontes processáveis. A criação deve falhar antes de persistir job e o frontend deve mostrar erro controlado, sem perguntas inventadas.

### Passo 6 - Preparar evidence técnica e pedagógica

1. Objetivo funcional do passo no contexto da app.

Guardar prova suficiente para PR, apresentação e defesa PAP.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md`
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

Confirmar que `BK-MF6-03` consegue consumir o que este BK entrega sem reescrever a solução.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md`
- LOCALIZAÇÃO: Handoff e Changelog.

3. Instruções do que fazer.

Atualiza o handoff com exports, endpoints, comandos e riscos restantes. A decisão marcada como DERIVADO neste BK é: usar background job simples para quizzes longos, mantendo resposta síncrona apenas para pedidos pequenos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é garantir continuidade entre BKs. Este fecho evita que a MF6 fique como uma coleção de tarefas soltas.

6. Validação do passo.

Confirma que o próximo BK citado existe na matriz e que nenhum caminho interno de referência aparece no texto destinado ao aluno.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de algo que não foi entregue aqui, volta ao passo técnico correspondente e completa o contrato antes de fechar.

#### Critérios de aceite

- `RNF12` tem uma regra backend verificável: criação de job `QUEUED`, geração posterior de quiz e polling por `jobId`.
- O cenário principal produz output objetivo e repetível: pré-validação passa, `POST` devolve job inicial e `GET` mostra `DONE` com `artifactId` quando a IA terminar.
- O cenário negativo sem fontes falha antes de persistir job e sem dados sensíveis.
- A solução não depende de permissões decididas no frontend.
- Os caminhos de ficheiros usam apenas apps/api e apps/web.
- A evidence inclui comando, resultado observado e interpretação curta.
- O handoff para `BK-MF6-03` fica explícito e já não depende de `Map` local.

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
- proof_handoff: nota curta a explicar como BK-MF6-03 consome este trabalho.

#### Handoff

- Entrega para `BK-MF6-03`: schema persistido de job, endpoints sob `api/study-areas/:id/study-tools`, cliente tipado e UI com polling simples.
- Decisão DERIVADO registada: usar pré-validação com `StudyToolsService.assertQuizGenerationReady(...)`, job persistido e `StudyToolsService.generateStudyTool(... type: "QUIZ")` antes de introduzir fila distribuída completa.
- Risco residual: validar em ambiente semelhante ao deploy final, sobretudo reinícios durante jobs em curso e futura execução em múltiplas instâncias.
- Não há alteração de RF/RNF nem mudança de matriz nesta entrega.

#### Changelog

- `2026-06-22`: guia corrigido para pré-validar fontes antes de criar job, persistir jobs de quiz, usar injeção NestJS runtime-safe, reutilizar o controller real de ferramentas de estudo, remover estado em memória local, fornecer cliente/UI completos e provar delegação para `StudyToolsService`.
