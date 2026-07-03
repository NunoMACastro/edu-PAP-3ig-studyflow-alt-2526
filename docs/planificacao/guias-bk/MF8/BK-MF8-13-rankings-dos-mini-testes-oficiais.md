# BK-MF8-13 - Rankings dos mini-testes oficiais.

## Header

- `doc_id`: `GUIA-BK-MF8-13`
- `bk_id`: `BK-MF8-13`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-12`
- `rf_rnf`: `RF28, RF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-14`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais implementar o ranking dos mini-testes oficiais por disciplina. O professor autenticado consegue abrir um mini-teste publicado, ver uma tabela ordenada por pontuação e confirmar o desempenho da turma sem consultar dados fora da disciplina que controla.

O ranking consome a tentativa oficial criada no `BK-MF8-12`: `OfficialTestAttempt`. Esse contrato já guarda `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`. Neste BK vais transformar essas tentativas em resposta segura para professor, endpoint HTTP, cliente frontend, página React e testes focados.

#### Importância

`RF28` é CANONICO porque define testes/mini-testes oficiais. `RF30` é CANONICO porque pede progresso, dificuldades e métricas da turma. Um ranking simples não substitui um dashboard analítico completo, mas cria uma métrica pedagógica observável: quem realizou o mini-teste, que pontuação obteve e em que posição ficou.

Este BK também é importante para segurança e defesa PAP. Resultados de alunos são dados pessoais em contexto escolar. Por isso, o professor só pode ver rankings de disciplinas que lhe pertencem, o backend deve filtrar por `subjectId`, `testId` e `classId`, e a UI não pode decidir permissões localmente.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-13` em matriz, backlog e contrato de campos.
- Consumir o contrato `OfficialTestAttempt` entregue por `BK-MF8-12`.
- Criar service backend para ranking docente com validação de professor dono da disciplina.
- Expor `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
- Criar cliente API tipado em `apps/web/src/lib/apiClient.ts`.
- Criar página React `OfficialTestRankingPage` com loading, vazio, erro e sucesso.
- Criar testes unitários para professor errado, ordenação por pontuação e empate por data.
- Minimizar dados pessoais no ranking, usando identificador curto do aluno em vez de email completo.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Alterar a forma como o aluno submete tentativas; isso pertence ao `BK-MF8-12`.
- Criar dashboards avançados, analytics preditivo ou relatórios automáticos.
- Criar ranking público para alunos.
- Mostrar emails completos, materiais privados, respostas completas, cookies, sessões ou dados sensíveis em logs/evidence.
- Prometer RAG, embeddings, OCR, tradução completa ou automação externa.
- Fazer o frontend decidir ownership, membership, role ou permissão.

#### Estado antes e depois

- Estado antes: a aplicação prevista já tem testes oficiais docentes e, pelo `BK-MF8-12`, tentativas oficiais persistidas por aluno, mas ainda não transforma essas tentativas em ranking visível ao professor.
- Estado depois: `BK-MF8-13` entrega ranking docente com service, endpoint, cliente API, página React, testes negativos e handoff para `BK-MF8-14`.

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
- `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `apps/api/src/modules/official-tests/schemas/official-test.schema.ts`
- `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
- `apps/api/src/modules/official-tests/official-tests.module.ts`
- `apps/api/src/modules/official-tests/official-tests.controller.ts`
- `apps/api/src/modules/subjects/subjects.service.ts`
- `apps/web/src/lib/apiClient.ts`

#### Glossário

- **Mini-teste oficial:** teste criado pelo professor numa disciplina oficial, definido por `RF28`.
- **Tentativa oficial:** submissão de um aluno para um mini-teste publicado, criada no `BK-MF8-12`.
- **Ranking:** lista ordenada de tentativas de um mini-teste, calculada no backend.
- **Professor dono da disciplina:** professor autenticado que criou/controla a disciplina.
- **Dados mínimos:** conjunto reduzido de campos devolvido pela API para cumprir o objetivo sem expor dados excessivos.
- **Identificador curto do aluno:** referência derivada do `studentId`, como `Aluno 9012`, usada quando a app ainda não tem perfil público de nome.
- **Ownership docente:** regra que confirma que a disciplina pertence ao professor autenticado.
- **Empate:** situação em que dois alunos têm a mesma percentagem; neste BK ganha prioridade a tentativa mais antiga.
- **Evidence:** prova objetiva de execução, com comando, output ou screenshot sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Ranking pedagógico.** É uma visualização de desempenho. Vem das tentativas de alunos, passa por uma regra de ordenação e chega ao professor como apoio à análise de turma. Evita que o professor tenha de ler cada tentativa manualmente.
- **Tentativa persistida.** É o registo criado no `BK-MF8-12` quando o aluno submete respostas. Contém pontuação, data e ligação a aluno, disciplina, turma e teste. Evita recalcular resultados no frontend.
- **Service de domínio.** É a classe backend que valida role, ownership, filtros e ordenação. Evita que controller ou UI tenham regras críticas espalhadas.
- **Controller.** Recebe o pedido HTTP, recolhe `subjectId` e `testId`, usa a sessão autenticada e delega a decisão ao service. Evita misturar transporte HTTP com regras de domínio.
- **Mongoose model.** Dá acesso às coleções `official_tests` e `official_test_attempts`. Neste BK, a query tem de filtrar por teste, disciplina e turma para evitar mistura de dados.
- **Minimização de dados.** Em contexto escolar, o ranking deve devolver só o necessário. Neste BK devolve posição, identificador curto, pontuação e data, não respostas completas nem email.
- **Cliente API tipado.** Define a forma da resposta no frontend antes da UI a consumir. Evita payloads sem tipo explícito e chamadas a endpoints inventados.
- **Estados React.** Loading, vazio, erro e sucesso ajudam o professor a perceber o que acontece sem expor detalhes internos.
- **Teste negativo.** Prova que o sistema falha em segurança. Aqui, professor errado e teste inexistente devem bloquear antes de devolver tentativas.

#### Arquitetura do BK

- Requisito canónico: `RF28, RF30`.
- Dependência direta: `BK-MF8-12`, que entrega `OfficialTestAttempt`.
- Endpoint principal: `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
- Backend:
  - `OfficialTestRankingService` valida professor, disciplina e teste;
  - lê `OfficialTestAttempt` filtrado por `testId`, `subjectId` e `classId`;
  - ordena por `percentage` descendente e `answeredAt` ascendente;
  - devolve dados mínimos.
