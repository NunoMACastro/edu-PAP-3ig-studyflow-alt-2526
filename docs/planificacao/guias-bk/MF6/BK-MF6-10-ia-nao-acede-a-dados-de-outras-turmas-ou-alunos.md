# BK-MF6-10 - IA não acede a dados de outras turmas ou alunos.

## Header

- `doc_id`: `GUIA-BK-MF6-10`
- `bk_id`: `BK-MF6-10`
- `macro`: `MF6`
- `owner`: `Natalia`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF20`
- `fase_documental`: `Fase 3`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-11`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Garantir que a IA só recebe fontes que o aluno autenticado pode ler no contexto funcional certo.

No fim deste BK, uma pergunta feita à IA com fontes obrigatórias deve passar por autorização no backend antes de qualquer chamada ao provider. Se o aluno tentar usar um documento de outro aluno, de uma sala onde não participa ou de uma turma onde não está inscrito, o pedido deve falhar antes de existir prompt.

#### Importância

Uma resposta de IA pode esconder a origem dos dados usados para a gerar. O risco principal não é apenas o texto devolvido ao aluno: é o conjunto de excertos enviado ao provider.

Se o backend enviar documentos privados ao provider antes de validar permissões, a fuga já aconteceu. Por isso, a fronteira de segurança tem de estar no servidor, antes da montagem do prompt, e não numa condição visual do frontend.

Este BK fecha a MF6 na parte de privacidade da IA: a app pode ter IA privada, IA em salas e IA em turmas, mas cada fluxo só pode usar fontes autorizadas por serviços de domínio.

#### Scope-in

- Rever o contrato de `RNF20`.
- Validar o fluxo `source-grounded AI` com `MaterialIndexService.findReadableDoneJob`.
- Garantir que `SourceGroundedAiService` autoriza cada `sourceJobId` antes de delegar na `GovernedAiExecutionService`.
- Manter o DTO source-grounded limitado a `sourceJobIds` e `question`.
- Confirmar que IA privada, IA de sala e IA de turma usam fontes filtradas pelo backend.
- Acrescentar teste negativo para fonte proibida antes da fachada governada.
- Produzir evidence sem prompts privados, documentos reais, cookies, tokens ou dados pessoais.

#### Scope-out

- Criar endpoints novos para substituir fluxos já existentes.
- Mover autorização para o frontend.
- Aceitar permissões vindas do cliente, como `contextType`, `resourceId`, `ownerId`, `roomId` ou `classId`.
- Criar um serviço paralelo de permissões quando os serviços de domínio já validam leitura.
- Implementar pesquisa vetorial, leitura ótica de imagem, streaming ou novo provider de IA.
- Guardar prompts completos com conteúdo privado em logs, analytics, resposta HTTP ou relatório.
- Alterar regras de matrícula, membership de sala ou autenticação.

#### Estado antes e depois

Antes deste BK, a aplicação já tem guardrails de IA e fluxos separados para área privada, sala e turma, mas ainda precisa de uma verificação explícita de que a IA com fontes obrigatórias nunca recebe documentos fora do contexto autorizado.

Depois deste BK, o aluno deve conseguir confirmar que cada `sourceJobId` passa por autorização no backend antes de entrar no prompt, que os outros fluxos de IA mantêm filtros de contexto e que uma fonte proibida bloqueia o provider.

#### Pre-requisitos

Antes de começar, lê:

- `docs/RNF.md`, procurando `RNF19` e `RNF20`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, procurando `BK-MF6-10`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, procurando `BK-MF6-10`.
- `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`.
- `docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md`.
- `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`.
- `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`.
- `apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`.
- `apps/api/src/modules/material-index/material-index.service.ts`.
- `apps/api/src/common/types/authenticated-request.ts`.

#### Glossário

