# BK-MF2-08 - Extrair tópicos, secções, estrutura e referências.

## Header
- `doc_id`: `GUIA-BK-MF2-08`
- `bk_id`: `BK-MF2-08`
- `macro`: `MF2`
- `owner`: `Kaua`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF32`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-09`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-08-extrair-topicos-seccoes-estrutura-e-referencias.md`
- `last_updated`: `2026-06-11`

## Objetivo do BK

Extrair tópicos, secções, estrutura e referências a partir de um job de indexação concluído, para tornar os materiais pesquisáveis e citáveis.

## Importância

Este BK transforma texto bruto em estrutura pedagógica. Ele prepara citações por secção, navegação por programa e pesquisa por tópico sem depender de heurísticas soltas nos BKs posteriores.

## Scope-in

- Criar estrutura do material ligada a `MaterialIndexJob`.
- Guardar tópicos, secções e referências derivadas dos chunks do BK-MF2-07.
- Rejeitar jobs que ainda não estejam concluídos.
- Expor dados reutilizáveis por IA e pesquisa.

## Scope-out

- Classificação curricular avançada.
- Motor semântico ou embeddings.
- Citações bibliográficas finais, que ficam para MF3/MF7.

## Estado antes

`BK-MF2-07` cria jobs `DONE` com chunks ordenados, texto extraído e origem mínima. Ainda não organiza esse conteúdo por tópicos ou secções.

## Estado depois

Existe `MaterialStructureModule` que lê apenas jobs concluídos e grava estrutura normalizada. Cada secção fica ligada a chunks reais, com origem, locator e excerto, permitindo que BKs futuros pesquisem tópicos e citem fontes sem inventar referências.

## Pré-requisitos

- `MaterialIndexModule` exporta `MaterialIndexService.findDoneJob`.
- Job de indexação concluído com `extractedTextChunks`.
- Actor autenticado com acesso ao job.

## Glossário

- Tópico: conceito principal extraído do material.
- Secção: parte textual com título, ordem, resumo curto e referências.
- Referência: ligação verificável a um chunk do BK-MF2-07, incluindo ordem, origem, locator e excerto.

## Conceitos teóricos

- **Estruturação de conhecimento.** converte chunks indexados em elementos navegáveis. Este conceito vem de `RF32` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-08 - Extrair tópicos, secções, estrutura e referências.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Citação rastreável.** cada referência deve apontar para uma origem verificável do chunk usado. Este conceito vem de `RF32` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-08 - Extrair tópicos, secções, estrutura e referências.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Normalização.** formatos diferentes de material passam a uma mesma forma de consulta porque o BK-MF2-07 já entrega chunks com a mesma estrutura. Este conceito vem de `RF32` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-08 - Extrair tópicos, secções, estrutura e referências.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve provider de IA quando o próprio requisito o pede. Quando não há chamada de IA, o guia limita-se a preparar fontes, autorização ou contexto sem prometer geração automática; quando há chamada de IA, o provider vem de `AiModule`/`AI_PROVIDER`, as fontes são recolhidas antes da chamada e a resposta só é persistida depois de validação mínima.

## Decisões documentais

- `CANONICO`: `BK-MF2-08`, `RF32`, prioridade `P0`, owner `Kaua`, apoio `Natalia`, sprint `S05`, dependências `BK-MF2-07` e próximo BK `BK-MF2-09` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-08 - Extrair tópicos, secções, estrutura e referências.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: a referência mínima usa `chunkOrder`, `sourceLabel`, `locator` e `excerpt`, porque esses dados são suficientes para rastrear a origem sem prometer citação bibliográfica final.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`MaterialStructureService` chama `MaterialIndexService.findDoneJob`, gera tópicos, secções e referências a partir de `extractedTextChunks` e persiste `MaterialStructure`. O controller expõe criação e leitura por job.

## Ficheiros previstos

- `apps/api/src/modules/material-structure/schemas/material-structure.schema.ts`
- `apps/api/src/modules/material-structure/dto/material-structure.dto.ts`
- `apps/api/src/modules/material-structure/material-structure.service.ts`
- `apps/api/src/modules/material-structure/material-structure.controller.ts`
- `apps/api/src/modules/material-structure/material-structure.module.ts`
- `apps/web/src/lib/api/material-structure.ts`
- `apps/web/src/pages/mf2/MaterialStructurePage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de estrutura extraída dos materiais no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/material-structure/schemas/material-structure.schema.ts`
    - CRIAR: `apps/api/src/modules/material-structure/dto/material-structure.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-structure/schemas/material-structure.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialStructureDocument = HydratedDocument<MaterialStructure>;
