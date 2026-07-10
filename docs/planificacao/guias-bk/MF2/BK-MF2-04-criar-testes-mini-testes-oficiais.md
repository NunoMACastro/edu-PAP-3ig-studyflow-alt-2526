# BK-MF2-04 - Criar testes/mini-testes oficiais.

## Header
- `doc_id`: `GUIA-BK-MF2-04`
- `bk_id`: `BK-MF2-04`
- `macro`: `MF2`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-08`
- `rf_rnf`: `RF28`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-05`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
- `last_updated`: `2026-07-10`

## Objetivo do BK

Permitir que professores criem testes e mini-testes oficiais associados a disciplinas suas, com perguntas MCQ válidas e publicação controlada.

## Importância

Este BK cobre um requisito `Must` e cria uma base avaliativa oficial. Sem ele, o painel de progresso da turma não consegue agregar desempenho por tópico e disciplina.

## Scope-in

- Criar testes oficiais por disciplina.
- Validar perguntas MCQ com uma resposta correcta e três distractores.
- Guardar estado de rascunho ou publicado.
- Listar testes por disciplina do professor.

## Scope-out

- Realização do teste pelo aluno.
- Correcção automática de submissões.
- Geração de perguntas por IA.

## Estado antes

`BK-MF1-08` cria disciplinas e valida ownership. Ainda não existe modelo para testes oficiais nem validação estrutural das perguntas.

## Estado depois

Existe `OfficialTestsModule` com schema, DTO, service e controller. Os testes ficam associados a disciplinas validadas por `SubjectsService.findOwnedSubject`.

## Pré-requisitos

- `SubjectsModule` exporta `SubjectsService`.
- Professor autenticado.
- Disciplina existente e pertencente ao professor.

## Glossário

- Teste oficial: instrumento avaliativo criado pelo professor.
- MCQ: pergunta de escolha múltipla com uma resposta correcta.
- Distractor: opção errada plausível usada na pergunta.

## Conceitos teóricos

- **Validação estrutural.** o backend rejeita perguntas sem o formato mínimo exigido. Este conceito vem de `RF28` e das dependências `BK-MF1-08`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-04 - Criar testes/mini-testes oficiais.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Estado editorial.** rascunho permite preparar; publicado permite uso posterior. Este conceito vem de `RF28` e das dependências `BK-MF1-08`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-04 - Criar testes/mini-testes oficiais.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Fonte de métricas.** as perguntas guardam tópico/disciplina para alimentar relatórios. Este conceito vem de `RF28` e das dependências `BK-MF1-08`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-04 - Criar testes/mini-testes oficiais.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-04`, `RF28`, prioridade `P0`, owner `Guilherme`, apoio `Natalia`, sprint `S05`, dependências `BK-MF1-08` e próximo BK `BK-MF2-05` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-04 - Criar testes/mini-testes oficiais.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`OfficialTestsService` valida a disciplina via `SubjectsService`, valida as perguntas e persiste `OfficialTest`. `OfficialTestsController` expõe rotas docentes; o frontend oferece formulário tipado.

## Ficheiros previstos

- `apps/api/src/modules/official-tests/schemas/official-test.schema.ts`
- `apps/api/src/modules/official-tests/dto/official-test.dto.ts`
- `apps/api/src/modules/official-tests/official-tests.service.ts`
- `apps/api/src/modules/official-tests/official-tests.controller.ts`
- `apps/api/src/modules/official-tests/official-tests.module.ts`
- `apps/web/src/lib/api/official-tests.ts`
- `apps/web/src/pages/mf2/OfficialTestsPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de testes oficiais da disciplina no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/official-tests/schemas/official-test.schema.ts`
    - CRIAR: `apps/api/src/modules/official-tests/dto/official-test.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/official-tests/schemas/official-test.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type OfficialTestDocument = HydratedDocument<OfficialTest>;
export type OfficialTestStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type OfficialTestQuestion = {
    statement: string;
    options: [string, string, string, string];
    correctOptionIndex: 0 | 1 | 2 | 3;
};