- **Actor:** utilizador autenticado recebido pelo backend.
- **Fonte autorizada:** job de indexação que o backend confirmou que o actor pode ler.
- **Prompt:** texto enviado ao provider de IA. Não deve conter dados fora do contexto autorizado.
- **Fachada IA:** `GovernedAiExecutionService` é a única fronteira de execução externa; o fluxo source-grounded não injeta nem exporta o provider.
- **Citação:** excerto limitado devolvido com a resposta para justificar a origem.
- **Fonte privada:** documento da área pessoal do aluno.
- **Fonte de sala:** documento partilhado numa sala onde o aluno é membro.
- **Fonte de turma:** material de disciplina associado à turma do aluno.

#### Conceitos teóricos essenciais

- **Autorização antes do prompt:** a autorização decide se o aluno pode ler uma fonte antes de essa fonte entrar no texto enviado ao provider. Vem da sessão autenticada e dos services de domínio, serve para impedir fugas de dados e evita que o frontend decida permissões.
- **Fonte processável:** uma fonte processável é um material já indexado com excertos textuais. Vem do módulo de indexação, segue para a IA apenas depois de validação e evita respostas sem base documental.
- **IA privada, IA de sala e IA de turma:** estes três contextos têm fontes diferentes. A IA privada usa dados do próprio aluno, a IA de sala usa partilhas da sala com membership validado e a IA de turma usa materiais oficiais da disciplina/turma. Esta separação evita mistura de dados entre alunos e contextos.
- **Provider isolado:** o provider é a peça que gera texto, mas não deve conhecer regras de permissão. Recebe apenas dados já filtrados pelo backend, devolve a resposta e permite testar a segurança antes da chamada externa.
- **Citação:** a citação liga a resposta a uma fonte autorizada. Vem dos chunks indexados, segue para a resposta persistida e ajuda o aluno/professor a perceber a origem da explicação.
- **Teste negativo:** um teste negativo prova que uma operação perigosa falha. Neste BK, ele confirma que uma fonte proibida não chama o provider nem grava resposta.

O contrato central é: primeiro autorização, depois seleção de excertos, depois provider.

#### Arquitetura do BK

Fluxo principal:

1. O frontend envia `POST /api/ai/source-grounded-answers`.
2. O `SessionGuard` injeta o utilizador autenticado.
3. O controller recebe `AskSourceGroundedAiDto`.
4. O service percorre cada `sourceJobId`.
5. Cada fonte passa por `MaterialIndexService.findReadableDoneJob(actor, jobId)`.
6. Só os jobs autorizados entram na lista de citações.
7. O provider recebe apenas excertos autorizados.
8. A resposta é persistida com `actorId`, `sourceJobIds`, pergunta, resposta e citações.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `apps/api/src/common/types/authenticated-request.ts`
- REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
- REVER: `apps/api/src/modules/study-rooms/room-ai.service.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar o contrato canónico de privacidade da IA

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega `RNF20` e depende dos guardrails do BK anterior.

2. Ficheiros envolvidos:

- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`

3. Instruções do que fazer.

Procura `RNF20` e confirma que o objetivo é privacidade entre alunos, turmas e contextos. Depois confirma que `BK-MF6-09` já tratou guardrails gerais, porque este BK não substitui esses guardrails: ele acrescenta isolamento de fontes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O objetivo é confirmar contrato e sequência.

5. Explicação do código.

Ainda não há código porque uma regra de privacidade deve começar por contrato. Se a equipa não souber que fonte pertence a que contexto, pode implementar testes verdes mas inseguros.

6. Validação do passo.

Executa:

```bash
rg -n "RNF20|BK-MF6-10|privacidade|IA" docs/RNF.md docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md docs/planificacao/backlogs/BACKLOG-MVP.md
```

7. Cenário negativo/erro esperado.

Se não encontrares `BK-MF6-10` ligado a `RNF20`, para a implementação e corrige primeiro a documentação canónica numa tarefa própria. Não avances com código sem contrato claro.

### Passo 2 - Fixar o DTO e o controller source-grounded

1. Objetivo funcional do passo no contexto da app.

Garantir que o cliente só envia pergunta e ids de fontes. O cliente não decide autorização.

2. Ficheiros envolvidos:

- ALTERAR: `apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`

3. Instruções do que fazer.

