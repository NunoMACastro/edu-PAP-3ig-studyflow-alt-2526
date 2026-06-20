# BK-MF5-10 - Dashboards e estudo carregam em ≤ 2s.

## Header

- `doc_id`: `GUIA-BK-MF5-10`
- `bk_id`: `BK-MF5-10`
- `macro`: `MF5`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF08`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-11`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-10-dashboards-e-estudo-carregam-em-2s.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais implementar medição de performance para o dashboard de estudo individual e para a página de turmas do professor, garantindo que a interface mostra um aviso controlado quando o carregamento ultrapassa 2 segundos.

#### Importância

`RNF08` é CANONICO e define que dashboards e estudo carregam em `≤ 2s`. Esta regra não é uma sensação visual: precisa de uma medição repetível, de mensagens seguras para o utilizador e de evidence técnica para defesa. A medição fica no frontend porque o requisito fala do tempo percebido pela UI, mas a segurança continua no backend.

#### Scope-in

- Criar `real_dev/web/src/features/mf5/performance-budget.ts`.
- Instrumentar `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`.
- Instrumentar `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`.
- Reutilizar o padrão de validação entregue em `BK-MF5-08` na página de turmas.
- Medir duração local sem guardar dados pessoais, tokens, cookies, prompts ou respostas IA.
- Criar smoke Playwright para provar o aviso de performance e a ausência de bloqueio total da página.

#### Scope-out

- Alterar endpoints, DTOs, controllers, schemas ou regras backend.
- Criar sistema profissional de observabilidade, métricas remotas ou APM.
- Mover autenticação, autorização, ownership ou membership para o frontend.
- Adicionar dependências novas.
- Medir chamadas IA; isso pertence ao `BK-MF5-11`.
- Testar concorrência de 200 utilizadores; isso pertence ao `BK-MF5-12`.

#### Estado antes e depois

- **Antes:** as páginas carregam dados reais, mas não existe medição comum para provar o limite de 2 segundos nem aviso quando esse limite é ultrapassado.
- **Depois:** o dashboard do aluno e a página de turmas medem o carregamento inicial, mostram estado de carregamento, erro, vazio/sucesso e aviso de performance quando a duração excede 2000 ms.

#### Pre-requisitos

- Ler `RNF08` em `docs/RNF.md`.
- Rever a linha de `BK-MF5-10` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `BK-MF5-08`, porque a página de turmas já deve usar validação de formulário.
- Rever `BK-MF5-09`, porque a shell autenticada não deve bloquear as páginas medidas.
- Rever `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`.
- Rever `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`.
- Rever `real_dev/web/src/lib/apiClient.ts`.
- Rever `real_dev/web/tests/e2e/README.md`.

#### Glossário

- **Budget de performance:** limite máximo aceitável para uma operação, neste BK `2000 ms`.
- **Tempo percebido:** duração entre iniciar o carregamento da UI e mostrar dados ou erro controlado.
- **Performance API:** API do browser que permite criar marcas e medir durações sem dependências novas.
- **p95:** percentil em que 95% das medições ficam abaixo daquele valor; é útil em evidence manual ou futura.
- **Estado de carregamento:** feedback enquanto a página espera pela API.
- **Estado vazio:** resposta válida sem dados, por exemplo professor sem turmas.
- **Estado de erro:** mensagem segura quando a API falha.
- **Evidence técnico:** output, teste ou print que prova a entrega.

#### Conceitos teóricos essenciais

