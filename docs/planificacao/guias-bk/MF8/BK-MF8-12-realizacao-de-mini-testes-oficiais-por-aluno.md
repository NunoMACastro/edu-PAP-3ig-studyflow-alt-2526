# BK-MF8-12 - Realização de mini-testes oficiais por aluno.

## Header

- `doc_id`: `GUIA-BK-MF8-12`
- `bk_id`: `BK-MF8-12`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-04`
- `rf_rnf`: `RF28`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-13`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais permitir que um aluno inscrito numa disciplina realize um mini-teste oficial publicado pelo professor, envie as respostas pela sessão autenticada e receba uma pontuação calculada no backend.

O resultado do professor continua intacto: o `OfficialTest` criado em `BK-MF2-04` é a versão oficial read-only, e este BK cria uma tentativa separada do aluno para que `BK-MF8-13` consiga construir rankings sem alterar a prova original.

#### Importância

`RF28` é CANONICO na planificação StudyFlow: professores criam testes/mini-testes oficiais. `BK-MF2-04` implementou a criação docente, mas deixou fora do seu scope a realização pelo aluno e a correção automática.

Este BK fecha essa lacuna funcional. Sem ele, a app tem testes oficiais, mas não tem execução avaliativa real por aluno, nem pontuação própria para alimentar rankings, métricas ou evidence de defesa.

#### Scope-in

- Listar para o aluno apenas testes oficiais `PUBLISHED` da disciplina onde está inscrito.
- Submeter respostas de escolha múltipla para `POST /api/student/subjects/:subjectId/tests/:testId/attempts`.
- Validar no backend que o aluno está inscrito na turma da disciplina.
- Calcular pontuação no backend a partir da versão oficial criada pelo professor.
- Persistir a tentativa separada do `OfficialTest`.
- Mostrar na UI os estados de carregamento, vazio, erro, submissão e resultado.
- Criar testes focados para aluno não inscrito, teste não publicado e pontuação calculada.

#### Scope-out

- Criar ou editar testes oficiais do professor.
- Alterar `RF28`, owner, apoio, prioridade, sprint, esforço, dependência ou próximo BK.
- Criar rankings globais, tabelas comparativas ou métricas de turma; isso fica para `BK-MF8-13`.
- Expor respostas corretas antes da submissão do aluno.
- Aceitar `studentId`, `classId`, role, membership ou pontuação calculada vindos do frontend.
- Guardar tokens, cookies, dados pessoais desnecessários ou conteúdo integral do teste em logs.

#### Estado antes e depois

- Estado antes: a app já tem `OfficialTestsModule` com criação/listagem docente de testes oficiais por disciplina, mas o aluno ainda não tem fluxo completo para realizar um teste publicado.
- Estado depois: a app passa a ter listagem segura de testes publicados para aluno inscrito, submissão de tentativa, correção backend, persistência de resultado próprio, UI de realização e testes negativos focados.

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `apps/api/src/modules/official-tests/official-tests.module.ts`
- `apps/api/src/modules/official-tests/official-tests.controller.ts`
- `apps/api/src/modules/official-tests/official-tests.service.ts`
- `apps/api/src/modules/official-tests/schemas/official-test.schema.ts`
- `apps/api/src/modules/subjects/subjects.service.ts`
- `apps/web/src/lib/apiClient.ts`

#### Glossário

- **Teste oficial:** mini-teste criado por professor numa disciplina oficial.
- **Tentativa:** submissão concreta de um aluno para um teste publicado.
- **Teste publicado:** `OfficialTest` com `status: "PUBLISHED"`, visível para alunos inscritos.
- **Teste em rascunho:** `OfficialTest` com `status: "DRAFT"`, visível apenas ao professor.
- **Disciplina:** unidade oficial associada a uma turma, criada por professor.
- **Aluno inscrito:** aluno pertencente à turma da disciplina; a validação acontece no backend.
- **Pontuação backend:** cálculo feito no service, nunca no frontend.
- **Resposta correta oculta:** a UI do aluno não recebe `correctOptionIndex` antes de submeter.
- **Evidence:** prova objetiva de execução sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Versão oficial vs tentativa.** A versão oficial vem do professor e fica guardada em `OfficialTest`. A tentativa vem do aluno e fica guardada em `OfficialTestAttempt`. Esta separação evita que uma resposta do aluno altere a prova original.
- **Autorização por inscrição.** O aluno não escolhe a turma no body. O backend chama `SubjectsService.findSubjectForStudent(...)`, que confirma que a disciplina existe e que o aluno pertence à turma correspondente.
- **DTO.** O DTO limita o formato de entrada. Aqui recebe apenas `selectedOptionIndexes`, uma lista de índices escolhidos pelo aluno.
- **Schema/model.** O schema da tentativa guarda IDs mínimos, respostas, pontuação e data. Isto prepara o ranking sem expor mais dados do que o necessário.
- **Controller fino.** O controller recebe sessão, parâmetros e body, mas não decide permissões nem pontuação. Essa decisão fica no service.
- **Service de domínio.** O service valida role, inscrição, estado publicado, número de respostas e persistência. Isto evita regras duplicadas em componentes React.
- **Frontend tipado.** A UI usa tipos claros e `requestJson(...)`, que centraliza `credentials: "include"` e o marcador CSRF.
- **Privacidade.** Antes da submissão, o aluno vê enunciados e opções, mas não recebe índices corretos. Depois da submissão, recebe a correção da sua própria tentativa.
- **Teste negativo.** Um teste negativo prova que a app falha bem: aluno não inscrito, teste em rascunho e respostas incompletas não podem passar.

#### Arquitetura do BK

- Requisito canónico: `RF28`.
- Dependência principal: `BK-MF2-04`, que criou testes oficiais por professor.
- Endpoints novos:
  - `GET /api/student/subjects/:subjectId/tests`
  - `POST /api/student/subjects/:subjectId/tests/:testId/attempts`