- Frontend:
  - `getOfficialTestRanking(...)` chama o endpoint com cookies de sessão através de `requestJson(...)`;
  - `OfficialTestRankingPage` mostra tabela, estado vazio, erro e carregamento.
- Testes:
  - professor errado;
  - ordenação por percentagem;
  - empate por data;
  - ausência de leakage de respostas completas.
- Decisões CANONICO:
  - `BK-MF8-13` usa `RF28, RF30`;
  - `BK-MF8-13` depende de `BK-MF8-12`;
  - `BK-MF8-14` vem a seguir.
- Decisões DERIVADO:
  - usar `Aluno XXXX` como identificador curto enquanto não existir perfil público de nome;
  - ordenar empate pela tentativa mais antiga;
  - criar service separado de ranking para manter `OfficialTestsService` focado em criação/listagem/submissão.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/official-tests/official-test-ranking.service.ts`
- CRIAR: `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`
- EDITAR: `apps/api/src/modules/official-tests/official-tests.module.ts`
- EDITAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- CRIAR: `apps/web/src/pages/teacher/OfficialTestRankingPage.tsx`
- REVER: `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
- REVER: `apps/api/src/modules/subjects/subjects.service.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e handoff

1. Objetivo funcional do passo no contexto da app.

Confirmar que o ranking nasce dos documentos canónicos e do contrato técnico deixado por `BK-MF8-12`, sem alterar o escopo de `BK-MF8-13`.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
    - LOCALIZAÇÃO: linhas de `BK-MF8-13`, `RF28`, `RF30`, handoff do `BK-MF8-12` e header do `BK-MF8-14`.

3. Instruções do que fazer.

Confirma estes pontos antes de escrever código:

- CANONICO: `BK-MF8-13` pertence à `MF8`, sprint `S12`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF8-12` e próximo BK `BK-MF8-14`.
- CANONICO: `RF28` cobre testes oficiais.
- CANONICO: `RF30` cobre métricas/progresso da turma.
- CANONICO: o ranking deve consumir tentativas já pontuadas do `BK-MF8-12`.
- DERIVADO: o ranking docente mostra identificador curto do aluno, não email completo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e prepara a implementação sem alterar ficheiros.

5. Explicação do código.

Não há código porque a tarefa aqui é validar fronteiras. A principal decisão é não reabrir a submissão do aluno: o ranking lê `OfficialTestAttempt`, não recalcula respostas a partir do formulário.

6. Validação do passo.

Resultado esperado: o header do guia mantém os mesmos metadados da matriz, backlog e contrato de campos, e o handoff do `BK-MF8-12` continua a declarar `official_test_attempts`.