- **Performance no contexto StudyFlow:** para o aluno, atraso no dashboard atrasa o início do estudo; para o professor, atraso na página de turmas prejudica gestão de disciplinas, alunos e acompanhamento. `RNF08` protege estes fluxos centrais.
- **Medição no frontend:** mede o tempo que a UI demora a ficar útil. A API pode ser rápida, mas se a página não apresentar estado claro, o utilizador sente bloqueio.
- **Separação de responsabilidades:** o frontend mede e comunica o estado; o backend continua responsável por sessão, autorização, ownership, membership e validação.
- **Sessão autenticada:** o cookie HttpOnly mantém a identidade. Este BK não envia `userId`, não lê cookies e não guarda sessão no browser.
- **Dados pessoais:** métricas de duração não precisam de nomes, emails, materiais, prompts ou IDs privados. O aviso mostra apenas duração e nome técnico da página.
- **Estados React:** `loading`, `error`, `empty` e `success` deixam o utilizador perceber o que aconteceu sem abrir a consola.
- **Falha controlada:** se a API falhar, a página deve mostrar erro seguro; se a API for lenta, deve mostrar aviso de performance sem expor dados internos.
- **Smoke E2E:** simula uma resposta lenta e confirma que a mensagem de budget aparece. Isto prova o requisito de forma repetível.

#### Arquitetura do BK

`performance-budget.ts` fica em `real_dev/web/src/features/mf5` porque é uma regra transversal da MF5. `SoloStudyDashboard.tsx` mede o carregamento de `/api/study/solo` via `getSoloStudyState()`. `TeacherClassesPage.tsx` mede o carregamento de `listTeacherClasses()` e preserva a validação por campo do `BK-MF5-08`. O smoke `mf5-performance-budget.spec.ts` força respostas lentas controladas e confirma o aviso visível.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/features/mf5/performance-budget.ts`
- EDITAR: `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`
- EDITAR: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
- CRIAR: `real_dev/web/tests/e2e/mf5-performance-budget.spec.ts`
- REVER: `real_dev/web/src/features/mf5/form-validation.ts`
- REVER: `real_dev/web/src/components/forms/FormField.tsx`
- REVER: `real_dev/web/src/lib/apiClient.ts`
- REVER: `real_dev/web/playwright.config.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato de performance

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK implementa `RNF08` sem mudar contratos de dados ou permissões.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-09-notificacoes-discretas-e-contextualizadas.md`
    - LOCALIZAÇÃO: `RNF08`, linha canónica de `BK-MF5-10` e handoff de `BK-MF5-09`.

3. Instruções do que fazer.

Confirma que `RNF08` define `Dashboards e estudo carregam em ≤ 2s.`. Mantém os metadados do header iguais à matriz e usa o handoff de `BK-MF5-09`: a shell autenticada deve continuar navegável mesmo se notificações falharem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita alterar comportamento fora do requisito.

5. Explicação do código.

Não há código porque a primeira decisão é de escopo. Este BK mede páginas existentes e não cria novos dados de domínio. Isso evita transformar performance numa alteração de API, autenticação ou permissões.

6. Validação do passo.

Confirma que o header mantém `RNF08`, `P0`, `S09`, `Reforco` e `proximo_bk: BK-MF5-11`.

7. Cenário negativo/erro esperado.

Se mudares endpoints ou roles neste BK, estás a misturar requisito de UX/performance com regra de segurança.

### Passo 2 - Criar utilitário de budget

1. Objetivo funcional do passo no contexto da app.

Criar uma função comum para medir duração e decidir se a página excedeu os 2000 ms.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/features/mf5/performance-budget.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `startPerformanceBudget`, `finishPerformanceBudget` e `formatPerformanceBudgetMessage`. O utilitário não deve guardar métricas fora da memória da página.

4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/src/features/mf5/performance-budget.ts
export type PerformanceBudgetResult = {
    name: string;
    durationMs: number;
    budgetMs: number;
    exceeded: boolean;
};

const DEFAULT_DASHBOARD_BUDGET_MS = 2000;

/**
 * Inicia uma medição local para uma página ou fluxo visível.
 *
 * @param name Nome técnico da medição, sem dados pessoais.
 */
export function startPerformanceBudget(name: string): void {
    performance.mark(`${name}:start`);
}

/**
 * Termina a medição e indica se o budget foi excedido.
 *
 * @param name Nome usado em `startPerformanceBudget`.
 * @param budgetMs Limite máximo esperado em milissegundos.
 * @returns Resultado seguro para apresentar na UI ou usar em testes.
 */
export function finishPerformanceBudget(
    name: string,
    budgetMs = DEFAULT_DASHBOARD_BUDGET_MS,
): PerformanceBudgetResult {
    const startMark = `${name}:start`;
    const endMark = `${name}:end`;

    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    const entries = performance.getEntriesByName(name);
    const entry = entries[entries.length - 1];
    const durationMs = Math.round(entry?.duration ?? 0);

    // Limpar marcas evita que navegações prolongadas acumulem medições antigas.
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(name);

    return {
        name,
        durationMs,
        budgetMs,
        exceeded: durationMs > budgetMs,
    };
}

/**
 * Cria texto visível e seguro quando uma página excede o budget.
 *
 * @param result Resultado calculado no fim da medição.
 * @returns Mensagem curta para o utilizador e para evidence.
 */
export function formatPerformanceBudgetMessage(
    result: PerformanceBudgetResult,
): string {
    return `Esta página demorou ${result.durationMs} ms a carregar. O objetivo é ${result.budgetMs} ms.`;
}
```

