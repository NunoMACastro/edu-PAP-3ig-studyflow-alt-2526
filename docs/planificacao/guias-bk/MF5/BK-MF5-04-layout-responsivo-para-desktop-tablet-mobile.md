# BK-MF5-04 - Layout responsivo para desktop/tablet/mobile.

## Header

- `doc_id`: `GUIA-BK-MF5-04`
- `bk_id`: `BK-MF5-04`
- `macro`: `MF5`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF02`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-05`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-04-layout-responsivo-para-desktop-tablet-mobile.md`
- `last_updated`: `2026-06-19`

#### Objetivo

Neste BK vais implementar um frame responsivo reutilizável e aplicá-lo em páginas reais do aluno e do professor. O objetivo é que a aplicação continue legível em telemóvel, tablet e desktop, sem scroll horizontal, sobreposição de botões ou perda de estados de erro/carregamento.

#### Importância

`RNF02` é CANONICO e exige layout responsivo para desktop, tablet e mobile. Numa plataforma de estudo, o aluno pode consultar materiais no telemóvel e o professor pode gerir turmas num ecrã maior; ambos precisam da mesma informação, mas organizada de forma adequada à largura disponível.

#### Scope-in

- Criar `apps/web/src/components/layout/ResponsivePageFrame.tsx`.
- Reutilizar `PageHeader` criado em `BK-MF5-03`.
- Editar `StudyAreaMaterialsPage.tsx` para usar frame responsivo.
- Editar `TeacherClassesPage.tsx` para usar frame responsivo.
- Criar smoke Playwright para validar 390px, 768px e 1440px.

#### Scope-out

- Alterar endpoints, DTOs, autenticação, autorização, ownership ou membership.
- Criar novas regras de permissões no frontend.
- Alterar o contrato de materiais, turmas, IA, salas ou disciplinas.
- Adicionar dependências novas.

#### Estado antes e depois

- **Antes:** algumas páginas usam grelhas locais com larguras fixas, o que aumenta o risco de quebra visual em mobile.
- **Depois:** páginas com formulário e conteúdo principal usam um frame comum, com uma coluna em mobile e duas zonas em desktop.

#### Pre-requisitos

- Ter concluído `BK-MF5-03`, incluindo `apps/web/src/components/PageHeader.tsx`.
- Ler `RNF02` em `docs/RNF.md`.
- Confirmar `BK-MF5-04` em `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md`.
- Rever `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`.
- Rever `apps/web/src/pages/teacher/TeacherClassesPage.tsx`.

#### Glossário

- **Layout responsivo:** organização visual que se adapta à largura do ecrã sem esconder conteúdo importante.
- **Breakpoint:** ponto de largura onde o layout muda, por exemplo de uma coluna para duas.
- **Frame:** componente estrutural que define zonas de página, sem decidir dados ou permissões.
- **Aside:** zona secundária, normalmente usada para formulário, filtros ou ações.
- **Scroll horizontal:** deslocação lateral indesejada, comum quando elementos não podem encolher.

#### Conceitos teóricos essenciais

- **Componente React:** função que recebe props e devolve interface. Neste BK, `ResponsivePageFrame` recebe `main` e `aside`.
- **Props:** valores enviados por uma página para um componente. O frame recebe conteúdo já preparado, sem conhecer materiais ou turmas.
- **CSS Grid:** sistema de layout usado para alternar entre uma coluna em mobile e duas zonas em desktop.
- **`min-w-0`:** classe importante em grids CSS; permite que listas, cartões e URLs longos encolham dentro da coluna em vez de rebentarem o layout.
- **Acessibilidade:** a ordem no DOM continua a apresentar o conteúdo principal antes do painel secundário, facilitando leitura por teclado e leitor de ecrã.
- **Segurança frontend/backend:** o frontend organiza a experiência, mas permissões continuam a ser verificadas no backend através da sessão e dos services.
- **Smoke test responsivo:** teste E2E pequeno que abre a UI em várias larguras e prova que não há scroll horizontal nem desaparecimento do conteúdo principal.

#### Arquitetura do BK

O BK cria um componente visual em `components/layout`, sem chamadas HTTP. As páginas continuam a chamar os mesmos clientes de API e a receber dados pelos mesmos contratos. A alteração fica limitada à organização visual e à evidence de responsividade.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/components/layout/ResponsivePageFrame.tsx`
- EDITAR: `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`
- EDITAR: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
- CRIAR: `apps/web/tests/e2e/mf5-responsive-layout.spec.ts`
- REVER: `apps/web/src/components/PageHeader.tsx`
- REVER: `apps/web/src/lib/apiClient.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e dependências

1. Objetivo funcional do passo no contexto da app.

Confirmar que a correção pertence a `RNF02`, que recebe o handoff visual de `BK-MF5-03` e que prepara o feedback imediato de `BK-MF5-05`.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-03-interface-intuitiva-e-clara-para-alunos-e-professores.md`
    - LOCALIZAÇÃO: linhas de `BK-MF5-04`, `RNF02`, `BK-MF5-03` e `BK-MF5-05`.