7. Cenário negativo/erro esperado.

Se a matriz disser uma dependência diferente de `BK-MF8-12`, não escolhas por intuição. Regista `BLOQUEADO_POR_CONTRATO` no relatório e pede decisão documental.

### Passo 2 - Criar service de ranking docente

1. Objetivo funcional do passo no contexto da app.

Criar o service que valida professor, disciplina e mini-teste antes de devolver ranking com dados mínimos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/official-tests/official-test-ranking.service.ts`
    - REVER: `apps/api/src/modules/official-tests/schemas/official-test.schema.ts`
    - REVER: `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
    - REVER: `apps/api/src/modules/subjects/subjects.service.ts`
    - LOCALIZAÇÃO: ficheiro completo `official-test-ranking.service.ts`.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Ele não recebe `teacherId`, `studentId` nem `classId` do frontend. O professor vem da sessão, a disciplina é validada por `SubjectsService.findOwnedSubject(...)` e a turma vem da disciplina validada.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-test-ranking.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptDocument,
} from "./schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestDocument,
} from "./schemas/official-test.schema.js";

export type OfficialTestRankingAttempt = {
    studentId: unknown;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: Date;
};

export type OfficialTestRankingRow = {
    position: number;
    studentRef: string;
    displayName: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: Date;
};

export type OfficialTestRankingView = {
    testId: string;
    subjectId: string;
    classId: string;
    rows: OfficialTestRankingRow[];
};

/**
 * Ordena tentativas oficiais e transforma-as em linhas seguras de ranking.
 *
 * @param attempts Tentativas já filtradas por professor, disciplina, turma e teste.
 * @returns Linhas ordenadas sem respostas completas nem email do aluno.
 */
export function buildOfficialTestRanking(
    attempts: OfficialTestRankingAttempt[],
): OfficialTestRankingRow[] {
    return [...attempts]
        .sort((left, right) => {
            if (right.percentage !== left.percentage) {
                return right.percentage - left.percentage;
            }

            // Em empate, a tentativa mais antiga fica primeiro para a regra ser previsível.
            return left.answeredAt.getTime() - right.answeredAt.getTime();
        })
        .map((attempt, index) => {
            const studentRef = String(attempt.studentId);
            return {
                position: index + 1,
                studentRef,
                displayName: `Aluno ${studentRef.slice(-4)}`,
                correctAnswers: attempt.correctAnswers,
                totalQuestions: attempt.totalQuestions,
                percentage: attempt.percentage,
                answeredAt: attempt.answeredAt,
            };
        });
}

/**
 * Service de ranking dos mini-testes oficiais.
 */
