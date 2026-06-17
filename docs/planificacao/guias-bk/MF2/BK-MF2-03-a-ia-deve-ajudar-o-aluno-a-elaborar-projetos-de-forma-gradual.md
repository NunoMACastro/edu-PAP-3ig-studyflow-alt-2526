# BK-MF2-03 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.

## Header
- `doc_id`: `GUIA-BK-MF2-03`
- `bk_id`: `BK-MF2-03`
- `macro`: `MF2`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF2-02`
- `rf_rnf`: `RF27`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-04`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-03-a-ia-deve-ajudar-o-aluno-a-elaborar-projetos-de-forma-gradual.md`
- `last_updated`: `2026-06-10`

## Objetivo do BK

Permitir que a IA ajude o aluno a transformar um projecto publicado em passos graduais, mantendo o enunciado como fonte principal.

## Importância

O aluno recebe apoio sem a IA resolver o trabalho por ele. A funcionalidade melhora acompanhamento e autonomia, mas precisa de validação forte para não expor projectos de outras turmas nem criar conteúdo fora do enunciado.

## Scope-in

- Criar planos de trabalho por aluno e projecto.
- Ler apenas projectos publicados através de `findPublishedForStudent`.
- Usar `AI_PROVIDER` exportado pela cadeia MF0/MF1.
- Guardar passos, objectivo do aluno e referência ao projecto usado.

## Scope-out

- Entregar trabalhos pelo aluno.
- Avaliar automaticamente qualidade da entrega.
- Usar conhecimento externo sem autorização explícita.

## Estado antes

`BK-MF2-02` cria projectos e expõe a leitura segura. Ainda não existe uma entidade para plano de IA por aluno.

## Estado depois

Existe `ProjectAiModule`, com planos persistidos, validação de aluno inscrito e prompt limitado ao projecto publicado. A resposta é dividida em passos sequenciais e guarda referência ao projecto.

## Pré-requisitos

- `ClassProjectsModule` exporta `ClassProjectsService`.
- `AiModule` exporta `AI_PROVIDER`.
- O projecto está publicado e pertence à turma do aluno.

## Glossário

- Plano gradual: lista de passos pequenos para executar o projecto.
- Fonte do plano: projecto publicado usado como base.
- Dificuldades conhecidas: pontos opcionais indicados pelo aluno para orientar a ajuda.

## Conceitos teóricos

- **IA assistiva.** apoia o processo, mas não substitui a autoria do aluno. Este conceito vem de `RF27` e das dependências `BK-MF2-02`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-03 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Validação de fonte.** a resposta tem de partir do enunciado e guardar referência ao projecto. Este conceito vem de `RF27` e das dependências `BK-MF2-02`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-03 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Runtime não confiável.** a saída da IA deve ser tratada como texto a validar antes de persistir. Este conceito vem de `RF27` e das dependências `BK-MF2-02`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-03 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve provider de IA quando o próprio requisito o pede. Quando não há chamada de IA, o guia limita-se a preparar fontes, autorização ou contexto sem prometer geração automática; quando há chamada de IA, o provider vem de `AiModule`/`AI_PROVIDER`, as fontes são recolhidas antes da chamada e a resposta só é persistida depois de validação mínima.

## Decisões documentais

- `CANONICO`: `BK-MF2-03`, `RF27`, prioridade `P1`, owner `Natalia`, apoio `Guilherme`, sprint `S05`, dependências `BK-MF2-02` e próximo BK `BK-MF2-04` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-03 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`ProjectAiService` valida inscrição via `ClassProjectsService.findPublishedForStudent`, chama `AI_PROVIDER`, normaliza a resposta em passos e grava `ProjectAiPlan`. O controller expõe criação e histórico do aluno.

## Ficheiros previstos

- `apps/api/src/modules/project-ai/schemas/project-ai-plan.schema.ts`
- `apps/api/src/modules/project-ai/dto/project-ai-plan.dto.ts`
- `apps/api/src/modules/project-ai/project-ai.service.ts`
- `apps/api/src/modules/project-ai/project-ai.controller.ts`
- `apps/api/src/modules/project-ai/project-ai.module.ts`
- `apps/web/src/lib/api/project-ai.ts`
- `apps/web/src/pages/mf2/ProjectAiPlanPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de plano gradual de IA para projetos no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/project-ai/schemas/project-ai-plan.schema.ts`
    - CRIAR: `apps/api/src/modules/project-ai/dto/project-ai-plan.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/project-ai/schemas/project-ai-plan.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ProjectAiPlanDocument = HydratedDocument<ProjectAiPlan>;

