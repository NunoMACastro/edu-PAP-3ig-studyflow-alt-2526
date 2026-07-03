# BK-MF8-05 - Aproximação da UI à UI do mockup.

## Header

- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF38`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais implementar uma checklist visual de aproximação ao mockup para páginas reais do StudyFlow. A checklist fica visível no dashboard do aluno e serve para organizar o fecho visual da PAP sem criar backend novo, sem alterar requisitos e sem inventar regras fora de `RNF38`.

No fim, a aplicação passa a ter uma peça simples para controlar três ecrãs de referência: estudo individual, salas de estudo e área docente. Cada item liga a uma rota real da app, descreve o estado visual esperado e indica que prova deve ser recolhida para PR ou defesa.

#### Importância

`RNF38` é CANONICO: a UI real deve aproximar-se da UI definida no mockup. Isto não significa fazer pixel-perfect nem transformar o mockup em contrato técnico. Significa criar uma forma objetiva de comparar páginas reais com a referência visual e registar evidence sem expor dados sensíveis.

Este BK é importante para a defesa porque torna o acabamento visual demonstrável. Em vez de dizer apenas que a UI foi melhorada, o aluno consegue apontar para rotas reais, estados a verificar, critérios visuais e provas de execução.

#### Scope-in

- Confirmar `BK-MF8-05`, `RNF38`, owner, apoio, sprint e handoff nos documentos canónicos.
- Consultar `mockup/` como referência visual e de fluxo, sem o tratar como contrato técnico.
- Criar uma checklist frontend reutilizável em `apps/web/src/features/mf8/mockup-alignment.ts`.
- Criar um painel React completo em `apps/web/src/features/mf8/mockup-alignment-panel.tsx`.
- Integrar o painel no dashboard real do aluno em `apps/web/src/pages/student/SoloStudyDashboard.tsx`.
- Criar teste Playwright em `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`.
- Usar rotas reais da aplicação: `/app`, `/app/salas` e `/app/professor/turmas`.

#### Scope-out

- Criar endpoint, controller, DTO, schema, model ou service backend.
- Alterar autenticação, sessão, ownership, membership, roles ou permissões.
- Alterar IDs, owner, apoio, prioridade, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Exigir pixel-perfect ou copiar o mockup como se fosse contrato técnico.
- Guardar screenshots, cookies, tokens, dados pessoais, materiais privados, prompts privados ou respostas IA completas no código.
- Prometer RAG, embeddings, OCR, tradução completa, automações externas ou integrações que não pertencem a `RNF38`.

#### Estado antes e depois

- Estado antes: `BK-MF8-04` deixa o fluxo de IA externa com policy e UI própria; a aproximação visual ao mockup ainda não tem checklist implementável ligada a rotas reais.
- Estado depois: `BK-MF8-05` entrega uma checklist visual, um painel React integrado no dashboard do aluno, um teste Playwright focado e um handoff limpo para `BK-MF8-06`.

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- `apps/web/src/routes/protectedRoutes.tsx`
- `apps/web/src/components/layout/navigation.ts`
- `apps/web/tests/e2e/`
- `mockup/`

#### Glossário

- **Mockup:** referência visual e de fluxo usada para comparar hierarquia, navegação, estados e linguagem da UI.
- **Checklist visual:** lista controlada de ecrãs reais, estados esperados e evidence a recolher.
- **Rota real:** caminho que existe na aplicação, como `/app`, `/app/salas` ou `/app/professor/turmas`.
- **Evidence visual:** prova de que um ecrã foi revisto, como screenshot desktop/mobile ou nota de verificação sem dados sensíveis.
- **Estado visual:** situação observável da interface, por exemplo carregamento, vazio, erro ou sucesso.
- **Painel React:** componente que mostra a checklist dentro da app.
- **Teste Playwright:** teste E2E que abre a app no browser e confirma elementos visíveis.
- **Dados sensíveis:** emails reais, nomes de alunos reais, materiais privados, cookies, tokens, prompts privados e respostas IA completas.

#### Conceitos teóricos essenciais

- **Aproximação visual:** não é copiar cada pixel. É alinhar navegação, hierarquia, labels, espaçamento, estados e clareza com a intenção do mockup.
- **Fonte de verdade funcional:** a rota real da aplicação prevalece sobre nomes usados no mockup. Se a app usa `/app/salas`, a checklist não deve apontar para `/student/rooms`.
- **Componente React:** recebe dados por props ou por função local e transforma esse contrato em UI. Neste BK, o componente não decide permissões.
- **Estado local:** neste BK, os itens são estáticos porque servem para fecho visual e evidence. Não há chamada HTTP, por isso não há `credentials: "include"` neste fluxo.
- **Acessibilidade:** a checklist deve ter headings, links com texto claro e mensagens compreensíveis para que a defesa possa navegar sem ambiguidade.
- **Privacidade:** screenshots e notes de defesa não devem mostrar dados reais de alunos, professores, materiais, prompts ou respostas IA completas.
- **Teste E2E:** valida o comportamento observável da UI. Aqui, o teste confirma que o painel aparece, usa rotas reais e não expõe rotas antigas.

#### Arquitetura do BK

- Requisito canónico: `RNF38`.
- Endpoint: nenhum endpoint novo.
- Backend: sem alteração.
- Frontend:
  - `apps/web/src/features/mf8/mockup-alignment.ts`
  - `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
  - `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- Testes:
  - `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- Rotas reais validadas:
  - `/app`
  - `/app/salas`
  - `/app/professor/turmas`