@Schema({ timestamps: true, collection: "official_tests" })
export class OfficialTest {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, enum: ["MINI_TEST", "TEST"] })
    type!: "MINI_TEST" | "TEST";

    @Prop({ required: true, enum: ["DRAFT", "PUBLISHED", "CLOSED"], default: "DRAFT", index: true })
    status!: OfficialTestStatus;

    @Prop({ type: [{ statement: String, options: [String], correctOptionIndex: Number }], required: true })
    questions!: OfficialTestQuestion[];
}

export const OfficialTestSchema = SchemaFactory.createForClass(OfficialTest);
OfficialTestSchema.index({ subjectId: 1, createdAt: -1 });

// apps/api/src/modules/official-tests/dto/official-test.dto.ts
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class OfficialTestQuestionDto {
    @IsString()
    @MinLength(5)
    statement!: string;

    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @ArrayUnique()
    @IsString({ each: true })
    options!: string[];

    @IsInt()
    @Min(0)
    @Max(3)
    correctOptionIndex!: number;
}

export class CreateOfficialTestDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsIn(["MINI_TEST", "TEST"])
    type!: "MINI_TEST" | "TEST";

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(60)
    @ValidateNested({ each: true })
    @Type(() => OfficialTestQuestionDto)
    questions!: OfficialTestQuestionDto[];
}
~~~

5. Explicação do código.

    Este bloco separa persistência e entrada HTTP. O schema define os campos guardados em MongoDB, índices e estados que os BKs seguintes podem consultar. O DTO valida o corpo do pedido antes de chegar ao service, por isso dados vazios, demasiado longos ou com formato errado falham com `400 Bad Request`. A regra de segurança é simples: IDs de utilizador, aluno ou professor nunca vêm do body; vêm sempre da sessão autenticada.

6. Como validar este passo.

    Arranca a API depois de integrar o module e confirma que um body vazio devolve 400.

7. Erros comuns ou cenário negativo.

    Não aceites actorId, teacherId ou studentId no body; esses valores vêm da sessão autenticada.

### Passo 2 - Criar service com autorização

1. Explicação simples do objetivo.

    Centralizar regras de negócio, validação de contexto e erros de domínio.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/official-tests/official-tests.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/official-tests/official-tests.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { SubjectsService } from "../subjects/subjects.service";
import { CreateOfficialTestDto } from "./dto/official-test.dto";
import { OfficialTest, OfficialTestDocument } from "./schemas/official-test.schema";

@Injectable()
export class OfficialTestsService {
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly tests: Model<OfficialTestDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async create(actor: AuthenticatedUser, subjectId: string, dto: CreateOfficialTestDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const test = await this.tests.create({
            subjectId: subject._id,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            type: dto.type,
            status: "DRAFT",
            questions: this.normalizeQuestions(dto.questions),
        });
        return this.toView(test);
    }

    async publish(actor: AuthenticatedUser, subjectId: string, testId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const test = await this.tests.findOneAndUpdate(
            { _id: testId, subjectId: subject._id, teacherId: new Types.ObjectId(actor.id), status: "DRAFT" },
            { $set: { status: "PUBLISHED" } },
            { new: true, runValidators: true },
        );
        if (!test) throw new ConflictException({ code: "TEST_NOT_DRAFT", message: "Só um rascunho pode ser publicado." });
        return this.toView(test);
    }

    async updateDraft(actor: AuthenticatedUser, subjectId: string, testId: string, dto: CreateOfficialTestDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const test = await this.tests.findOneAndUpdate(
            { _id: testId, subjectId: subject._id, teacherId: new Types.ObjectId(actor.id), status: "DRAFT" },
            { $set: { title: dto.title.trim(), type: dto.type, questions: this.normalizeQuestions(dto.questions) } },
            { new: true, runValidators: true },
        );
        if (!test) throw new ConflictException({ code: "TEST_NOT_DRAFT", message: "Só um rascunho pode ser editado." });
        return this.toView(test);
    }