@Schema({ timestamps: true, collection: "project_ai_plans" })
export class ProjectAiPlan {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    projectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    objective!: string;

    @Prop({ type: [String], default: [] })
    steps!: string[];

    @Prop({ type: [String], default: [] })
    sourceProjectSections!: string[];
}

export const ProjectAiPlanSchema = SchemaFactory.createForClass(ProjectAiPlan);
ProjectAiPlanSchema.index({ projectId: 1, studentId: 1, createdAt: -1 });

// apps/api/src/modules/project-ai/dto/project-ai-plan.dto.ts
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProjectAiPlanDto {
    @IsString()
    @MinLength(10)
    @MaxLength(12000)
    objective!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    knownDifficulties?: string[];
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
    - CRIAR: `apps/api/src/modules/project-ai/project-ai.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/project-ai/project-ai.service.ts
import { ForbiddenException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider";
import { ClassProjectsService } from "../class-projects/class-projects.service";
import { CreateProjectAiPlanDto } from "./dto/project-ai-plan.dto";
import { ProjectAiPlan, ProjectAiPlanDocument } from "./schemas/project-ai-plan.schema";

@Injectable()
export class ProjectAiService {
    constructor(
        @InjectModel(ProjectAiPlan.name)
        private readonly plans: Model<ProjectAiPlanDocument>,
        private readonly classProjectsService: ClassProjectsService,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    ) {}

    async createPlan(actor: AuthenticatedUser, classId: string, projectId: string, dto: CreateProjectAiPlanDto) {
        this.assertStudent(actor);
        const project = await this.classProjectsService.findPublishedForStudent(actor, classId, projectId);
        const text = await this.generatePlan(project.brief, dto);
        const steps = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
        const plan = await this.plans.create({
            classId: project.classId,
            projectId: project._id,
            studentId: new Types.ObjectId(actor.id),
            objective: dto.objective.trim(),
            steps,
            sourceProjectSections: [project._id.toString()],
        });
        return this.toView(plan);
    }

    async listPlans(actor: AuthenticatedUser, classId: string, projectId: string) {
        this.assertStudent(actor);
        const project = await this.classProjectsService.findPublishedForStudent(actor, classId, projectId);
        const plans = await this.plans.find({ projectId: project._id, studentId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return plans.map((plan) => this.toView(plan));
    }

    private async generatePlan(projectBrief: string, dto: CreateProjectAiPlanDto) {
        try {
            return await this.aiProvider.generateText({
                system: "Ajuda o aluno a decompor o projeto em passos graduais, sem fazer o trabalho por ele.",
                user: [
                    "Enunciado: " + projectBrief,
                    "Objetivo do aluno: " + dto.objective,
                    "Dificuldades: " + (dto.knownDifficulties ?? []).join(", "),
                ].join("\n"),
                sources: [{ id: "class-project", title: "Projeto publicado" }],
            });
        } catch (error) {
            throw new ServiceUnavailableException("Não foi possível gerar o plano do projeto neste momento.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem pedir plano de projeto.");
        }
    }

    private toView(plan: ProjectAiPlan) {
        return { id: plan._id.toString(), objective: plan.objective, steps: plan.steps, sourceProjectSections: plan.sourceProjectSections };
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
    - CRIAR: `apps/api/src/modules/project-ai/project-ai.controller.ts`
    - CRIAR: `apps/api/src/modules/project-ai/project-ai.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/project-ai/project-ai.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateProjectAiPlanDto } from "./dto/project-ai-plan.dto";