- Decisão CANONICO: `RNF38` exige aproximação da UI real ao mockup.
- Decisões DERIVADO:
  - usar checklist visual em vez de pixel-perfect;
  - integrar o painel no dashboard do aluno para ficar visível no primeiro ecrã autenticado;
  - usar Playwright porque já existe configuração E2E no frontend.
- Handoff: `BK-MF8-06` pode assumir que o fecho visual tem inventário verificável e rotas reais.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/features/mf8/mockup-alignment.ts`
- CRIAR: `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
- CRIAR: `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- EDITAR: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- REVER: `apps/web/src/components/layout/navigation.ts`
- REVER: `mockup/`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e rotas reais

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega `RNF38` e que a checklist usa rotas existentes na aplicação StudyFlow.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `apps/web/src/routes/protectedRoutes.tsx`
    - REVER: `mockup/`
    - LOCALIZAÇÃO: linha de `RNF38`, linha de `BK-MF8-05` e função `resolveProtectedPage`.

3. Instruções do que fazer.

Confirma estes pontos antes de criar código:

- `BK-MF8-05` continua associado a `RNF38`;
- `owner` é `Guilherme` e `apoio` é `Natalia`;
- `proximo_bk` é `BK-MF8-06`;
- a app usa `/app`, `/app/salas` e `/app/professor/turmas`;
- o mockup é referência visual, não contrato técnico.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e evita que o aluno escreva caminhos errados antes de criar a checklist.

5. Explicação do código.

Não há código porque a decisão principal é de alinhamento documental. O erro que este passo evita é criar uma checklist bonita mas desligada da navegação real da aplicação.

6. Validação do passo.

Resultado esperado: consegues apontar no código para `/app`, `/app/salas` e `/app/professor/turmas`, e consegues apontar nos documentos para `RNF38` e `BK-MF8-05`.

7. Cenário negativo/erro esperado.

Se encontrares uma rota no guia que não exista em `protectedRoutes.tsx`, corrige a rota no guia antes de escrever componente ou teste.

### Passo 2 - Criar o contrato da checklist visual

1. Objetivo funcional do passo no contexto da app.

Criar a função que descreve os ecrãs a comparar com o mockup, com rotas reais, estados esperados e evidence.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/features/mf8/mockup-alignment.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `apps/web/src/features/mf8/` se ainda não existir. Depois cria o ficheiro abaixo com o contrato completo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/mf8/mockup-alignment.ts
export type MockupAlignmentStatus = "PENDENTE" | "VALIDADO" | "BLOQUEADO";

export type MockupAlignmentItem = {
    id: string;
    screen: string;
    realPath: string;
    mockupFocus: string;
    expectedState: string;
    evidence: string;
    status: MockupAlignmentStatus;
};

export type MockupAlignmentSummary = {
    total: number;
    pending: number;
    validated: number;
    blocked: number;
};

/**
 * Lista os ecrãs prioritários para aproximar a UI real ao mockup.
 *
 * @returns Itens de revisão visual ligados a rotas reais da aplicação.
 */
export function buildMockupAlignmentChecklist(): MockupAlignmentItem[] {
    return [
        {
            id: "solo-study-dashboard",
            screen: "Dashboard do aluno",
            realPath: "/app",
            mockupFocus: "hierarquia inicial, cards de progresso e chamadas de ação",
            expectedState: "cards de estudo, progresso, rotinas e materiais visíveis sem poluição visual",
            evidence: "screenshot desktop e mobile com conta seed de aluno",
            status: "PENDENTE",
        },
        {
            id: "study-rooms",
            screen: "Salas de estudo",
            realPath: "/app/salas",
            mockupFocus: "organização de salas, partilhas e ações principais",
            expectedState: "lista ou estado vazio com ações claras para criar e abrir salas",
            evidence: "screenshot com estado vazio e screenshot com sala populada",
            status: "PENDENTE",
        },
        {
            id: "teacher-classes",
            screen: "Área docente",
            realPath: "/app/professor/turmas",
            mockupFocus: "navegação docente, turmas, disciplinas e ações de acompanhamento",
            expectedState: "turmas acessíveis, ações docentes visíveis e feedback de carregamento controlado",
            evidence: "screenshot com conta seed de professor",
            status: "PENDENTE",
        },
    ];
}

/**
 * Calcula totais da checklist sem guardar dados pessoais nem screenshots no código.
 *
 * @param items Itens de revisão visual.
 * @returns Totais por estado para apresentar na UI e usar em defesa.
 */
export function summarizeMockupAlignment(
    items: MockupAlignmentItem[],
): MockupAlignmentSummary {
    return items.reduce<MockupAlignmentSummary>(
        (summary, item) => {
            // A contagem fica derivada dos itens para evitar números manuais divergentes na defesa.
            if (item.status === "PENDENTE") summary.pending += 1;
            if (item.status === "VALIDADO") summary.validated += 1;
            if (item.status === "BLOQUEADO") summary.blocked += 1;
            summary.total += 1;
            return summary;
        },
        { total: 0, pending: 0, validated: 0, blocked: 0 },
    );
}

/**
 * Valida a checklist antes de a UI a apresentar.
 *
 * @param items Itens de revisão visual.
 * @returns Lista de mensagens de erro; lista vazia significa contrato válido.
 */
export function validateMockupAlignmentChecklist(
    items: MockupAlignmentItem[],
): string[] {
    const allowedPaths = new Set(["/app", "/app/salas", "/app/professor/turmas"]);

    return items.flatMap((item) => {
        const errors: string[] = [];
        if (!allowedPaths.has(item.realPath)) {
            errors.push(`${item.screen}: rota real não reconhecida (${item.realPath}).`);
        }
        if (item.evidence.trim().length === 0) {
            errors.push(`${item.screen}: evidence visual em falta.`);
        }
        // O mockup orienta a revisão, mas a rota real continua a ser a âncora técnica.
        if (item.mockupFocus.trim().length === 0) {
            errors.push(`${item.screen}: foco visual do mockup em falta.`);
        }
        return errors;
    });
}
```

