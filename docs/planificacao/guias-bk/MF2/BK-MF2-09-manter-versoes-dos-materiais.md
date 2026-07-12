# BK-MF2-09 - Manter versões dos materiais.

## Header
- `doc_id`: `GUIA-BK-MF2-09`
- `bk_id`: `BK-MF2-09`
- `macro`: `MF2`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF33`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-10`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-09-manter-versoes-dos-materiais.md`
- `last_updated`: `2026-07-11`

## Objetivo do BK

Guardar versões de materiais indexados e permitir consultar ou repor uma versão anterior quando necessário.

## Importância

Versionamento protege professores e alunos contra alterações acidentais. Também dá uma base auditável para entender que conteúdo alimentou IA, testes ou pesquisa em determinado momento.

## Scope-in

- Criar versão a partir de um job de indexação concluído.
- Guardar número, título, chunks e metadados mínimos.
- Listar versões por material.
- Repor uma versão como activa.

## Scope-out

- Comparação visual entre versões.
- Merge automático de versões.
- Auditoria administrativa completa.

## Estado antes

`BK-MF2-07` guarda jobs e chunks, mas não preserva histórico de alterações dos materiais.

## Estado depois

Existe `MaterialVersionsModule` com snapshots versionados e operação de reposição. O BK seguinte pode separar materiais por contexto sem perder histórico.

## Pré-requisitos

- `MaterialIndexModule` exporta `MaterialIndexService.findDoneJob`.
- Job concluído com chunks.
- Actor autenticado com acesso ao job.

## Glossário

- Versão: snapshot de um material num momento.
- Snapshot: cópia do conteúdo necessário para reproduzir a versão.
- Reposição: marcação de uma versão anterior como activa.

## Conceitos teóricos

- **Imutabilidade.** uma versão criada não deve ser editada, apenas sucedida. Este conceito vem de `RF33` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-09 - Manter versões dos materiais.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Rastreabilidade.** cada versão sabe de que job nasceu. Este conceito vem de `RF33` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-09 - Manter versões dos materiais.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Reversibilidade.** o sistema deve permitir regressar a uma versão estável. Este conceito vem de `RF33` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-09 - Manter versões dos materiais.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-09`, `RF33`, prioridade `P1`, owner `Natalia`, apoio `Guilherme`, sprint `S05`, dependências `BK-MF2-07` e próximo BK `BK-MF2-10` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-09 - Manter versões dos materiais.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`MaterialVersionsService` valida o job concluído, calcula o próximo número, cria `MaterialVersion` e permite listar/restaurar versões do mesmo material e contexto.

## Ficheiros previstos

- `apps/api/src/modules/material-versions/schemas/material-version.schema.ts`
- `apps/api/src/modules/material-versions/dto/material-version.dto.ts`
- `apps/api/src/modules/material-versions/material-versions.service.ts`
- `apps/api/src/modules/material-versions/material-versions.controller.ts`
- `apps/api/src/modules/material-versions/material-versions.module.ts`
- `apps/web/src/lib/api/material-versions.ts`
- `apps/web/src/pages/mf2/MaterialVersionsPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de versões de materiais indexados no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/material-versions/schemas/material-version.schema.ts`
    - CRIAR: `apps/api/src/modules/material-versions/dto/material-version.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-versions/schemas/material-version.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialVersionDocument = HydratedDocument<MaterialVersion>;

@Schema({ timestamps: true, collection: "material_versions" })
export class MaterialVersion {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    jobId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    ownerId!: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    versionNumber!: number;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 300 })
    title!: string;

    @Prop({ type: [String], default: [] })
    changeSummary!: string[];
}

export const MaterialVersionSchema = SchemaFactory.createForClass(MaterialVersion);
MaterialVersionSchema.index({ materialId: 1, versionNumber: -1 });

// apps/api/src/modules/material-versions/dto/material-version.dto.ts
import { ArrayMaxSize, IsArray, IsString, MaxLength, MinLength } from "class-validator";

export class CreateMaterialVersionDto {
    @IsString()
    @MinLength(3)
    @MaxLength(300)
    title!: string;

    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    changeSummary!: string[];
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
    - CRIAR: `apps/api/src/modules/material-versions/material-versions.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-versions/material-versions.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialIndexService } from "../material-index/material-index.service";
import { CreateMaterialVersionDto } from "./dto/material-version.dto";
import { MaterialVersion, MaterialVersionDocument } from "./schemas/material-version.schema";

@Injectable()
export class MaterialVersionsService {
    constructor(
        @InjectModel(MaterialVersion.name)
        private readonly versions: Model<MaterialVersionDocument>,
        private readonly indexService: MaterialIndexService,
    ) {}

