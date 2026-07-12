# BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.

## Header
- `doc_id`: `GUIA-BK-MF2-06`
- `bk_id`: `BK-MF2-06`
- `macro`: `MF2`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-12`
- `rf_rnf`: `RF30`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-07`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-06-painel-com-progresso-dificuldades-e-metricas-da-turma.md`
- `last_updated`: `2026-07-11`

## Objetivo do BK

Criar um painel docente com progresso, dificuldades e métricas agregadas da turma, validando sempre que o professor é dono da turma.

## Importância

Este BK transforma actividades e conteúdos em sinais pedagógicos accionáveis. O professor passa a ver onde a turma está a avançar e onde precisa de apoio.

## Scope-in

- Calcular indicadores simples por turma.
- Mostrar progresso, dificuldades e contadores relevantes.
- Usar a turma validada por `ClassesService.findOwnedClass`.
- Preparar integração futura com testes, revisões e actividade real.

## Scope-out

- Analytics em tempo real.
- Predições automáticas.
- Alertas de acompanhamento, que ficam para BKs posteriores.

## Estado antes

`BK-MF1-12` permite avisos e publicações. A MF2 ainda não tem uma vista agregada para acompanhamento da turma.

## Estado depois

Existe `ClassProgressModule` com endpoint docente e uma página intitulada **Resumo da turma**. A rota histórica `/app/professor/turmas/:classId/progresso` mantém-se por compatibilidade, mas a UI apresenta apenas contexto factual e notas append-only; não transforma publicações, notas ou conteúdos numa percentagem de aprendizagem.

O resumo mostra número de alunos, disciplinas, mini-testes publicados, publicações e notas. O registo docente apresenta título, observação, etiquetas e data, da nota mais recente para a mais antiga. Estados de loading, erro, vazio e sucesso são explícitos, e um erro ao criar uma nota fica limitado ao painel lateral.

## Pré-requisitos

- `ClassesModule` exporta `ClassesService`.
- Professor autenticado.
- Turma criada e pertencente ao professor.

## Glossário

- Métrica da turma: valor agregado visível ao professor.
- Dificuldade: tópico ou área em que a turma apresenta menor desempenho.
- Progresso: avanço pedagógico suportado por dados de aprendizagem; não pode ser inferido a partir da quantidade de conteúdos ou notas criadas.
- Resumo da turma: factos existentes e registo docente, sem médias, risco ou percentagens sintéticas.

## Conceitos teóricos

- **Agregação segura.** o painel mostra dados por turma do professor, não dados livres. Este conceito vem de `RF30` e das dependências `BK-MF1-12`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Métrica accionável.** cada número deve orientar uma decisão docente. Este conceito vem de `RF30` e das dependências `BK-MF1-12`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Evolução incremental.** o MVP pode começar com contadores e crescer com eventos reais. Este conceito vem de `RF30` e das dependências `BK-MF1-12`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-06`, `RF30`, prioridade `P1`, owner `Guilherme`, apoio `Natalia`, sprint `S04`, dependências `BK-MF1-12` e próximo BK `BK-MF2-07` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`ClassProgressService` valida a turma via `ClassesService`, monta um resumo factual e devolve as notas ordenadas. `ClassProgressController` mantém a rota docente; o frontend apresenta contexto, atalhos e o registo docente. O contrato não inclui `learningProgressPercent`, `activityCoveragePercent`, `metricsBasis` ou mensagens técnicas sobre macrofases.

## Ficheiros previstos