5. Explicação do código.

Este ficheiro transforma `RNF38` num contrato simples: uma lista de ecrãs, rotas reais, foco visual e evidence. A função `buildMockupAlignmentChecklist()` cria os itens que o painel vai mostrar. A função `summarizeMockupAlignment()` calcula totais sem guardar screenshots nem dados sensíveis. A função `validateMockupAlignmentChecklist()` protege contra o erro mais perigoso deste BK: apontar a checklist para rotas que não existem.

O código não cria backend porque este BK é de fecho visual. Também não chama APIs, não mexe em cookies e não decide permissões. A segurança aqui está em não expor dados sensíveis e em manter a checklist ligada a rotas reais.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/web run build
```

Resultado esperado: o TypeScript compila e não há erro de export/import neste ficheiro.

7. Cenário negativo/erro esperado.

Altera temporariamente uma rota para `/student/dashboard` e chama `validateMockupAlignmentChecklist(...)`. O resultado esperado é uma mensagem de erro a dizer que a rota não é reconhecida. Depois repõe `/app`.

### Passo 3 - Criar o painel React da checklist

1. Objetivo funcional do passo no contexto da app.

Mostrar a checklist visual dentro da UI real, com totais, links, estados e mensagens adequadas a aluno/professor em português de Portugal.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
    - REVER: `apps/web/src/features/mf8/mockup-alignment.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o componente abaixo. Ele deve importar o contrato do passo anterior, validar a checklist antes de mostrar itens e usar links reais.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/mf8/mockup-alignment-panel.tsx