    async close(actor: AuthenticatedUser, subjectId: string, testId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const test = await this.tests.findOneAndUpdate(
            { _id: testId, subjectId: subject._id, teacherId: new Types.ObjectId(actor.id), status: "PUBLISHED" },
            { $set: { status: "CLOSED" } },
            { new: true, runValidators: true },
        );
        if (!test) throw new ConflictException({ code: "TEST_NOT_PUBLISHED", message: "Só um teste publicado pode ser fechado." });
        return this.toView(test);
    }

    async listForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const tests = await this.tests.find({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return tests.map((test) => this.toView(test));
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem criar testes oficiais.");
        }
    }

    private normalizeQuestions(questions: CreateOfficialTestDto["questions"]) {
        return questions.map((question) => {
            const options = question.options.map((option) => option.trim());
            const distinct = new Set(options.map((option) => option.toLocaleLowerCase("pt-PT")));
            if (options.some((option) => option.length === 0) || distinct.size !== 4) {
                throw new BadRequestException({ code: "TEST_OPTIONS_INVALID", message: "Cada pergunta exige quatro opções distintas." });
            }
            return {
                statement: question.statement.trim(),
                options,
                correctOptionIndex: question.correctOptionIndex,
            };
        });
    }

    private toView(test: OfficialTest) {
        return { id: test._id.toString(), title: test.title, type: test.type, status: test.status, questionCount: test.questions.length };
    }
}
~~~

5. Explicação do código.

    Este service concentra a regra de negócio do BK. Recebe o utilizador autenticado, valida o papel esperado, confirma ownership ou membership nos services herdados e só depois consulta ou grava dados. A entrada principal vem do controller; a saída é uma resposta já filtrada para o frontend. Isto evita duplicar segurança em componentes React e impede acessos cruzados entre alunos, professores, turmas, disciplinas e áreas de estudo.

6. Como validar este passo.

    Testa três casos: sem sessão, sessão com papel errado e sessão válida com contexto pertencente ao actor.

7. Erros comuns ou cenário negativo.

    Fazer apenas `Model.findById(id)` sem validar dono ou inscrição permite leitura indevida entre turmas, disciplinas ou áreas.

### Passo 3 - Criar controller e module do domínio

1. Explicação simples do objetivo.

    Expor as rotas HTTP do BK e ligar controller, service e schema no módulo NestJS.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`
    - CRIAR: `apps/api/src/modules/official-tests/official-tests.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/official-tests/official-tests.controller.ts
import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateOfficialTestDto } from "./dto/official-test.dto";
import { OfficialTestsService } from "./official-tests.service";

@UseGuards(SessionGuard)
@Controller("api/teacher/subjects/:subjectId/tests")
export class OfficialTestsController {
    constructor(private readonly testsService: OfficialTestsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Body() dto: CreateOfficialTestDto) {
        return this.testsService.create(actor, subjectId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.testsService.listForTeacher(actor, subjectId);
    }

    @Put(":testId")
    updateDraft(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Param("testId") testId: string, @Body() dto: CreateOfficialTestDto) {
        return this.testsService.updateDraft(actor, subjectId, testId, dto);
    }

    @Post(":testId/publish")
    publish(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Param("testId") testId: string) {
        return this.testsService.publish(actor, subjectId, testId);
    }

    @Post(":testId/close")
    close(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Param("testId") testId: string) {
        return this.testsService.close(actor, subjectId, testId);
    }
}

// apps/api/src/modules/official-tests/official-tests.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { OfficialTestsController } from "./official-tests.controller";
import { OfficialTestsService } from "./official-tests.service";
import { OfficialTest, OfficialTestSchema } from "./schemas/official-test.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: OfficialTest.name, schema: OfficialTestSchema }]), SubjectsModule],
    controllers: [OfficialTestsController],
    providers: [OfficialTestsService],
    exports: [OfficialTestsService],
})
export class OfficialTestsModule {}
~~~