- `apps/api/src/modules/class-progress/schemas/class-progress-note.schema.ts`
- `apps/api/src/modules/class-progress/dto/class-progress-note.dto.ts`
- `apps/api/src/modules/class-progress/class-progress.service.ts`
- `apps/api/src/modules/class-progress/class-progress.controller.ts`
- `apps/api/src/modules/class-progress/class-progress.module.ts`
- `apps/web/src/lib/api/class-progress.ts`
- `apps/web/src/pages/mf2/ClassProgressDashboardPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de painel de progresso da turma no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/class-progress/schemas/class-progress-note.schema.ts`
    - CRIAR: `apps/api/src/modules/class-progress/dto/class-progress-note.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-progress/schemas/class-progress-note.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassProgressNoteDocument = HydratedDocument<ClassProgressNote>;

@Schema({ timestamps: true, collection: "class_progress_notes" })
export class ClassProgressNote {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 4000 })
    note!: string;

    @Prop({ type: [String], default: [] })
    difficultyTags!: string[];
}

export const ClassProgressNoteSchema = SchemaFactory.createForClass(ClassProgressNote);
ClassProgressNoteSchema.index({ classId: 1, createdAt: -1 });

// apps/api/src/modules/class-progress/dto/class-progress-note.dto.ts
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassProgressNoteDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(4000)
    note!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(12)
    @IsString({ each: true })
    difficultyTags?: string[];
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
    - CRIAR: `apps/api/src/modules/class-progress/class-progress.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-progress/class-progress.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassPostsService } from "../class-posts/class-posts.service";
import { ClassesService } from "../classes/classes.service";
import { CreateClassProgressNoteDto } from "./dto/class-progress-note.dto";
import { ClassProgressNote, ClassProgressNoteDocument } from "./schemas/class-progress-note.schema";

@Injectable()
export class ClassProgressService {
    constructor(
        @InjectModel(ClassProgressNote.name)
        private readonly notes: Model<ClassProgressNoteDocument>,
        private readonly classesService: ClassesService,
        private readonly classPostsService: ClassPostsService,
    ) {}