import { useMemo } from "react";
import {
    buildMockupAlignmentChecklist,
    summarizeMockupAlignment,
    validateMockupAlignmentChecklist,
    type MockupAlignmentItem,
    type MockupAlignmentStatus,
} from "./mockup-alignment.js";

const statusLabel: Record<MockupAlignmentStatus, string> = {
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    BLOQUEADO: "Bloqueado",
};

/**
 * Devolve classes visuais para cada estado sem alterar o contrato funcional.
 *
 * @param status Estado de revisão visual do item.
 * @returns Classes Tailwind usadas no badge do estado.
 */
function getStatusClassName(status: MockupAlignmentStatus): string {
    if (status === "VALIDADO") {
        return "bg-emerald-100 text-emerald-800";
    }

    if (status === "BLOQUEADO") {
        return "bg-rose-100 text-rose-800";
    }

    return "bg-amber-100 text-amber-900";
}

/**
 * Renderiza um item individual da checklist.
 *
 * @param props Dados do item visual.
 * @returns Cartão com rota, foco de mockup e evidence esperada.
 */
function MockupAlignmentCard({ item }: { item: MockupAlignmentItem }) {
    return (
        <article className="sf-panel space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950">{item.screen}</h3>
                    <p className="text-sm text-slate-600">{item.mockupFocus}</p>
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(item.status)}`}
                >
                    {statusLabel[item.status]}
                </span>
            </div>

            <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                    <dt className="font-medium text-slate-700">Rota real</dt>
                    <dd>
                        <a className="text-studyflow-brand underline" href={item.realPath}>
                            {item.realPath}
                        </a>
                    </dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-700">Estado esperado</dt>
                    <dd className="text-slate-600">{item.expectedState}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-700">Evidence</dt>
                    <dd className="text-slate-600">{item.evidence}</dd>
                </div>
            </dl>
        </article>
    );
}

/**
 * Painel de fecho visual para RNF38.
 *
 * @returns Checklist de aproximação ao mockup com rotas reais e validação local.
 */
export function MockupAlignmentPanel() {
    const items = useMemo(() => buildMockupAlignmentChecklist(), []);
    const summary = useMemo(() => summarizeMockupAlignment(items), [items]);
    const validationErrors = useMemo(
        () => validateMockupAlignmentChecklist(items),
        [items],
    );

    return (
        <section className="space-y-4" aria-labelledby="mockup-alignment-title">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-studyflow-brand">
                        MF8 · RNF38
                    </p>
                    <h2 id="mockup-alignment-title" className="text-xl font-bold text-slate-950">
                        Alinhamento ao mockup
                    </h2>
                    <p className="max-w-3xl text-sm text-slate-600">
                        Usa esta checklist para comparar páginas reais com o mockup e recolher evidence
                        visual sem guardar dados sensíveis no código.
                    </p>
                </div>
                <div className="sf-panel grid min-w-56 grid-cols-2 gap-2 text-sm">
                    {/* Estes totais ajudam na defesa sem dependerem de cálculos manuais no relatório. */}
                    <span>Total: {summary.total}</span>
                    <span>Pendentes: {summary.pending}</span>
                    <span>Validados: {summary.validated}</span>
                    <span>Bloqueados: {summary.blocked}</span>
                </div>
            </div>

            {validationErrors.length > 0 ? (
                <div className="sf-error" role="alert">
                    <p className="font-semibold">Corrige a checklist antes de recolher evidence.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        {validationErrors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            <div className="grid gap-3">
                {items.map((item) => (
                    <MockupAlignmentCard item={item} key={item.id} />
                ))}
            </div>
        </section>
    );
}
```

5. Explicação do código.

O painel usa `useMemo` para construir a checklist uma vez e recalcular totais apenas quando a lista muda. `MockupAlignmentCard` separa a apresentação de cada item para manter o componente principal legível. A validação local aparece antes dos cartões para impedir que a equipa recolha evidence sobre uma rota errada.

Este componente não chama backend e não usa `localStorage` ou `sessionStorage`. Os links apontam para rotas reais já protegidas pela aplicação. A autorização continua no fluxo existente de sessão e nas páginas reais, não neste painel.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/web run build
```

Resultado esperado: não há erro de import, tipos ou JSX.

7. Cenário negativo/erro esperado.

Se o contrato tiver uma rota fora da lista permitida, a UI deve mostrar a mensagem `Corrige a checklist antes de recolher evidence.` e listar o problema.

### Passo 4 - Integrar o painel no dashboard do aluno

1. Objetivo funcional do passo no contexto da app.

Colocar a checklist num ecrã real que já existe e que o aluno vê depois de iniciar sessão.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
    - CRIAR: `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
    - LOCALIZAÇÃO: ficheiro completo `SoloStudyDashboard.tsx`.

3. Instruções do que fazer.

Substitui `SoloStudyDashboard.tsx` pela versão abaixo. A única mudança funcional é importar `MockupAlignmentPanel` e renderizá-lo no fim da página, depois dos atalhos principais.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/student/SoloStudyDashboard.tsx
/**
 * Implementa uma página React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { MockupAlignmentPanel } from "../../features/mf8/mockup-alignment-panel.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";
import { getSoloStudyState, SoloStudyState } from "../../lib/apiClient.js";

/**
 * Dashboard do modo individual sem turma obrigatória.
 *
 * @returns Painel inicial do aluno.
 */
export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function load(): Promise<void> {
            const measurement = startPerformanceBudget("solo-study-dashboard");
            setLoading(true);
            setError(null);
            setPerformanceWarning(null);
            try {
                const nextState = await getSoloStudyState();
                if (active) setState(nextState);
            } catch (caught) {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Erro ao carregar estudo individual.",
                    );
                }
            } finally {
                if (active) {
                    const result = finishPerformanceBudget(measurement);
                    setPerformanceWarning(
                        result.exceeded
                            ? formatPerformanceBudgetMessage(result)
                            : null,
                    );
                    setLoading(false);
                }
            }
        }

        void load();
        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="space-y-6">
            <PageHeader
                title={state ? `Olá, ${state.studentName}` : "Estudo individual"}
                description={
                    state?.hasClass
                        ? `Turma: ${state.className}`
                        : "Modo individual ativo para organizar áreas, rotinas e materiais."
                }
                action={<a className="sf-button-primary" href="/app/areas">Criar área</a>}
            />

            {loading ? <p className="text-sm text-slate-600">A carregar estudo...</p> : null}
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {performanceWarning ? (
                <p className="sf-panel text-sm text-amber-900" role="status">
                    {performanceWarning}
                </p>
            ) : null}

            {state ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <article className="sf-panel">
                        <p className="text-sm text-slate-500">Áreas</p>
                        <p className="mt-2 text-3xl font-bold">{state.studyAreasCount}</p>
                    </article>
                    <article className="sf-panel">
                        <p className="text-sm text-slate-500">Rotinas</p>
                        <p className="mt-2 text-3xl font-bold">{state.routinesCount}</p>
                    </article>
                    <article className="sf-panel">
                        <p className="text-sm text-slate-500">Materiais</p>
                        <p className="mt-2 text-3xl font-bold">{state.materialsCount}</p>
                    </article>
                </div>
            ) : null}

            {state && state.studyAreasCount === 0 ? (
                <p className="sf-panel text-sm text-slate-600">
                    Ainda não há áreas de estudo. Cria a primeira área para juntar materiais e IA privada.
                </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
                <a className="sf-button-secondary" href="/app/rotinas">Organizar rotinas</a>
            </div>

            {/* A checklist fica no dashboard para ser fácil recolher evidence no fecho da PAP. */}
            <MockupAlignmentPanel />
        </section>
    );
}
```

5. Explicação do código.

A página mantém o comportamento anterior: carrega o estado do estudo, mostra loading, erro, aviso de performance e cards. A integração nova é apenas o import e a renderização de `MockupAlignmentPanel`.

O painel fica no dashboard porque `/app` já é a entrada autenticada do aluno. Assim, o aluno consegue abrir a checklist sem criar nova rota, sem mexer na navegação global e sem alterar permissões. O dashboard continua a chamar a API através do cliente existente; a checklist em si é local e não envia dados.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/web run build
```