5. Explicação do código.

    O controller transforma pedidos HTTP autenticados em chamadas ao service, sem colocar regras de negócio na rota. O module liga controller, service, schema Mongoose e módulos herdados, garantindo dependency injection correta. Se faltar um import no module, a app não arranca; se faltar o guard no controller, o endpoint deixa de proteger sessão e permissões.

6. Como validar este passo.

    Confirma que a aplicação arranca sem erros de provider desconhecido e que as rotas aparecem com o prefixo esperado.

7. Erros comuns ou cenário negativo.

    Usar fallback genérico de parâmetros esconde bugs de rota e pode passar `undefined` para o service.

### Passo 4 - Integrar no módulo acumulativo da MF2

1. Explicação simples do objetivo.

    Garantir que o endpoint fica activo sem apagar modules criados em BKs anteriores.

2. Ficheiros envolvidos.
    - EDITAR: `apps/api/src/modules/mf2/mf2.module.ts`
    - REVER: `apps/api/src/app.module.ts` já deve importar Mf2Module desde BK-MF2-01

3. O que fazer.

    Mantém todos os imports anteriores e acrescenta apenas o module deste BK ao `Mf2Module`.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/mf2/mf2.module.ts
import { Module } from "@nestjs/common";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module";
import { ClassProjectsModule } from "../class-projects/class-projects.module";
import { ProjectAiModule } from "../project-ai/project-ai.module";
import { OfficialTestsModule } from "../official-tests/official-tests.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
    ],
})
export class Mf2Module {}

~~~

5. Explicação do código.

    O `Mf2Module` organiza a macrofase inteira. O `AppModule` só precisa de o importar uma vez, evitando edições repetidas e arriscadas.

6. Como validar este passo.

    Arranca a API e confirma que o Nest resolve providers do module acabado de criar.

7. Erros comuns ou cenário negativo.

    Não troques o array de imports por uma lista só com o module novo; isso desligaria funcionalidades anteriores.

### Passo 5 - Criar cliente frontend tipado

1. Explicação simples do objetivo.

    Dar ao frontend funções pequenas para chamar a API com cookies HttpOnly.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/lib/api/official-tests.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/official-tests.ts