@Injectable()
export class OfficialTestRankingService {
    /**
     * @param testModel Modelo de mini-testes oficiais.
     * @param attemptModel Modelo de tentativas oficiais criado no BK-MF8-12.
     * @param subjectsService Service que valida ownership docente da disciplina.
     */
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly testModel: Model<OfficialTestDocument>,
        @InjectModel(OfficialTestAttempt.name)
        private readonly attemptModel: Model<OfficialTestAttemptDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Lista ranking de um mini-teste oficial para o professor dono da disciplina.
     *
     * @param actor Professor autenticado pela sessão.
     * @param subjectId Disciplina oficial do professor.
     * @param testId Mini-teste oficial a consultar.
     * @returns Ranking com dados mínimos das tentativas.
     * @throws ForbiddenException quando o utilizador não é professor.
     * @throws NotFoundException quando o teste não pertence à disciplina validada.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
    ): Promise<OfficialTestRankingView> {
        this.assertTeacher(actor);
        if (!Types.ObjectId.isValid(testId)) throw this.officialTestNotFound();

        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                subjectId: new Types.ObjectId(subject._id),
            })
            .lean();

        if (!test) throw this.officialTestNotFound();

        const attempts = await this.attemptModel
            .find({
                testId: new Types.ObjectId(test._id),
                subjectId: new Types.ObjectId(subject._id),
                classId: new Types.ObjectId(subject.classId),
            })
            .sort({ percentage: -1, answeredAt: 1 })
            .lean();

        return {
            testId: String(test._id),
            subjectId: String(subject._id),
            classId: String(subject.classId),
            // O helper recebe apenas tentativas já filtradas para não misturar autorização com ordenação.
            rows: buildOfficialTestRanking(attempts),
        };
    }

    /**
     * Confirma que o utilizador autenticado é professor.
     *
     * @param actor Utilizador autenticado.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    /**
     * Cria erro estável para mini-teste inacessível.
     *
     * @returns Exceção HTTP 404.
     */
    private officialTestNotFound(): NotFoundException {
        return new NotFoundException({
            code: "OFFICIAL_TEST_NOT_FOUND",
            message: "Mini-teste oficial não encontrado.",
        });
    }
}
```

5. Explicação do código.

O ficheiro separa duas responsabilidades. `buildOfficialTestRanking(...)` só ordena e transforma tentativas já autorizadas; isto torna o cálculo fácil de testar. `OfficialTestRankingService.listForTeacher(...)` faz a parte sensível: confirma role de professor, valida ownership da disciplina com `findOwnedSubject(...)`, confirma que o teste pertence à disciplina e só depois lê tentativas da mesma disciplina e turma.

Os dados que entram são `actor`, `subjectId` e `testId`. O `actor` vem da sessão autenticada; `subjectId` e `testId` vêm da rota; nenhum `studentId` vem do frontend. A saída evita respostas completas e email. `displayName` é DERIVADO a partir dos últimos quatro caracteres do `studentId`, porque o schema de utilizador atual não define nome público.

6. Validação do passo.

Resultado esperado: o service compila, devolve `rows` ordenadas e nunca lê tentativas antes de validar o professor dono da disciplina.

7. Cenário negativo/erro esperado.

Se um aluno chamar este service, recebe `TEACHER_ROLE_REQUIRED`. Se um professor pedir teste de disciplina que não controla, recebe `OFFICIAL_TEST_NOT_FOUND` ou erro de disciplina, sem linhas de ranking.

### Passo 3 - Registar service no módulo

1. Objetivo funcional do passo no contexto da app.

Garantir que o NestJS conhece o service de ranking e o schema de tentativas usado pelo ranking.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/official-tests/official-tests.module.ts`
    - REVER: `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
    - LOCALIZAÇÃO: ficheiro completo `official-tests.module.ts`.

3. Instruções do que fazer.

Substitui o módulo por esta versão. Ela mantém `OfficialTestsService` e acrescenta `OfficialTestRankingService`. Se o `BK-MF8-12` já tiver registado `OfficialTestAttempt`, preserva esse registo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-tests.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { OfficialTestRankingService } from "./official-test-ranking.service.js";
import { OfficialTestsController } from "./official-tests.controller.js";
import { OfficialTestsService } from "./official-tests.service.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "./schemas/official-test-attempt.schema.js";
import { OfficialTest, OfficialTestSchema } from "./schemas/official-test.schema.js";

/**
 * Módulo de testes oficiais, tentativas e ranking docente.
 */
@Module({
    imports: [
        AuthModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: OfficialTest.name, schema: OfficialTestSchema },
            { name: OfficialTestAttempt.name, schema: OfficialTestAttemptSchema },
        ]),
    ],
    controllers: [OfficialTestsController],
    providers: [OfficialTestsService, OfficialTestRankingService],
    exports: [OfficialTestsService, OfficialTestRankingService],
})
export class OfficialTestsModule {}
```

5. Explicação do código.

O módulo liga schemas, controller e providers. Sem este registo, o controller não conseguiria receber `OfficialTestRankingService` por injeção de dependências, e o service não conseguiria receber `attemptModel`. O ficheiro preserva `AuthModule` e `SubjectsModule`, porque a sessão e a validação da disciplina continuam a ser dependências reais.

6. Validação do passo.

Resultado esperado: a API compila sem erro de provider em falta, token de Mongoose em falta ou import partido.

7. Cenário negativo/erro esperado.

Se aparecer erro `Nest can't resolve dependencies of OfficialTestRankingService`, confirma se `OfficialTestAttempt` está no `MongooseModule.forFeature(...)` e se `OfficialTestRankingService` está em `providers`.

### Passo 4 - Expor endpoint HTTP no controller

1. Objetivo funcional do passo no contexto da app.