5. Explicação do código.

`startPerformanceBudget` cria uma marca inicial com um nome técnico, como `solo-study-dashboard`. `finishPerformanceBudget` cria a marca final, mede a diferença e devolve `durationMs`, `budgetMs` e `exceeded`. As marcas são limpas para não acumular dados antigos no browser. `formatPerformanceBudgetMessage` cria uma mensagem segura: inclui duração e objetivo, mas não inclui nome do aluno, email, turma, materiais, prompts ou IDs privados. Este utilitário cumpre `RNF08` e prepara `BK-MF5-12`, onde a equipa vai trabalhar evidence de concorrência.

6. Validação do passo.

Importa o utilitário numa página, chama `startPerformanceBudget("teste")`, espera mais de 2000 ms e confirma que `finishPerformanceBudget("teste").exceeded` devolve `true`.

7. Cenário negativo/erro esperado.

Se a mensagem de performance incluir dados pessoais ou conteúdo de estudo, a métrica deixa de ser segura para mostrar ou anexar à defesa.

### Passo 3 - Instrumentar o dashboard do aluno

1. Objetivo funcional do passo no contexto da app.

Medir o carregamento inicial do modo de estudo individual, mostrar estados claros e avisar quando o budget de 2 segundos é excedido.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`
    - REVER: `real_dev/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o conteúdo de `SoloStudyDashboard.tsx` pela versão completa abaixo. A página deve medir apenas a chamada inicial a `getSoloStudyState()`.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/pages/student/SoloStudyDashboard.tsx
import { useEffect, useState } from "react";
import { getSoloStudyState, SoloStudyState } from "../../lib/apiClient.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    PerformanceBudgetResult,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";

const SOLO_STUDY_MEASURE = "solo-study-dashboard";

/**
 * Dashboard do modo individual sem turma obrigatória.
 *
 * @returns Painel inicial do aluno com estados de carregamento, erro e performance.
 */