3. Instruções do que fazer.

Confirma que `BK-MF5-04` é um BK de UX. Não cries endpoints, schemas, DTOs nem services backend. A correção deve reutilizar chamadas existentes e manter autorização no backend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e preparatório, porque fixa o contrato antes de editar a aplicação.

5. Explicação do código.

Não há código porque a decisão importante é de fronteira: `RNF02` altera layout, não regras de negócio. Isto evita transformar uma melhoria visual numa alteração de permissões, dados ou endpoints.

6. Validação do passo.

Confirma que o header mantém `bk_id: BK-MF5-04`, `rf_rnf: RNF02`, `sprint: S09` e `proximo_bk: BK-MF5-05`.

7. Cenário negativo/erro esperado.

Se encontrares uma decisão visual que exige novo campo ou novo endpoint, não a assumes como facto. Regista a decisão como `DERIVADO` no relatório ou bloqueia por contrato se for indispensável.

### Passo 2 - Criar ResponsivePageFrame

1. Objetivo funcional do passo no contexto da app.

Criar um componente de layout reutilizável, capaz de organizar conteúdo principal e painel secundário sem scroll horizontal.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/components/layout/ResponsivePageFrame.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. O componente deve receber `main`, `aside` opcional e `asideLabel` opcional. Não deve importar clientes de API nem conhecer entidades StudyFlow.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/components/layout/ResponsivePageFrame.tsx
import { ReactNode } from "react";

/**
 * Dados necessários para organizar uma página com conteúdo principal e zona secundária.
 */
type ResponsivePageFrameProps = {
    /** Conteúdo principal da página, por exemplo uma lista de materiais ou turmas. */
    main: ReactNode;
    /** Conteúdo secundário, por exemplo formulário, filtros ou ações de apoio. */
    aside?: ReactNode;
    /** Nome acessível da zona secundária, usado apenas quando existe `aside`. */
    asideLabel?: string;
};

/**
 * Organiza páginas StudyFlow em uma coluna no mobile e duas zonas no desktop.
 *
 * @param props Conteúdo principal, zona secundária opcional e etiqueta acessível.
 * @returns Frame responsivo sem lógica de domínio.
 */