Adicionar rota docente para ranking sem quebrar rotas existentes de criação, listagem e submissão de mini-testes.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`
    - REVER: `apps/api/src/common/guards/session.guard.ts`
    - LOCALIZAÇÃO: ficheiro completo `official-tests.controller.ts`.

3. Instruções do que fazer.

Substitui o controller por esta versão. Mantém o controller em `@Controller("api")`, porque o `BK-MF8-12` já usa rotas docentes e de aluno no mesmo domínio.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-tests.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { SubmitOfficialTestAttemptDto } from "./dto/submit-official-test-attempt.dto.js";
import { OfficialTestRankingService } from "./official-test-ranking.service.js";
import { OfficialTestsService } from "./official-tests.service.js";

/**
 * Endpoints de testes oficiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class OfficialTestsController {
    /**
     * @param testsService Service principal de testes oficiais.
     * @param rankingService Service de ranking docente.
     */
    constructor(
        private readonly testsService: OfficialTestsService,
        private readonly rankingService: OfficialTestRankingService,
    ) {}

    /**
     * Cria teste oficial docente.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina do professor.
     * @param body Dados validados pelo DTO docente.
     * @returns Teste oficial criado.
     */
    @Post("teacher/subjects/:subjectId/tests")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateOfficialTestDto,
    ) {
        return this.testsService.create(request.user!, subjectId, body);
    }

    /**
     * Lista testes oficiais para o professor dono.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina do professor.
     * @returns Testes oficiais da disciplina.
     */
    @Get("teacher/subjects/:subjectId/tests")
    listForTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.testsService.listForTeacher(request.user!, subjectId);
    }

    /**
     * Lista ranking de um mini-teste oficial para professor autorizado.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina do professor.
     * @param testId Mini-teste oficial.
     * @returns Ranking ordenado e minimizado.
     */
    @Get("teacher/subjects/:subjectId/tests/:testId/ranking")
    listRankingForTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
    ) {
        return this.rankingService.listForTeacher(
            request.user!,
            subjectId,
            testId,
        );
    }

    /**
     * Lista testes publicados para aluno inscrito.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina onde o aluno deve estar inscrito.
     * @returns Testes publicados sem respostas corretas.
     */
    @Get("student/subjects/:subjectId/tests")
    listPublishedForStudent(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.testsService.listPublishedForStudent(request.user!, subjectId);
    }

    /**
     * Submete tentativa de aluno para teste oficial publicado.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina onde o aluno está inscrito.
     * @param testId Teste oficial publicado.
     * @param body Respostas escolhidas pelo aluno.
     * @returns Tentativa corrigida no backend.
     */
    @Post("student/subjects/:subjectId/tests/:testId/attempts")
    submitAttempt(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
        @Body() body: SubmitOfficialTestAttemptDto,
    ) {
        return this.testsService.submitStudentAttempt(
            request.user!,
            subjectId,
            testId,
            body,
        );
    }
}
```

5. Explicação do código.

O controller continua fino. Ele não valida professor, turma, disciplina ou ranking; apenas entrega `request.user`, `subjectId` e `testId` ao service. Isto evita duplicar regras críticas no transporte HTTP. A nova rota docente fica antes das rotas de aluno, mas não colide porque o caminho inclui `teacher/.../ranking`.

6. Validação do passo.

Resultado esperado: `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking` chama `OfficialTestRankingService.listForTeacher(...)` e devolve `{ testId, subjectId, classId, rows }`.

7. Cenário negativo/erro esperado.

Se o controller tentar ler `teacherId` do body ou query string, remove esse campo. A identidade vem sempre da sessão autenticada.

### Passo 5 - Criar cliente API e página React

1. Objetivo funcional do passo no contexto da app.

Permitir que o professor veja o ranking no frontend com estados previsíveis e sem decisões de autorização na UI.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/apiClient.ts`
    - CRIAR: `apps/web/src/pages/teacher/OfficialTestRankingPage.tsx`
    - REVER: `apps/web/src/routes/protectedRoutes.tsx`
    - LOCALIZAÇÃO: zona de tipos/funções de testes oficiais no cliente API e ficheiro completo da página.

3. Instruções do que fazer.

Adiciona os tipos e a função ao `apiClient.ts` junto das funções de testes oficiais. Depois cria a página. A rota protegida deve passar `subjectId` e `testId` vindos da URL; se a app ainda não tiver rota final, deixa a página criada e regista a rota no PR como integração a fazer no ficheiro de rotas.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/apiClient.ts
export type OfficialTestRankingRow = {
    position: number;
    studentRef: string;
    displayName: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: string;
};

export type OfficialTestRanking = {
    testId: string;
    subjectId: string;
    classId: string;
    rows: OfficialTestRankingRow[];
};

/**
 * Obtém ranking docente de um mini-teste oficial.
 *
 * @param subjectId Disciplina do professor autenticado.
 * @param testId Mini-teste oficial.
 * @returns Ranking minimizado e autorizado pelo backend.
 */
export function getOfficialTestRanking(
    subjectId: string,
    testId: string,
): Promise<OfficialTestRanking> {
    return requestJson<OfficialTestRanking>(
        `/api/teacher/subjects/${subjectId}/tests/${testId}/ranking`,
    );
}
```

