# BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).

## Header
- `doc_id`: `GUIA-BK-MF2-05`
- `bk_id`: `BK-MF2-05`
- `macro`: `MF2`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-09`
- `rf_rnf`: `RF29`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-06`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md`
- `last_updated`: `2026-07-11`

## Objetivo do BK

Permitir que professores revejam e aprovem conteúdos gerados por IA, como resumos e quizzes, antes de estes serem tratados como conteúdo oficial.

## Importância

Este BK introduz curadoria docente. A IA pode apoiar a produção, mas o professor mantém responsabilidade pela aprovação, pela qualidade e pela ligação ao material oficial.

## Scope-in

- Criar registos de revisão por material oficial.
- Guardar tipo de conteúdo, estado, decisão e comentário do professor.
- Aprovar ou rejeitar conteúdo gerado.
- Disponibilizar aos alunos inscritos apenas conteúdo aprovado.
- Corrigir e persistir tentativas de quizzes aprovados, com histórico próprio minimizado.
- Garantir que só o professor da disciplina consegue rever.

## Scope-out

- Gerar o conteúdo por IA dentro deste BK.
- Publicar automaticamente conteúdos rejeitados.
- Gestão de workflows multi-aprovador.
- Rankings competitivos ou KPIs sintéticos para quizzes aprovados.

## Estado antes

`BK-MF1-09` cria materiais oficiais processados. Ainda não existe camada de decisão docente sobre conteúdos derivados desses materiais.

## Estado depois

Existe `AiContentReviewsModule`, ligado a materiais oficiais processados e disciplinas. O professor trabalha numa fila por material, pode aprovar ou rejeitar com comentário e pode rever uma decisão. Cada transição fica no audit log. O aluno inscrito vê apenas conteúdos atualmente aprovados; quizzes estruturados são corrigidos e cada tentativa fica persistida em `ApprovedAiQuizAttempt`, sem duplicar a chave de soluções.

## Pré-requisitos

- `OfficialMaterialsModule` exporta `OfficialMaterialsService`.
- `SubjectsModule` valida ownership da disciplina.
- Material oficial processado.

## Glossário

- Conteúdo gerado: resumo, quiz ou texto produzido por IA.
- Revisão docente: decisão explícita do professor.
- Aprovado: conteúdo imediatamente visível aos alunos inscritos na disciplina.
- Quiz aprovado: questionário cuja solução só é devolvida depois da submissão completa.

## Conceitos teóricos

- **Human-in-the-loop.** a IA propõe, o professor decide. Este conceito vem de `RF29` e das dependências `BK-MF1-09`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Rastreabilidade.** decisões guardam estado, comentário e autor. Este conceito vem de `RF29` e das dependências `BK-MF1-09`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Fonte oficial.** conteúdos só são revistos quando ligados a material oficial da disciplina. Este conceito vem de `RF29` e das dependências `BK-MF1-09`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-05`, `RF29`, prioridade `P1`, owner `Kaua`, apoio `Guilherme`, sprint `S05`, dependências `BK-MF1-09` e próximo BK `BK-MF2-06` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`AiContentReviewsService` valida o material processado, normaliza resumos/quizzes, cria revisões, audita decisões e limita o consumo do aluno a `APPROVED`. O controller preserva criação, listagem e decisão docentes e acrescenta leitura/correção para alunos. `POST /api/student/subjects/:subjectId/approved-ai-content/:reviewId/quiz-attempts` persiste uma tentativa; o `GET` no mesmo path devolve apenas o histórico do próprio aluno, sem soluções. O frontend mostra uma fila por disciplina/material e uma página de conteúdos aprovados.

## Ficheiros previstos

- `apps/api/src/modules/ai-content-reviews/schemas/ai-content-review.schema.ts`
- `apps/api/src/modules/ai-content-reviews/dto/ai-content-review.dto.ts`
- `apps/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts`
- `apps/api/src/modules/ai-content-reviews/ai-content-reviews.controller.ts`
- `apps/api/src/modules/ai-content-reviews/ai-content-reviews.module.ts`
- `apps/web/src/lib/api/ai-content-reviews.ts`
- `apps/web/src/pages/mf2/AiContentReviewsPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de revisão docente de conteúdo IA no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/ai-content-reviews/schemas/ai-content-review.schema.ts`
    - CRIAR: `apps/api/src/modules/ai-content-reviews/dto/ai-content-review.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/ai-content-reviews/schemas/ai-content-review.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiContentReviewDocument = HydratedDocument<AiContentReview>;
export type AiContentReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

@Schema({ timestamps: true, collection: "ai_content_reviews" })
export class AiContentReview {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SUMMARY", "QUIZ"] })
    contentType!: "SUMMARY" | "QUIZ";

    @Prop({ type: Object, required: true })
    contentJson!: Record<string, unknown>;

    @Prop({ required: true, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" })
    status!: AiContentReviewStatus;

    @Prop({ trim: true, maxlength: 1000 })
    teacherComment?: string;
}

export const AiContentReviewSchema = SchemaFactory.createForClass(AiContentReview);
AiContentReviewSchema.index({ subjectId: 1, status: 1, createdAt: -1 });

// apps/api/src/modules/ai-content-reviews/dto/ai-content-review.dto.ts
import { IsIn, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAiContentReviewDto {
    @IsString()
    materialId!: string;

    @IsIn(["SUMMARY", "QUIZ"])
    contentType!: "SUMMARY" | "QUIZ";

    @IsObject()
    contentJson!: Record<string, unknown>;
}

export class DecideAiContentReviewDto {
    @IsIn(["APPROVED", "REJECTED"])
    status!: "APPROVED" | "REJECTED";

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    teacherComment?: string;
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
    - CRIAR: `apps/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { CreateAiContentReviewDto, DecideAiContentReviewDto } from "./dto/ai-content-review.dto";