export type MaterialReference = {
    chunkOrder: number;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};
export type MaterialSection = {
    order: number;
    title: string;
    summary: string;
    references: MaterialReference[];
};

@Schema({ timestamps: true, collection: "material_structures" })
export class MaterialStructure {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    jobId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    ownerId!: Types.ObjectId;

    @Prop({ type: [String], default: [] })
    topics!: string[];

    @Prop({
        type: [
            {
                order: Number,
                title: String,
                summary: String,
                references: [
                    {
                        chunkOrder: Number,
                        sourceLabel: String,
                        locator: String,
                        excerpt: String,
                    },
                ],
            },
        ],
        default: [],
    })
    sections!: MaterialSection[];
}

export const MaterialStructureSchema = SchemaFactory.createForClass(MaterialStructure);
MaterialStructureSchema.index({ jobId: 1 }, { unique: true });

// apps/api/src/modules/material-structure/dto/material-structure.dto.ts
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateMaterialStructureDto {
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(30)
    @IsString({ each: true })
    manualTopics?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    teacherNote?: string;
}
~~~

5. Explicação do código.

    Este bloco separa persistência e entrada HTTP. O schema define os campos guardados em MongoDB, índices e estados que os BKs seguintes podem consultar. Cada referência mantém a ligação ao chunk original através de ordem, origem, locator e excerto. O DTO valida o corpo do pedido antes de chegar ao service, por isso dados vazios, demasiado longos ou com formato errado falham com `400 Bad Request`. A regra de segurança é simples: IDs de utilizador, aluno ou professor nunca vêm do body; vêm sempre da sessão autenticada.

6. Como validar este passo.

    Arranca a API depois de integrar o module e confirma que um body vazio devolve 400.

7. Erros comuns ou cenário negativo.

    Não aceites actorId, teacherId ou studentId no body; esses valores vêm da sessão autenticada.

### Passo 2 - Criar service com autorização

1. Explicação simples do objetivo.

    Centralizar regras de negócio, validação de contexto e erros de domínio.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/material-structure/material-structure.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-structure/material-structure.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialIndexService } from "../material-index/material-index.service";
import { CreateMaterialStructureDto } from "./dto/material-structure.dto";
import { MaterialStructure, MaterialStructureDocument } from "./schemas/material-structure.schema";

type IndexedChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

@Injectable()
export class MaterialStructureService {
    constructor(
        @InjectModel(MaterialStructure.name)
        private readonly structures: Model<MaterialStructureDocument>,
        private readonly indexService: MaterialIndexService,
    ) {}

    async create(actor: AuthenticatedUser, jobId: string, dto: CreateMaterialStructureDto) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const chunks = job.extractedTextChunks as IndexedChunk[];
        const topics = dto.manualTopics?.length ? this.cleanManualTopics(dto.manualTopics) : this.extractTopics(chunks);
        const sections = this.buildSections(chunks);
        const structure = await this.structures.findOneAndUpdate(
            { jobId: job._id },
            {
                jobId: job._id,
                materialId: job.materialId,
                ownerId: job.ownerId,
                topics,
                sections,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        return this.toView(structure);
    }

    async get(actor: AuthenticatedUser, jobId: string) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const structure = await this.structures.findOne({ jobId: job._id });
        return structure ? this.toView(structure) : null;
    }

    private cleanManualTopics(topics: string[]) {
        return Array.from(new Set(topics.map((topic) => topic.trim()).filter((topic) => topic.length >= 4))).slice(0, 30);
    }

    private extractTopics(chunks: IndexedChunk[]) {
        const candidates = chunks.flatMap((chunk) => chunk.text.split(/[.;:\n]/));
        return this.cleanManualTopics(candidates).slice(0, 12);
    }

    private buildSections(chunks: IndexedChunk[]) {
        return chunks.slice(0, 20).map((chunk, index) => ({
            order: index + 1,
            title: this.createTitle(chunk.text, index),
            summary: this.summarise(chunk.text),
            references: [
                {
                    chunkOrder: chunk.order,
                    sourceLabel: chunk.sourceLabel,
                    locator: chunk.locator,
                    excerpt: this.excerpt(chunk.text),
                },
            ],
        }));
    }