export function ResponsivePageFrame({
    main,
    aside,
    asideLabel = "Ações secundárias",
}: ResponsivePageFrameProps) {
    if (!aside) {
        return <div className="min-w-0 space-y-4">{main}</div>;
    }

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* O conteúdo principal vem primeiro no DOM para preservar leitura natural em mobile e leitores de ecrã. */}
            <div className="min-w-0 space-y-4">{main}</div>

            <aside
                aria-label={asideLabel}
                className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start"
            >
                {/* min-w-0 impede que URLs, emails ou títulos longos criem scroll horizontal dentro da grelha. */}
                {aside}
            </aside>
        </div>
    );
}
```

5. Explicação do código.

O componente usa `ReactNode` para aceitar qualquer conteúdo React. `main` é obrigatório porque cada página precisa de conteúdo principal; `aside` é opcional porque nem todas as páginas têm painel secundário.

O contrato de `RNF02` é cumprido pela grid: em mobile a estrutura fica numa coluna; em desktop passa para `minmax(0,1fr)_360px`, mantendo a zona principal flexível e a lateral previsível. `min-w-0` evita o erro comum em CSS Grid em que um filho largo força scroll horizontal. O componente não lê sessão, não chama API e não decide permissões, por isso preserva a fronteira de segurança definida nos BKs anteriores.

6. Validação do passo.

Confirma que o ficheiro exporta `ResponsivePageFrame` e que o import funciona a partir de páginas em `apps/web/src/pages/*`.

7. Cenário negativo/erro esperado.

Se removeres `min-w-0`, uma URL longa ou email longo pode rebentar a coluna em mobile. Repõe `min-w-0` no frame e nos blocos internos que contêm listas.

### Passo 3 - Aplicar o frame à página de materiais do aluno

1. Objetivo funcional do passo no contexto da app.

Organizar a página de materiais privados para que a lista seja o conteúdo principal e o formulário fique numa zona secundária responsiva.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`
    - REVER: `apps/web/src/components/materials/MaterialList.tsx`
    - REVER: `apps/web/src/components/materials/MaterialSubmitForm.tsx`
    - LOCALIZAÇÃO: componente completo `StudyAreaMaterialsPage`.

3. Instruções do que fazer.

Substitui o conteúdo completo de `StudyAreaMaterialsPage.tsx` pelo código abaixo. Mantém `studyAreaId` vindo da rota protegida e mantém a criação/listagem de materiais através dos componentes existentes.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/student/StudyAreaMaterialsPage.tsx
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { ResponsivePageFrame } from "../../components/layout/ResponsivePageFrame.js";
import { MaterialList } from "../../components/materials/MaterialList.js";
import { MaterialSubmitForm } from "../../components/materials/MaterialSubmitForm.js";
import { listMaterials, StudyMaterial } from "../../lib/apiClient.js";

/**
 * Props da página de materiais privados.
 */
type StudyAreaMaterialsPageProps = {
    /** Identificador da área validado pela rota protegida e pelo backend. */
    studyAreaId: string;
};

/**
 * Mostra materiais de uma área de estudo e o formulário para adicionar novos materiais.
 *
 * @param props Identificador da área de estudo privada.
 * @returns Página responsiva de materiais privados.
 */