Confirma que o DTO tem apenas `sourceJobIds` e `question`. Não adiciones campos de contexto ou dono. No controller, confirma que o utilizador vem da sessão autenticada e é passado ao service.

4. Código completo, correto e integrado com a app final.

`apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`

```ts
/**
 * DTO de pergunta à IA com fontes obrigatórias.
 *
 * O cliente escolhe fontes visíveis na UI, mas a autorização final dessas
 * fontes acontece no service através do utilizador autenticado.
 */
import { ArrayMaxSize, ArrayMinSize, IsArray, IsMongoId, IsString, MaxLength } from "class-validator";

export class AskSourceGroundedAiDto {
    /**
     * Jobs de indexação que o aluno pretende usar como fontes.
     * Cada id será validado no backend antes de entrar no prompt.
     */
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(8)
    @IsMongoId({ each: true })
    sourceJobIds!: string[];

    /**
     * Pergunta do aluno, limitada para reduzir abuso e prompts demasiado longos.
     */
    @IsString()
    @MaxLength(800)
    question!: string;
}
```

`apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`

```ts
/**
 * Controller HTTP para respostas de IA baseadas em fontes autorizadas.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../auth/session.guard.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

@Controller("ai/source-grounded-answers")
@UseGuards(SessionGuard)
export class SourceGroundedAiController {
    constructor(private readonly sourceGroundedAiService: SourceGroundedAiService) {}

    /**
     * Mantém a autorização ligada à sessão real do utilizador.
     *
     * @param request Pedido autenticado pelo SessionGuard.
     * @param input Pergunta e fontes pedidas pelo cliente.
     * @returns Resposta com citações autorizadas.
     */
    @Post()
    ask(@Req() request: AuthenticatedRequest, @Body() input: AskSourceGroundedAiDto) {
        return this.sourceGroundedAiService.ask(request.user, input);
    }
}
```

5. Explicação do código.

O DTO não recebe dados de permissão porque esses dados seriam controlados pelo cliente. A autorização usa `request.user`, que vem da sessão validada pelo backend.

6. Validação do passo.

Executa:

```bash
rg -n "contextType|resourceId|ownerId|roomId|classId" apps/api/src/modules/source-grounded-ai
npm --prefix apps/api run test:unit
```

O primeiro comando deve ficar sem ocorrências no módulo source-grounded. Se existir alguma ocorrência, confirma que não é campo aceitado pelo DTO.

7. Cenário negativo/erro esperado.

Se um aluno enviar manualmente um id de fonte que não pode ler, o DTO pode aceitar o formato, mas o service rejeita a leitura antes da fachada governada.

### Passo 3 - Autorizar cada fonte antes de montar o prompt

1. Objetivo funcional do passo no contexto da app.

Garantir que `SourceGroundedAiService` só constrói prompts com fontes autorizadas.

2. Ficheiros envolvidos:

- ALTERAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `apps/api/src/common/types/authenticated-request.ts`

3. Instruções do que fazer.

Confirma que o service importa `AuthenticatedUser`, injeta `GovernedAiExecutionService` e chama `findReadableDoneJob(actor, jobId)` para cada fonte antes de selecionar chunks.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * Implementa as regras de negócio de IA com fontes obrigatórias e concentra validações do domínio.
 */
import {
    Injectable,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { MaterialTextChunk } from "../material-index/schemas/material-index-job.schema.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerDocument,
    SourceGroundedCitation,
} from "./schemas/source-grounded-ai-answer.schema.js";

/**
 * Vista pública de IA com fontes obrigatórias, sem detalhes internos de Mongoose.
 */
export type SourceGroundedAiAnswerView = {
    _id: string;
    sourceJobIds: string[];
    question: string;
    answer: string;
    citations: SourceGroundedCitation[];
    createdAt?: Date;
};

/**
 * Serviço de respostas com citações obrigatórias.
 *
 * A resposta é pedida à fachada governada depois de o backend validar
 * fontes autorizadas. A execução inclui apenas excertos processáveis e impede
 * conhecimento externo, preservando o contrato anti-alucinação do BK.
 */