- Backend:
  - DTO `SubmitOfficialTestAttemptDto`;
  - schema `OfficialTestAttempt`;
  - helper `scoreOfficialTestAttempt(...)`;
  - extensão de `OfficialTestsService`;
  - extensão de `OfficialTestsController`;
  - registo do schema no `OfficialTestsModule`.
- Frontend:
  - tipos e funções em `apps/web/src/lib/apiClient.ts`;
  - página `OfficialTestAttemptPage`.
- Testes:
  - aluno não inscrito;
  - teste `DRAFT` bloqueado;
  - pontuação calculada e persistida.
- Decisões `CANONICO`:
  - `RF28`;
  - dependência `BK-MF2-04`;
  - próximo BK `BK-MF8-13`.
- Decisões `DERIVADO`:
  - criar `OfficialTestAttempt` separado de `OfficialTest`;
  - listar testes publicados para aluno por endpoint próprio;
  - ocultar `correctOptionIndex` antes da submissão;
  - calcular pontuação no backend.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
- CRIAR: `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
- CRIAR: `apps/api/src/modules/official-tests/official-test-attempt-scoring.ts`
- EDITAR: `apps/api/src/modules/official-tests/official-tests.module.ts`
- EDITAR: `apps/api/src/modules/official-tests/official-tests.service.ts`
- EDITAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`
- EDITAR: `apps/api/src/modules/official-tests/official-tests.service.spec.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- CRIAR: `apps/web/src/pages/student/OfficialTestAttemptPage.tsx`
- REVER: `apps/api/src/modules/subjects/subjects.service.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e limites de segurança

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK continua alinhado com `RF28`, consome `BK-MF2-04` e prepara `BK-MF8-13` sem inventar requisitos novos.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
    - LOCALIZAÇÃO: linhas de `BK-MF8-12`, `RF28`, `BK-MF2-04` e `BK-MF8-13`.

3. Instruções do que fazer.

Confirma estes pontos antes de tocar no código:

- `BK-MF8-12` mantém owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, sprint `S12`, dependência `BK-MF2-04` e próximo BK `BK-MF8-13`.
- `BK-MF2-04` criou testes oficiais docentes, mas não realizou tentativas de aluno.
- `BK-MF8-13` precisa de tentativas persistidas para construir rankings.
- O aluno só acede a testes de uma disciplina se estiver inscrito na turma dessa disciplina.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e impede que a correção altere IDs, requisitos ou ownership fora do scope.

5. Explicação do código.

Não há código neste passo. A validação documental evita dois erros comuns: transformar este BK em criação docente de testes, que já existe em `BK-MF2-04`, ou antecipar rankings, que pertencem a `BK-MF8-13`.

6. Validação do passo.

Resultado esperado: os documentos canónicos continuam a apontar `BK-MF8-12` para `RF28`, `BK-MF2-04` e `BK-MF8-13`.

7. Cenário negativo/erro esperado.

Se encontrares divergência entre matriz, backlog e contrato de campos, não alteres metadados no guia. Regista `BLOQUEADO_POR_CONTRATO` no relatório da MF8.

### Passo 2 - Criar DTO, schema e módulo da tentativa

1. Objetivo funcional do passo no contexto da app.

Criar o contrato de entrada e a persistência da tentativa oficial do aluno sem alterar o `OfficialTest` do professor.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
    - CRIAR: `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
    - EDITAR: `apps/api/src/modules/official-tests/official-tests.module.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Cria o DTO com uma lista de índices escolhidos pelo aluno. Depois cria o schema `OfficialTestAttempt` com `studentId`, `subjectId`, `classId`, `testId`, respostas, pontuação e data. Por fim, regista o novo schema no módulo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsInt,
    Max,
    Min,
} from "class-validator";

/**
 * DTO usado quando um aluno submete respostas para um teste oficial publicado.
 *
 * O frontend envia apenas índices de opções. O backend obtém `studentId`,
 * `subjectId`, `classId`, perguntas e respostas corretas a partir da sessão
 * e da base de dados, evitando manipulação de identidade ou pontuação.
 */
export class SubmitOfficialTestAttemptDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(60)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(3, { each: true })
    selectedOptionIndexes!: number[];
}
```

```ts
// apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Resultado de uma pergunta dentro de uma tentativa oficial.
 */
export type OfficialTestAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
};

/**
 * Documento Mongoose de tentativas oficiais de aluno.
 */
export type OfficialTestAttemptDocument = HydratedDocument<OfficialTestAttempt>;

/**
 * Tentativa persistida de um aluno sobre um teste oficial publicado.
 */
@Schema({ timestamps: true, collection: "official_test_attempts" })
export class OfficialTestAttempt {
    @Prop({ type: Types.ObjectId, ref: "OfficialTest", required: true, index: true })
    testId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: [Number], required: true })
    selectedOptionIndexes!: number[];

    @Prop({ required: true, min: 0 })
    correctAnswers!: number;

    @Prop({ required: true, min: 1 })
    totalQuestions!: number;

    @Prop({ required: true, min: 0, max: 100 })
    percentage!: number;

    @Prop({ type: [Object], required: true })
    results!: OfficialTestAttemptQuestionResult[];

    @Prop({ required: true })
    answeredAt!: Date;
}

export const OfficialTestAttemptSchema =
    SchemaFactory.createForClass(OfficialTestAttempt);

OfficialTestAttemptSchema.index({ testId: 1, studentId: 1, answeredAt: -1 });
OfficialTestAttemptSchema.index({ subjectId: 1, percentage: -1, answeredAt: 1 });
```

```ts
// apps/api/src/modules/official-tests/official-tests.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { OfficialTestsController } from "./official-tests.controller.js";
import { OfficialTestsService } from "./official-tests.service.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "./schemas/official-test-attempt.schema.js";
import { OfficialTest, OfficialTestSchema } from "./schemas/official-test.schema.js";