export function StudyAreaMaterialsPage({ studyAreaId }: StudyAreaMaterialsPageProps) {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega materiais da área autenticada.
     *
     * @returns Promise resolvida depois de atualizar a lista visível.
     */
    async function refresh(): Promise<void> {
        setIsLoading(true);
        setError(null);
        try {
            // O frontend só envia o studyAreaId; o backend continua a validar ownership pela sessão.
            setMaterials(await listMaterials(studyAreaId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível carregar materiais.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [studyAreaId]);

    const materialList = (
        <section className="sf-panel min-w-0 space-y-4">
            <div>
                <h2 className="text-lg font-bold">Materiais submetidos</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Estes materiais pertencem à tua área de estudo privada.
                </p>
            </div>

            {error ? <p className="sf-error">{error}</p> : null}
            {isLoading ? <p className="text-sm text-slate-600">A carregar materiais...</p> : null}
            {!isLoading && materials.length === 0 ? (
                <p className="text-sm text-slate-600">
                    Ainda não existem materiais nesta área. Usa o formulário para adicionar o primeiro.
                </p>
            ) : null}
            {!isLoading && materials.length > 0 ? (
                // A lista fica dentro do bloco principal para o aluno ver primeiro o que já existe.
                <MaterialList materials={materials} studyAreaId={studyAreaId} />
            ) : null}
        </section>
    );

    return (
        <section className="space-y-6">
            <PageHeader
                title="Materiais da área"
                description="Consulta os materiais já associados à tua área e adiciona novos tópicos, URLs ou ficheiros sem sair deste ecrã."
            />

            <ResponsivePageFrame
                aside={<MaterialSubmitForm studyAreaId={studyAreaId} onSubmitted={refresh} />}
                asideLabel="Adicionar material"
                main={materialList}
            />
        </section>
    );
}
```

5. Explicação do código.

Este código mantém a responsabilidade da página: carregar materiais e entregar o formulário que cria novos materiais. O `PageHeader` vem de `BK-MF5-03` e dá contexto ao aluno. O `ResponsivePageFrame` criado neste BK separa conteúdo principal e formulário, sem alterar a chamada `listMaterials`.

Entram `studyAreaId` e a sessão autenticada já mantida pela aplicação. Sai uma página com loading, erro, vazio e lista. A regra de ownership continua no backend; o comentário dentro de `refresh` lembra que o frontend não deve decidir que materiais pertencem ao aluno. A página prepara `BK-MF5-05`, porque o formulário lateral será um dos pontos onde o feedback imediato pode ser aplicado.

6. Validação do passo.

Abre uma área de estudo com e sem materiais. Em 390px, confirma que o topo aparece primeiro, depois a lista e depois o formulário. Em 1440px, confirma que lista e formulário aparecem lado a lado.

7. Cenário negativo/erro esperado.

Se `listMaterials` devolver erro, a página deve mostrar "Não foi possível carregar materiais." sem esconder o formulário nem expor detalhes internos da API.

### Passo 4 - Aplicar o frame à página de turmas do professor

1. Objetivo funcional do passo no contexto da app.

Organizar a página de turmas para que a lista de turmas seja o conteúdo principal e o formulário de criação fique num painel lateral.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: componente completo `TeacherClassesPage`.

3. Instruções do que fazer.

Substitui o conteúdo completo de `TeacherClassesPage.tsx` pelo código abaixo. Mantém as funções `listTeacherClasses`, `createTeacherClass` e `addClassStudent`, porque os contratos de professor/turma continuam no backend.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { ResponsivePageFrame } from "../../components/layout/ResponsivePageFrame.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Gestão responsiva de turmas, alunos e atalhos docentes.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    /**
     * Recarrega as turmas do professor autenticado.
     *
     * @returns Promise resolvida depois de atualizar a lista.
     */
    async function refresh(): Promise<void> {
        setIsLoading(true);
        setError(null);
        try {
            // A API só devolve turmas que o professor autenticado pode gerir.
            setClasses(await listTeacherClasses());
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    /**
     * Cria uma turma oficial para o professor autenticado.
     *
     * @param event Evento de submissão do formulário.
     * @returns Promise resolvida depois de criar e recarregar.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setIsCreating(true);
        try {
            // O backend valida o professor e impede criar turmas em nome de outro utilizador.
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setIsCreating(false);
        }
    }

    /**
     * Adiciona um aluno a uma turma do professor autenticado.
     *
     * @param classId Identificador da turma oficial.
     * @returns Promise resolvida depois de associar o aluno e recarregar.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        try {
            const email = emails[classId]?.trim() ?? "";
            if (email.length < 3) {
                throw new Error("Indica o email do aluno.");
            }

            await addClassStudent(classId, email);
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        }
    }

    const createClassForm = (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
            <h2 className="text-lg font-bold">Nova turma</h2>
            {error ? <p className="sf-error">{error}</p> : null}

            <label className="block" htmlFor="className">
                Nome
                <input id="className" value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            <label className="block" htmlFor="classCode">
                Código
                <input id="classCode" value={code} onChange={(event) => setCode(event.target.value)} />
            </label>

            <label className="block" htmlFor="classSchoolYear">
                Ano letivo
                <input
                    id="classSchoolYear"
                    value={schoolYear}
                    onChange={(event) => setSchoolYear(event.target.value)}
                />
            </label>

            <button
                className="sf-button-primary"
                disabled={isCreating || name.trim().length < 2 || code.trim().length < 2}
                type="submit"
            >
                {isCreating ? "A criar..." : "Criar turma"}
            </button>
        </form>
    );

    const classesList = (
        <section className="min-w-0 space-y-3">
            {isLoading ? <p className="sf-panel text-sm text-slate-600">A carregar turmas...</p> : null}
            {!isLoading && classes.length === 0 ? (
                <p className="sf-panel text-sm text-slate-600">Ainda não tens turmas.</p>
            ) : null}

            {classes.map((schoolClass) => (
                <article className="sf-panel min-w-0 space-y-3" key={schoolClass._id}>
                    <div>
                        <h2 className="break-words font-semibold">{schoolClass.name}</h2>
                        <p className="text-sm text-slate-600">
                            {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                        </p>
                    </div>

                    <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto]">
                        <input
                            aria-label={`Email do aluno para ${schoolClass.name}`}
                            value={emails[schoolClass._id] ?? ""}
                            onChange={(event) =>
                                setEmails((current) => ({
                                    ...current,
                                    [schoolClass._id]: event.target.value,
                                }))
                            }
                            placeholder="email do aluno"
                        />
                        <button
                            className="sf-button-secondary"
                            onClick={() => void handleAddStudent(schoolClass._id)}
                            type="button"
                        >
                            Adicionar aluno
                        </button>
                    </div>

                    <div className="flex min-w-0 flex-wrap gap-2">
                        {/* Estes links mantêm a navegação docente existente sem criar novas regras de permissão. */}
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
                            Projectos
                        </a>
                        <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>
                            Progresso
                        </a>
                    </div>
                </article>
            ))}
        </section>
    );

    return (
        <section className="space-y-6">
            <PageHeader
                title="Turmas"
                description="Cria turmas, associa alunos e entra nos módulos docentes sem perder contexto."
            />

            <ResponsivePageFrame
                aside={createClassForm}
                asideLabel="Criar turma"
                main={classesList}
            />
        </section>
    );
}
```

5. Explicação do código.

Este código preserva as responsabilidades de `TeacherClassesPage`: listar turmas, criar turma e adicionar alunos. O `ResponsivePageFrame` apenas muda a organização visual. Em mobile, a lista fica primeiro e o formulário aparece depois; em desktop, o formulário fica lateral.

Entram dados de formulário (`name`, `code`, `schoolYear`, emails por turma) e saem chamadas para clientes API já existentes. O backend continua a validar professor, turma e aluno. O estado `isCreating` evita submissões duplicadas, e `isLoading` evita ecrãs silenciosos. `min-w-0`, `break-words` e `flex-wrap` reduzem o risco de scroll horizontal quando nomes, emails ou links crescem.

6. Validação do passo.

Como professor, abre `/app/professor/turmas` em 390px, 768px e 1440px. Confirma que o formulário é utilizável, a lista não rebenta a largura e os links ficam acessíveis.

7. Cenário negativo/erro esperado.

Se tentares adicionar aluno sem email, a página deve mostrar "Indica o email do aluno." e não deve chamar a API.

### Passo 5 - Criar smoke responsivo

1. Objetivo funcional do passo no contexto da app.

Criar evidence automatizada para provar que as páginas críticas não criam scroll horizontal nas larguras exigidas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf5-responsive-layout.spec.ts`
    - REVER: `apps/web/playwright.config.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Usa login real pela UI, como nos smokes anteriores, para manter cookies HttpOnly e sessão real.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf5-responsive-layout.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

const viewports = [
    { height: 844, width: 390 },
    { height: 1024, width: 768 },
    { height: 900, width: 1440 },
];

/**
 * Entra pela UI para validar a sessão real baseada em cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E.
 */
async function loginAs(
    page: Page,
    credentials: { email: string; password: string },
): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(credentials.email)).toBeVisible();
}

/**
 * Confirma que a página não obriga o utilizador a fazer scroll horizontal.
 *
 * @param page Página Playwright.
 */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
    const hasHorizontalScroll = await page.evaluate(() => {
        // Compara largura total e largura visível para detetar overflow real no documento.
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
}

test("MF5 responsive: materiais do aluno mantêm layout em mobile, tablet e desktop", async ({ page }) => {
    await loginAs(page, student);

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto("/app/areas");
        await expect(page.getByRole("heading", { name: /Áreas|Estudo/i })).toBeVisible();

        await expectNoHorizontalScroll(page);
    }
});

test("MF5 responsive: turmas do professor mantêm layout em mobile, tablet e desktop", async ({ page }) => {
    await loginAs(page, teacher);

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto("/app/professor/turmas");
        await expect(page.getByRole("heading", { name: "Turmas" })).toBeVisible();

        // O teste valida o contrato visual, não substitui testes de autorização no backend.
        await expectNoHorizontalScroll(page);
    }
});
```

5. Explicação do código.

O teste usa as mesmas credenciais E2E por variáveis de ambiente já usadas pelos smokes existentes. Entra pela UI para preservar o comportamento real de sessão e cookies HttpOnly. Depois percorre três larguras: 390px, 768px e 1440px.

`expectNoHorizontalScroll` mede `scrollWidth` e `clientWidth`. Se a página tiver um elemento a rebentar a largura, o teste falha. Isto cumpre `RNF02` com evidence objetiva. O teste não valida ownership, porque esse contrato pertence aos endpoints backend; aqui valida apenas o comportamento visual.

6. Validação do passo.

Executa `npm --prefix apps/web run test:e2e -- mf5-responsive-layout.spec.ts` depois de ter API/web E2E configurados.

7. Cenário negativo/erro esperado.

Se aparecer scroll horizontal, procura primeiro elementos com largura fixa, URLs longos, botões sem `flex-wrap` ou grids sem `min-w-0`.

### Passo 6 - Validar manualmente a experiência

1. Objetivo funcional do passo no contexto da app.

Confirmar que o resultado é utilizável por aluno e professor, não apenas que compila.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`
    - REVER: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `apps/web/tests/e2e/mf5-responsive-layout.spec.ts`
    - LOCALIZAÇÃO: browser em 390px, 768px e 1440px.