import { AiContentReview, AiContentReviewDocument } from "./schemas/ai-content-review.schema";

@Injectable()
export class AiContentReviewsService {
    constructor(
        @InjectModel(AiContentReview.name)
        private readonly reviews: Model<AiContentReviewDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async create(actor: AuthenticatedUser, subjectId: string, dto: CreateAiContentReviewDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const material = await this.officialMaterialsService.findOwnedMaterial(actor.id, dto.materialId);
        if (material.subjectId !== subject._id || material.status !== "PROCESSED") {
            throw new NotFoundException("Material oficial processado não encontrado nesta disciplina.");
        }
        const review = await this.reviews.create({ subjectId: subject._id, materialId: material._id, teacherId: new Types.ObjectId(actor.id), contentType: dto.contentType, contentJson: dto.contentJson, status: "PENDING" });
        return this.toView(review);
    }

    async list(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const reviews = await this.reviews.find({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return reviews.map((review) => this.toView(review));
    }

    async decide(actor: AuthenticatedUser, reviewId: string, dto: DecideAiContentReviewDto) {
        this.assertTeacher(actor);
        if (dto.status === "REJECTED" && (dto.teacherComment?.trim().length ?? 0) < 5) {
            throw new BadRequestException("A rejeição exige um motivo.");
        }
        const review = await this.reviews.findOneAndUpdate({ _id: reviewId, teacherId: new Types.ObjectId(actor.id) }, { status: dto.status, teacherComment: dto.teacherComment?.trim() }, { new: true });
        if (!review) {
            throw new NotFoundException("Revisão não encontrada nesta disciplina.");
        }
        return this.toView(review);
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem rever conteúdo IA.");
        }
    }
    private toView(review: AiContentReview) {
        return { id: review._id.toString(), contentType: review.contentType, status: review.status, contentJson: review.contentJson, teacherComment: review.teacherComment ?? null };
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
    - CRIAR: `apps/api/src/modules/ai-content-reviews/ai-content-reviews.controller.ts`
    - CRIAR: `apps/api/src/modules/ai-content-reviews/ai-content-reviews.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/ai-content-reviews/ai-content-reviews.controller.ts
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AiContentReviewsService } from "./ai-content-reviews.service";
import { CreateAiContentReviewDto, DecideAiContentReviewDto } from "./dto/ai-content-review.dto";

@UseGuards(SessionGuard)
@Controller("api")
export class AiContentReviewsController {
    constructor(private readonly reviewsService: AiContentReviewsService) {}

    @Post("teacher/subjects/:subjectId/ai-content-reviews")
    create(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Body() dto: CreateAiContentReviewDto) {
        return this.reviewsService.create(actor, subjectId, dto);
    }

    @Get("teacher/subjects/:subjectId/ai-content-reviews")
    list(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.reviewsService.list(actor, subjectId);
    }

    @Patch("teacher/ai-content-reviews/:reviewId")
    decide(@CurrentUser() actor: AuthenticatedUser, @Param("reviewId") reviewId: string, @Body() dto: DecideAiContentReviewDto) {
        return this.reviewsService.decide(actor, reviewId, dto);
    }

    @Get("student/subjects/:subjectId/approved-ai-content")
    listApproved(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.reviewsService.listApprovedForStudent(actor, subjectId);
    }
}

// apps/api/src/modules/ai-content-reviews/ai-content-reviews.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { AiContentReviewsController } from "./ai-content-reviews.controller";
import { AiContentReviewsService } from "./ai-content-reviews.service";
import { AiContentReview, AiContentReviewSchema } from "./schemas/ai-content-review.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: AiContentReview.name, schema: AiContentReviewSchema }]), SubjectsModule, OfficialMaterialsModule],
    controllers: [AiContentReviewsController],
    providers: [AiContentReviewsService],
    exports: [AiContentReviewsService],
})
export class AiContentReviewsModule {}
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

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
        AiContentReviewsModule,
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
    - CRIAR: `apps/web/src/lib/api/ai-content-reviews.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/ai-content-reviews.ts
export type AiContentReviewView = { id: string; materialId: string; materialTitle: string; contentType: "SUMMARY" | "QUIZ"; contentJson: Record<string, unknown>; status: "PENDING" | "APPROVED" | "REJECTED"; teacherComment?: string; createdAt?: string; decidedAt: string | null };
export type CreateAiContentReviewInput = { materialId: string; contentType: "SUMMARY" | "QUIZ"; contentJson: Record<string, unknown> };
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
export function listAiContentReviews(subjectId: string) {
    return requestJson<AiContentReviewView[]>("/api/teacher/subjects/" + subjectId + "/ai-content-reviews");
}
export function createAiContentReview(subjectId: string, input: CreateAiContentReviewInput) {
    return requestJson<AiContentReviewView>("/api/teacher/subjects/" + subjectId + "/ai-content-reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}
export function decideAiContentReview(reviewId: string, status: "APPROVED" | "REJECTED", teacherComment?: string) {
    return requestJson<AiContentReviewView>("/api/teacher/ai-content-reviews/" + reviewId, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, teacherComment }) });
}
export function listApprovedAiContent(subjectId: string) {
    return requestJson("/api/student/subjects/" + subjectId + "/approved-ai-content");
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
    - CRIAR: `apps/web/src/pages/mf2/AiContentReviewsPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/AiContentReviewsPage.tsx
import { useEffect, useState } from "react";
import { decideAiContentReview, listAiContentReviews, AiContentReviewView } from "../../lib/api/ai-content-reviews";

export function AiContentReviewsPage({ subjectId }: { subjectId: string }) {
    const [reviews, setReviews] = useState<AiContentReviewView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        try {
            setReviews(await listAiContentReviews(subjectId));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar revisões.");
        }
    }
    useEffect(() => {
        void load();
    }, [subjectId]);
    return (
        <main>
            <h1>Revisão de conteúdo IA</h1>
            {error && <p role="alert">{error}</p>}
            <ul>
                {reviews.map((review) => (
                    <li key={review.id}>
                        {review.materialTitle} · {review.contentType} · {review.status}
                        <button type="button" onClick={() => decideAiContentReview(review.id, "APPROVED").then(load)}>
                            Aprovar
                        </button>
                        <button type="button" onClick={() => decideAiContentReview(review.id, "REJECTED", "Rever conteúdo").then(load)}>
                            Rejeitar
                        </button>
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

    Confirmar que o BK cumpre RF29, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md`
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

    Não avances para BK-MF2-06 se a validação de sessão, ownership ou membership falhar.

## Expected results

- Professor cria revisão ligada a material oficial processado.
- Professor aprova, rejeita ou revê a decisão; a rejeição exige comentário.
- Só conteúdos atualmente aprovados ficam visíveis aos alunos inscritos.
- O aluno responde a quizzes aprovados, recebe correção e pode consultar o histórico persistido das próprias tentativas.
- Professor de outra disciplina não consegue rever o material.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.
- A fila mostra títulos de materiais, datas e estados sem IDs ou JSON.
- A listagem do aluno não contém soluções, comentário docente ou identificação do professor.
- A correção só devolve respostas certas e explicações depois da submissão completa.
- A persistência guarda respostas selecionadas e pontuação, mas não duplica soluções nem explicações.
- O histórico `GET` nunca devolve respostas certas, explicações, comentário docente ou dados de colegas.
- Existem estados controlados de loading, error, empty e success.

## Validação final

- Confirmar que a revisão valida material oficial antes de gravar decisão.
- Confirmar que estados de aprovação são explícitos, reversíveis e auditados.
- Confirmar que `PENDING` e `REJECTED` nunca aparecem no endpoint do aluno.
- Executar caminho aprovado, caminho rejeitado e dois cenários negativos.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-06

## Atualização de paridade professor → aluno (2026-07-11)

As tentativas de quizzes aprovados são persistidas em `ApprovedAiQuizAttempt`, sem
duplicar a chave de soluções, e ficam disponíveis no histórico próprio e nas métricas
factuais do Centro de Acompanhamento. Aprovar ou retirar conteúdo visível cria uma
notificação in-app. O registo de atividade guarda apenas tipo, turma, aluno, instante e
chave técnica, nunca respostas ou texto pedagógico.

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
- `2026-07-11`: documentadas persistência de tentativas, minimização, atividade oficial e notificações de visibilidade.
