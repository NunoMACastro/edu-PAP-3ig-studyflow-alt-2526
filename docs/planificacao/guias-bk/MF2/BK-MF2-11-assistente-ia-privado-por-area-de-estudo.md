# BK-MF2-11 - Assistente IA privado por Área de Estudo.

## Header
- `doc_id`: `GUIA-BK-MF2-11`
- `bk_id`: `BK-MF2-11`
- `macro`: `MF2`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-10`
- `rf_rnf`: `RF35`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-12`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-11-assistente-ia-privado-por-area-de-estudo.md`
- `last_updated`: `2026-07-10`

## Objetivo do BK

Criar um assistente IA privado por área de estudo, limitado aos materiais do aluno e validado pela propriedade da área.

## Importância

Este BK entrega a experiência central de estudo individual com IA. Também prepara guardrails, limites de uso e alertas futuros, por isso precisa de fronteiras fortes de fonte, sessão e perfil.

## Scope-in

- Perguntar à IA dentro de uma área privada do aluno.
- Usar `StudyAreasService.getMyStudyArea` e `MaterialsService.listByArea`.
- Bloquear respostas sem materiais processáveis.
- Guardar histórico com fontes usadas.

## Scope-out

- Conhecimento externo.
- IA da turma ou disciplina.
- Quotas administrativas e consentimentos avançados.

## Estado antes

`BK-MF0-10` cria perfil de IA da área e `BK-MF0-11/12` fecham a fundação do provider. Ainda falta um assistente conversacional privado na MF2.

## Estado depois

Existe `PrivateAreaAiModule` que importa `AiModule`, injeta `GovernedAiExecutionService`, valida a área do aluno e guarda respostas com `sourceMaterialIds`.

## Pré-requisitos

- `StudyAreasModule` exporta `StudyAreasService`.
- `MaterialsModule` exporta `MaterialsService`.
- `AiModule` exporta `GovernedAiExecutionService`.

## Glossário

- IA privada: assistente restrito aos materiais do aluno.
- Fonte processável: material com texto disponível para consulta.
- Histórico de resposta: pergunta, resposta e fontes usadas.

## Conceitos teóricos

- **Confiança zero no provider.** a resposta da IA deve ser validada antes de guardar. Este conceito vem de `RF35` e das dependências `BK-MF0-10`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-11 - Assistente IA privado por Área de Estudo.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Fonte obrigatória.** sem materiais, o assistente não responde. Este conceito vem de `RF35` e das dependências `BK-MF0-10`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-11 - Assistente IA privado por Área de Estudo.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Separação de perfis.** a IA privada não lê dados de turma ou professor. Este conceito vem de `RF35` e das dependências `BK-MF0-10`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-11 - Assistente IA privado por Área de Estudo.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-11`, `RF35`, prioridade `P0`, owner `Guilherme`, apoio `Natalia`, sprint `S04`, dependências `BK-MF0-10` e próximo BK `BK-MF2-12` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-11 - Assistente IA privado por Área de Estudo.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`PrivateAreaAiService` valida aluno e área, recolhe materiais autorizados e chama `GovernedAiExecutionService` com finalidade `PRIVATE_AREA_AI`; a fachada valida consentimento, policy, guardrails, quota, output e audit antes de persistir `PrivateAreaAiAnswer`.

## Ficheiros previstos

- `apps/api/src/modules/private-area-ai/schemas/private-area-ai-answer.schema.ts`
- `apps/api/src/modules/private-area-ai/dto/private-area-ai-answer.dto.ts`
- `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
- `apps/api/src/modules/private-area-ai/private-area-ai.controller.ts`
- `apps/api/src/modules/private-area-ai/private-area-ai.module.ts`
- `apps/web/src/lib/api/private-area-ai.ts`
- `apps/web/src/pages/mf2/PrivateAreaAiPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de assistente IA privado por área no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/private-area-ai/schemas/private-area-ai-answer.schema.ts`
    - CRIAR: `apps/api/src/modules/private-area-ai/dto/private-area-ai-answer.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/private-area-ai/schemas/private-area-ai-answer.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type PrivateAreaAiAnswerDocument = HydratedDocument<PrivateAreaAiAnswer>;