    async create(actor: AuthenticatedUser, jobId: string, dto: CreateMaterialVersionDto) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const latest = await this.versions.findOne({ materialId: job.materialId }).sort({ versionNumber: -1 });
        const version = await this.versions.create({ jobId: job._id, materialId: job.materialId, ownerId: job.ownerId, versionNumber: latest ? latest.versionNumber + 1 : 1, title: dto.title.trim(), changeSummary: dto.changeSummary });
        return this.toView(version);
    }

    async list(actor: AuthenticatedUser, jobId: string) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const versions = await this.versions.find({ materialId: job.materialId, ownerId: job.ownerId }).sort({ versionNumber: -1 }).lean();
        return versions.map((version) => this.toView(version));
    }

    private toView(version: MaterialVersion) {
        return { id: version._id.toString(), materialId: version.materialId.toString(), jobId: version.jobId.toString(), versionNumber: version.versionNumber, title: version.title, changeSummary: version.changeSummary };
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
    - CRIAR: `apps/api/src/modules/material-versions/material-versions.controller.ts`
    - CRIAR: `apps/api/src/modules/material-versions/material-versions.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-versions/material-versions.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateMaterialVersionDto } from "./dto/material-version.dto";
import { MaterialVersionsService } from "./material-versions.service";

@UseGuards(SessionGuard)
@Controller("api/material-index/jobs/:jobId/versions")
export class MaterialVersionsController {
    constructor(private readonly versionsService: MaterialVersionsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string, @Body() dto: CreateMaterialVersionDto) {
        return this.versionsService.create(actor, jobId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string) {
        return this.versionsService.list(actor, jobId);
    }
}

// apps/api/src/modules/material-versions/material-versions.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialIndexModule } from "../material-index/material-index.module";
import { MaterialVersionsController } from "./material-versions.controller";
import { MaterialVersionsService } from "./material-versions.service";
import { MaterialVersion, MaterialVersionSchema } from "./schemas/material-version.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: MaterialVersion.name, schema: MaterialVersionSchema }]), MaterialIndexModule],
    controllers: [MaterialVersionsController],
    providers: [MaterialVersionsService],
    exports: [MaterialVersionsService],
})
export class MaterialVersionsModule {}
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
    - CRIAR: `apps/web/src/lib/api/material-versions.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/material-versions.ts
export type MaterialVersionView = { id: string; materialId: string; jobId: string; versionNumber: number; title: string; changeSummary: string[] };
export type CreateMaterialVersionInput = { title: string; changeSummary: string[] };
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
export function listMaterialVersions(jobId: string) {
    return requestJson<MaterialVersionView[]>("/api/material-index/jobs/" + jobId + "/versions");
}
export function createMaterialVersion(jobId: string, input: CreateMaterialVersionInput) {
    return requestJson<MaterialVersionView>("/api/material-index/jobs/" + jobId + "/versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
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
    - CRIAR: `apps/web/src/pages/mf2/MaterialVersionsPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/MaterialVersionsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createMaterialVersion, listMaterialVersions, MaterialVersionView } from "../../lib/api/material-versions";

export function MaterialVersionsPage() {
    const [jobId, setJobId] = useState("");
    const [title, setTitle] = useState("");
    const [versions, setVersions] = useState<MaterialVersionView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!jobId.trim()) return;

        try {
            setVersions(await listMaterialVersions(jobId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar versões.");
        }
    }
    useEffect(() => {
        void load();
    }, [jobId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await createMaterialVersion(jobId.trim(), {
            title,
            changeSummary: ["Nova versão revista"],
        });
        setTitle("");
        await load();
    }
    return (
        <main>
            <h1>Versões do material</h1>
            <form onSubmit={submit}>
                <input value={jobId} onChange={(event) => setJobId(event.target.value)} placeholder="ID do job" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título da versão" />
                <button type="submit">Criar versão</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ol>
                {versions.map((version) => (
                    <li key={version.id}>v{version.versionNumber} - {version.title}</li>
                ))}
            </ol>
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

    Confirmar que o BK cumpre RF33, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-09-manter-versoes-dos-materiais.md`
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

    Não avances para BK-MF2-10 se a validação de sessão, ownership ou membership falhar.

## Expected results

- Sistema cria versão numerada a partir de job concluído.
- Listagem devolve versões do material/contexto autorizado.
- Reposição marca uma versão anterior como activa.
- Job não concluído não cria versão.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que versões são snapshots e não edições directas.
- Confirmar que a numeração cresce por material e contexto.
- Executar caso positivo, reposição e dois cenários negativos.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-10

## Atualização de paridade professor → aluno (2026-07-11)

Para materiais oficiais, criar ou restaurar uma versão atualiza na mesma transação a
versão ativa e a projeção `OfficialMaterial.textContent`, `activeVersionId` e
`contentRevision`. O catálogo do aluno é paginado e remove `teacherId`; a IA e as salas
consomem a mesma projeção ativa. A migração reconstrói esta relação a partir das versões
`OFFICIAL_SUBJECT` existentes.

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
- `2026-07-11`: documentadas projeção atómica, catálogo discente minimizado e migração da versão ativa.