```tsx
// apps/web/src/pages/teacher/OfficialTestRankingPage.tsx
import { useEffect, useState } from "react";
import {
    getOfficialTestRanking,
    OfficialTestRanking,
} from "../../lib/apiClient.js";

type OfficialTestRankingPageProps = {
    subjectId: string;
    testId: string;
};

/**
 * Página docente de ranking de mini-testes oficiais.
 *
 * @param props Identificadores vindos da rota protegida.
 * @returns Tabela de ranking ou estados controlados.
 */
export function OfficialTestRankingPage({
    subjectId,
    testId,
}: OfficialTestRankingPageProps) {
    const [ranking, setRanking] = useState<OfficialTestRanking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        async function loadRanking(): Promise<void> {
            setIsLoading(true);
            setError(null);
            try {
                const loadedRanking = await getOfficialTestRanking(subjectId, testId);
                if (!isActive) return;
                setRanking(loadedRanking);
            } catch (caught) {
                if (!isActive) return;
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar o ranking.",
                );
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        // A página só pede dados; autorização e filtros continuam no backend.
        void loadRanking();

        return () => {
            isActive = false;
        };
    }, [subjectId, testId]);

    if (isLoading) {
        return <p className="sf-panel">A carregar ranking do mini-teste...</p>;
    }

    if (error) {
        return (
            <section className="sf-panel" role="alert">
                <h1 className="text-xl font-bold">Ranking indisponível</h1>
                <p className="sf-error">{error}</p>
            </section>
        );
    }

    if (!ranking || ranking.rows.length === 0) {
        return (
            <section className="sf-panel">
                <h1 className="text-xl font-bold">Ranking do mini-teste</h1>
                <p className="text-sm text-slate-600">
                    Ainda não existem tentativas submetidas para este mini-teste.
                </p>
            </section>
        );
    }

    return (
        <section className="sf-panel space-y-4">
            <div>
                <h1 className="text-xl font-bold">Ranking do mini-teste</h1>
                <p className="text-sm text-slate-600">
                    Resultados ordenados por pontuação. Em empate, aparece primeiro
                    quem submeteu mais cedo.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <caption className="sr-only">
                        Ranking de mini-teste oficial da disciplina
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">Posição</th>
                            <th scope="col">Aluno</th>
                            <th scope="col">Pontuação</th>
                            <th scope="col">Respostas certas</th>
                            <th scope="col">Submissão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.rows.map((row) => (
                            <tr key={`${row.studentRef}-${row.answeredAt}`}>
                                <td>{row.position}</td>
                                <td>{row.displayName}</td>
                                <td>{row.percentage}%</td>
                                <td>
                                    {row.correctAnswers}/{row.totalQuestions}
                                </td>
                                <td>{new Date(row.answeredAt).toLocaleString("pt-PT")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
```

5. Explicação do código.

O cliente API define exatamente a resposta do backend. A página usa `useEffect` para carregar o ranking, mostra carregamento enquanto espera, mostra erro com `role="alert"`, mostra estado vazio quando não há tentativas e apresenta uma tabela acessível no sucesso. A UI não calcula ranking, não filtra turma e não decide se o professor tem acesso; apenas apresenta o que o backend autorizou.

6. Validação do passo.

Resultado esperado: professor autorizado vê tabela; professor sem acesso vê erro controlado; mini-teste sem tentativas mostra estado vazio.

7. Cenário negativo/erro esperado.

Se a UI tentar esconder linhas por `teacherId`, `classId` ou `studentId`, remove essa lógica. O frontend não é fronteira de segurança.

### Passo 6 - Criar testes unitários de ranking

1. Objetivo funcional do passo no contexto da app.

Provar que o ranking bloqueia acessos errados, ordena corretamente e trata empates.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: ficheiro completo de testes unitários.

3. Instruções do que fazer.

Cria a suite abaixo. Ela usa duplos de Jest apenas para isolar o service de base de dados real. Isto é aceitável porque o objetivo é testar regra de domínio, ordem de autorização e ordenação.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    buildOfficialTestRanking,
    OfficialTestRankingService,
} from "./official-test-ranking.service.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439013",
    email: "professor@example.test",
    role: "TEACHER",
};
const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const subjectId = "507f1f77bcf86cd799439014";
const classId = "507f1f77bcf86cd799439015";
const testId = "507f1f77bcf86cd799439016";

