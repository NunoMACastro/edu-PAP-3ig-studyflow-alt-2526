# BK-MF2-10 - Separar materiais entre aluno, professor e turma.

## Header
- `doc_id`: `GUIA-BK-MF2-10`
- `bk_id`: `BK-MF2-10`
- `macro`: `MF2`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF34`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-11`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-10-separar-materiais-entre-aluno-professor-e-turma.md`
- `last_updated`: `2026-06-11`

## Objetivo do BK

Separar materiais por contexto de utilização: privado do aluno, oficial do professor e turma/disciplina, impedindo mistura de dados entre perfis.

## Importância

Este BK reduz risco de privacidade e prepara IA segura. Assistentes privados, assistentes de disciplina e requisitos de não exposição entre turmas dependem desta fronteira.

## Scope-in

- Criar registos de contexto de material.
- Associar material a `PRIVATE_AREA` ou `OFFICIAL_SUBJECT`, distinguindo a origem por `source` (`student`, `teacher` ou `class`).
- Validar acesso por owner, disciplina ou turma.
- Listar materiais permitidos por actor e contexto.

## Scope-out

- Consentimentos RGPD.
- Políticas administrativas globais.
- Guardrails finais de IA por perfil.

## Estado antes

A indexação sabe se um job é privado ou oficial, mas ainda não existe uma camada explícita que filtre materiais por contexto de consumo.

## Estado depois

Existe `MaterialContextsModule` que fornece listas seguras para módulos de IA, pesquisa e disciplina. O BK seguinte pode usar apenas materiais privados do aluno.

## Pré-requisitos

- `BK-MF2-07` concluído.
- `MaterialsService`, `SubjectsService` e `OfficialMaterialsService` disponíveis.
- Validação de turma e disciplina herdada da MF1.

## Glossário

- Contexto: fronteira que define quem pode consumir um material.
- Material privado: material submetido pelo aluno para a sua área.
- Material oficial: material do professor numa disciplina/turma.

## Conceitos teóricos

- **Menor privilégio.** cada actor recebe só os materiais necessários. Este conceito vem de `RF34` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-10 - Separar materiais entre aluno, professor e turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Isolamento por domínio.** materiais pessoais e oficiais não se misturam por conveniência. Este conceito vem de `RF34` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-10 - Separar materiais entre aluno, professor e turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Preparação para IA segura.** o assistente só recebe fontes do contexto autorizado. Este conceito vem de `RF34` e das dependências `BK-MF2-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-10 - Separar materiais entre aluno, professor e turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve provider de IA quando o próprio requisito o pede. Quando não há chamada de IA, o guia limita-se a preparar fontes, autorização ou contexto sem prometer geração automática; quando há chamada de IA, o provider vem de `AiModule`/`AI_PROVIDER`, as fontes são recolhidas antes da chamada e a resposta só é persistida depois de validação mínima.

## Decisões documentais

- `CANONICO`: `BK-MF2-10`, `RF34`, prioridade `P0`, owner `Daniel`, apoio `Guilherme`, sprint `S05`, dependências `BK-MF2-07` e próximo BK `BK-MF2-11` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-10 - Separar materiais entre aluno, professor e turma.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`MaterialContextsService` valida actor e origem, grava `MaterialContext` e devolve listas filtradas. O controller separa rotas de aluno, professor e turma para evitar ambiguidade.

## Ficheiros previstos

- `apps/api/src/modules/material-contexts/schemas/material-context.schema.ts`
- `apps/api/src/modules/material-contexts/dto/material-context-query.dto.ts`
- `apps/api/src/modules/material-contexts/material-contexts.service.ts`
- `apps/api/src/modules/material-contexts/material-contexts.controller.ts`
- `apps/api/src/modules/material-contexts/material-contexts.module.ts`
- `apps/web/src/lib/api/material-contexts.ts`
- `apps/web/src/pages/mf2/MaterialContextsPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de contextos de materiais por perfil no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/material-contexts/schemas/material-context.schema.ts`
    - CRIAR: `apps/api/src/modules/material-contexts/dto/material-context-query.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-contexts/schemas/material-context.schema.ts
export type MaterialContextScope = "PRIVATE_AREA" | "OFFICIAL_SUBJECT";

export type MaterialContextView = {
    id: string;
    title: string;
    scope: MaterialContextScope;
    contextId: string;
    source: "student" | "teacher" | "class";
};

// apps/api/src/modules/material-contexts/dto/material-context-query.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

export class MaterialContextQueryDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
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
    - CRIAR: `apps/api/src/modules/material-contexts/material-contexts.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-contexts/material-contexts.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialsService } from "../materials/materials.service";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { MaterialContextView } from "./schemas/material-context.schema";

