# BK-MF5-03 - Interface intuitiva e clara para alunos e professores.

## Header

- `doc_id`: `GUIA-BK-MF5-03`
- `bk_id`: `BK-MF5-03`
- `macro`: `MF5`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF01`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-04`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-03-interface-intuitiva-e-clara-para-alunos-e-professores.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais melhorar a clareza de duas zonas centrais do StudyFlow: o dashboard inicial do aluno e a página onde o professor gere turmas. O objetivo é transformar `RNF01` numa experiência concreta: cada página deve dizer onde o utilizador está, o que pode fazer primeiro, que dados estão a ser carregados e que erro ocorreu se alguma operação falhar.

Vais criar um componente `PageHeader` para dar um padrão comum ao topo das páginas. Depois vais aplicá-lo em `SoloStudyDashboard.tsx` e `TeacherClassesPage.tsx`, preservando os contratos de API já existentes e sem alterar regras de autenticação, autorização, turmas, áreas de estudo ou materiais.

No fim, vais criar um smoke test Playwright para provar que cada página continua acessível, tem um único título principal e mostra as ações essenciais. Este BK não altera backend; melhora a camada visual e valida que a navegação principal continua previsível.

#### Importância

`RNF01` exige uma interface intuitiva e clara para alunos e professores. Numa aplicação educativa, esta regra não é decorativa: um aluno deve perceber rapidamente como continuar o estudo, e um professor deve encontrar ações de gestão sem ter de interpretar a estrutura interna da aplicação.

Este BK também prepara os BKs seguintes da MF5. `BK-MF5-04` pode trabalhar responsividade sobre uma hierarquia visual mais estável. `BK-MF5-05` pode melhorar feedback imediato sem redesenhar o topo das páginas. `BK-MF5-06` pode reforçar navegação consistente usando o mesmo padrão de título, descrição e ação principal.

O ponto de segurança importante é simples: a interface pode organizar ações, mas não decide permissões. Ownership, role, membership e autorização continuam no backend. O frontend chama contratos existentes e apresenta resultados de forma clara.

#### Scope-in

- Criar `apps/web/src/components/PageHeader.tsx`.
- Editar `apps/web/src/pages/student/SoloStudyDashboard.tsx`.
- Editar `apps/web/src/pages/teacher/TeacherClassesPage.tsx`.
- Criar `apps/web/tests/e2e/mf5-interface-smoke.spec.ts`.
- Preservar chamadas existentes a `getSoloStudyState`, `listTeacherClasses`, `createTeacherClass` e `addClassStudent`.
- Garantir estados `loading`, `error`, `empty` e `success` quando a página os usa.
- Garantir um único `h1` por página.
- Usar credenciais E2E por variáveis de ambiente, sem valores sensíveis no código.

#### Scope-out

- Alterar endpoints backend.
- Alterar autenticação, sessões, cookies ou permissões.
- Alterar modelos de dados, schemas, DTOs ou services NestJS.
- Criar uma biblioteca visual nova.
- Mudar regras de criação de turmas ou associação de alunos.
- Implementar responsividade avançada de toda a aplicação; isso fica para `BK-MF5-04`.
- Guardar tokens, passwords, cookies ou dados sensíveis no browser.

#### Estado antes e depois

- **Antes:** o dashboard do aluno e a página de turmas já existem, mas cada uma organiza o topo da página diretamente no próprio ficheiro. A página de turmas mistura o título principal com o formulário, e não existe um componente reutilizável para a hierarquia visual.
- **Depois:** as duas páginas usam `PageHeader`, têm um único `h1`, mantêm estados de carregamento/erro/vazio/sucesso e ficam validadas por um smoke test focado em clareza de interface.

#### Pre-requisitos