@Injectable()
export class SourceGroundedAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param answerModel Modelo Mongoose injetado para ler e persistir IA com fontes obrigatórias.
     * @param materialIndexService Service injetado para reutilizar regras de indexação textual de materiais sem duplicar validações.
     * @param governedAiExecutionService Fachada governada injetada para executar IA.
     */
    constructor(
        @InjectModel(SourceGroundedAiAnswer.name)
        private readonly answerModel: Model<SourceGroundedAiAnswerDocument>,
        private readonly materialIndexService: MaterialIndexService,
        private readonly governedAiExecutionService: GovernedAiExecutionService,
    ) {}

    /**
     * Responde com base exclusiva nos jobs de indexação autorizados.
     *
     * @param actor Utilizador autenticado.
     * @param input Pergunta e jobs alvo.
     * @returns Resposta persistida com citações.
     * @throws UnprocessableEntityException quando não há fontes citáveis.
     * @throws ServiceUnavailableException quando o provider falha ou devolve output inválido.
     */
    async ask(
        actor: AuthenticatedUser,
        input: AskSourceGroundedAiDto,
    ): Promise<SourceGroundedAiAnswerView> {
        // Cada job é autorizado individualmente porque a lista pode misturar materiais privados e oficiais.
        const jobs = await Promise.all(
            input.sourceJobIds.map((jobId) =>
                this.materialIndexService.findReadableDoneJob(actor, jobId),
            ),
        );
        const citations = jobs.flatMap((job) =>
            this.selectChunks(job, input.question).map((chunk) =>
                this.toCitation(job, chunk),
            ),
        );

        if (citations.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_INDEXED_SOURCES",
                message: "Os materiais ainda não têm fontes processáveis para citar.",
            });
        }

        const answer = await this.generateAnswer(actor, input.question, citations);

        // Persistir as citações junto da resposta permite auditoria posterior do output da IA.
        const document = await this.answerModel.create({
            actorId: new Types.ObjectId(actor.id),
            sourceJobIds: input.sourceJobIds.map((jobId) => new Types.ObjectId(jobId)),
            question: input.question.trim(),
            answer,
            citations,
        });
        const created = document.toObject() as { createdAt?: Date };
        return {
            _id: String(document._id),
            sourceJobIds: input.sourceJobIds,
            question: document.question,
            answer: document.answer,
            citations: document.citations,
            createdAt: created.createdAt,
        };
    }

    /**
     * Escolhe os chunks mais relevantes por correspondência textual simples.
     *
     * @param job Job autorizado e concluído.
     * @param question Pergunta do utilizador.
     * @returns Até três chunks para citar.
     */
    private selectChunks(
        job: MaterialIndexJobView,
        question: string,
    ): MaterialTextChunk[] {
        // A seleção lexical é simples de propósito: é explicável para alunos e não introduz pesquisa externa.
        const terms = question
            .toLowerCase()
            .split(/\W+/)
            .filter((term) => term.length >= 4);
        const scored = job.extractedTextChunks.map((chunk) => ({
            chunk,
            score: terms.reduce(
                (total, term) =>
                    total + (chunk.text.toLowerCase().includes(term) ? 1 : 0),
                0,
            ),
        }));

        const matches = scored
            .filter((item) => item.score > 0)
            .sort((left, right) => right.score - left.score)
            .map((item) => item.chunk);

        return (matches.length > 0 ? matches : job.extractedTextChunks).slice(0, 3);
    }

    /**
     * Converte um chunk interno numa citação pública.
     *
     * @param job Job autorizado.
     * @param chunk Chunk indexado.
     * @returns Citação com excerto limitado.
     */
    private toCitation(
        job: MaterialIndexJobView,
        chunk: MaterialTextChunk,
    ): SourceGroundedCitation {
        return {
            sourceJobId: job._id,
            materialId: job.materialId,
            sourceLabel: chunk.sourceLabel,
            locator: chunk.locator,
            excerpt: chunk.text.trim().slice(0, 420),
        };
    }

    /**
     * Delega a execução na fachada com fontes previamente autorizadas.
     *
     * @param question Pergunta original.
     * @param citations Citações autorizadas.
     * @returns Resposta validada.
     */
    private async generateAnswer(
        actor: AuthenticatedUser,
        question: string,
        citations: SourceGroundedCitation[],
    ): Promise<string> {
        const result = await this.governedAiExecutionService.execute({
            actor,
            purpose: "SOURCE_GROUNDED_AI",
            userInput: question.trim(),
            authorizedSources: citations.map((citation) => ({
                id: citation.sourceJobId,
                locator: citation.locator,
                excerpt: citation.excerpt,
            })),
        });
        return result.answer;
    }
}
```

5. Explicação do código.

A linha de defesa principal é `findReadableDoneJob(actor, jobId)`. Se rejeitar a fonte, a execução para antes da fachada. A fachada aplica consentimento, policy, limites, guardrails, quota atómica, chamada externa, validação de output e audit seguro.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run test:unit -- source-grounded-ai
```