    async createNote(actor: AuthenticatedUser, classId: string, dto: CreateClassProgressNoteDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const note = await this.notes.create({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id), title: dto.title.trim(), note: dto.note.trim(), difficultyTags: dto.difficultyTags ?? [] });
        return this.toNoteView(note);
    }

    async dashboard(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const [notes, posts] = await Promise.all([
            this.notes.find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean(),
            this.classPostsService.listForTeacher(actor, classId),
        ]);
        return { classId: schoolClass._id.toString(), noteCount: notes.length, postCount: posts.length, difficultyTags: [...new Set(notes.flatMap((note) => note.difficultyTags))], notes: notes.map((note) => this.toNoteView(note)) };
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem consultar métricas da turma.");
        }
    }
    private toNoteView(note: ClassProgressNote) {
        return { id: note._id.toString(), title: note.title, note: note.note, difficultyTags: note.difficultyTags };
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
    - CRIAR: `apps/api/src/modules/class-progress/class-progress.controller.ts`
    - CRIAR: `apps/api/src/modules/class-progress/class-progress.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-progress/class-progress.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassProgressService } from "./class-progress.service";
import { CreateClassProgressNoteDto } from "./dto/class-progress-note.dto";

@UseGuards(SessionGuard)
@Controller("api/teacher/classes/:classId/progress-dashboard")
export class ClassProgressController {
    constructor(private readonly progressService: ClassProgressService) {}

    @Post("notes")
    createNote(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Body() dto: CreateClassProgressNoteDto) {
        return this.progressService.createNote(actor, classId, dto);
    }

    @Get()
    dashboard(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.progressService.dashboard(actor, classId);
    }
}

// apps/api/src/modules/class-progress/class-progress.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassPostsModule } from "../class-posts/class-posts.module";
import { ClassesModule } from "../classes/classes.module";
import { ClassProgressController } from "./class-progress.controller";
import { ClassProgressService } from "./class-progress.service";
import { ClassProgressNote, ClassProgressNoteSchema } from "./schemas/class-progress-note.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ClassProgressNote.name, schema: ClassProgressNoteSchema }]), ClassesModule, ClassPostsModule],
    controllers: [ClassProgressController],
    providers: [ClassProgressService],
})
export class ClassProgressModule {}
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

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
        AiContentReviewsModule,
        ClassProgressModule,
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
    - CRIAR: `apps/web/src/lib/api/class-progress.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/class-progress.ts
export type TeacherClassSummary = {
    classId: string;
    className: string;
    studentsCount: number;
    subjectsCount: number;
    publishedTestsCount: number;
    approvedAiContentCount: number;
    postCount: number;
    noteCount: number;
    difficultyTags: string[];
    notes: { id: string; title: string; note: string; difficultyTags: string[]; createdAt?: string }[];
};
export type CreateClassProgressNoteInput = { title: string; note: string; difficultyTags?: string[] };
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
export function getTeacherClassSummary(classId: string) {
    return requestJson<TeacherClassSummary>("/api/teacher/classes/" + classId + "/progress");
}
export function createClassProgressNote(classId: string, input: CreateClassProgressNoteInput) {
    return requestJson<TeacherClassSummary["notes"][number]>("/api/teacher/classes/" + classId + "/progress/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
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
    - CRIAR: `apps/web/src/pages/mf2/ClassProgressDashboardPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/ClassProgressDashboardPage.tsx
import { useEffect, useState } from "react";
import { getTeacherClassSummary, TeacherClassSummary } from "../../lib/api/class-progress";

export function ClassProgressDashboardPage({ classId }: { classId: string }) {
    const [summary, setSummary] = useState<TeacherClassSummary | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        getTeacherClassSummary(classId)
            .then(setSummary)
            .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar resumo."));
    }, [classId]);
    return (
        <main>
            <h1>Resumo da turma</h1>
            {error && <p role="alert">{error}</p>}
            {!summary && !error && <p>A carregar resumo da turma...</p>}
            {summary && (
                <section>
                    <h2>Contexto da turma</h2>
                    <p>Alunos: {summary.studentsCount}</p>
                    <p>Disciplinas: {summary.subjectsCount}</p>
                    <p>Mini-testes publicados: {summary.publishedTestsCount}</p>
                    <p>Publicações: {summary.postCount}</p>
                    <h2>Registo docente</h2>
                    {summary.notes.length === 0 ? <p>Ainda não existem notas.</p> : summary.notes.map((item) => (
                        <article key={item.id}>
                            <h3>{item.title}</h3>
                            <p>{item.note}</p>
                            <p>{item.createdAt ?? "Data não disponível"}</p>
                        </article>
                    ))}
                </section>
            )}
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

    Confirmar que o BK cumpre RF30, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-06-painel-com-progresso-dificuldades-e-metricas-da-turma.md`
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

    Guarda evidência com request válido, resposta esperada, pelo menos 2 cenário(s) negativo(s) e captura da página final.

7. Erros comuns ou cenário negativo.

    Não avances para BK-MF2-07 se a validação de sessão, ownership ou membership falhar.

## Expected results

- Professor consulta o resumo factual de uma turma sua.
- Resposta inclui contexto existente e notas append-only ordenadas por data.
- A UI não apresenta percentagens sintéticas, classificações de risco ou mensagens técnicas sobre macrofases.
- Professor não consulta turma de outro professor.
- Aluno não acede ao painel docente.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.
- A página mostra loading, erro, vazio, sucesso e fallback para notas sem `createdAt`.

## Validação final

- Confirmar que `ClassesService.findOwnedClass` é chamado antes de montar o resumo.
- Confirmar que não há IDs de aluno expostos desnecessariamente.
- Confirmar que criar uma nota não produz nem altera qualquer percentagem de aprendizagem.
- Executar caso positivo e dois cenários negativos.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-07

## Atualização de paridade professor → aluno (2026-07-11)

O Centro usa `ClassLearningActivity` e `StudentClassActivityState`, estritamente
delimitados a `classId`; eventos de estudo privado nunca contam para inatividade. O
baseline é `ClassMembership.joinedAt`, evitando sinalizar um aluno recém-inscrito. O
endpoint `GET /api/follow-up-centre/classes/:classId/students/:studentId` consolida
atividade temporal, salas guiadas, política `BEST_ATTEMPT` dos testes e quizzes IA
aprovados. Devolve sinais factuais explicados, sem score de risco nem diagnóstico oculto.
Evento e projeção de atividade confirmam na mesma transação. O progresso de salas usa o
`joinedAt`: salas encerradas antes da adesão não entram no denominador do novo aluno.

## Changelog

- `2026-07-11`: UI real alinhada como `Resumo da turma`, contrato reduzido a factos existentes e notas append-only com data; removidas percentagens sintéticas e mensagens técnicas da experiência docente.
- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
- `2026-07-11`: acrescentados fonte canónica por turma, baseline de membership e detalhe factual consolidado por aluno.