- Ler `RNF01` em `docs/RNF.md`.
- Confirmar `BK-MF5-03` em `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Rever `BK-MF5-01`, porque este BK deve melhorar a clareza visual sem alterar endpoints nem regras de importação de materiais.
- Rever `BK-MF5-04`, porque o próximo BK recebe uma base visual mais estável.
- Confirmar que existem `apps/web/src/pages/student/SoloStudyDashboard.tsx`, `apps/web/src/pages/teacher/TeacherClassesPage.tsx` e `apps/web/src/lib/apiClient.ts`.
- Confirmar que `apps/web/src/lib/apiClient.ts` exporta `getSoloStudyState`, `SoloStudyState`, `listTeacherClasses`, `createTeacherClass`, `addClassStudent` e `SchoolClass`.
- Confirmar que Playwright já existe em `apps/web/tests/e2e/`.

#### Glossário

- **Interface intuitiva:** interface que permite perceber rapidamente onde estamos, o que aconteceu e qual é o próximo passo.
- **Hierarquia visual:** organização por importância: título principal, descrição, ação principal, conteúdo e estados.
- **Ação principal:** botão ou ligação que representa a tarefa mais importante naquele ecrã.
- **Estado de carregamento:** mensagem apresentada enquanto a app procura dados.
- **Estado de erro:** mensagem clara quando uma operação falha.
- **Estado vazio:** mensagem que explica que a operação correu bem, mas ainda não existem dados.
- **Smoke test:** teste curto que confirma que o fluxo principal continua acessível.
- **Autorização backend:** regra que impede o frontend de decidir sozinho quem pode ver ou alterar dados.

#### Conceitos teóricos essenciais

- **Aluno no StudyFlow:** utilizador que estuda em modo individual, com áreas de estudo, rotinas, histórico e materiais privados. O dashboard do aluno deve orientar o estudo sem expor dados de outros utilizadores.
- **Professor no StudyFlow:** utilizador que gere turmas, disciplinas, materiais oficiais e acompanhamento. A página de turmas deve tornar ações docentes visíveis sem alterar permissões.
- **Turma:** grupo oficial gerido por professor. A associação de alunos a turmas continua a ser validada pelo backend; a UI apenas recolhe dados e apresenta feedback.
- **Componente React:** função que devolve interface. Neste BK, `PageHeader` isola o padrão de título, descrição e ação principal.
- **Props:** dados recebidos por um componente. `PageHeader` recebe `title`, `description` e `action`, sem conhecer regras de negócio.
- **Estado local:** valores guardados com `useState`, como `loading`, `error`, `successMessage`, campos de formulário e lista de turmas.
- **Efeito assíncrono:** chamada feita com `useEffect` para carregar dados depois de a página aparecer.
- **Cliente API:** funções em `apiClient.ts` que chamam endpoints reais. Este BK reutiliza essas funções em vez de criar chamadas soltas.
- **Acessibilidade:** práticas que ajudam todos os utilizadores, incluindo tecnologias de apoio. Um único `h1`, labels e mensagens de erro claras ajudam navegação e leitura.
- **Privacidade:** a página não deve mostrar dados sensíveis desnecessários, guardar credenciais ou colocar lógica de ownership no browser.
- **Evidence:** prova técnica para PR/defesa, como build, smoke test e capturas de ecrã das páginas.

#### Arquitetura do BK

- Endpoint(s): nenhum endpoint novo.
- Modelo/schema: nenhum modelo novo.
- Service(s): nenhum service backend novo.
- Controller/route: nenhuma route backend nova.
- Guard/middleware: não há guard novo; autenticação e autorização continuam nas rotas existentes.
- Cliente API: reutiliza `getSoloStudyState`, `listTeacherClasses`, `createTeacherClass` e `addClassStudent`.
- Página/componente: cria `PageHeader`, edita `SoloStudyDashboard` e `TeacherClassesPage`.
- Testes: cria `mf5-interface-smoke.spec.ts`.
- Handoff para o próximo BK: `BK-MF5-04` passa a ter um topo de página consistente para validar responsividade.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/components/PageHeader.tsx`
- EDITAR: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- EDITAR: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
- CRIAR: `apps/web/tests/e2e/mf5-interface-smoke.spec.ts`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/web/src/pages/auth/LoginPage.tsx`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato RNF01 e ponto de partida

1. Objetivo funcional do passo no contexto da app.

Confirmar que `RNF01` pede interface intuitiva e clara, e que este BK atua apenas no frontend já existente.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
    - REVER: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: linhas de `RNF01`, linha de `BK-MF5-03` e exports do cliente API.

3. Instruções do que fazer.

Confirma quatro decisões antes de editar. `RNF01` é CANONICO. Criar `PageHeader` é DERIVADO para reduzir repetição sem adicionar dependências. O BK não cria endpoints novos. O frontend não decide permissões, apenas chama funções existentes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e preparatório, porque fecha o contrato antes de alterar páginas.

5. Explicação do código.

Não existe código neste passo porque ainda estás a confirmar o domínio. A decisão evita misturar UX com regras de backend. Este BK existe para tornar páginas mais claras, não para mudar autenticação, ownership, turmas ou materiais.

Os dados que entram nesta análise vêm de `RNF01`, matriz, backlog, contrato de campos e ficheiros reais. O resultado é uma lista pequena de ficheiros que podes alterar com segurança. O erro que este passo evita é criar um componente visual que inventa permissões ou endpoints.

6. Validação do passo.

Confirma que `BK-MF5-03` aponta para `RNF01`, `S09`, `proximo_bk: BK-MF5-04` e que `apiClient.ts` exporta as funções usadas nas páginas.

7. Cenário negativo/erro esperado.

Se encontrares necessidade de criar endpoint backend ou alterar permissões, para e regista como fora de escopo. Esse comportamento não pertence a `RNF01`.

### Passo 2 - Criar o componente PageHeader

1. Objetivo funcional do passo no contexto da app.

Criar um componente reutilizável para representar o topo das páginas com título principal, descrição e ação opcional.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/components/PageHeader.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `PageHeader.tsx` em `apps/web/src/components/`. O componente deve ter `title`, `description` e `action`. Não coloques regras de aluno, professor, turma ou permissões neste componente; ele só organiza a interface.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/components/PageHeader.tsx
import { ReactNode } from "react";

/**
 * Dados necessários para construir o topo comum de uma página StudyFlow.
 */
type PageHeaderProps = {
    /** Título principal da página; deve originar exatamente um `h1`. */
    title: string;
    /** Texto curto que explica ao utilizador o que pode fazer neste ecrã. */
    description: string;
    /** Ação principal opcional, por exemplo uma ligação ou botão. */
    action?: ReactNode;
};

/**
 * Mostra o título, a descrição e uma ação principal de forma consistente.
 *
 * @param props Dados visuais recebidos da página que usa o componente.
 * @returns Cabeçalho reutilizável para páginas protegidas do StudyFlow.
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <header className="sf-panel flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl space-y-2">
                {/* Um único h1 por página torna a navegação mais previsível para leitores de ecrã e testes. */}
                <h1 className="text-2xl font-bold text-teal-900">{title}</h1>
                <p className="text-sm leading-6 text-slate-600">{description}</p>
            </div>

            {action ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {/* A ação vem da página para este componente não decidir regras de domínio ou permissões. */}
                    {action}
                </div>
            ) : null}
        </header>
    );
}
```