describe("buildOfficialTestRanking", () => {
    it("ordena por percentagem desc e data asc em empate", () => {
        const rows = buildOfficialTestRanking([
            attempt("507f1f77bcf86cd799439021", 80, "2026-07-02T10:05:00.000Z"),
            attempt("507f1f77bcf86cd799439022", 90, "2026-07-02T10:10:00.000Z"),
            attempt("507f1f77bcf86cd799439023", 90, "2026-07-02T10:00:00.000Z"),
        ]);

        expect(rows.map((row) => row.studentRef)).toEqual([
            "507f1f77bcf86cd799439023",
            "507f1f77bcf86cd799439022",
            "507f1f77bcf86cd799439021",
        ]);
        expect(rows.map((row) => row.position)).toEqual([1, 2, 3]);
    });
});

describe("OfficialTestRankingService", () => {
    it("bloqueia aluno antes de consultar disciplina", async () => {
        const { subjectsService, testModel, attemptModel, service } = makeService();

        await expect(
            service.listForTeacher(student, subjectId, testId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
        expect(testModel.findOne).not.toHaveBeenCalled();
        expect(attemptModel.find).not.toHaveBeenCalled();
    });

    it("bloqueia professor sem ownership da disciplina", async () => {
        const { subjectsService, testModel, attemptModel, service } = makeService();
        subjectsService.findOwnedSubject.mockRejectedValueOnce(
            new NotFoundException({
                code: "SUBJECT_NOT_FOUND",
                message: "Disciplina não encontrada.",
            }),
        );

        await expect(
            service.listForTeacher(teacher, subjectId, testId),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(testModel.findOne).not.toHaveBeenCalled();
        expect(attemptModel.find).not.toHaveBeenCalled();
    });

    it("devolve ranking minimizado para professor autorizado", async () => {
        const { service } = makeService();

        await expect(
            service.listForTeacher(teacher, subjectId, testId),
        ).resolves.toEqual({
            testId,
            subjectId,
            classId,
            rows: [
                expect.objectContaining({
                    position: 1,
                    displayName: "Aluno 9023",
                    percentage: 90,
                }),
                expect.objectContaining({
                    position: 2,
                    displayName: "Aluno 9022",
                    percentage: 80,
                }),
            ],
        });
    });

    it("bloqueia teste inexistente antes de listar tentativas", async () => {
        const { testModel, attemptModel, service } = makeService();
        testModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.listForTeacher(teacher, subjectId, testId),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(attemptModel.find).not.toHaveBeenCalled();
    });
});

/**
 * Cria uma tentativa para testar ordenação sem base de dados real.
 *
 * @param studentId Aluno da tentativa.
 * @param percentage Percentagem obtida.
 * @param answeredAt Data ISO da submissão.
 * @returns Tentativa compatível com o helper de ranking.
 */
function attempt(studentId: string, percentage: number, answeredAt: string) {
    return {
        studentId,
        correctAnswers: percentage / 10,
        totalQuestions: 10,
        percentage,
        answeredAt: new Date(answeredAt),
    };
}

/**
 * Cria service com dependências observáveis para testar autorização e queries.
 *
 * @returns Service e duplos de modelos.
 */
function makeService() {
    const testModel = {
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: testId,
                subjectId,
                classId,
            }),
        }),
    };
    const attemptModel = {
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    attempt("507f1f77bcf86cd799439022", 80, "2026-07-02T10:05:00.000Z"),
                    attempt("507f1f77bcf86cd799439023", 90, "2026-07-02T10:00:00.000Z"),
                ]),
            }),
        }),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
    };
    const service = new OfficialTestRankingService(
        testModel as never,
        attemptModel as never,
        subjectsService as never,
    );
    return { attemptModel, subjectsService, testModel, service };
}
```

5. Explicação do código.

A suite testa duas camadas. Primeiro testa o helper puro, garantindo a regra de ordenação e empate. Depois testa o service com duplos controlados: aluno é bloqueado antes de qualquer query, professor sem disciplina não lê teste, professor autorizado recebe ranking minimizado e teste inexistente não lista tentativas.

Os duplos de Jest não substituem a implementação final; servem apenas para controlar cenários de unidade. A implementação real continua nos ficheiros de service, controller e module.

6. Validação do passo.

Resultado esperado: a suite passa e prova que a ordem segura é role -> ownership da disciplina -> teste -> tentativas.

7. Cenário negativo/erro esperado.

Se o teste "bloqueia aluno antes de consultar disciplina" falhar porque `findOwnedSubject` foi chamado, a ordem de segurança está errada. Corrige o service para validar role antes de qualquer leitura.

### Passo 7 - Validar, recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com validação textual, técnica e pedagógica suficiente para PR e defesa.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - LOCALIZAÇÃO: secções de validação final, evidence e handoff.

3. Instruções do que fazer.

Executa ou prepara estes comandos no PR:

- `npm run test:unit -- official-test-ranking`
- `git diff --check`
- `bash scripts/validate-planificacao.sh`
- pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`
- pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`

Regista no PR:

- expected result;
- observed result;
- negativo testado;
- ficheiros alterados;
- risco residual;
- impacto no `BK-MF8-14`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de validação e evidence. O código novo já foi criado nos passos anteriores.

5. Explicação do código.

Não há código neste passo. A entrega é prova objetiva: o professor consegue ver que ranking, endpoint, UI e testes foram tratados sem expor dados sensíveis.

6. Validação do passo.

Resultado esperado: pesquisas textuais sem termos proibidos, `git diff --check` sem erros, validador de planificação a passar e suite unitária de ranking a passar.

7. Cenário negativo/erro esperado.

Se `npm run test:unit -- official-test-ranking` não existir no projeto, executa a suite unitária equivalente da API e regista o comando real usado. Não marques o BK como concluído se não houver evidence mínima dos negativos críticos.

#### Critérios de aceite

- Header e metadados iguais à matriz, backlog e contrato de campos.
- `BK-MF8-13` consome o contrato de `OfficialTestAttempt` entregue pelo `BK-MF8-12`.
- `OfficialTestRankingService` valida professor antes de qualquer query sensível.
- `SubjectsService.findOwnedSubject(...)` valida ownership docente da disciplina.
- A query de tentativas filtra por `testId`, `subjectId` e `classId`.
- O ranking ordena por `percentage` descendente e `answeredAt` ascendente em empate.
- A resposta não devolve respostas completas, email completo, cookies, sessão ou dados excessivos.
- `OfficialTestsController` expõe `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
- `apiClient.ts` tem tipos e função `getOfficialTestRanking(...)`.
- `OfficialTestRankingPage` cobre loading, vazio, erro e sucesso.
- A tabela usa `caption`, cabeçalhos e texto PT-PT compreensível.
- A suite `official-test-ranking.service.spec.ts` cobre professor errado, ownership, ordenação e teste inexistente.
- Não há caminhos privados, linguagem de trabalho, funções por implementar, payloads sem tipo explícito ou casts perigosos.