/**
 * Módulo de testes oficiais.
 *
 * Regista o teste oficial criado pelo professor e a tentativa separada
 * criada pelo aluno, preservando a versão oficial sem alterações.
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
    providers: [OfficialTestsService],
    exports: [OfficialTestsService],
})
export class OfficialTestsModule {}
```

5. Explicação do código.

O DTO aceita apenas `selectedOptionIndexes`, porque a identidade do aluno e a disciplina são obtidas a partir da sessão e da rota. O schema guarda a tentativa numa coleção própria para não alterar o `OfficialTest` criado pelo professor. Os índices ajudam o próximo BK a consultar resultados por teste, aluno e disciplina sem varrer toda a coleção.

6. Validação do passo.

Resultado esperado: o módulo compila, o schema fica registado no `MongooseModule` e o DTO rejeita listas vazias, respostas fora de `0..3` e arrays demasiado grandes.

7. Cenário negativo/erro esperado.

Se o frontend tentar enviar `studentId`, `classId` ou pontuação, esses campos não existem no DTO e não devem ser usados pelo service.

### Passo 3 - Criar cálculo de pontuação e vistas públicas

1. Objetivo funcional do passo no contexto da app.

Criar uma função pequena e testável para calcular pontuação no backend e definir que dados o aluno pode ver antes e depois da tentativa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/official-tests/official-test-attempt-scoring.ts`
    - EDITAR: `apps/api/src/modules/official-tests/official-tests.service.ts`
    - LOCALIZAÇÃO: helper completo e tipos públicos no topo do service.

3. Instruções do que fazer.

Cria o helper de cálculo. No service, usa tipos separados: a listagem do aluno não expõe `correctOptionIndex`; a resposta da tentativa pode mostrar a correção da tentativa do próprio aluno.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-test-attempt-scoring.ts
import { BadRequestException } from "@nestjs/common";
import { OfficialTestQuestion } from "./schemas/official-test.schema.js";

export type OfficialTestAttemptScore = {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
};

/**
 * Calcula a pontuação de uma tentativa oficial.
 *
 * @param questions Perguntas oficiais publicadas pelo professor.
 * @param selectedOptionIndexes Índices escolhidos pelo aluno autenticado.
 * @returns Pontuação agregada da tentativa.
 * @throws BadRequestException quando o número de respostas não corresponde ao teste.
 */
export function scoreOfficialTestAttempt(
    questions: OfficialTestQuestion[],
    selectedOptionIndexes: number[],
): OfficialTestAttemptScore {
    if (questions.length !== selectedOptionIndexes.length) {
        throw new BadRequestException({
            code: "OFFICIAL_TEST_ATTEMPT_INCOMPLETE",
            message: "Responde a todas as perguntas antes de submeter o mini-teste.",
        });
    }

    const correctAnswers = questions.reduce((total, question, index) => {
        const selectedOptionIndex = selectedOptionIndexes[index];
        return total + (question.correctOptionIndex === selectedOptionIndex ? 1 : 0);
    }, 0);

    // A percentagem é calculada no backend para impedir manipulação pela interface.
    const percentage = Math.round((correctAnswers / questions.length) * 100);

    return {
        totalQuestions: questions.length,
        correctAnswers,
        percentage,
    };
}
```

```ts
// apps/api/src/modules/official-tests/official-tests.service.ts
export type OfficialTestStudentQuestionView = {
    statement: string;
    topic?: string;
    options: string[];
};

export type OfficialTestStudentView = {
    _id: string;
    subjectId: string;
    classId: string;
    title: string;
    description?: string;
    questions: OfficialTestStudentQuestionView[];
    createdAt?: Date;
};

export type OfficialTestAttemptView = {
    _id: string;
    testId: string;
    subjectId: string;
    classId: string;
    studentId: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    results: OfficialTestAttemptQuestionResult[];
    answeredAt: Date;
};
```

5. Explicação do código.

O helper transforma uma lista de respostas numa pontuação agregada. Se faltarem respostas, lança erro controlado antes de persistir a tentativa. As vistas públicas separam o que o aluno vê antes da submissão e o que recebe depois da submissão, evitando que `correctOptionIndex` seja enviado cedo.

6. Validação do passo.

Resultado esperado: o helper devolve `correctAnswers`, `totalQuestions` e `percentage`, e falha com `OFFICIAL_TEST_ATTEMPT_INCOMPLETE` quando o aluno envia menos respostas do que perguntas.

7. Cenário negativo/erro esperado.

Se a listagem do aluno devolver `correctOptionIndex`, a UI revela a prova antes da resposta. Corrige a vista pública antes de continuar.

### Passo 4 - Integrar service e regras backend

1. Objetivo funcional do passo no contexto da app.

Implementar as regras de domínio: listar testes publicados para aluno inscrito e submeter tentativa com pontuação persistida.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/official-tests/official-tests.service.ts`
    - REVER: `apps/api/src/modules/subjects/subjects.service.ts`
    - LOCALIZAÇÃO: ficheiro completo `official-tests.service.ts`.

3. Instruções do que fazer.

Substitui o service pelo código abaixo. Preserva a criação/listagem docente já criada em `BK-MF2-04` e adiciona métodos de aluno sem duplicar o conceito de teste oficial.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-tests.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { SubmitOfficialTestAttemptDto } from "./dto/submit-official-test-attempt.dto.js";
import { scoreOfficialTestAttempt } from "./official-test-attempt-scoring.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptDocument,
    OfficialTestAttemptQuestionResult,
} from "./schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestDocument,
    OfficialTestQuestion,
    OfficialTestStatus,
} from "./schemas/official-test.schema.js";

export type OfficialTestView = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    description?: string;
    status: OfficialTestStatus;
    questions: OfficialTestQuestion[];
    createdAt?: Date;
};