Resultado esperado: o build compila e a página `/app` mostra `Alinhamento ao mockup` depois do login.

7. Cenário negativo/erro esperado.

Remove temporariamente o import de `MockupAlignmentPanel`. O resultado esperado é erro de compilação por componente desconhecido se ele continuar renderizado. Depois repõe o import.

### Passo 5 - Criar teste Playwright do painel

1. Objetivo funcional do passo no contexto da app.

Criar uma prova automatizada de que a checklist aparece, usa rotas reais e não mantém rotas antigas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
    - REVER: `apps/web/playwright.config.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele segue o padrão dos testes E2E existentes: usa credenciais seed com possibilidade de override por variáveis de ambiente e valida comportamento observável.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf8-mockup-alignment.spec.ts
import { expect, test, type Page } from "@playwright/test";

type Credentials = {
    email: string;
    password: string;
};

const student = readCredentials("STUDENT", {
    email: "aluno.dev@studyflow.local",
    password: "aluno-dev-12345",
});

/**
 * Lê credenciais E2E sem as escrever no teste.
 *
 * @param role Role usado no sufixo das variáveis de ambiente.
 * @param fallback Conta local criada pelas seeds de desenvolvimento.
 * @returns Credenciais para login pela UI.
 */
function readCredentials(role: "STUDENT", fallback: Credentials): Credentials {
    return {
        email: process.env[`STUDYFLOW_E2E_${role}_EMAIL`] ?? fallback.email,
        password: process.env[`STUDYFLOW_E2E_${role}_PASSWORD`] ?? fallback.password,
    };
}

/**
 * Entra como aluno para validar a checklist dentro de uma sessão real.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando o dashboard autenticado fica visível.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(student.email)).toBeVisible();
}

test("MF8 RNF38 mostra checklist de alinhamento ao mockup com rotas reais", async ({
    page,
}) => {
    await loginAsStudent(page);
    await page.goto("/app");

    await expect(page.getByRole("heading", { name: "Alinhamento ao mockup" })).toBeVisible();
    await expect(page.getByText("MF8 · RNF38")).toBeVisible();

    // As rotas validadas são as rotas reais de protectedRoutes.tsx.
    await expect(page.getByRole("link", { name: "/app" })).toBeVisible();
    await expect(page.getByRole("link", { name: "/app/salas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "/app/professor/turmas" })).toBeVisible();

    // Este negativo impede regressão para nomes antigos que não existem na app atual.
    await expect(page.getByText("/student/dashboard")).toHaveCount(0);
    await expect(page.getByText("/student/rooms")).toHaveCount(0);
    await expect(page.getByText("/teacher/classes")).toHaveCount(0);
});
```