@Schema({ timestamps: true, collection: "private_area_ai_answers" })
export class PrivateAreaAiAnswer {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 4000 })
    question!: string;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 20000 })
    answer!: string;

    @Prop({ type: [String], default: [] })
    sourceMaterialIds!: string[];
}

export const PrivateAreaAiAnswerSchema = SchemaFactory.createForClass(PrivateAreaAiAnswer);
PrivateAreaAiAnswerSchema.index({ studyAreaId: 1, studentId: 1, createdAt: -1 });

// apps/api/src/modules/private-area-ai/dto/private-area-ai-answer.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreatePrivateAreaAiAnswerDto {
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
    - CRIAR: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/private-area-ai/private-area-ai.service.ts
import { ForbiddenException, Inject, Injectable, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service";
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { CreatePrivateAreaAiAnswerDto } from "./dto/private-area-ai-answer.dto";
import { PrivateAreaAiAnswer, PrivateAreaAiAnswerDocument } from "./schemas/private-area-ai-answer.schema";

@Injectable()
export class PrivateAreaAiService {
    constructor(
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly answers: Model<PrivateAreaAiAnswerDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly aiExecution: GovernedAiExecutionService,
    ) {}

    async ask(actor: AuthenticatedUser, studyAreaId: string, dto: CreatePrivateAreaAiAnswerDto) {
        this.assertStudent(actor);
        const area = await this.studyAreasService.getMyStudyArea(actor.id, studyAreaId);
        const materials = await this.materialsService.listByArea(actor.id, area._id.toString());
        const sources = materials.filter((material) => Boolean(material.contentText));
        if (sources.length === 0) {
            throw new UnprocessableEntityException("A área ainda não tem fontes suficientes para IA.");
        }
        const answerText = await this.generateAnswer(actor, studyAreaId, dto.question, sources);
        const answer = await this.answers.create({ studyAreaId: area._id, studentId: new Types.ObjectId(actor.id), question: dto.question.trim(), answer: answerText, sourceMaterialIds: sources.map((source) => source._id.toString()) });
        return this.toView(answer);
    }

    async list(actor: AuthenticatedUser, studyAreaId: string) {
        this.assertStudent(actor);
        const area = await this.studyAreasService.getMyStudyArea(actor.id, studyAreaId);
        const answers = await this.answers.find({ studyAreaId: area._id, studentId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return answers.map((answer) => this.toView(answer));
    }

    private async generateAnswer(
        actor: AuthenticatedUser,
        studyAreaId: string,
        question: string,
        sources: Array<{ _id: Types.ObjectId; title: string; contentText: string }>,
    ) {
        try {
            const { result } = await this.aiExecution.execute({
                userId: actor.id,
                purpose: "PRIVATE_AREA_AI",
                quota: { scope: "USER", targetId: actor.id },
                sources,
                guardrailText: question,
                buildPrompt: (limitedSources) => [
                    question,
                    "Fontes:",
                    ...limitedSources.map((source) => source.contentText),
                ].join("\n"),
                invoke: ({ provider, prompt, options }) => provider.generateText({
                    system: "Responde só com base nos materiais privados do aluno.",
                    user: prompt,
                    sources: [{ id: studyAreaId, title: "Materiais privados" }],
                    ...options,
                }),
                validateResult: (value) => {
                    if (typeof value !== "string" || value.trim().length === 0) {
                        throw new TypeError("Resposta IA privada inválida.");
                    }
                },
            });
            return result;
        } catch (error) {
            throw new ServiceUnavailableException("IA privada indisponível neste momento.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem usar a IA privada.");
        }
    }
    private toView(answer: PrivateAreaAiAnswer) {
        return { id: answer._id.toString(), question: answer.question, answer: answer.answer, sourceMaterialIds: answer.sourceMaterialIds };
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
    - CRIAR: `apps/api/src/modules/private-area-ai/private-area-ai.controller.ts`
    - CRIAR: `apps/api/src/modules/private-area-ai/private-area-ai.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/private-area-ai/private-area-ai.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreatePrivateAreaAiAnswerDto } from "./dto/private-area-ai-answer.dto";
import { PrivateAreaAiService } from "./private-area-ai.service";

@UseGuards(SessionGuard)
@Controller("api/study-areas/:studyAreaId/private-ai/answers")
export class PrivateAreaAiController {
    constructor(private readonly privateAiService: PrivateAreaAiService) {}

    @Post()
    ask(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string, @Body() dto: CreatePrivateAreaAiAnswerDto) {
        return this.privateAiService.ask(actor, studyAreaId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string) {
        return this.privateAiService.list(actor, studyAreaId);
    }
}

// apps/api/src/modules/private-area-ai/private-area-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { MaterialsModule } from "../materials/materials.module";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { PrivateAreaAiController } from "./private-area-ai.controller";
import { PrivateAreaAiService } from "./private-area-ai.service";
import { PrivateAreaAiAnswer, PrivateAreaAiAnswerSchema } from "./schemas/private-area-ai-answer.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: PrivateAreaAiAnswer.name, schema: PrivateAreaAiAnswerSchema }]), StudyAreasModule, MaterialsModule, AiModule],
    controllers: [PrivateAreaAiController],
    providers: [PrivateAreaAiService],
    exports: [PrivateAreaAiService],
})
export class PrivateAreaAiModule {}
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
    - CRIAR: `apps/web/src/lib/api/private-area-ai.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/private-area-ai.ts
export type PrivateAreaAiAnswerView = { id: string; question: string; answer: string; sourceMaterialIds: string[] };
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
export function listPrivateAreaAiAnswers(studyAreaId: string) {
    return requestJson<PrivateAreaAiAnswerView[]>("/api/study-areas/" + studyAreaId + "/private-ai/answers");
}
export function askPrivateAreaAi(studyAreaId: string, question: string) {
    return requestJson<PrivateAreaAiAnswerView>("/api/study-areas/" + studyAreaId + "/private-ai/answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
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
    - CRIAR: `apps/web/src/pages/mf2/PrivateAreaAiPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/PrivateAreaAiPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { askPrivateAreaAi, listPrivateAreaAiAnswers, PrivateAreaAiAnswerView } from "../../lib/api/private-area-ai";

export function PrivateAreaAiPage() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<PrivateAreaAiAnswerView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!studyAreaId.trim()) return;

        try {
            setAnswers(await listPrivateAreaAiAnswers(studyAreaId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar IA privada.");
        }
    }
    useEffect(() => {
        void load();
    }, [studyAreaId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await askPrivateAreaAi(studyAreaId.trim(), question);
        setQuestion("");
        await load();
    }
    return (
        <main>
            <h1>IA privada da área</h1>
            <form onSubmit={submit}>
                <input value={studyAreaId} onChange={(event) => setStudyAreaId(event.target.value)} placeholder="ID da área" />
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

    Confirmar que o BK cumpre RF35, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-11-assistente-ia-privado-por-area-de-estudo.md`
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

    Não avances para BK-MF2-12 se a validação de sessão, ownership ou membership falhar.

### Passo 8 - Fechar prova final do BK P0

1. Explicação simples do objetivo.

    Confirmar que a IA privada só responde com fontes da área do aluno e falha de forma controlada quando não há fontes.

2. Ficheiros envolvidos.
    - REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
    - REVER: `apps/api/src/modules/private-area-ai/private-area-ai.controller.ts`
    - REVER: `apps/web/src/pages/mf2/PrivateAreaAiPage.tsx`

3. O que fazer.

    Reexecuta os testes, confirma os três cenários negativos de P0 e regista evidência de resposta com `sourceMaterialIds`.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    A sequência valida sessão, ownership da área, existência de fontes e disponibilidade do provider.

6. Como validar este passo.

    A entrega só está pronta quando a IA recusar área sem fontes, área de outro aluno e provider indisponível.

7. Erros comuns ou cenário negativo.

    Permitir resposta sem `sourceMaterialIds` enfraquece citações, guardrails e auditoria futura.

## Expected results

- Aluno pergunta à IA numa área sua e recebe resposta com fontes privadas.
- Resposta fica guardada com `sourceMaterialIds`.
- Área sem fontes processáveis devolve erro controlado.
- Aluno não acede a área de outro aluno.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que `StudyAreasService.getMyStudyArea` corre antes de consultar materiais.
- Confirmar que o módulo importa `AiModule` e não redefine provider.
- Executar caso positivo e três cenários negativos por ser BK `P0`.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-12

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