5. Explicação do código.

Este código cria um componente pequeno e reutilizável. Ele recebe texto e ação por props, devolve um `header` e garante que o título principal usa `h1`. Existe neste BK porque `RNF01` pede clareza e previsibilidade visual.

O contrato técnico é simples: páginas passam `title`, `description` e, se precisarem, `action`. Entram strings e um `ReactNode`; sai markup React. Não há chamada HTTP, não há dados pessoais e não há autorização aqui. Isso evita a vulnerabilidade de esconder regras de negócio dentro de componentes visuais.

O componente prepara `SoloStudyDashboard`, `TeacherClassesPage` e os BKs seguintes de layout, feedback e navegação. O aluno pode adaptar classes Tailwind ou texto visual, mas não deve transformar este componente numa zona com lógica de permissões.

6. Validação do passo.

Confirma que `PageHeader.tsx` exporta `PageHeader` e que o ficheiro compila sem imports partidos.

7. Cenário negativo/erro esperado.

Se uma página passar uma ação que só deveria estar disponível para outro perfil, o backend continua a bloquear a operação. A UI não substitui autorização.

### Passo 3 - Integrar PageHeader no dashboard do aluno

1. Objetivo funcional do passo no contexto da app.

Substituir o topo manual do dashboard do aluno por `PageHeader`, mantendo carregamento, erro, dados agregados e ações principais.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o conteúdo do ficheiro pelo código completo abaixo. Mantém `getSoloStudyState` como fonte de dados. Não cries `userId` no frontend; a API continua a usar sessão.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/student/SoloStudyDashboard.tsx
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    getSoloStudyState,
    type SoloStudyState,
} from "../../lib/apiClient.js";