5. Explicação do código.

O teste entra como aluno, abre `/app` e confirma que o painel está visível. Depois valida as três rotas reais usadas na checklist. Por fim, testa o negativo que motivou a correção: as rotas antigas não podem aparecer.

As credenciais são as mesmas usadas noutros testes E2E do projecto e podem ser substituídas por variáveis de ambiente. O teste não imprime cookies, tokens, dados pessoais reais, prompts ou materiais privados.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/web run test:e2e -- tests/e2e/mf8-mockup-alignment.spec.ts
```

Resultado esperado: o teste passa quando a API e o frontend E2E arrancam com as seeds locais.

7. Cenário negativo/erro esperado.

Se trocares `/app/salas` por `/student/rooms` na checklist, o teste deve falhar porque passa a encontrar uma rota antiga que não existe na app real.

### Passo 6 - Validar build, texto e privacidade

1. Objetivo funcional do passo no contexto da app.

Confirmar que o BK não introduz imports partidos, caminhos privados, texto de trabalho ou exposição de dados sensíveis.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/features/mf8/mockup-alignment.ts`
    - REVER: `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
    - REVER: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
    - REVER: `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
    - LOCALIZAÇÃO: comandos de validação.

3. Instruções do que fazer.

Executa os comandos abaixo e guarda apenas resultados seguros no PR.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de validação e evidence.