3. Instruções do que fazer.

Abre as duas páginas em sessão real. Testa teclado, foco, mensagens de erro, estados vazios e nomes longos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação manual, porque confirma comportamento visual e ergonomia no browser.

5. Explicação do código.

Não há código novo porque a validação deve observar a aplicação. O objetivo é apanhar problemas que um teste automatizado simples pode não mostrar, como ordem visual confusa, foco pouco previsível ou texto que fica apertado demais.

6. Validação do passo.

Regista evidence com prints ou vídeo curto dos três tamanhos e com o output do smoke.

7. Cenário negativo/erro esperado.

Se o utilizador precisar de zoom ou scroll lateral para submeter material ou criar turma, o layout ainda não cumpre `RNF02`.

### Passo 7 - Preparar handoff para feedback imediato

1. Objetivo funcional do passo no contexto da app.

Deixar claro o que `BK-MF5-05` deve reutilizar para implementar feedback imediato sem refazer layout.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/components/layout/ResponsivePageFrame.tsx`
    - REVER: `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`
    - REVER: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
    - LOCALIZAÇÃO: secções `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista que `BK-MF5-05` deve usar os mesmos pontos de submissão assíncrona: submissão de material, criação de turma, adição de aluno e pedidos IA.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha documentação e handoff técnico.