export type OfficialTestStudentQuestionView = {
    statement: string;
    topic?: string;
    options: string[];
};

export type OfficialTestStudentView = {
    _id: string;
    subjectId: string;
    classId: string;
    title: string;
    description?: string;
    questions: OfficialTestStudentQuestionView[];
    createdAt?: Date;
};

export type OfficialTestAttemptView = {
    _id: string;
    testId: string;
    subjectId: string;
    classId: string;
    studentId: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    results: OfficialTestAttemptQuestionResult[];
    answeredAt: Date;
};

/**
 * Serviço de testes oficiais por disciplina.
 */
@Injectable()
export class OfficialTestsService {
    /**
     * @param testModel Modelo dos testes oficiais criados por professores.
     * @param attemptModel Modelo das tentativas submetidas por alunos.
     * @param subjectsService Service de disciplinas usado para validar ownership e inscrição.
     */
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly testModel: Model<OfficialTestDocument>,
        @InjectModel(OfficialTestAttempt.name)
        private readonly attemptModel: Model<OfficialTestAttemptDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Cria um teste oficial depois de validar ownership docente.
     *
     * @param actor Professor autenticado.
     * @param subjectId Disciplina do professor.
     * @param input Payload validado pelo DTO docente.
     * @returns Teste oficial criado.
     */
    async create(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateOfficialTestDto,
    ): Promise<OfficialTestView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const questions = input.questions.map((question) =>
            this.normalizeQuestion(question),
        );
        const test = await this.testModel.create({
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(subject.classId),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            description: input.description?.trim(),
            status: input.status ?? "DRAFT",
            questions,
        });
        return this.toTeacherView(test.toObject());
    }

    /**
     * Lista testes oficiais para o professor dono da disciplina.
     *
     * @param actor Professor autenticado.
     * @param subjectId Disciplina do professor.
     * @returns Testes oficiais da disciplina.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialTestView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const tests = await this.testModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return tests.map((test) => this.toTeacherView(test));
    }

    /**
     * Lista testes publicados para um aluno inscrito na disciplina.
     *
     * @param actor Aluno autenticado pela sessão.
     * @param subjectId Disciplina pedida.
     * @returns Testes publicados sem expor respostas corretas.
     */
    async listPublishedForStudent(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialTestStudentView[]> {
        this.assertStudent(actor);
        const { subject } = await this.subjectsService.findSubjectForStudent(
            actor.id,
            subjectId,
        );
        const tests = await this.testModel
            .find({
                subjectId: new Types.ObjectId(subject._id),
                status: "PUBLISHED",
            })
            .sort({ createdAt: -1 })
            .lean();

        // A vista do aluno remove `correctOptionIndex` para não revelar a prova antes da submissão.
        return tests.map((test) => this.toStudentView(test));
    }

    /**
     * Submete uma tentativa oficial e calcula pontuação no backend.
     *
     * @param actor Aluno autenticado pela sessão.
     * @param subjectId Disciplina da tentativa.
     * @param testId Teste publicado escolhido pelo aluno.
     * @param input Respostas escolhidas pelo aluno.
     * @returns Tentativa persistida com correção da própria submissão.
     */
    async submitStudentAttempt(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
        input: SubmitOfficialTestAttemptDto,
    ): Promise<OfficialTestAttemptView> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(testId)) throw this.officialTestNotFound();

        const { subject, schoolClass } =
            await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                subjectId: new Types.ObjectId(subject._id),
                status: "PUBLISHED",
            })
            .lean();

        if (!test) throw this.officialTestNotFound();

        this.validateAttemptAnswers(input.selectedOptionIndexes, test.questions);
        const score = scoreOfficialTestAttempt(
            test.questions,
            input.selectedOptionIndexes,
        );
        const results = this.buildQuestionResults(
            test.questions,
            input.selectedOptionIndexes,
        );

        const attempt = await this.attemptModel.create({
            testId: new Types.ObjectId(test._id),
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(schoolClass._id),
            // O studentId vem sempre da sessão, nunca do body enviado pelo frontend.
            studentId: new Types.ObjectId(actor.id),
            selectedOptionIndexes: input.selectedOptionIndexes,
            correctAnswers: score.correctAnswers,
            totalQuestions: score.totalQuestions,
            percentage: score.percentage,
            results,
            answeredAt: new Date(),
        });

        return this.toAttemptView(attempt.toObject());
    }

    /**
     * Conta testes publicados por disciplina para painéis de progresso.
     *
     * @param subjectIds Disciplinas a contabilizar.
     * @returns Número de testes publicados.
     */
    async countPublishedBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.testModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status: "PUBLISHED",
        });
    }

    /**
     * Normaliza uma pergunta oficial antes de persistir.
     *
     * @param question Pergunta recebida do DTO docente.
     * @returns Pergunta normalizada.
     */
    private normalizeQuestion(question: OfficialTestQuestion): OfficialTestQuestion {
        const options = question.options.map((option) => option.trim());
        if (new Set(options).size !== options.length || options.some((option) => !option)) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_TEST_OPTIONS",
                message: "Cada pergunta deve ter quatro opções distintas e preenchidas.",
            });
        }
        return {
            statement: question.statement.trim(),
            topic: question.topic?.trim(),
            options,
            correctOptionIndex: question.correctOptionIndex,
        };
    }

    /**
     * Garante que cada resposta aponta para uma opção existente.
     *
     * @param selectedOptionIndexes Respostas submetidas pelo aluno.
     * @param questions Perguntas oficiais publicadas.
     * @throws BadRequestException quando falta uma resposta ou o índice não existe.
     */
    private validateAttemptAnswers(
        selectedOptionIndexes: number[],
        questions: OfficialTestQuestion[],
    ): void {
        if (selectedOptionIndexes.length !== questions.length) {
            throw new BadRequestException({
                code: "OFFICIAL_TEST_ATTEMPT_INCOMPLETE",
                message: "Responde a todas as perguntas antes de submeter o mini-teste.",
            });
        }

        const invalidIndex = selectedOptionIndexes.findIndex(
            (selectedOptionIndex, questionIndex) =>
                selectedOptionIndex < 0 ||
                selectedOptionIndex >= questions[questionIndex].options.length,
        );
        if (invalidIndex >= 0) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_TEST_ANSWER",
                message: "Uma das respostas não corresponde a nenhuma opção do mini-teste.",
            });
        }
    }

    /**
     * Constrói a correção pergunta a pergunta da tentativa.
     *
     * @param questions Perguntas oficiais publicadas.
     * @param selectedOptionIndexes Respostas do aluno.
     * @returns Resultados individuais da tentativa.
     */
    private buildQuestionResults(
        questions: OfficialTestQuestion[],
        selectedOptionIndexes: number[],
    ): OfficialTestAttemptQuestionResult[] {
        return questions.map((question, questionIndex) => {
            const selectedOptionIndex = selectedOptionIndexes[questionIndex];
            return {
                questionIndex,
                selectedOptionIndex,
                correctOptionIndex: question.correctOptionIndex,
                isCorrect: selectedOptionIndex === question.correctOptionIndex,
            };
        });
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
     * Confirma que o utilizador autenticado é aluno.
     *
     * @param actor Utilizador autenticado.
     */
    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    /**
     * Cria erro estável para testes oficiais não disponíveis ao aluno.
     *
     * @returns Exceção HTTP 404.
     */
    private officialTestNotFound(): NotFoundException {
        return new NotFoundException({
            code: "OFFICIAL_TEST_NOT_FOUND",
            message: "Mini-teste oficial não encontrado ou ainda não publicado.",
        });
    }

    /**
     * Converte documento interno para vista docente.
     *
     * @param test Documento ou objeto lean de teste oficial.
     * @returns Vista docente com respostas corretas.
     */
    private toTeacherView(test: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        description?: string;
        status: OfficialTestStatus;
        questions: OfficialTestQuestion[];
        createdAt?: Date;
    }): OfficialTestView {
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            classId: String(test.classId),
            teacherId: String(test.teacherId),
            title: test.title,
            description: test.description,
            status: test.status,
            questions: test.questions,
            createdAt: test.createdAt,
        };
    }

    /**
     * Converte documento interno para vista segura do aluno.
     *
     * @param test Documento ou objeto lean de teste oficial.
     * @returns Vista sem respostas corretas.
     */
    private toStudentView(test: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        title: string;
        description?: string;
        questions: OfficialTestQuestion[];
        createdAt?: Date;
    }): OfficialTestStudentView {
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            classId: String(test.classId),
            title: test.title,
            description: test.description,
            questions: test.questions.map((question) => ({
                statement: question.statement,
                topic: question.topic,
                options: question.options,
            })),
            createdAt: test.createdAt,
        };
    }

    /**
     * Converte tentativa persistida para resposta pública da própria submissão.
     *
     * @param attempt Documento ou objeto de tentativa.
     * @returns Vista pública da tentativa.
     */
    private toAttemptView(attempt: {
        _id: unknown;
        testId: unknown;
        subjectId: unknown;
        classId: unknown;
        studentId: unknown;
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        results: OfficialTestAttemptQuestionResult[];
        answeredAt: Date;
    }): OfficialTestAttemptView {
        return {
            _id: String(attempt._id),
            testId: String(attempt.testId),
            subjectId: String(attempt.subjectId),
            classId: String(attempt.classId),
            studentId: String(attempt.studentId),
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage,
            results: attempt.results,
            answeredAt: attempt.answeredAt,
        };
    }
}
```

5. Explicação do código.

O service mantém os métodos docentes já existentes e adiciona dois métodos de aluno. `listPublishedForStudent(...)` confirma a inscrição antes de listar apenas testes publicados e remove respostas corretas. `submitStudentAttempt(...)` valida role, inscrição, teste publicado, número de respostas e índices válidos antes de persistir. O cálculo e o `studentId` ficam no backend, reduzindo risco de fraude, exposição de respostas e acesso cruzado.

6. Validação do passo.

Resultado esperado: aluno inscrito recebe testes publicados sem `correctOptionIndex`; aluno inscrito consegue submeter tentativa; aluno não inscrito ou teste em rascunho recebe erro controlado.

7. Cenário negativo/erro esperado.

Se a UI enviar respostas para um teste `DRAFT`, o service deve devolver `OFFICIAL_TEST_NOT_FOUND`, sem guardar tentativa.

### Passo 5 - Expor endpoints HTTP e cliente API tipado

1. Objetivo funcional do passo no contexto da app.

Ligar o service a rotas HTTP reais e criar funções frontend que usam cookies HttpOnly via `requestJson(...)`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`
    - EDITAR: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: controller completo e zona de tipos/funções de testes oficiais no cliente API.