export type OfficialTestView = { id: string; title: string; type: "MINI_TEST" | "TEST"; status: "DRAFT" | "PUBLISHED" | "CLOSED"; questionCount: number };
export type OfficialTestQuestionInput = {
    statement: string;
    options: [string, string, string, string];
    correctOptionIndex: 0 | 1 | 2 | 3;
};
export type CreateOfficialTestInput = { title: string; type: "MINI_TEST" | "TEST"; questions: OfficialTestQuestionInput[] };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
        ...init,
        // Envia o cookie HttpOnly da sessão; o frontend nunca guarda tokens manualmente.
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
}
export function listOfficialTests(subjectId: string) {
    return requestJson<OfficialTestView[]>("/api/teacher/subjects/" + subjectId + "/tests");
}
export function createOfficialTest(subjectId: string, input: CreateOfficialTestInput) {
    return requestJson<OfficialTestView>("/api/teacher/subjects/" + subjectId + "/tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}
~~~

5. Explicação do código.

    O cliente API é tipado e envia cookies com `credentials: "include"`, para reutilizar a sessão segura criada na MF0. Ele não guarda tokens no browser, não envia `actorId` e devolve erros claros quando o backend responde com `400`, `401`, `403` ou `404`. Assim, os tipos do frontend ficam alinhados com o payload e com a resposta real do controller.

6. Como validar este passo.

    Usa DevTools ou testes de integração para confirmar que as chamadas incluem cookies e tratam 401/403/404.

7. Erros comuns ou cenário negativo.

    Fazer fetch sem `credentials: "include"` transforma uma sessão válida em 401 no backend.

### Passo 6 - Criar página React do BK

1. Explicação simples do objetivo.

    Expor a funcionalidade ao utilizador com estados de loading, erro, vazio e sucesso.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/pages/mf2/OfficialTestsPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/OfficialTestsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createOfficialTest, listOfficialTests, OfficialTestView } from "../../lib/api/official-tests";

export function OfficialTestsPage() {
    const [subjectId, setSubjectId] = useState("");
    const [title, setTitle] = useState("");
    const [tests, setTests] = useState<OfficialTestView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!subjectId.trim()) return;

        try {
            setTests(await listOfficialTests(subjectId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar testes.");
        }
    }
    useEffect(() => {
        void load();
    }, [subjectId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await createOfficialTest(subjectId.trim(), {
            title,
            type: "MINI_TEST",
            questions: [
                {
                    statement: "Pergunta inicial",
                    options: ["A", "B", "C", "D"],
                    correctOptionIndex: 0,
                },
            ],
        });
        setTitle("");
        await load();
    }
    return (
        <main>
            <h1>Testes oficiais</h1>
            <form onSubmit={submit}>
                <input value={subjectId} onChange={(event) => setSubjectId(event.target.value)} placeholder="ID da disciplina" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <button type="submit">Criar mini-teste</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {tests.map((test) => (
                    <li key={test.id}>{test.title} - {test.questionCount} perguntas</li>
                ))}
            </ul>
        </main>
    );
}
~~~

5. Explicação do código.

    A página separa estado de formulário, estado de lista e mensagens de erro para ser fácil de testar e manter.

6. Como validar este passo.

    Abre a página com sessão válida, executa o fluxo principal e confirma que a lista actualiza sem refresh manual.

7. Erros comuns ou cenário negativo.

    Não escondas erros HTTP genéricos; mostra mensagem controlada para o utilizador e mantém o detalhe técnico no backend.

### Passo 7 - Validar contrato, negativos e handoff

1. Explicação simples do objetivo.

    Confirmar que o BK cumpre RF28, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
    - REVER: testes backend e frontend criados para este BK

3. O que fazer.

    Executa validações automáticas e regista evidência de caminho feliz e cenários negativos.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    Estes comandos cobrem regressões unitárias, contratos API, fluxo integrado e coerência documental.

6. Como validar este passo.

    Guarda evidência com request válido, resposta esperada, pelo menos 3 cenário(s) negativo(s) e captura da página final.

7. Erros comuns ou cenário negativo.

    Não avances para BK-MF2-05 se a validação de sessão, ownership ou membership falhar.

### Passo 8 - Fechar prova final do BK P0

1. Explicação simples do objetivo.

    Confirmar que o teste oficial fica pronto para alimentar curadoria e métricas sem quebrar a cadeia de disciplinas.

2. Ficheiros envolvidos.
    - REVER: `apps/api/src/modules/official-tests/official-tests.service.ts`
    - REVER: `apps/api/src/modules/official-tests/official-tests.controller.ts`
    - REVER: `apps/web/src/pages/mf2/OfficialTestsPage.tsx`

3. O que fazer.

    Reexecuta os testes, confirma os três cenários negativos de P0 e regista evidência de criação, rejeição e bloqueio por ownership.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    A sequência valida unidade, contrato HTTP, integração e coerência documental antes de entregar o BK.

6. Como validar este passo.

    A entrega só está pronta quando todos os comandos terminarem sem erro e houver prova de MCQ válido, MCQ inválido e disciplina fora do professor.

7. Erros comuns ou cenário negativo.

    Fechar o BK só com teste positivo deixa passar perguntas inválidas ou testes criados em disciplinas que não pertencem ao professor.

## Expected results

- Professor cria teste oficial numa disciplina sua.
- Cada pergunta MCQ tem uma resposta correcta e três distractores.
- Professor não cria teste em disciplina de outro professor.
- Payload sem perguntas válidas é rejeitado.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar validação de ownership via `SubjectsService.findOwnedSubject`.
- Confirmar validação estrutural de perguntas antes da persistência.
- Executar teste positivo e três cenários negativos por ser BK `P0`.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-05

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
