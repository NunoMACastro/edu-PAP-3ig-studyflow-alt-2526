# BK-MF2-12 - Assistente IA da disciplina/turma com voz docente herdada.

## Header
- `doc_id`: `GUIA-BK-MF2-12`
- `bk_id`: `BK-MF2-12`
- `macro`: `MF2`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-10`
- `rf_rnf`: `RF36`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-01`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-12-assistente-ia-da-disciplina-turma-com-voz-docente.md`
- `last_updated`: `2026-07-10`

## Objetivo do BK

Estender a IA da disciplina/turma com voz docente herdada, usando apenas materiais oficiais aprovados e a voz efetiva resolvida pelo professor.

## Importância

Este BK fecha a MF2 com um assistente oficial de disciplina. Ele tem impacto directo em segurança, confiança pedagógica e macros futuras de guardrails, citações e limites docentes.

## Scope-in

- Editar o domínio `class-ai` já criado em `BK-MF1-11`.
- Usar `SubjectsService.findSubjectForStudent`, `OfficialMaterialsService.findProcessedBySubject` e `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`.
- Aplicar regras de voz docente no prompt.
- Guardar resposta com materiais oficiais e regras usadas.

## Scope-out

- Redefinir provider de IA.
- Criar novo domínio concorrente para IA da turma.
- Usar materiais privados do aluno como fonte oficial.

## Estado antes

`BK-MF1-11` já criou `ClassAiModule` com IA limitada da turma. A versão actual precisa ser estendida sem substituir o módulo nem duplicar o provider.

## Estado depois

`ClassAiService` passa a suportar o assistente da disciplina com voz docente efetiva, mantendo o import de `AiModule` e as validações de aluno, disciplina, materiais oficiais e voz.

## Pré-requisitos

- `TeacherAiModule` exporta `TeacherAiVoiceService`.
- `SubjectsModule` exporta `SubjectsService.findSubjectForStudent`.
- `OfficialMaterialsModule` exporta `OfficialMaterialsService.findProcessedBySubject`.
- `AiModule` exporta `GovernedAiExecutionService`.

## Glossário

- Voz docente: regras de tom e estilo configuradas pelo professor.
- Material oficial: fonte da disciplina aprovada ou processada pelo professor.
- Assistente da disciplina: IA acessível ao aluno inscrito, limitada à disciplina.
- Voz efetiva: resultado da herança `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`.

## Conceitos teóricos

- **Extensão acumulada.** editar módulo existente preserva comportamento anterior. Este conceito vem de `RF36` e das dependências `BK-MF1-10`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-12 - Assistente IA da disciplina/turma com voz docente herdada.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Fonte oficial obrigatória.** a resposta deve vir dos materiais da disciplina. Este conceito vem de `RF36` e das dependências `BK-MF1-10`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-12 - Assistente IA da disciplina/turma com voz docente herdada.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Perfil de IA.** regras docentes condicionam tom, nível de detalhe e limites. Este conceito vem de `RF36` e das dependências `BK-MF1-10`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-12 - Assistente IA da disciplina/turma com voz docente herdada.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Herança da voz docente.** a disciplina pode ter override, mas quando não tem usa a voz base da turma; se nenhuma existir, aplica defaults seguros.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-12`, `RF36`, prioridade `P0`, owner `Natalia`, apoio `Guilherme`, sprint `S05`, dependências `BK-MF1-10` e próximo BK `BK-MF3-01` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-12 - Assistente IA da disciplina/turma com voz docente herdada.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `CANONICO`: a voz docente vem de `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`; chamadas antigas a `findForSubject` são legado dos snippets pré-alteração.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`ClassAiService` valida inscrição, recolhe materiais oficiais, resolve voz docente efetiva e chama `GovernedAiExecutionService` com finalidade `CLASS_AI` antes de gravar `ClassAiAnswer`.

## Ficheiros previstos

- `apps/api/src/modules/class-ai/schemas/class-ai-answer.schema.ts`
- `apps/api/src/modules/class-ai/dto/class-ai-answer.dto.ts`
- `apps/api/src/modules/class-ai/class-ai.service.ts`
- `apps/api/src/modules/class-ai/class-ai.controller.ts`
- `apps/api/src/modules/class-ai/class-ai.module.ts`
- `apps/web/src/lib/api/class-ai.ts`
- `apps/web/src/pages/mf2/ClassAiPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de assistente IA da disciplina no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/class-ai/schemas/class-ai-answer.schema.ts`
    - CRIAR: `apps/api/src/modules/class-ai/dto/class-ai-answer.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-ai/schemas/class-ai-answer.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassAiAnswerDocument = HydratedDocument<ClassAiAnswer>;

@Schema({ timestamps: true, collection: "class_ai_answers" })
export class ClassAiAnswer {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 4000 })
    question!: string;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 20000 })
    answer!: string;

    @Prop({ type: [String], default: [] })
    officialMaterialIds!: string[];

    @Prop({ type: [String], default: [] })
    teacherVoiceRules!: string[];
}

export const ClassAiAnswerSchema = SchemaFactory.createForClass(ClassAiAnswer);
ClassAiAnswerSchema.index({ subjectId: 1, studentId: 1, createdAt: -1 });

// apps/api/src/modules/class-ai/dto/class-ai-answer.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassAiAnswerDto {
    @IsString()
    @MinLength(3)
    @MaxLength(4000)
    question!: string;
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
    - EDITAR: `apps/api/src/modules/class-ai/class-ai.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-ai/class-ai.service.ts