3. Instruções do que fazer.

Substitui o controller por uma versão com rotas docentes e rotas de aluno. Depois adiciona ao `apiClient.ts` os tipos e funções de aluno.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-tests.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { SubmitOfficialTestAttemptDto } from "./dto/submit-official-test-attempt.dto.js";
import { OfficialTestsService } from "./official-tests.service.js";

/**
 * Endpoints de testes oficiais.
 *
 * O controller mantém rotas docentes e de aluno no mesmo domínio para evitar
 * controllers paralelos com regras duplicadas.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class OfficialTestsController {
    /**
     * @param testsService Service de domínio com regras de testes oficiais.
     */
    constructor(private readonly testsService: OfficialTestsService) {}

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

```ts
// apps/web/src/lib/apiClient.ts
export type OfficialTestForStudentQuestion = {
    statement: string;
    topic?: string;
    options: string[];
};

export type OfficialTestForStudent = {
    _id: string;
    subjectId: string;
    classId: string;
    title: string;
    description?: string;
    questions: OfficialTestForStudentQuestion[];
    createdAt?: string;
};

export type OfficialTestAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
};

export type OfficialTestAttemptResult = {
    _id: string;
    testId: string;
    subjectId: string;
    classId: string;
    studentId: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    results: OfficialTestAttemptQuestionResult[];
    answeredAt: string;
};

/**
 * Lista mini-testes oficiais publicados para um aluno inscrito.
 *
 * @param subjectId Disciplina oficial do aluno.
 * @returns Testes publicados sem respostas corretas.
 */
export function listPublishedOfficialTests(
    subjectId: string,
): Promise<OfficialTestForStudent[]> {
    return requestJson<OfficialTestForStudent[]>(
        `/api/student/subjects/${subjectId}/tests`,
    );
}

/**
 * Submete respostas de aluno para correção backend.
 *
 * @param subjectId Disciplina oficial do aluno.
 * @param testId Teste oficial publicado.
 * @param selectedOptionIndexes Índices escolhidos pelo aluno.
 * @returns Tentativa corrigida no backend.
 */
export function submitOfficialTestAttempt(
    subjectId: string,
    testId: string,
    selectedOptionIndexes: number[],
): Promise<OfficialTestAttemptResult> {
    return requestJson<OfficialTestAttemptResult>(
        `/api/student/subjects/${subjectId}/tests/${testId}/attempts`,
        {
            method: "POST",
            body: JSON.stringify({ selectedOptionIndexes }),
        },
    );
}
```