7. Cenário negativo/erro esperado.

Se trocares temporariamente `findReadableDoneJob` por uma leitura direta por id, a revisão deve rejeitar a alteração porque uma fonte formatada corretamente poderia entrar no prompt sem validação de leitura.

### Passo 4 - Testar que fonte proibida bloqueia o provider

1. Objetivo funcional do passo no contexto da app.

Provar automaticamente que uma fonte sem autorização não chega à fachada governada.

2. Ficheiros envolvidos:

- ALTERAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`

3. Instruções do que fazer.

Mantém o teste positivo, mantém o teste sem chunks e acrescenta um teste em que `findReadableDoneJob` rejeita uma fonte. Nesse cenário, `execute` e `answerModel.create` não podem ser chamados.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * Testa o comportamento de IA com fontes obrigatórias e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException, UnprocessableEntityException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

describe("SourceGroundedAiService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const jobId = "507f1f77bcf86cd799439013";
    const materialId = "507f1f77bcf86cd799439014";

    it("cria resposta com citações de chunks autorizados", async () => {
        const { governedAiExecutionService, answerModel, materialIndexService, service } =
            makeService();

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "O que são derivadas?",
            }),
        ).resolves.toMatchObject({
            sourceJobIds: [jobId],
            citations: [
                {
                    sourceJobId: jobId,
                    materialId,
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
            ],
        });
        expect(materialIndexService.findReadableDoneJob).toHaveBeenCalledWith(
            student,
            jobId,
        );
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                question: "O que são derivadas?",
                answer: "Resposta gerada pelo provider.",
                citations: expect.any(Array),
            }),
        );
        expect(governedAiExecutionService.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                purpose: "SOURCE_GROUNDED_AI",
                authorizedSources: expect.any(Array),
            }),
        );
    });

    it("bloqueia fonte sem autorização antes da fachada governada", async () => {
        const { governedAiExecutionService, answerModel, materialIndexService, service } =
            makeService();
        materialIndexService.findReadableDoneJob.mockRejectedValueOnce(
            new ForbiddenException({
                code: "MATERIAL_INDEX_FORBIDDEN",
                message: "O utilizador não pode ler esta fonte.",
            }),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Resume este documento.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(governedAiExecutionService.execute).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia quando o job não tem chunks citáveis", async () => {
        const { materialIndexService, service } = makeService();
        materialIndexService.findReadableDoneJob.mockResolvedValueOnce({
            _id: jobId,
            materialId,
            extractedTextChunks: [],
        });

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica o tema.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
});

type PersistedAnswerInput = {
    sourceJobIds: unknown[];
    question: string;
    answer: string;
    citations: unknown[];
};

/**
 * Cria estrutura auxiliar de IA com fontes obrigatórias para manter testes e prompts legíveis.
 *
 * @returns Dependências simuladas e service pronto a testar.
 */
function makeService() {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input: PersistedAnswerInput) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const materialIndexService = {
        findReadableDoneJob: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439013",
            materialId: "507f1f77bcf86cd799439014",
            extractedTextChunks: [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variação instantânea.",
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
            ],
        }),
    };
    const governedAiExecutionService = {
        execute: jest
            .fn()
            .mockResolvedValue({ answer: "Resposta gerada pelo provider." }),
    };
    const service = new SourceGroundedAiService(
        answerModel as never,
        materialIndexService as never,
        governedAiExecutionService as never,
    );
    return { governedAiExecutionService, answerModel, materialIndexService, service };
}
```