import { ForbiddenException, Inject, Injectable, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service";
import { CreateClassAiAnswerDto } from "./dto/class-ai-answer.dto";
import { ClassAiAnswer, ClassAiAnswerDocument } from "./schemas/class-ai-answer.schema";

@Injectable()
export class ClassAiService {
    constructor(
        @InjectModel(ClassAiAnswer.name)
        private readonly answers: Model<ClassAiAnswerDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly teacherAiVoiceService: TeacherAiVoiceService,
        private readonly aiExecution: GovernedAiExecutionService,
    ) {}

    async ask(actor: AuthenticatedUser, subjectId: string, dto: CreateClassAiAnswerDto) {
        this.assertStudent(actor);
        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        if (materials.length === 0) {
            throw new UnprocessableEntityException("Disciplina sem materiais oficiais processados.");
        }
        const voice = await this.teacherAiVoiceService.resolveTeacherVoice({
            classId: subject.classId.toString(),
            subjectId: subject._id.toString(),
        });
        const rules = voice?.rules ?? [];
        const answerText = await this.generateAnswer(
            actor,
            subject.classId.toString(),
            dto.question,
            materials,
            rules,
        );
        const answer = await this.answers.create({ subjectId: subject._id, classId: subject.classId, studentId: new Types.ObjectId(actor.id), question: dto.question.trim(), answer: answerText, officialMaterialIds: materials.map((material) => material._id.toString()), teacherVoiceRules: rules });
        return this.toView(answer);
    }

    async list(actor: AuthenticatedUser, subjectId: string) {
        this.assertStudent(actor);
        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const answers = await this.answers.find({ subjectId: subject._id, studentId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return answers.map((answer) => this.toView(answer));
    }

    private async generateAnswer(
        actor: AuthenticatedUser,
        classId: string,
        question: string,
        materials: Array<{ _id: Types.ObjectId; title: string; contentText: string }>,
        rules: string[],
    ) {
        try {
            const { result } = await this.aiExecution.execute({
                userId: actor.id,
                purpose: "CLASS_AI",
                quota: { scope: "CLASS", targetId: classId },
                sources: materials,
                guardrailText: question,
                buildPrompt: (limitedSources) => [
                    question,
                    "Regras docentes:",
                    rules.join("\n"),
                    "Fontes:",
                    ...limitedSources.map((source) => source.contentText),
                ].join("\n"),
                invoke: ({ provider, prompt, options }) => provider.generateText({
                    system: "Responde como assistente da disciplina, respeitando a voz docente e citando fontes oficiais.",
                    user: prompt,
                    sources: [{ id: classId, title: "Materiais oficiais" }],
                    ...options,
                }),
                validateResult: (value) => {
                    if (typeof value !== "string" || value.trim().length === 0) {
                        throw new TypeError("Resposta IA da disciplina inválida.");
                    }
                },
            });
            return result;
        } catch (error) {
            throw new ServiceUnavailableException("IA da disciplina indisponível neste momento.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem usar a IA da disciplina.");
        }
    }
    private toView(answer: ClassAiAnswer) {
        return { id: answer._id.toString(), question: answer.question, answer: answer.answer, officialMaterialIds: answer.officialMaterialIds, teacherVoiceRules: answer.teacherVoiceRules };
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
    - EDITAR: `apps/api/src/modules/class-ai/class-ai.controller.ts`
    - EDITAR: `apps/api/src/modules/class-ai/class-ai.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-ai/class-ai.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassAiService } from "./class-ai.service";
import { CreateClassAiAnswerDto } from "./dto/class-ai-answer.dto";

@UseGuards(SessionGuard)
@Controller("api/student/subjects/:subjectId/ai/answers")
export class ClassAiController {
    constructor(private readonly classAiService: ClassAiService) {}

    @Post()
    ask(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Body() dto: CreateClassAiAnswerDto) {
        return this.classAiService.ask(actor, subjectId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.classAiService.list(actor, subjectId);
    }
}

// apps/api/src/modules/class-ai/class-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiModule } from "../teacher-ai/teacher-ai.module";
import { ClassAiController } from "./class-ai.controller";
import { ClassAiService } from "./class-ai.service";
import { ClassAiAnswer, ClassAiAnswerSchema } from "./schemas/class-ai-answer.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ClassAiAnswer.name, schema: ClassAiAnswerSchema }]), SubjectsModule, OfficialMaterialsModule, TeacherAiModule, AiModule],
    controllers: [ClassAiController],
    providers: [ClassAiService],
    exports: [ClassAiService],
})
export class ClassAiModule {}
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
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module";
import { ClassProgressModule } from "../class-progress/class-progress.module";
import { MaterialIndexModule } from "../material-index/material-index.module";
import { MaterialStructureModule } from "../material-structure/material-structure.module";
import { MaterialVersionsModule } from "../material-versions/material-versions.module";
import { MaterialContextsModule } from "../material-contexts/material-contexts.module";
import { PrivateAreaAiModule } from "../private-area-ai/private-area-ai.module";
import { ClassAiModule } from "../class-ai/class-ai.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
        AiContentReviewsModule,
        ClassProgressModule,
        MaterialIndexModule,
        MaterialStructureModule,
        MaterialVersionsModule,
        MaterialContextsModule,
        PrivateAreaAiModule,
        ClassAiModule,
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
    - CRIAR: `apps/web/src/lib/api/class-ai.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/class-ai.ts
export type ClassAiAnswerView = { id: string; question: string; answer: string; officialMaterialIds: string[]; teacherVoiceRules: string[] };
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
export function listClassAiAnswers(subjectId: string) {
    return requestJson<ClassAiAnswerView[]>("/api/student/subjects/" + subjectId + "/ai/answers");
}
export function askClassAi(subjectId: string, question: string) {
    return requestJson<ClassAiAnswerView>("/api/student/subjects/" + subjectId + "/ai/answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
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
    - CRIAR: `apps/web/src/pages/mf2/ClassAiPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/ClassAiPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { askClassAi, listClassAiAnswers, ClassAiAnswerView } from "../../lib/api/class-ai";

export function ClassAiPage() {
    const [subjectId, setSubjectId] = useState("");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<ClassAiAnswerView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!subjectId.trim()) return;

        try {
            setAnswers(await listClassAiAnswers(subjectId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar IA da disciplina.");
        }
    }
    useEffect(() => {
        void load();
    }, [subjectId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await askClassAi(subjectId.trim(), question);
        setQuestion("");
        await load();
    }
    return (
        <main>
            <h1>IA da disciplina</h1>
            <form onSubmit={submit}>
                <input value={subjectId} onChange={(event) => setSubjectId(event.target.value)} placeholder="ID da disciplina" />
                <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Pergunta" />
                <button type="submit">Perguntar</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {answers.map((answer) => (
                    <li key={answer.id}>
                        {answer.question}
                        <p>{answer.answer}</p>
                    </li>
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

    Confirmar que o BK cumpre RF36, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-12-assistente-ia-da-disciplina-turma-com-voz-docente.md`
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

    Não avances para BK-MF3-01 se a validação de sessão, ownership ou membership falhar.

### Passo 8 - Fechar prova final do BK P0

1. Explicação simples do objetivo.

    Confirmar que a IA da disciplina preserva o `ClassAiModule` herdado e responde apenas com materiais oficiais e voz docente.

2. Ficheiros envolvidos.
    - REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
    - REVER: `apps/api/src/modules/class-ai/class-ai.module.ts`
    - REVER: `apps/web/src/pages/mf2/ClassAiPage.tsx`

3. O que fazer.

    Reexecuta os testes, confirma os três cenários negativos de P0 e regista evidência de resposta com materiais oficiais e regras docentes.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    A sequência protege o módulo existente, as fontes oficiais, a voz docente e o handoff para guardrails da MF3.

6. Como validar este passo.

    A entrega só está pronta quando aluno fora da turma, disciplina sem materiais e provider indisponível falharem de forma controlada.

7. Erros comuns ou cenário negativo.

    Criar outro módulo de IA para a turma duplica provider e quebra o comportamento já estabelecido em `BK-MF1-11`.

## Expected results

- Aluno inscrito pergunta à IA da disciplina e recebe resposta baseada em materiais oficiais.
- Disciplina sem override herda voz base da turma.
- Disciplina com override usa a voz da disciplina.
- Resposta guarda materiais oficiais e regras de voz docente efetivamente aplicadas.
- Disciplina sem materiais processados devolve erro controlado.
- Aluno fora da turma não recebe resposta.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- O service usa `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`.
- `voiceRulesApplied` guarda as regras efetivamente usadas, não apenas o override bruto.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que `ClassAiModule` é editado como módulo existente da cadeia MF1.
- Confirmar que a voz docente vem de `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`.
- Confirmar herança da turma sem override e precedência do override da disciplina.
- Executar caso positivo e três cenários negativos por ser BK `P0`.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Evidence de resposta com voz herdada da turma e resposta com override da disciplina.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF3-01

## Changelog

- `2026-06-30`: documentada voz efetiva por herança de turma com override opcional de disciplina.
- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