    private createTitle(text: string, index: number) {
        const [firstSentence] = text.split(/[.!?]/);
        const cleaned = firstSentence.trim();
        return cleaned.length >= 8 ? cleaned.slice(0, 90) : `Secção ${index + 1}`;
    }

    private summarise(text: string) {
        return text.replace(/\s+/g, " ").trim().slice(0, 280);
    }

    private excerpt(text: string) {
        return text.replace(/\s+/g, " ").trim().slice(0, 180);
    }

    private toView(structure: MaterialStructure) {
        return {
            id: structure._id.toString(),
            jobId: structure.jobId.toString(),
            materialId: structure.materialId.toString(),
            topics: structure.topics,
            sections: structure.sections,
        };
    }
}
~~~

5. Explicação do código.

    Este service concentra a regra de negócio do BK. Recebe o utilizador autenticado, valida o job através de `MaterialIndexService.findDoneJob` e só depois transforma chunks em tópicos e secções. As referências não são fabricadas: cada secção aponta para a ordem, origem, locator e excerto do chunk usado. A entrada principal vem do controller; a saída é uma resposta já filtrada para o frontend. Isto evita duplicar segurança em componentes React e impede acessos cruzados entre alunos, professores, turmas, disciplinas e áreas de estudo.

6. Como validar este passo.

    Testa três casos: sem sessão, sessão sem acesso ao job e sessão válida com job `DONE` que contenha chunks.

7. Erros comuns ou cenário negativo.

    Fazer apenas `Model.findById(id)` sem validar dono ou inscrição permite leitura indevida entre turmas, disciplinas ou áreas.

### Passo 3 - Criar controller e module do domínio

1. Explicação simples do objetivo.

    Expor as rotas HTTP do BK e ligar controller, service e schema no módulo NestJS.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/material-structure/material-structure.controller.ts`
    - CRIAR: `apps/api/src/modules/material-structure/material-structure.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-structure/material-structure.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateMaterialStructureDto } from "./dto/material-structure.dto";
import { MaterialStructureService } from "./material-structure.service";

@UseGuards(SessionGuard)
@Controller("api/material-index/jobs/:jobId/structure")
export class MaterialStructureController {
    constructor(private readonly structureService: MaterialStructureService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string, @Body() dto: CreateMaterialStructureDto) {
        return this.structureService.create(actor, jobId, dto);
    }

    @Get()
    get(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string) {
        return this.structureService.get(actor, jobId);
    }
}