export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [performanceResult, setPerformanceResult] =
        useState<PerformanceBudgetResult | null>(null);

    useEffect(() => {
        let active = true;

        startPerformanceBudget(SOLO_STUDY_MEASURE);

        async function loadDashboard(): Promise<void> {
            try {
                const nextState = await getSoloStudyState();
                if (!active) return;
                // O dashboard só guarda o resumo público devolvido pela API autenticada.
                setState(nextState);
                setError(null);
            } catch (caught: unknown) {
                if (!active) return;
                setError(caught instanceof Error ? caught.message : "Não foi possível carregar o estudo.");
            } finally {
                if (!active) return;
                setPerformanceResult(finishPerformanceBudget(SOLO_STUDY_MEASURE));
                setLoading(false);
            }
        }

        void loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar estudo...</p>;
    }

    if (error) {
        return (
            <section className="sf-panel space-y-2" role="alert">
                <h1 className="text-xl font-bold">Não foi possível abrir o estudo</h1>
                <p className="text-sm text-red-700">{error}</p>
            </section>
        );
    }

    if (!state) {
        return (
            <section className="sf-panel" role="status">
                <p className="text-sm text-slate-600">Ainda não existem dados de estudo para apresentar.</p>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Olá, {state.studentName}</h1>
                <p className="mt-1 text-sm text-slate-600">
                    {state.hasClass ? `Turma: ${state.className}` : "Modo individual ativo"}
                </p>
            </div>

            {performanceResult?.exceeded ? (
                <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                    {formatPerformanceBudgetMessage(performanceResult)}
                </p>
            ) : null}

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

            <div className="flex flex-wrap gap-3">
                <a className="sf-button-primary" href="/app/areas">Criar área</a>
                <a className="sf-button-secondary" href="/app/rotinas">Organizar rotinas</a>
            </div>
        </section>
    );
}
```

5. Explicação do código.

A página começa a medição antes de chamar `getSoloStudyState()`. O pedido usa o cliente existente, que já envia cookies HttpOnly via `credentials: "include"`, por isso o componente não recebe nem guarda `userId`. `loading` mostra feedback enquanto a API responde. `error` apresenta uma mensagem controlada quando falha. `performanceResult` só guarda duração e limite; não guarda conteúdo privado. O aviso aparece apenas quando `exceeded` é `true`. Esta integração cumpre `RNF08`, preserva o fluxo individual sem turma e prepara evidence para `BK-MF5-12`.

6. Validação do passo.

Abre `/app` com sessão de aluno. Esperado: enquanto carrega aparece `A carregar estudo...`; se a resposta for rápida, o dashboard aparece sem aviso; se a resposta ultrapassar 2000 ms, aparece a mensagem com duração.

7. Cenário negativo/erro esperado.

Se a API devolver erro, a página deve mostrar `Não foi possível abrir o estudo` sem expor tokens, cookies, stack trace, IDs internos ou conteúdo de materiais.

### Passo 4 - Instrumentar turmas do professor

1. Objetivo funcional do passo no contexto da app.

Medir o carregamento inicial das turmas do professor sem perder a validação por campo entregue em `BK-MF5-08`.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `real_dev/web/src/components/forms/FormField.tsx`
    - REVER: `real_dev/web/src/features/mf5/form-validation.ts`
    - REVER: `real_dev/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui `TeacherClassesPage.tsx` pela versão completa abaixo. A medição deve envolver o primeiro `listTeacherClasses()`, e os submits devem continuar validados antes de chamar a API.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";
import {
    FieldErrors,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    PerformanceBudgetResult,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";

type TeacherClassField = "name" | "code" | "schoolYear";
type StudentEmailField = "studentEmail";

const TEACHER_CLASSES_MEASURE = "teacher-classes-page";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Gestão de turmas com validação por campo e medição de performance.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [classFieldErrors, setClassFieldErrors] = useState<FieldErrors<TeacherClassField>>({});
    const [studentFieldErrors, setStudentFieldErrors] = useState<Record<string, FieldErrors<StudentEmailField>>>({});
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [addingStudentId, setAddingStudentId] = useState<string | null>(null);
    const [performanceResult, setPerformanceResult] =
        useState<PerformanceBudgetResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega as turmas visíveis para o professor autenticado.
     */
    async function refresh(): Promise<void> {
        setClasses(await listTeacherClasses());
    }

    useEffect(() => {
        let active = true;

        startPerformanceBudget(TEACHER_CLASSES_MEASURE);

        async function loadClasses(): Promise<void> {
            try {
                const nextClasses = await listTeacherClasses();
                if (!active) return;
                // A API filtra turmas por professor; a UI apenas apresenta o resultado autorizado.
                setClasses(nextClasses);
                setError(null);
            } catch (caught: unknown) {
                if (!active) return;
                setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
            } finally {
                if (!active) return;
                setPerformanceResult(finishPerformanceBudget(TEACHER_CLASSES_MEASURE));
                setLoading(false);
            }
        }

        void loadClasses();

        return () => {
            active = false;
        };
    }, []);

    /**
     * Cria turma depois de validar campos obrigatórios no browser.
     *
     * @param event Evento do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);

        const nextErrors = requireFields<TeacherClassField>([
            { name: "name", label: "Nome", value: name },
            { name: "code", label: "Código", value: code },
            { name: "schoolYear", label: "Ano letivo", value: schoolYear },
        ]);
        setClassFieldErrors(nextErrors);

        if (hasFieldErrors(nextErrors)) {
            return;
        }

        setCreating(true);
        try {
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            setSchoolYear("2025/2026");
            await refresh();
        } catch (caught: unknown) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setCreating(false);
        }
    }

    /**
     * Adiciona aluno a uma turma depois de validar o email escrito.
     *
     * @param classId Identificador da turma autorizada pelo backend.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        const nextErrors = requireFields<StudentEmailField>([
            { name: "studentEmail", label: "Email do aluno", value: emails[classId] ?? "" },
        ]);
        setStudentFieldErrors((current) => ({ ...current, [classId]: nextErrors }));

        if (hasFieldErrors(nextErrors)) {
            return;
        }

        setAddingStudentId(classId);
        try {
            await addClassStudent(classId, emails[classId] ?? "");
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught: unknown) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        } finally {
            setAddingStudentId(null);
        }
    }

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar turmas...</p>;
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Turmas</h1>

                {performanceResult?.exceeded ? (
                    <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                        {formatPerformanceBudgetMessage(performanceResult)}
                    </p>
                ) : null}

                {error ? <p className="sf-error" role="alert">{error}</p> : null}

                <FormField id="teacher-class-name" label="Nome" error={classFieldErrors.name}>
                    <input value={name} onChange={(event) => setName(event.target.value)} />
                </FormField>

                <FormField id="teacher-class-code" label="Código" error={classFieldErrors.code}>
                    <input value={code} onChange={(event) => setCode(event.target.value)} />
                </FormField>

                <FormField id="teacher-class-year" label="Ano letivo" error={classFieldErrors.schoolYear}>
                    <input value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} />
                </FormField>

                <button className="sf-button-primary" disabled={creating}>
                    {creating ? "A criar..." : "Criar turma"}
                </button>
            </form>

            <div className="grid gap-3">
                {classes.length === 0 ? (
                    <p className="sf-panel text-sm text-slate-600">Ainda não tens turmas.</p>
                ) : null}

                {classes.map((schoolClass) => {
                    const studentErrors = studentFieldErrors[schoolClass._id] ?? {};
                    const isAdding = addingStudentId === schoolClass._id;

                    return (
                        <article className="sf-panel space-y-3" key={schoolClass._id}>
                            <div>
                                <h2 className="font-semibold">{schoolClass.name}</h2>
                                <p className="text-sm text-slate-600">
                                    {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                <FormField
                                    id={`student-email-${schoolClass._id}`}
                                    label="Email do aluno"
                                    error={studentErrors.studentEmail}
                                >
                                    <input
                                        value={emails[schoolClass._id] ?? ""}
                                        onChange={(event) =>
                                            setEmails((current) => ({
                                                ...current,
                                                [schoolClass._id]: event.target.value,
                                            }))
                                        }
                                    />
                                </FormField>

                                <button
                                    className="sf-button-secondary self-end"
                                    disabled={isAdding}
                                    onClick={() => void handleAddStudent(schoolClass._id)}
                                    type="button"
                                >
                                    {isAdding ? "A adicionar..." : "Adicionar aluno"}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/disciplinas`}>Disciplinas</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/publicacoes`}>Publicações</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/salas-guiadas`}>Salas guiadas</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/projectos`}>Projectos</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>Progresso</a>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
```

5. Explicação do código.

A página mede apenas o carregamento inicial das turmas, porque esse é o momento em que o professor espera que o dashboard fique utilizável. `listTeacherClasses()` continua a vir do cliente API existente e o backend continua a decidir que turmas o professor pode ver. A criação de turmas e a adição de alunos preservam `requireFields` de `BK-MF5-08`, por isso este BK não desfaz validação anterior. O aviso de performance aparece no formulário, mas não impede o professor de continuar. O estado `addingStudentId` impede cliques repetidos no mesmo fluxo sem expor dados sensíveis.

6. Validação do passo.

Abre `/app/professor/turmas` com sessão de professor. Esperado: aparece `A carregar turmas...`; se a resposta exceder 2000 ms, surge a mensagem com duração; criar turma sem campos obrigatórios mostra erros junto aos campos.

7. Cenário negativo/erro esperado.

Se o aviso de performance substituir a lista de turmas ou bloquear a navegação, a medição está a prejudicar o fluxo que deveria observar.

### Passo 5 - Criar smoke de performance

1. Objetivo funcional do passo no contexto da app.

Provar que uma resposta lenta gera aviso visível sem guardar dados privados.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/tests/e2e/mf5-performance-budget.spec.ts`
    - REVER: `real_dev/web/tests/e2e/README.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria um smoke Playwright que autentica o aluno, atrasa `/api/study/solo` e confirma a mensagem de performance.

4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/tests/e2e/mf5-performance-budget.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Inicia sessão com credenciais de desenvolvimento usadas nos smokes StudyFlow.
 *
 * @param page Página Playwright controlada pelo teste.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
}

test("MF5 mostra aviso quando o dashboard excede 2 segundos", async ({ page }) => {
    await page.route("**/api/study/solo", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2100));
        // A resposta tem só dados públicos do resumo do aluno, iguais ao contrato da API.
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify({
                studentName: "Aluno Dev",
                hasClass: false,
                className: null,
                studyAreasCount: 2,
                routinesCount: 1,
                materialsCount: 4,
            }),
        });
    });

    await loginAsStudent(page);

    await expect(page.getByText("Esta página demorou")).toBeVisible();
    await expect(page.getByText("O objetivo é 2000 ms.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Criar área" })).toBeVisible();
});
```

5. Explicação do código.

O teste usa credenciais de desenvolvimento, tal como os smokes anteriores. `page.route` atrasa apenas o endpoint do dashboard e devolve um corpo mínimo dentro do contrato esperado. O teste confirma a mensagem de performance e também confirma que o link `Criar área` continua visível. Isto evita que a medição se transforme num bloqueio da página. O corpo devolvido não contém cookie, token, prompt ou material privado.

6. Validação do passo.

Executa `cd real_dev/web && npm run test:e2e -- mf5-performance-budget.spec.ts`. Esperado: teste verde e aviso visível quando a resposta demora mais de 2000 ms.

7. Cenário negativo/erro esperado.

Se o teste precisar de dados de produção ou mostrar dados reais de alunos, substitui por dados de desenvolvimento controlados.

### Passo 6 - Validar ausência de dados sensíveis

1. Objetivo funcional do passo no contexto da app.

Garantir que a evidence de performance não expõe conteúdo privado.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/features/mf5/performance-budget.ts`
    - REVER: `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`
    - REVER: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
    - LOCALIZAÇÃO: mensagens visíveis e estados `performanceResult`.