#### Validação final

- Executar a pesquisa de termos proibidos indicada na prompt sobre `docs/planificacao/guias-bk/MF8/*.md`.
- Executar a pesquisa de caminhos privados indicada na prompt sobre `docs/planificacao/guias-bk/MF8/*.md`.
- Executar validação de whitespace:
  - `git diff --check`
- Executar validação documental:
  - `bash scripts/validate-planificacao.sh`
- Executar teste unitário focado:
  - `npm run test:unit -- official-test-ranking`

Erros comuns a evitar:

- devolver `results` completos das tentativas no ranking;
- ordenar no frontend;
- consultar tentativas antes de validar professor;
- usar email completo como nome visível;
- esquecer `OfficialTestAttempt` no módulo;
- criar endpoint paralelo fora de `official-tests`.

#### Evidence para PR/defesa

- `proof`: output da suite `official-test-ranking.service.spec.ts`.
- `proof`: request `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking` com professor autorizado.
- `neg`: professor com role diferente de `TEACHER` recebe `TEACHER_ROLE_REQUIRED`.
- `neg`: professor sem ownership da disciplina não recebe linhas.
- `neg`: teste inexistente não consulta tentativas.
- `ui`: screenshot da página com estado vazio e tabela preenchida com dados fictícios.
- `privacy`: confirmação de que o ranking não devolve respostas completas nem email completo.
- `handoff`: nota a indicar que `BK-MF8-14` pode continuar sem depender de analytics avançado.

#### Handoff

O próximo BK é `BK-MF8-14`. Ele pode assumir que o professor tem uma forma segura de consultar ranking de mini-testes oficiais, mas não deve depender de ranking público para alunos nem de dashboard avançado.

O contrato entregue por este BK é:

- `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`;
- `OfficialTestRankingService`;
- `buildOfficialTestRanking(...)`;
- `getOfficialTestRanking(...)`;
- `OfficialTestRankingPage`;
- testes unitários de autorização e ordenação.

#### Changelog

- `2026-07-02`: guia reforçado com service, módulo, controller, cliente API, página React e suite Jest de ranking, substituindo a integração genérica por um fluxo completo.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com estrutura completa, caminhos públicos, decisões CANONICO/DERIVADO, validação por passo, negativos e handoff.