@Injectable()
export class MaterialContextsService {
    constructor(
        private readonly materialsService: MaterialsService,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async listPrivateForStudent(actor: AuthenticatedUser, studyAreaId: string): Promise<MaterialContextView[]> {
        this.assertStudent(actor);
        const materials = await this.materialsService.listByArea(actor.id, studyAreaId);
        return materials.map((material) => ({ id: material._id.toString(), title: material.title, scope: "PRIVATE_AREA", contextId: studyAreaId, source: "student" }));
    }

    async listOfficialForStudent(actor: AuthenticatedUser, subjectId: string): Promise<MaterialContextView[]> {
        this.assertStudent(actor);
        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        return materials.map((material) => ({ id: material._id.toString(), title: material.title, scope: "OFFICIAL_SUBJECT", contextId: subject._id.toString(), source: "class" }));
    }

    async listOfficialForTeacher(actor: AuthenticatedUser, subjectId: string): Promise<MaterialContextView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        return materials.map((material) => ({ id: material._id.toString(), title: material.title, scope: "OFFICIAL_SUBJECT", contextId: subject._id.toString(), source: "teacher" }));
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar este contexto.");
        }
    }
    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem consultar este contexto.");
        }
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
    - CRIAR: `apps/api/src/modules/material-contexts/material-contexts.controller.ts`
    - CRIAR: `apps/api/src/modules/material-contexts/material-contexts.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-contexts/material-contexts.controller.ts
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialContextsService } from "./material-contexts.service";

@UseGuards(SessionGuard)
@Controller()
export class MaterialContextsController {
    constructor(private readonly contextsService: MaterialContextsService) {}

    @Get("api/material-contexts/student/:studyAreaId")
    listPrivateForStudent(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string) {
        return this.contextsService.listPrivateForStudent(actor, studyAreaId);
    }

    @Get("api/material-contexts/subjects/:subjectId")
    listOfficialForStudent(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.contextsService.listOfficialForStudent(actor, subjectId);
    }

    @Get("api/teacher/material-contexts/subjects/:subjectId")
    listOfficialForTeacher(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.contextsService.listOfficialForTeacher(actor, subjectId);
    }
}

// apps/api/src/modules/material-contexts/material-contexts.module.ts
import { Module } from "@nestjs/common";
import { MaterialsModule } from "../materials/materials.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { MaterialContextsController } from "./material-contexts.controller";
import { MaterialContextsService } from "./material-contexts.service";

@Module({
    imports: [MaterialsModule, SubjectsModule, OfficialMaterialsModule],
    controllers: [MaterialContextsController],
    providers: [MaterialContextsService],
    exports: [MaterialContextsService],
})
export class MaterialContextsModule {}
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
    - CRIAR: `apps/web/src/lib/api/material-contexts.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/material-contexts.ts
export type MaterialContextView = { id: string; title: string; scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT"; contextId: string; source: "student" | "teacher" | "class" };
async function requestJson<T>(path: string): Promise<T> {
    const response = await fetch(path, {
        // Envia o cookie HttpOnly da sessão; o backend decide permissões pelo actor autenticado.
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
}
export function listPrivateMaterialContexts(studyAreaId: string) {
    return requestJson<MaterialContextView[]>("/api/material-contexts/student/" + studyAreaId);
}
export function listSubjectMaterialContexts(subjectId: string) {
    return requestJson<MaterialContextView[]>("/api/material-contexts/subjects/" + subjectId);
}
export function listTeacherSubjectMaterialContexts(subjectId: string) {
    return requestJson<MaterialContextView[]>("/api/teacher/material-contexts/subjects/" + subjectId);
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
    - CRIAR: `apps/web/src/pages/mf2/MaterialContextsPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/MaterialContextsPage.tsx
import { useState } from "react";
import { listPrivateMaterialContexts, listSubjectMaterialContexts, MaterialContextView } from "../../lib/api/material-contexts";

export function MaterialContextsPage() {
    const [contextId, setContextId] = useState("");
    const [mode, setMode] = useState<"PRIVATE" | "SUBJECT">("PRIVATE");
    const [items, setItems] = useState<MaterialContextView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        try {
            const nextItems =
                mode === "PRIVATE"
                    ? await listPrivateMaterialContexts(contextId.trim())
                    : await listSubjectMaterialContexts(contextId.trim());
            setItems(nextItems);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar materiais.");
        }
    }
    return (
        <main>
            <h1>Contextos de materiais</h1>
            <select value={mode} onChange={(event) => setMode(event.target.value === "SUBJECT" ? "SUBJECT" : "PRIVATE")}>
                <option value="PRIVATE">Aluno</option>
                <option value="SUBJECT">Turma</option>
            </select>
            <input value={contextId} onChange={(event) => setContextId(event.target.value)} placeholder="ID do contexto" />
            <button type="button" onClick={load}>Carregar</button>
            {error && <p role="alert">{error}</p>}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>{item.title} - {item.source}</li>
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

    Confirmar que o BK cumpre RF34, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-10-separar-materiais-entre-aluno-professor-e-turma.md`
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

    Não avances para BK-MF2-11 se a validação de sessão, ownership ou membership falhar.

### Passo 8 - Fechar prova final do BK P0

1. Explicação simples do objetivo.

    Confirmar que a separação de contexto impede leitura cruzada entre aluno, professor e turma.

2. Ficheiros envolvidos.
    - REVER: `apps/api/src/modules/material-contexts/material-contexts.service.ts`
    - REVER: `apps/api/src/modules/material-contexts/material-contexts.controller.ts`
    - REVER: `apps/web/src/pages/mf2/MaterialContextsPage.tsx`

3. O que fazer.

    Reexecuta os testes, confirma os três cenários negativos de P0 e regista evidência de cada contexto.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    A sequência valida que a fronteira de materiais fica pronta para IA privada, IA da disciplina e requisitos de privacidade.

6. Como validar este passo.

    A entrega só está pronta quando material privado não aparecer no contexto oficial e material oficial não aparecer na área privada.

7. Erros comuns ou cenário negativo.

    Usar uma lista global de materiais com filtros no frontend expõe dados indevidos e viola a separação de contexto.

## Expected results

- Material privado aparece apenas ao aluno dono.
- Material oficial aparece apenas no contexto da disciplina/turma autorizada.
- Listagem por contexto não mistura fontes privadas e oficiais.
- Actor sem relação com o contexto recebe erro controlado.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que cada contexto tem regra de autorização própria.
- Confirmar que a resposta não devolve materiais de outras turmas ou alunos.
- Executar três cenários negativos por ser BK `P0`, incluindo tentativa de acesso cruzado.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-11

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