// apps/api/src/modules/material-structure/material-structure.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialIndexModule } from "../material-index/material-index.module";
import { MaterialStructureController } from "./material-structure.controller";
import { MaterialStructureService } from "./material-structure.service";
import { MaterialStructure, MaterialStructureSchema } from "./schemas/material-structure.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: MaterialStructure.name, schema: MaterialStructureSchema }]), MaterialIndexModule],
    controllers: [MaterialStructureController],
    providers: [MaterialStructureService],
    exports: [MaterialStructureService],
})
export class MaterialStructureModule {}
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
    - CRIAR: `apps/web/src/lib/api/material-structure.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/material-structure.ts
export type MaterialReferenceView = {
    chunkOrder: number;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};
export type MaterialStructureView = {
    id: string;
    jobId: string;
    materialId: string;
    topics: string[];
    sections: {
        order: number;
        title: string;
        summary: string;
        references: MaterialReferenceView[];
    }[];
};
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
export function getMaterialStructure(jobId: string) {
    return requestJson<MaterialStructureView | null>("/api/material-index/jobs/" + jobId + "/structure");
}
export function createMaterialStructure(jobId: string, manualTopics?: string[]) {
    return requestJson<MaterialStructureView>("/api/material-index/jobs/" + jobId + "/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualTopics }),
    });
}
~~~

5. Explicação do código.

    O cliente API é tipado e envia cookies com `credentials: "include"`, para reutilizar a sessão segura criada na MF0. Ele não guarda tokens no browser, não envia `actorId` e devolve erros claros quando o backend responde com `400`, `401`, `403` ou `404`. O tipo de resposta inclui referências estruturadas, para a página conseguir mostrar de que chunk saiu cada secção.

6. Como validar este passo.

    Usa DevTools ou testes de integração para confirmar que as chamadas incluem cookies e tratam 401/403/404.

7. Erros comuns ou cenário negativo.

    Fazer fetch sem `credentials: "include"` transforma uma sessão válida em 401 no backend.

### Passo 6 - Criar página React do BK

1. Explicação simples do objetivo.

    Expor a funcionalidade ao utilizador com estados de loading, erro, vazio e sucesso.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/pages/mf2/MaterialStructurePage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/MaterialStructurePage.tsx
import { useState } from "react";
import { createMaterialStructure, MaterialStructureView } from "../../lib/api/material-structure";

export function MaterialStructurePage() {
    const [jobId, setJobId] = useState("");
    const [structure, setStructure] = useState<MaterialStructureView | null>(null);
    const [error, setError] = useState("");
    async function extract() {
        try {
            setStructure(await createMaterialStructure(jobId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao extrair estrutura.");
        }
    }
    return (
        <main>
            <h1>Estrutura do material</h1>
            <input value={jobId} onChange={(event) => setJobId(event.target.value)} placeholder="ID do job" />
            <button type="button" onClick={extract}>Extrair</button>
            {error && <p role="alert">{error}</p>}
            {structure && (
                <ul>
                    {structure.sections.map((section) => (
                        <li key={section.order}>
                            <h2>{section.title}</h2>
                            <p>{section.summary}</p>
                            <ul>
                                {section.references.map((reference) => (
                                    <li key={`${reference.chunkOrder}-${reference.locator}`}>
                                        {reference.sourceLabel} · {reference.locator} · {reference.excerpt}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
~~~

5. Explicação do código.

    A página separa estado de formulário, estado de lista, referências e mensagens de erro para ser fácil de testar e manter.

6. Como validar este passo.

    Abre a página com sessão válida, executa o fluxo principal e confirma que a lista actualiza sem refresh manual.

7. Erros comuns ou cenário negativo.

    Não escondas erros HTTP genéricos; mostra mensagem controlada para o utilizador e mantém o detalhe técnico no backend.

### Passo 7 - Validar contrato, negativos e handoff

1. Explicação simples do objetivo.

    Confirmar que o BK cumpre RF32, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-08-extrair-topicos-seccoes-estrutura-e-referencias.md`
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

    Não avances para BK-MF2-09 se a validação de sessão, ownership ou membership falhar.

### Passo 8 - Fechar prova final do BK P0

1. Explicação simples do objetivo.

    Confirmar que a estrutura criada é rastreável, citável e segura para BKs posteriores.

2. Ficheiros envolvidos.
    - REVER: `apps/api/src/modules/material-structure/material-structure.service.ts`
    - REVER: `apps/api/src/modules/material-structure/material-structure.controller.ts`
    - REVER: `apps/web/src/pages/mf2/MaterialStructurePage.tsx`

3. O que fazer.

    Reexecuta os testes, confirma os três cenários negativos de P0 e regista evidência de tópicos, secções e referências com chunk, origem, locator e excerto.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    A sequência protege o contrato usado por citações, navegação e pesquisa: sem job concluído não há estrutura.

6. Como validar este passo.

    A entrega só está pronta quando cada secção tiver referência verificável ao chunk usado e o service rejeitar jobs não concluídos.

7. Erros comuns ou cenário negativo.

    Guardar tópicos soltos sem ligação a secções e referências torna a IA futura incapaz de citar fontes.

## Expected results

- Job concluído gera estrutura com tópicos, secções e referências derivadas dos chunks.
- Estrutura fica ligada ao job e ao material.
- Cada referência inclui ordem do chunk, origem, locator e excerto.
- Job ainda em processamento é rejeitado.
- Actor sem acesso ao job não lê estrutura.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service usa `MaterialIndexService.findDoneJob` antes de consultar ou gravar estrutura.
- As secções não usam referências genéricas ao job como substituto de fonte.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que a estrutura vem de `MaterialIndexService.findDoneJob`.
- Confirmar que cada referência aponta para um chunk real com origem, locator e excerto.
- Executar caso positivo e três cenários negativos por ser BK `P0`.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.
- Exemplo de resposta com pelo menos uma secção e uma referência rastreável.

## Handoff

BK-MF2-09

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