5. Explicação do código.

O teste negativo confirma a ordem da segurança. A fonte é rejeitada antes da fachada, por isso a execução e a persistência não são chamadas.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run test:unit -- source-grounded-ai
```

7. Cenário negativo/erro esperado.

Se `execute` for chamado neste teste, a implementação está insegura: significa que dados potencialmente privados chegaram à fronteira de execução.

### Passo 5 - Rever IA privada, IA de sala e IA de turma

1. Objetivo funcional do passo no contexto da app.

Confirmar que os outros fluxos de IA da app também filtram fontes no backend.

2. Ficheiros envolvidos:

- REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
- REVER: `apps/api/src/modules/study-rooms/room-ai.service.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
- REVER: `apps/api/src/modules/private-area-ai/dto/ask-private-area-ai.dto.ts`
- REVER: `apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts`
- REVER: `apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts`

3. Instruções do que fazer.

Confirma estes invariantes:

- IA privada usa apenas fontes da área privada do próprio aluno.
- IA de sala chama validação de membership antes de listar fontes da sala.
- IA de turma confirma a disciplina do aluno antes de usar materiais da turma.
- Os DTOs aceitam a pergunta e seleção de fontes, mas não aceitam permissões inventadas pelo cliente.
- O provider só recebe fontes depois da validação de contexto.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é revisão de fronteiras existentes antes de fechar a evidence.

5. Explicação do código.

A source-grounded AI cobre perguntas com fontes explícitas. A app também tem IA em contextos funcionais. Estes contextos precisam da mesma regra: a autorização vem do backend e do domínio, não do ecrã.

6. Validação do passo.

Executa:

```bash
rg -n "getMyStudyArea|ensureMember|findSubjectForStudent|listReadyTextSources|findUsableSharesForRoom|listProcessedForSubject|GovernedAiExecutionService" apps/api/src/modules/private-area-ai apps/api/src/modules/study-rooms apps/api/src/modules/class-ai
```

7. Cenário negativo/erro esperado.

Se algum fluxo invocar a fachada antes de validar área privada, membership ou disciplina, esse fluxo deve ser corrigido antes de fechar o BK.

### Passo 6 - Confirmar ausência de logs e evidence sensível

1. Objetivo funcional do passo no contexto da app.

Evitar que a própria validação do BK exponha dados privados.

2. Ficheiros envolvidos:

- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
- REVER: `apps/api/src/modules/study-rooms/room-ai.service.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
- REVER: ficheiro de PR, relatório técnico ou comentário de entrega usado pela equipa

3. Instruções do que fazer.

Procura logs, analytics ou serialização de prompts completos. A evidence deve mostrar comandos, resultado e interpretação, mas não deve copiar perguntas reais de alunos, excertos privados, cookies, tokens ou ids de sessão.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O objetivo é validar privacidade da evidence.

5. Explicação do código.

Um BK de privacidade pode falhar se a prova técnica copiar dados sensíveis para o PR. Evidence boa é reprodutível sem revelar conteúdo privado.

6. Validação do passo.

Executa:

```bash
rg -n "console\\.log|logger\\.|prompt" apps/api/src/modules/source-grounded-ai apps/api/src/modules/private-area-ai apps/api/src/modules/study-rooms apps/api/src/modules/class-ai
rg -n "cookie|token" apps/api/src/modules/source-grounded-ai apps/api/src/modules/private-area-ai apps/api/src/modules/study-rooms apps/api/src/modules/class-ai
rg -n "sessionStorage|localStorage" apps/api/src/modules/source-grounded-ai apps/api/src/modules/private-area-ai apps/api/src/modules/study-rooms apps/api/src/modules/class-ai
```

Classifica cada ocorrência. `prompt` pode existir como variável interna; o problema é imprimir ou persistir o prompt completo fora do contrato da resposta.

7. Cenário negativo/erro esperado.

Se encontrares logs com prompt completo ou conteúdo de documentos, remove-os ou troca por logs agregados sem conteúdo privado.

### Passo 7 - Fechar RNF20 e preparar BK-MF6-11

1. Objetivo funcional do passo no contexto da app.

Fechar o isolamento de dados da IA e entregar evidence para a transição para backups automáticos.

2. Ficheiros envolvidos:

- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md`