5. Explicação do código.

O controller usa `@Controller("api")` para preservar as rotas docentes existentes e acrescentar rotas de aluno sem duplicar classes. O cliente API acrescenta tipos específicos para aluno: antes da submissão não existe `correctOptionIndex`; depois da submissão existe resultado da própria tentativa. `requestJson(...)` já centraliza `credentials: "include"`, por isso a página não guarda tokens.

6. Validação do passo.

Resultado esperado: as rotas docentes continuam com os mesmos caminhos, e o aluno passa a ter `GET /api/student/subjects/:subjectId/tests` e `POST /api/student/subjects/:subjectId/tests/:testId/attempts`.

7. Cenário negativo/erro esperado.

Se uma chamada frontend tentar decidir localmente se o aluno pertence à turma, remove essa lógica. A UI só mostra estados; o backend decide acesso.

### Passo 6 - Criar página React de realização do mini-teste

1. Objetivo funcional do passo no contexto da app.

Permitir que o aluno escolha um mini-teste publicado, responda às perguntas e veja a sua pontuação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/student/OfficialTestAttemptPage.tsx`
    - REVER: `apps/web/src/routes/protectedRoutes.tsx`
    - LOCALIZAÇÃO: componente completo e rota protegida de aluno.

3. Instruções do que fazer.

Cria a página abaixo. Depois liga-a à rota de aluno que a app já usa para páginas protegidas, passando `subjectId` da URL.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/student/OfficialTestAttemptPage.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    listPublishedOfficialTests,
    OfficialTestAttemptResult,
    OfficialTestForStudent,
    submitOfficialTestAttempt,
} from "../../lib/apiClient.js";

type OfficialTestAttemptPageProps = {
    subjectId: string;
};

/**
 * Página de aluno para realização de mini-testes oficiais publicados.
 *
 * @param props Propriedades da rota protegida.
 * @returns Interface com listagem, formulário de respostas e resultado.
 */
export function OfficialTestAttemptPage({ subjectId }: OfficialTestAttemptPageProps) {
    const [tests, setTests] = useState<OfficialTestForStudent[]>([]);
    const [selectedTestId, setSelectedTestId] = useState("");
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<OfficialTestAttemptResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedTest = useMemo(
        () => tests.find((test) => test._id === selectedTestId) ?? null,
        [tests, selectedTestId],
    );

    useEffect(() => {
        let isActive = true;

        async function loadTests(): Promise<void> {
            setIsLoading(true);
            setError(null);
            try {
                const publishedTests = await listPublishedOfficialTests(subjectId);
                if (!isActive) return;
                setTests(publishedTests);
                setSelectedTestId(publishedTests[0]?._id ?? "");
                setAnswers({});
                setResult(null);
            } catch (caught) {
                if (!isActive) return;
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar os mini-testes.",
                );
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        void loadTests();

        return () => {
            isActive = false;
        };
    }, [subjectId]);

    /**
     * Atualiza uma resposta local sem calcular permissões nem pontuação.
     *
     * @param questionIndex Índice da pergunta.
     * @param selectedOptionIndex Índice da opção escolhida.
     */
    function selectAnswer(questionIndex: number, selectedOptionIndex: number): void {
        setAnswers((current) => ({
            ...current,
            [questionIndex]: selectedOptionIndex,
        }));
        setResult(null);
    }

    /**
     * Submete respostas para correção backend.
     *
     * @param event Evento do formulário.
     */
    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (!selectedTest) return;

        const selectedOptionIndexes = selectedTest.questions.map(
            (_question, questionIndex) => answers[questionIndex] ?? -1,
        );

        setIsSubmitting(true);
        setError(null);
        try {
            const attemptResult = await submitOfficialTestAttempt(
                subjectId,
                selectedTest._id,
                selectedOptionIndexes,
            );
            setResult(attemptResult);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível submeter o mini-teste.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return <p className="sf-panel">A carregar mini-testes oficiais...</p>;
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="sf-panel space-y-3">
                <h1 className="text-xl font-bold">Mini-testes oficiais</h1>
                {tests.length === 0 ? (
                    <p className="text-sm text-slate-600">
                        Ainda não existem mini-testes publicados para esta disciplina.
                    </p>
                ) : (
                    <label className="block text-sm font-medium">
                        Escolhe o mini-teste
                        <select
                            className="mt-2 w-full"
                            value={selectedTestId}
                            onChange={(event) => {
                                setSelectedTestId(event.target.value);
                                setAnswers({});
                                setResult(null);
                            }}
                        >
                            {tests.map((test) => (
                                <option key={test._id} value={test._id}>
                                    {test.title}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {error ? <p className="sf-error">{error}</p> : null}
            </aside>

            {selectedTest ? (
                <form className="sf-panel space-y-5" onSubmit={(event) => void handleSubmit(event)}>
                    <div>
                        <h2 className="text-lg font-semibold">{selectedTest.title}</h2>
                        {selectedTest.description ? (
                            <p className="text-sm text-slate-600">{selectedTest.description}</p>
                        ) : null}
                    </div>

                    {selectedTest.questions.map((question, questionIndex) => (
                        <fieldset className="space-y-2" key={`${selectedTest._id}-${questionIndex}`}>
                            <legend className="font-medium">
                                {questionIndex + 1}. {question.statement}
                            </legend>
                            {question.topic ? (
                                <p className="text-xs text-slate-500">Tópico: {question.topic}</p>
                            ) : null}
                            {question.options.map((option, optionIndex) => {
                                const inputId = `official-test-${questionIndex}-${optionIndex}`;
                                return (
                                    <label className="flex gap-2 text-sm" htmlFor={inputId} key={inputId}>
                                        <input
                                            checked={answers[questionIndex] === optionIndex}
                                            id={inputId}
                                            name={`question-${questionIndex}`}
                                            onChange={() => selectAnswer(questionIndex, optionIndex)}
                                            type="radio"
                                            value={optionIndex}
                                        />
                                        <span>{option}</span>
                                    </label>
                                );
                            })}
                        </fieldset>
                    ))}

                    <button className="sf-button-primary" disabled={isSubmitting}>
                        {isSubmitting ? "A submeter..." : "Submeter respostas"}
                    </button>

                    {result ? (
                        <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                            <h3 className="font-semibold">Resultado</h3>
                            <p>
                                {result.correctAnswers}/{result.totalQuestions} respostas certas ·{" "}
                                {result.percentage}%
                            </p>
                        </section>
                    ) : null}
                </form>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

A página carrega apenas testes publicados que o backend autoriza. O formulário usa `fieldset`, `legend`, `label` e `input radio`, dando nome acessível às perguntas e opções. A UI guarda respostas locais apenas para enviar índices; não calcula pontuação, não decide inscrição e não guarda tokens. O resultado mostrado é o que vem do backend depois da submissão.

6. Validação do passo.

Resultado esperado: com testes publicados, o aluno vê perguntas e opções; com lista vazia, vê estado vazio; com erro de autorização ou sessão, vê mensagem controlada; após submissão válida, vê pontuação.

7. Cenário negativo/erro esperado.

Se o aluno abrir a página sem estar inscrito na disciplina, o backend bloqueia a listagem e a UI mostra a mensagem de erro sem revelar perguntas.

### Passo 7 - Criar testes focados e fechar evidence

1. Objetivo funcional do passo no contexto da app.

Provar que a submissão respeita inscrição, estado publicado e pontuação backend.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/official-tests/official-tests.service.spec.ts`
    - REVER: `apps/api/package.json`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
    - LOCALIZAÇÃO: suite completa do service.