/**
 * Dashboard do modo individual do aluno.
 *
 * @returns Página inicial do aluno com estado, métricas e ações principais.
 */
export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        /**
         * Carrega o resumo do aluno autenticado sem aceitar identificadores vindos da UI.
         */
        async function loadSoloStudyState(): Promise<void> {
            try {
                const nextState = await getSoloStudyState();

                if (isMounted) {
                    setState(nextState);
                    setError(null);
                }
            } catch (caught) {
                if (isMounted) {
                    setError(caught instanceof Error ? caught.message : "Erro ao carregar o estudo.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        // A API usa a sessão HttpOnly; a página não escolhe que aluno está a consultar.
        void loadSoloStudyState();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar o teu estudo...</p>;
    }

    if (error) {
        return (
            <section className="space-y-4">
                <PageHeader
                    title="Estudo"
                    description="Não foi possível carregar o resumo do teu estudo."
                />
                <p className="sf-error">{error}</p>
            </section>
        );
    }

    if (!state) {
        return (
            <section className="space-y-4">
                <PageHeader
                    title="Estudo"
                    description="Ainda não há dados de estudo para apresentar."
                />
                <p className="sf-panel text-sm text-slate-600">
                    Cria a primeira área de estudo para começares a organizar materiais e rotinas.
                </p>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <PageHeader
                title={`Olá, ${state.studentName}`}
                description={
                    state.hasClass && state.className
                        ? `Estás a estudar em modo individual e também associado à turma ${state.className}.`
                        : "Estás em modo individual, sem turma obrigatória."
                }
                action={
                    <a className="sf-button-primary" href="/app/areas">
                        Criar área
                    </a>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <article className="sf-panel">
                    <p className="text-sm text-slate-500">Áreas de estudo</p>
                    <p className="mt-2 text-3xl font-bold">{state.studyAreasCount}</p>
                </article>
                <article className="sf-panel">
                    <p className="text-sm text-slate-500">Rotinas ativas</p>
                    <p className="mt-2 text-3xl font-bold">{state.routinesCount}</p>
                </article>
                <article className="sf-panel">
                    <p className="text-sm text-slate-500">Materiais submetidos</p>
                    <p className="mt-2 text-3xl font-bold">{state.materialsCount}</p>
                </article>
            </div>

            <article className="sf-panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-semibold text-slate-950">Próxima ação sugerida</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Revê as tuas rotinas para manter continuidade no estudo.
                    </p>
                </div>
                {/* A ligação aponta para rota existente e não transporta dados sensíveis no URL. */}
                <a className="sf-button-secondary" href="/app/rotinas">
                    Rever rotinas
                </a>
            </article>
        </section>
    );
}
```

5. Explicação do código.

Este código transforma o dashboard numa página com estados explícitos. Primeiro mostra loading. Se a chamada falhar, mostra erro controlado. Se não houver dados, mostra estado vazio. Quando há dados, apresenta `PageHeader`, métricas e uma ação secundária.

O código existe neste BK porque `RNF01` pede clareza e previsibilidade. Ele consome `getSoloStudyState`, criado no contrato frontend anterior, e prepara `BK-MF5-04`, `BK-MF5-05` e `BK-MF5-06` com uma hierarquia visual mais estável. Entram dados do backend sobre nome do aluno, turma, áreas, rotinas e materiais. Saem elementos visuais.

A regra de segurança principal é que o frontend não escolhe `userId`. A chamada usa sessão e cookies geridos pelo browser e pela API. Isto evita que um aluno force o dashboard de outro aluno. O aluno pode adaptar textos visíveis e classes, mas não deve passar identificadores de aluno na query string nem mover autorização para React.

6. Validação do passo.

Executa `npm run build` em `apps/web` depois de aplicar o ficheiro. No browser, confirma que `/app/estudo` tem um único `h1`, mostra `Criar área`, mostra métricas e não perde o estado de erro.

7. Cenário negativo/erro esperado.

Se a API de sessão estiver indisponível, a página deve mostrar `Erro ao carregar o estudo.` ou a mensagem controlada devolvida pelo cliente API. Não deve mostrar stack traces nem IDs internos.

### Passo 4 - Integrar PageHeader na página de turmas do professor

1. Objetivo funcional do passo no contexto da app.

Melhorar a clareza da gestão de turmas do professor, mantendo criação de turmas, associação de alunos, estados de carregamento, erro, vazio e sucesso.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o conteúdo do ficheiro pelo código completo abaixo. Reutiliza os contratos de `apiClient.ts`; não cries chamadas `fetch` soltas.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    type SchoolClass,
} from "../../lib/apiClient.js";

/**
 * Página de gestão de turmas oficiais do professor.
 *
 * @returns Interface para criar turmas, associar alunos e abrir áreas da turma.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Recarrega as turmas visíveis para o professor autenticado.
     */
    async function refreshClasses(): Promise<void> {
        const nextClasses = await listTeacherClasses();
        setClasses(nextClasses);
    }

    useEffect(() => {
        let isMounted = true;

        /**
         * Carrega dados iniciais sem guardar permissões no browser.
         */
        async function loadClasses(): Promise<void> {
            try {
                const nextClasses = await listTeacherClasses();

                if (isMounted) {
                    setClasses(nextClasses);
                    setError(null);
                }
            } catch (caught) {
                if (isMounted) {
                    setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        // A API decide se o utilizador é professor; a página apenas apresenta o resultado.
        void loadClasses();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * Cria uma turma usando o contrato existente da API.
     *
     * @param event Evento de submissão do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            setSuccessMessage("Turma criada com sucesso.");
            await refreshClasses();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        }
    }

    /**
     * Associa um aluno à turma indicada usando email.
     *
     * @param classId Identificador da turma escolhida pelo professor.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        setSuccessMessage(null);

        try {
            await addClassStudent(classId, emails[classId] ?? "");
            setEmails((current) => ({ ...current, [classId]: "" }));
            setSuccessMessage("Aluno associado à turma.");
            await refreshClasses();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao associar aluno.");
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader
                title="Turmas"
                description="Gestão docente de turmas, alunos inscritos e atalhos para disciplinas, publicações e progresso."
                action={
                    <button
                        aria-controls="criar-turma"
                        aria-expanded={isCreatePanelOpen}
                        className="sf-button-primary"
                        onClick={() => setIsCreatePanelOpen((current) => !current)}
                        type="button"
                    >
                        {classes.length > 0 ? "Nova turma" : "Criar turma"}
                    </button>
                }
            />

            {classes.length > 0 ? (
                <section aria-label="Ferramentas de turmas" className="sf-panel grid gap-3">
                    <label>
                        <span>Pesquisar turma</span>
                        <input
                            placeholder="Nome, código ou ano"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </label>

                    <label>
                        <span>Ordenar</span>
                        <select
                            value={sortMode}
                            onChange={(event) => setSortMode(event.target.value as TeacherClassSortMode)}
                        >
                            <option value="recent">Mais recentes</option>
                            <option value="name">Nome A-Z</option>
                            <option value="schoolYear">Ano letivo</option>
                        </select>
                    </label>
                </section>
            ) : null}

            {error ? <p className="sf-error">{error}</p> : null}
            {successMessage ? <p className="sf-success">{successMessage}</p> : null}

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <form
                    id="criar-turma"
                    className="sf-panel space-y-4"
                    onSubmit={(event) => void handleCreate(event)}
                >
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Criar turma</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Usa um nome claro e um código curto para a turma.
                        </p>
                    </div>

                    <label className="block space-y-2">
                        <span>Nome</span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            minLength={2}
                        />
                    </label>

                    <label className="block space-y-2">
                        <span>Código</span>
                        <input
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            required
                            minLength={2}
                        />
                    </label>

                    <label className="block space-y-2">
                        <span>Ano letivo</span>
                        <input
                            value={schoolYear}
                            onChange={(event) => setSchoolYear(event.target.value)}
                            required
                        />
                    </label>

                    {/* A validação visual ajuda o professor, mas a validação final continua no backend. */}
                    <button
                        className="sf-button-primary w-full"
                        disabled={name.trim().length < 2 || code.trim().length < 2}
                        type="submit"
                    >
                        Criar turma
                    </button>
                </form>

                <div className="space-y-3">
                    {loading ? <p className="sf-panel text-sm text-slate-600">A carregar turmas...</p> : null}

                    {!loading && classes.length === 0 ? (
                        <p className="sf-panel text-sm text-slate-600">
                            Ainda não tens turmas. Cria a primeira turma para associares alunos e disciplinas.
                        </p>
                    ) : null}

                    {classes.map((schoolClass) => (
                        <article className="sf-panel space-y-4" key={schoolClass._id}>
                            <div>
                                <h2 className="font-semibold text-slate-950">{schoolClass.name}</h2>
                                <p className="text-sm text-slate-600">
                                    {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                <label className="block space-y-2">
                                    <span>Email do aluno</span>
                                    <input
                                        value={emails[schoolClass._id] ?? ""}
                                        onChange={(event) =>
                                            setEmails((current) => ({
                                                ...current,
                                                [schoolClass._id]: event.target.value,
                                            }))
                                        }
                                        placeholder="aluno@example.test"
                                        type="email"
                                    />
                                </label>
                                {/* O classId identifica a turma pedida; o backend confirma se o professor pode alterá-la. */}
                                <button
                                    className="sf-button-secondary self-end"
                                    onClick={() => void handleAddStudent(schoolClass._id)}
                                    type="button"
                                >
                                    Associar aluno
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/disciplinas`}>
                                    Disciplinas
                                </a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/publicacoes`}>
                                    Publicações
                                </a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/salas-guiadas`}>
                                    Salas guiadas
                                </a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/projectos`}>
                                    Projetos
                                </a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>
                                    Progresso
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
```

5. Explicação do código.

Este código mantém a responsabilidade da página: mostrar turmas do professor, criar turma e associar alunos. O `PageHeader` orienta o professor antes dos formulários. O formulário de criação fica separado da lista, e cada turma apresenta ações docentes visíveis.

O código cumpre `RNF01` porque reduz ambiguidade visual e mantém feedback. Consome contratos anteriores de `apiClient.ts`: `listTeacherClasses`, `createTeacherClass` e `addClassStudent`. Entram dados de formulário e emails; saem chamadas API e estados visíveis. O backend continua a validar professor, turma e aluno.

As validações no frontend ajudam a experiência, mas não são segurança definitiva. O botão pode bloquear nome/código curtos, mas a API continua a rejeitar input inválido e professor sem permissão. Isto evita misturar role e ownership no browser. O aluno pode ajustar textos e classes, mas não deve substituir `apiClient.ts` por chamadas soltas.

6. Validação do passo.

Executa build frontend e abre `/app/professor/turmas` com conta de professor. Confirma um único `h1`, formulário `Criar turma`, botão `Associar aluno`, estado vazio e mensagem de erro controlada quando a API falhar.

7. Cenário negativo/erro esperado.

Com utilizador sem perfil de professor, a API deve bloquear a operação. A página pode mostrar erro, mas não deve assumir que esconder botões substitui a autorização backend.

### Passo 5 - Criar o smoke test da interface

1. Objetivo funcional do passo no contexto da app.

Criar um teste rápido que valide a hierarquia visual principal de aluno e professor.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf5-interface-smoke.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Usa variáveis de ambiente para credenciais e não guardes passwords reais no repositório.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf5-interface-smoke.spec.ts
import { expect, Page, test } from "@playwright/test";

/**
 * Entra na aplicação com uma conta de teste.
 *
 * @param page Página Playwright.
 * @param email Email da conta de teste.
 * @param password Password da conta de teste.
 */
async function login(page: Page, email: string, password: string): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    // A presença do email confirma que a sessão foi carregada no layout protegido.
    await expect(page.getByText(email)).toBeVisible();
}

test.describe("MF5 - clareza da interface", () => {
    test("dashboard do aluno mantém título único e ações de estudo", async ({ page }) => {
        const email = process.env.STUDYFLOW_E2E_STUDENT_EMAIL;
        const password = process.env.STUDYFLOW_E2E_STUDENT_PASSWORD;

        if (!email || !password) {
            throw new Error("E2E_CONFIGURATION_REQUIRED: faltam credenciais do aluno.");
        }

        await login(page, email, password);
        await page.goto("/app/estudo");

        // Um único h1 evita páginas ambíguas para leitores de ecrã e para testes.
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.getByRole("heading", { level: 1 })).toContainText("Olá,");
        await expect(page.getByRole("link", { name: "Criar área" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Rever rotinas" })).toBeVisible();
    });

    test("página de turmas do professor mantém título único e ações de gestão", async ({ page }) => {
        const email = process.env.STUDYFLOW_E2E_TEACHER_EMAIL;
        const password = process.env.STUDYFLOW_E2E_TEACHER_PASSWORD;

        if (!email || !password) {
            throw new Error("E2E_CONFIGURATION_REQUIRED: faltam credenciais do professor.");
        }

        await login(page, email, password);
        await page.goto("/app/professor/turmas");

        // O teste valida navegação e hierarquia visual, não substitui testes backend de permissões.
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.getByRole("heading", { name: "Turmas" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Nova turma" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Criar turma" })).toBeVisible();
        await expect(page.getByLabel("Pesquisar turma")).toBeVisible();
        await expect(page.getByLabel("Ordenar")).toBeVisible();
        await expect(page.getByRole("link", { name: /Voz IA da turma/ })).toBeVisible();
    });
});
```

5. Explicação do código.

Este teste valida a navegação mínima da interface MF5. Ele usa login real com contas de teste, abre o dashboard do aluno e a página de turmas do professor, e confirma que cada uma tem um único `h1` e ações principais visíveis.

O teste existe porque `RNF01` precisa de evidence observável. Entram credenciais de ambiente; saem asserts Playwright. As credenciais não ficam no ficheiro, o que reduz risco de exposição. O teste prepara `BK-MF5-04` e `BK-MF5-06`, porque torna mais fácil detetar quebra de layout ou navegação.

O aluno pode adaptar emails de teste através de variáveis de ambiente, mas não deve escrever passwords reais no código. Credenciais ausentes fazem a suite falhar: os E2E de aceitação nunca ficam opcionais nem passam por `skip` silencioso.

6. Validação do passo.

Executa `npx playwright test tests/e2e/mf5-interface-smoke.spec.ts` dentro de `apps/web`, com a API e o frontend ativos.

7. Cenário negativo/erro esperado.

Sem variáveis `STUDYFLOW_E2E_STUDENT_EMAIL`, `STUDYFLOW_E2E_STUDENT_PASSWORD`, `STUDYFLOW_E2E_TEACHER_EMAIL` ou `STUDYFLOW_E2E_TEACHER_PASSWORD`, o teste deve ficar skipped, não deve falhar com credenciais vazias.

### Passo 6 - Validar experiência, acessibilidade e privacidade

1. Objetivo funcional do passo no contexto da app.

Confirmar que as páginas ficaram claras, navegáveis e sem exposição de dados sensíveis.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/components/PageHeader.tsx`
    - REVER: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
    - REVER: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `apps/web/tests/e2e/mf5-interface-smoke.spec.ts`
    - LOCALIZAÇÃO: browser, build e smoke test.

3. Instruções do que fazer.

Executa build, abre as páginas em desktop e mobile, confirma labels, foco, erro, vazio e ações principais. Garante que a UI não guarda credenciais e não decide permissões.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação operacional e visual depois de aplicares os ficheiros.

5. Explicação do código.

Não há código porque a responsabilidade aqui é testar o resultado. O objetivo é verificar se o que foi escrito nos passos anteriores cumpre `RNF01`. Os dados analisados são comportamento no browser, mensagens e resultados de testes.

Este passo evita entregar uma alteração que compila, mas fica confusa para alunos ou professores. Também evita exposição de dados sensíveis: não deve haver passwords no código, mensagens com detalhes internos ou permissões decididas apenas na UI.

6. Validação do passo.

Valida:

- `npm run build` passa em `apps/web`;
- cada página tem um único `h1`;
- labels dos formulários são visíveis;
- erro aparece em `.sf-error`;
- estado vazio de turmas é compreensível;
- teste Playwright corre ou fica skipped por falta de credenciais.

7. Cenário negativo/erro esperado.

Se a API devolver erro, a página deve mostrar uma mensagem controlada. Não deve mostrar stack trace, resposta interna completa nem dados de outro utilizador.

### Passo 7 - Preparar evidence e handoff para BK-MF5-04

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova técnica e deixar claro o que `BK-MF5-04` pode reutilizar.

2. Ficheiros envolvidos:
    - REVER: ficheiros criados ou editados neste BK.
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-04-layout-responsivo-para-desktop-tablet-mobile.md`
    - LOCALIZAÇÃO: secções `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista outputs de build, teste e screenshots. No handoff, indica que o próximo BK deve trabalhar responsividade sem trocar o contrato de `PageHeader`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de fecho, defesa e handoff.

5. Explicação do código.

Não há código porque o objetivo é criar evidence. A prova técnica mostra que a alteração é defensável e que não quebrou fluxos. Isto prepara o próximo BK com nomes concretos: `PageHeader`, `SoloStudyDashboard`, `TeacherClassesPage` e `mf5-interface-smoke.spec.ts`.

O erro evitado é o próximo BK ter de adivinhar que componente deve tornar responsivo. A equipa pode adaptar classes e espaçamentos no BK seguinte, mas deve preservar o `h1` único, as props do `PageHeader` e as chamadas API existentes.

6. Validação do passo.

Confirma que a evidence tem comando, resultado observado e data. Confirma que o handoff menciona `BK-MF5-04`.

7. Cenário negativo/erro esperado.

Se faltares a evidence, o PR fica difícil de defender. Se o handoff omitir `PageHeader`, o próximo BK pode duplicar o mesmo padrão visual.

#### Critérios de aceite

- `PageHeader.tsx` existe e exporta `PageHeader`.
- `SoloStudyDashboard.tsx` usa `PageHeader`.
- `TeacherClassesPage.tsx` usa `PageHeader`.
- Cada página tem exatamente um `h1`.
- O dashboard do aluno mantém loading, erro, vazio e métricas.
- A página de turmas mantém criação de turma, associação de aluno, loading, erro, vazio e sucesso.
- O frontend não decide ownership, role ou permissões.
- Não há credenciais, tokens ou passwords escritos no código.
- O smoke test MF5 valida dashboard e página de turmas.
- O build frontend passa quando o código for aplicado.
- O smoke test passa ou fica skipped por falta explícita de credenciais E2E.

#### Validação final

Executa na raiz `apps/web`:

```bash
npm run build
npx playwright test tests/e2e/mf5-interface-smoke.spec.ts
```

Resultados esperados:

- build TypeScript/Vite sem erros;
- teste Playwright com dois cenários passados ou skipped por credenciais ausentes;
- dashboard do aluno com `h1` único e ações `Criar área` e `Rever rotinas`;
- página de turmas com `h1` único, ação superior `Nova turma` quando já existem turmas e botão de submit `Criar turma`;
- toolbar de turmas com `Pesquisar turma`, `Ordenar`, contagem contextual e estado vazio `Nenhuma turma corresponde à pesquisa.`;
- cards de turma com estado `Sem alunos`/`Com alunos`, CTA `Voz IA da turma` e próxima ação contextual (`Adicionar primeiro aluno` ou `Gerir disciplinas`);
- nenhum dado sensível escrito no código ou nos screenshots.

#### Evidence para PR/defesa

- Output de `npm run build`.
- Output de `npx playwright test tests/e2e/mf5-interface-smoke.spec.ts`.
- Screenshot do dashboard do aluno.
- Screenshot da página de turmas do professor.
- Nota curta: `RNF01 cumprida através de PageHeader, h1 único, estados visíveis e smoke test`.
- Nota de privacidade: credenciais E2E vêm de variáveis de ambiente; permissões continuam no backend.

#### Handoff

`BK-MF5-04` recebe `PageHeader` como padrão visual para testar responsividade em desktop, tablet e mobile. `BK-MF5-05` pode reutilizar os estados `error` e `successMessage` para melhorar feedback. `BK-MF5-06` pode alinhar navegação e títulos com o mesmo padrão.

O próximo BK não deve criar outro componente para a mesma responsabilidade sem motivo. Deve preservar `title`, `description`, `action`, `h1` único e chamadas API existentes.

#### Changelog

- `2026-06-19`: Guia reestruturado para cumprir o formato obrigatório, com passos 1 a 7, código completo, explicações didáticas, validação por passo, cenários negativos, evidence e handoff para `BK-MF5-04`.