3. Instruções do que fazer.

Regista os comandos executados, o resultado e a interpretação. Depois confirma que `BK-MF6-11` pode avançar para backups sem depender de alterações adicionais na fronteira da IA.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O fecho é documental e de validação.

5. Explicação do código.

`BK-MF6-11` vai tratar persistência e backups. Antes disso, este BK garante que os dados persistidos por respostas de IA já respeitam o actor e as fontes autorizadas.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- source-grounded-ai
rg -n "findReadableDoneJob|GovernedAiExecutionService|AuthenticatedUser|execute" apps/api/src/modules/source-grounded-ai apps/api/src/common/types/authenticated-request.ts
```

7. Cenário negativo/erro esperado.

Se a build ou o teste source-grounded falhar, não marques o BK como concluído. Corrige primeiro imports, tipos ou ordem de autorização.

#### Critérios de aceite

- `AskSourceGroundedAiDto` mantém apenas `sourceJobIds` e `question`.
- `SourceGroundedAiController` usa `SessionGuard` e passa `request.user` ao service.
- `SourceGroundedAiService` importa `AuthenticatedUser` de `apps/api/src/common/types/authenticated-request.ts`.
- `SourceGroundedAiService` injeta `GovernedAiExecutionService` e não conhece o provider.
- Cada fonte passa por `MaterialIndexService.findReadableDoneJob(actor, jobId)` antes da seleção de chunks.
- O provider não é chamado quando uma fonte não está autorizada.
- O teste de fonte proibida confirma que a fachada e `answerModel.create` não são chamados.
- IA privada, IA de sala e IA de turma foram revistas quanto a área própria, membership e disciplina.
- Evidence não inclui prompts completos, documentos privados, cookies, tokens, ids de sessão ou dados pessoais.

#### Validação final

Executa, no mínimo:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- source-grounded-ai
rg -n "findReadableDoneJob|GovernedAiExecutionService|AuthenticatedUser|execute" apps/api/src/modules/source-grounded-ai apps/api/src/common/types/authenticated-request.ts
rg -n "contextType|resourceId|ownerId|roomId|classId" apps/api/src/modules/source-grounded-ai
```

Resultado esperado:

- build sem erros;
- testes source-grounded verdes;
- presença explícita de `findReadableDoneJob`, `GovernedAiExecutionService` e `AuthenticatedUser`;
- ausência de campos de permissão vindos do cliente no módulo source-grounded.

#### Evidence para PR/defesa

Regista evidence neste formato:

```md
Comando: npm --prefix apps/api run test:unit -- source-grounded-ai
Resultado: PASS na suite SourceGroundedAiService
Negativo validado: fonte sem autorização rejeitada antes da fachada governada
Interpretação: RNF20 fica protegido porque a IA só recebe excertos de fontes autorizadas pelo backend
```

Acrescenta também:

- uma linha com o resultado da build;
- uma linha com o resultado da pesquisa por campos de permissão vindos do cliente;
- uma nota a dizer que prompts completos e documentos privados não foram copiados para a evidence.

#### Handoff

- `BK-MF6-11` pode assumir que respostas source-grounded persistidas já estão ligadas a `actorId` e fontes autorizadas.
- Backups da próxima entrega não devem mascarar problemas de privacidade: se dados indevidos forem persistidos, o backup apenas preserva o erro.
- Logs de MF7 devem manter a mesma regra: eventos podem registar códigos e estado, mas não prompts completos nem excertos privados.

#### Changelog

- `2026-07-10`: execução source-grounded alinhada com `GovernedAiExecutionService`, mantendo autorização por `findReadableDoneJob` e teste negativo antes da fachada.