5. Explicação do código.

Não há código novo porque a entrega técnica já ficou nos passos anteriores. Aqui validas que a checklist não deixou imports partidos, não aponta para rotas antigas e não expõe dados sensíveis.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/web run build
rg -n "student/dashboard|student/rooms|teacher/classes" apps/web/src/features/mf8 apps/web/tests/e2e/mf8-mockup-alignment.spec.ts
```

Resultado esperado: o build passa. O comando `rg` só pode encontrar as rotas antigas no teste E2E, porque aí aparecem como negativo deliberado.

7. Cenário negativo/erro esperado.

Se aparecer uma ocorrência de rota antiga, remove-a do código antes de fechar o BK.

### Passo 7 - Recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-05` com evidence objetiva e deixar `BK-MF8-06` pronto para continuar.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções `Evidence para PR/defesa`, `Handoff` e relatório MF8.

3. Instruções do que fazer.

No PR ou defesa, regista:

- comando de build executado;
- resultado do teste Playwright;
- screenshot do painel em `/app`;
- screenshot da rota `/app/salas`;
- screenshot da rota `/app/professor/turmas` com conta de professor;
- negativo de ausência das rotas antigas;
- nota de privacidade a confirmar que screenshots não mostram dados reais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e de fecho.

5. Explicação do código.

Não há código porque o objetivo é provar o que foi implementado. A evidence permite defender que `RNF38` foi tratado com rotas reais, UI visível, teste automatizado e cuidado de privacidade.

6. Validação do passo.

Resultado esperado: o PR inclui build verde, teste E2E focado ou motivo técnico se o browser E2E não arrancar, screenshots sem dados sensíveis e referência explícita a `RNF38`.

7. Cenário negativo/erro esperado.

Se uma screenshot mostrar dados reais de aluno, professor, material ou prompt, não a uses na defesa. Repete a prova com contas seed ou dados anonimizados.

#### Critérios de aceite

- `BK-MF8-05` mantém metadados canónicos e `RNF38`.
- A checklist usa apenas rotas reais: `/app`, `/app/salas` e `/app/professor/turmas`.
- Não há endpoint, controller, service, DTO, schema ou model backend novo.
- `MockupAlignmentPanel` aparece no dashboard do aluno.
- O código tem JSDoc e comentários didáticos nos pontos relevantes.
- O teste Playwright valida o painel e o negativo das rotas antigas.
- Evidence visual não expõe dados reais, cookies, tokens, prompts privados, respostas IA completas ou materiais privados.
- `BK-MF8-06` consegue continuar sem redefinir a checklist visual.

#### Validação final

- `npm --prefix apps/web run build`
- `npm --prefix apps/web run test:e2e -- tests/e2e/mf8-mockup-alignment.spec.ts`
- Executar a pesquisa textual obrigatória da prompt para os guias MF8.
- `git diff --check`
- `bash scripts/validate-planificacao.sh`

#### Evidence para PR/defesa

- `pr`: `RNF38` implementado com checklist visual no dashboard.
- `proof_build`: output de `npm --prefix apps/web run build`.
- `proof_e2e`: output de `npm --prefix apps/web run test:e2e -- tests/e2e/mf8-mockup-alignment.spec.ts`.
- `proof_visual`: screenshots de `/app`, `/app/salas` e `/app/professor/turmas`.
- `proof_negativos`: ausência de `/student/dashboard`, `/student/rooms` e `/teacher/classes`.
- `proof_privacidade`: confirmação de que a evidence usa contas seed ou dados anonimizados.

#### Handoff

O próximo BK é `BK-MF8-06`. Ele pode assumir que `BK-MF8-05` deixou uma checklist visual frontend-only, ligada a rotas reais, com painel no dashboard e teste E2E focado. `BK-MF8-06` não precisa criar UI de mockup; deve continuar com suporte UTF-8 e PT-PT.

#### Changelog

- `2026-07-01`: guia atualizado para usar rotas reais, clarificar que o BK é frontend-only e incluir código completo, integração React, teste Playwright, validação e handoff.