5. Explicação do código.

O handoff evita duplicação. `BK-MF5-05` pode focar feedback imediato porque já recebe páginas com zonas claras e estados visíveis. Não deve criar outro frame, nem mover segurança para o frontend.

6. Validação do passo.

Confirma que `BK-MF5-05` menciona `ResponsivePageFrame` como contrato anterior e integra feedback nos fluxos assíncronos reais.

7. Cenário negativo/erro esperado.

Se `BK-MF5-05` criar outro componente de layout para resolver feedback, está a duplicar responsabilidade deste BK.

#### Critérios de aceite

- `ResponsivePageFrame.tsx` existe e exporta `ResponsivePageFrame`.
- `StudyAreaMaterialsPage.tsx` usa `PageHeader` e `ResponsivePageFrame`.
- `TeacherClassesPage.tsx` usa `PageHeader` e `ResponsivePageFrame`.
- As páginas não criam scroll horizontal em 390px, 768px e 1440px.
- O frontend continua sem decidir ownership, membership, role ou permissão.
- O smoke `mf5-responsive-layout.spec.ts` existe e valida overflow horizontal.

#### Validação final

- Executar `npm --prefix apps/web run build`.
- Executar `npm --prefix apps/web run test:e2e -- mf5-responsive-layout.spec.ts`.
- Confirmar manualmente as páginas em mobile, tablet e desktop.
- Confirmar que não há tokens, cookies, prompts privados ou dados sensíveis em logs ou storage.

#### Evidence para PR/defesa

- Output do build web.
- Output do smoke Playwright responsivo.
- Prints de `/app/areas`, `/app/professor/turmas` ou páginas com frame em 390px, 768px e 1440px.
- Nota: `RNF02 cumprida com ResponsivePageFrame, min-w-0, ordem mobile previsível e smoke sem scroll horizontal`.

#### Handoff

`BK-MF5-05` recebe `ResponsivePageFrame`, páginas com zonas estáveis e pontos assíncronos claros para adicionar feedback imediato: submissão de material, criação de turma, adição de aluno e pedidos IA. O próximo BK não deve recriar layout; deve apenas melhorar mensagens de loading, sucesso e erro.

#### Changelog

- 2026-06-19: Guia corrigido para incluir código completo de `ResponsivePageFrame`, integrações completas em `StudyAreaMaterialsPage.tsx` e `TeacherClassesPage.tsx`, smoke responsivo e handoff concreto para `BK-MF5-05`.