3. Instruções do que fazer.

Actualiza a suite do service. Mantém os testes existentes de criação docente e adiciona cobertura para aluno inscrito, aluno não inscrito, teste em rascunho e pontuação calculada.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/official-tests/official-tests.service.spec.ts
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OfficialTestsService } from "./official-tests.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439013",
    email: "professor@example.test",
    role: "TEACHER",
};
const subjectId = "507f1f77bcf86cd799439014";
const classId = "507f1f77bcf86cd799439015";
const testId = "507f1f77bcf86cd799439016";
const attemptId = "507f1f77bcf86cd799439017";

describe("OfficialTestsService", () => {
    it("cria teste oficial depois de validar ownership da disciplina", async () => {
        const { subjectsService, testModel, service } = makeService();

        await expect(
            service.create(teacher, subjectId, validInput()),
        ).resolves.toMatchObject({
            _id: testId,
            subjectId,
            classId,
            teacherId: teacher.id,
            status: "DRAFT",
        });
        expect(subjectsService.findOwnedSubject).toHaveBeenCalledWith(
            teacher.id,
            subjectId,
        );
        expect(testModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ title: "Mini-teste" }),
        );
    });

    it("bloqueia aluno antes de consultar disciplina docente", async () => {
        const { subjectsService, service } = makeService();

        await expect(
            service.create(student, subjectId, validInput()),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
    });

    it("lista para o aluno apenas testes publicados sem respostas corretas", async () => {
        const { service } = makeService();

        await expect(
            service.listPublishedForStudent(student, subjectId),
        ).resolves.toEqual([
            expect.objectContaining({
                _id: testId,
                questions: [
                    expect.not.objectContaining({ correctOptionIndex: expect.any(Number) }),
                ],
            }),
        ]);
    });

    it("submete tentativa de aluno inscrito e calcula pontuação no backend", async () => {
        const { attemptModel, subjectsService, service } = makeService();

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1, 2],
            }),
        ).resolves.toMatchObject({
            _id: attemptId,
            testId,
            studentId: student.id,
            correctAnswers: 1,
            totalQuestions: 2,
            percentage: 50,
        });
        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            subjectId,
        );
        expect(attemptModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                correctAnswers: 1,
                percentage: 50,
            }),
        );
    });

    it("bloqueia aluno não inscrito antes de procurar teste", async () => {
        const { subjectsService, testModel, service } = makeService();
        subjectsService.findSubjectForStudent.mockRejectedValueOnce(
            new ForbiddenException({
                code: "CLASS_MEMBERSHIP_REQUIRED",
                message: "Aluno não inscrito na turma.",
            }),
        );

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1, 2],
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(testModel.findOne).not.toHaveBeenCalled();
    });

    it("bloqueia teste não publicado", async () => {
        const { testModel, attemptModel, service } = makeService();
        testModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1, 2],
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(attemptModel.create).not.toHaveBeenCalled();
    });

    it("rejeita tentativa incompleta", async () => {
        const { attemptModel, service } = makeService();

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(attemptModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria input docente válido para teste oficial.
 *
 * @returns Payload de criação docente.
 */
function validInput() {
    return {
        title: " Mini-teste ",
        questions: [
            {
                statement: "Pergunta?",
                options: [" A ", " B ", " C ", " D "],
                correctOptionIndex: 1,
            },
        ],
    };
}

/**
 * Cria service com duplos de teste controlados.
 *
 * @returns Service e dependências observáveis.
 */
function makeService() {
    const test = {
        _id: testId,
        subjectId,
        classId,
        teacherId: teacher.id,
        title: "Mini-teste",
        status: "PUBLISHED",
        questions: [
            {
                statement: "Primeira pergunta?",
                options: ["A", "B", "C", "D"],
                correctOptionIndex: 1,
            },
            {
                statement: "Segunda pergunta?",
                options: ["A", "B", "C", "D"],
                correctOptionIndex: 3,
            },
        ],
    };
    const attempt = {
        _id: attemptId,
        testId,
        subjectId,
        classId,
        studentId: student.id,
        correctAnswers: 1,
        totalQuestions: 2,
        percentage: 50,
        results: [
            { questionIndex: 0, selectedOptionIndex: 1, correctOptionIndex: 1, isCorrect: true },
            { questionIndex: 1, selectedOptionIndex: 2, correctOptionIndex: 3, isCorrect: false },
        ],
        answeredAt: new Date("2026-07-02T10:00:00.000Z"),
    };
    const testModel = {
        create: jest.fn().mockResolvedValue({ toObject: () => test }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([test]),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(test),
        }),
        countDocuments: jest.fn().mockResolvedValue(1),
    };
    const attemptModel = {
        create: jest.fn().mockResolvedValue({ toObject: () => attempt }),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: { _id: subjectId, classId },
            schoolClass: { _id: classId },
        }),
    };
    const service = new OfficialTestsService(
        testModel as never,
        attemptModel as never,
        subjectsService as never,
    );
    return { attemptModel, subjectsService, testModel, service };
}
```

5. Explicação do código.

A suite prova o contrato principal do BK. O primeiro bloco preserva o comportamento docente herdado de `BK-MF2-04`. Os testes de aluno provam que a listagem oculta respostas corretas, que a pontuação nasce no backend, que aluno não inscrito fica bloqueado antes da query ao teste, que teste não publicado não cria tentativa e que respostas incompletas falham antes da persistência.

6. Validação do passo.

Resultado esperado: `npm run test:unit -- official-tests` ou a suite unitária equivalente passa com os cenários descritos. Se o script do projecto não aceitar filtro por ficheiro, executa `npm run test:unit` no pacote da API.

7. Cenário negativo/erro esperado.

Se o teste de aluno não inscrito ainda chamar `testModel.findOne`, a ordem de segurança está errada. A inscrição tem de ser validada antes da leitura do teste.

#### Critérios de aceite

- `BK-MF8-12` mantém `RF28`, owner, apoio, prioridade, esforço, sprint, dependência e próximo BK.
- O aluno só vê testes `PUBLISHED` de disciplinas onde está inscrito.
- A listagem do aluno não expõe `correctOptionIndex`.
- A submissão usa `studentId` da sessão e nunca do body.
- O backend valida inscrição antes de procurar o teste.
- O backend bloqueia teste inexistente ou `DRAFT`.
- O backend calcula e persiste pontuação.
- A UI usa cliente tipado, sessão por cookie via `requestJson(...)`, estados de carregamento, vazio, erro, submissão e sucesso.
- A UI tem `label`, `fieldset` e `legend` nos controlos de resposta.
- Os testes cobrem aluno não inscrito, teste não publicado, tentativa incompleta e pontuação calculada.
- Não há caminhos privados, segredos, armazenamento local para sessão, dados sensíveis em logs, código solto ou funções importantes sem JSDoc.

#### Validação final

- Executar a pesquisa de caminhos privados definida na prompt sobre este BK e confirmar que não devolve resultados.
- Executar pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar os testes unitários da API para `official-tests`.

Erros comuns a vigiar:

- Devolver `correctOptionIndex` na listagem do aluno.
- Receber `studentId` pelo body.
- Calcular percentagem no frontend.
- Criar uma segunda entidade de teste em vez de criar uma tentativa.
- Consultar o teste antes de validar inscrição.

#### Evidence para PR/defesa

- `proof`: output da suite de `official-tests` com sucesso.
- `neg`: prova de aluno não inscrito bloqueado antes de ler o teste.
- `neg`: prova de teste `DRAFT` bloqueado.
- `ui`: screenshot ou gravação curta da página com estado vazio, formulário e resultado.
- `privacy`: confirmação de que a listagem do aluno não devolve `correctOptionIndex`.
- `handoff`: nota a indicar que `BK-MF8-13` pode consumir `OfficialTestAttempt` para ranking.

#### Handoff

O próximo BK é `BK-MF8-13`. Ele pode assumir que existe uma coleção `official_test_attempts` com `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`.

`BK-MF8-13` deve usar estes dados para ranking com privacidade mínima, sem reabrir a lógica de submissão nem expor resultados de alunos fora da turma/disciplina autorizada.

#### Changelog

- `2026-07-02`: guia corrigido para entregar o fluxo completo de realização de mini-testes oficiais por aluno, com DTO, schema, scoring, service, controller, cliente API, página React, testes, validação, negativos e handoff para rankings.