3. Instruções do que fazer.

Confirma que a mensagem de performance contém apenas duração e objetivo. Não adiciones nomes, emails, IDs, cookies, tokens, prompts, respostas IA ou textos de materiais à medição.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é uma revisão de segurança e privacidade sobre o código criado nos passos anteriores.

5. Explicação do código.

A regra de privacidade é simples: performance mede duração, não conteúdo. Mesmo que a página carregue dados do aluno ou professor, o aviso deve ser neutro e reutilizável em evidence. Isto evita expor dados pessoais em prints, logs ou anexos de PR.

6. Validação do passo.

Pesquisa por `formatPerformanceBudgetMessage` e confirma que a mensagem usa apenas `durationMs` e `budgetMs`.

7. Cenário negativo/erro esperado.

Se a mensagem incluir `studentName`, `email`, `classId` ou conteúdo de material, remove esse dado antes de continuar.

### Passo 7 - Validar build e smoke

1. Objetivo funcional do passo no contexto da app.

Confirmar que TypeScript, Vite e Playwright aceitam a alteração.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/package.json`
    - REVER: `real_dev/web/tests/e2e/mf5-performance-budget.spec.ts`
    - LOCALIZAÇÃO: terminal.

3. Instruções do que fazer.

Executa build web e smoke E2E específico. Se o ambiente local não tiver API/seed, regista o bloqueio com o erro real.

4. Código completo, correto e integrado com a app final.

```bash
cd real_dev/web
npm run build
npm run test:e2e -- mf5-performance-budget.spec.ts
```

5. Explicação do código.

`npm run build` valida TypeScript e bundle Vite. O smoke E2E valida o comportamento principal do RNF08. Estes comandos não substituem monitorização real, mas dão evidence suficiente para uma entrega PAP.

6. Validação do passo.

Expected result: build sem erros e smoke verde. Se o smoke falhar por ausência de API local, mantém o build e documenta o bloqueio do smoke.

7. Cenário negativo/erro esperado.

Se o build falhar por import inexistente, corrige o path antes de avançar para `BK-MF5-11`.

### Passo 8 - Preparar handoff para timeout IA

1. Objetivo funcional do passo no contexto da app.

Deixar claro que este BK entrega medição de UI e que o próximo BK mede resposta IA.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/features/mf5/performance-budget.ts`
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-11-respostas-da-ia-devem-surgir-em-4s.md`
    - LOCALIZAÇÃO: secção Handoff e evidence.

3. Instruções do que fazer.

Regista que `performance-budget.ts` mede páginas frontend e não deve ser usado para provider IA. `BK-MF5-11` deve criar um helper backend próprio.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo documenta a fronteira entre performance de UI e timeout de provider IA.

5. Explicação do código.

A separação evita usar API do browser no backend e evita medir provider IA com uma métrica de UI. O próximo BK pode reutilizar o conceito de budget, mas deve implementá-lo com exceções NestJS e services IA.

6. Validação do passo.

Confirma que `performance-budget.ts` só é importado por ficheiros web e não por `real_dev/api`.

7. Cenário negativo/erro esperado.

Se `real_dev/api` importar `performance-budget.ts`, o projeto mistura runtimes browser e Node.js.

#### Critérios de aceite

- `performance-budget.ts` existe, é tipado e não guarda dados sensíveis.
- `SoloStudyDashboard.tsx` mede o carregamento inicial e mostra aviso quando excede 2000 ms.
- `TeacherClassesPage.tsx` mede o carregamento inicial e preserva validação por campo de `BK-MF5-08`.
- A UI mantém estados `loading`, `error`, `empty` e `success`.
- O aviso não inclui nomes, emails, IDs, cookies, tokens, prompts, respostas IA ou conteúdos de materiais.
- O smoke E2E prova uma resposta lenta e confirma que a página continua utilizável.
- Não há endpoints novos, DTOs novos nem alteração de autorização backend.

#### Validação final

- Executar `cd real_dev/web && npm run build`.
- Executar `cd real_dev/web && npm run test:e2e -- mf5-performance-budget.spec.ts`.
- Confirmar que `rg -n "performance-budget" real_dev/api/src` não devolve resultados.
- Confirmar cenário negativo: resposta lenta mostra aviso; erro da API mostra mensagem segura; página não expõe dados sensíveis.
- Erros comuns a evitar: medir no backend uma regra de UI, guardar conteúdo privado em evidence, esquecer estados de erro e desfazer validação de `BK-MF5-08`.

#### Evidence para PR/defesa

- Output de `npm run build`.
- Output de `npm run test:e2e -- mf5-performance-budget.spec.ts`.
- Print do aviso `Esta página demorou ... O objetivo é 2000 ms.`
- Nota curta a explicar que `RNF08` mede tempo percebido na UI e não altera regras de autorização.

#### Handoff

`BK-MF5-11` recebe páginas frontend com medição de carregamento e deve tratar apenas timeout IA no backend. O contrato entregue aqui é `performance-budget.ts` para web, integração em `SoloStudyDashboard.tsx`, integração em `TeacherClassesPage.tsx` e smoke `mf5-performance-budget.spec.ts`.

#### Changelog

- 2026-06-20: Guia corrigido com código completo para utilitário de performance, dashboard do aluno, página de turmas do professor, smoke E2E e fronteira explícita para `BK-MF5-11`.