import { ProjectAiService } from "./project-ai.service";

@UseGuards(SessionGuard)
@Controller("api/student/classes/:classId/projects/:projectId/ai-plan")
export class ProjectAiController {
    constructor(private readonly projectAiService: ProjectAiService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Param("projectId") projectId: string, @Body() dto: CreateProjectAiPlanDto) {
        return this.projectAiService.createPlan(actor, classId, projectId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Param("projectId") projectId: string) {
        return this.projectAiService.listPlans(actor, classId, projectId);
    }
}

// apps/api/src/modules/project-ai/project-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { ClassProjectsModule } from "../class-projects/class-projects.module";
import { ProjectAiController } from "./project-ai.controller";
import { ProjectAiService } from "./project-ai.service";
import { ProjectAiPlan, ProjectAiPlanSchema } from "./schemas/project-ai-plan.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ProjectAiPlan.name, schema: ProjectAiPlanSchema }]), ClassProjectsModule, AiModule],
    controllers: [ProjectAiController],
    providers: [ProjectAiService],
})
export class ProjectAiModule {}
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

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
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
    - CRIAR: `apps/web/src/lib/api/project-ai.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/project-ai.ts
export type ProjectAiPlanView = { id: string; objective: string; steps: string[]; sourceProjectSections: string[] };
export type CreateProjectAiPlanInput = { objective: string; knownDifficulties?: string[] };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, { ...init, credentials: "include" });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json() as Promise<T>;
}

export function listProjectAiPlans(classId: string, projectId: string) {
    return requestJson<ProjectAiPlanView[]>("/api/student/classes/" + classId + "/projects/" + projectId + "/ai-plan");
}

export function createProjectAiPlan(classId: string, projectId: string, input: CreateProjectAiPlanInput) {
    return requestJson<ProjectAiPlanView>("/api/student/classes/" + classId + "/projects/" + projectId + "/ai-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
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
    - CRIAR: `apps/web/src/pages/mf2/ProjectAiPlanPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/ProjectAiPlanPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createProjectAiPlan, listProjectAiPlans, ProjectAiPlanView } from "../../lib/api/project-ai";

export function ProjectAiPlanPage() {
    const [classId, setClassId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [objective, setObjective] = useState("");
    const [plans, setPlans] = useState<ProjectAiPlanView[]>([]);
    const [error, setError] = useState("");

    async function load() {
        if (!classId.trim() || !projectId.trim()) return;
        try { setPlans(await listProjectAiPlans(classId.trim(), projectId.trim())); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Erro ao carregar planos."); }
    }

    useEffect(() => {
        void load();
    }, [classId, projectId]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        await createProjectAiPlan(classId.trim(), projectId.trim(), { objective });
        setObjective("");
        await load();
    }

    return (
        <main>
            <h1>Plano gradual de projeto</h1>
            <form onSubmit={submit}>
                <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
                <input value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="ID do projeto" />
                <textarea value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="Objetivo" />
                <button type="submit">Gerar plano</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {plans.map((plan) => (
                    <li key={plan.id}>
                        {plan.objective}
                        <ol>
                            {plan.steps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
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

    Confirmar que o BK cumpre RF27, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-03-a-ia-deve-ajudar-o-aluno-a-elaborar-projetos-de-forma-gradual.md`
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

    Não avances para BK-MF2-04 se a validação de sessão, ownership ou membership falhar.

## Expected results

- Aluno inscrito cria plano gradual para projecto publicado.
- Plano guarda objectivo, passos e referência ao projecto.
- Professor ou aluno fora da turma não consegue gerar plano.
- Falha do provider devolve erro controlado sem gravar plano vazio.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que o prompt inclui o enunciado publicado e não recebe fontes externas.
- Confirmar que a resposta é normalizada em passos não vazios.
- Executar caso positivo, cenário sem inscrição e cenário de provider indisponível.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-04

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
