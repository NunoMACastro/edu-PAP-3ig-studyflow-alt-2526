# BK-MF5-07 - Regras básicas de acessibilidade (contraste, labels).

## Header

- `doc_id`: `GUIA-BK-MF5-07`
- `bk_id`: `BK-MF5-07`
- `macro`: `MF5`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF05`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-08`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-07-regras-basicas-de-acessibilidade-contraste-labels.md`
- `last_updated`: `2026-06-19`

#### Objetivo

Neste BK vais implementar um componente `FormField` para garantir labels, textos de ajuda, erros associados ao campo e contraste legível nos formulários principais. Depois vais aplicar esse componente nos formulários reais de turmas e materiais.

#### Importância

`RNF05` é CANONICO e pede regras básicas de acessibilidade, incluindo contraste e labels. Um formulário sem label explícita ou sem erro ligado ao campo obriga o utilizador a adivinhar o que deve corrigir. Acessibilidade também é qualidade técnica: quando o campo tem `htmlFor`, `aria-describedby` e `aria-invalid`, os testes conseguem validar comportamento real.

#### Scope-in

- Criar `real_dev/web/src/components/forms/FormField.tsx`.
- Aplicar `FormField` em `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`.
- Aplicar `FormField` em `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`.
- Associar label, ajuda e erro com IDs estáveis.
- Garantir contraste com classes Tailwind já usadas no projeto.
- Criar smoke Playwright focado em labels e atributos acessíveis.

#### Scope-out

- Criar biblioteca de design system completa.
- Substituir validação backend por validação frontend.
- Alterar endpoints, DTOs, roles, sessão, ownership ou membership.
- Criar tema visual novo.
- Adicionar dependências novas.

#### Estado antes e depois

- **Antes:** os formulários usam estilos parecidos, mas nem todos têm labels explícitas, ajuda associada e erro por campo preparado.
- **Depois:** formulários críticos usam `FormField`, com label, ajuda, `aria-describedby`, `aria-invalid` e contraste consistente.

#### Pre-requisitos

- Ter concluído `BK-MF5-06`, para manter navegação e shell autenticada estáveis.
- Ler `RNF05` em `docs/RNF.md`.
- Rever `real_dev/web/src/styles.css`.
- Rever `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`.
- Rever `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`.
- Rever `real_dev/web/tests/e2e/README.md`.
- Rever `BK-MF5-08`, porque a validação antes de submissão vai reutilizar erros por campo.

#### Glossário

- **Label:** texto associado a um campo através de `htmlFor` e `id`.
- **Texto de ajuda:** explicação curta que orienta o preenchimento antes do erro.
- **Erro por campo:** mensagem junto ao campo que explica o que deve ser corrigido.
- **`aria-describedby`:** atributo que liga o campo ao texto de ajuda e ao erro.
- **`aria-invalid`:** atributo que indica se o valor atual do campo está inválido.
- **Contraste:** diferença visual entre texto e fundo, necessária para leitura confortável.
- **Foco:** estado visual de um campo quando o utilizador navega com teclado.

#### Conceitos teóricos essenciais

- **Componente reutilizável:** `FormField` evita repetir a estrutura de label, ajuda e erro em cada formulário.
- **Props React:** o componente recebe `id`, `label`, `helpText`, `error` e `children`, deixando o formulário pai controlar o valor do input.
- **Composição:** o campo real continua a ser `<input>`, `<select>` ou `<textarea>`; `FormField` só adiciona o contrato acessível em volta.
- **Estado React:** os formulários mantêm estado local para valores e erro geral. Este BK prepara erro por campo para o BK seguinte.
- **Acessibilidade:** leitores de ecrã usam `htmlFor`, `aria-describedby` e `aria-invalid` para explicar o campo.
- **Segurança backend:** labels e erros ajudam o utilizador, mas a API continua a validar payloads e permissões.
- **Privacidade:** mensagens visíveis não devem revelar cookies, tokens, IDs internos desnecessários, prompts privados ou respostas IA privadas.
- **Evidence técnico:** um smoke E2E com `getByLabel` prova que os labels existem e estão associados aos controlos reais.

#### Arquitetura do BK

`FormField.tsx` fica em `real_dev/web/src/components/forms`. Os formulários importam esse componente e passam o controlo real como filho. `TeacherClassesPage.tsx` aplica-o nos campos de criação de turma e no email de aluno. `MaterialSubmitForm.tsx` aplica-o no tipo, título, ficheiro e texto/URL do material. O teste `mf5-accessibility.spec.ts` valida labels, ajuda associada e ausência de links com nomes inacessíveis.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/components/forms/FormField.tsx`
- EDITAR: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
- EDITAR: `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`
- CRIAR: `real_dev/web/tests/e2e/mf5-accessibility.spec.ts`
- REVER: `real_dev/web/src/styles.css`
- REVER: `real_dev/web/playwright.config.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato de acessibilidade

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF5-07` implementa `RNF05` sem mudar regras de dados ou permissões.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `real_dev/web/src/styles.css`
    - LOCALIZAÇÃO: `RNF05`, linha de `BK-MF5-07` e classes base de formulário.

3. Instruções do que fazer.

Confirma que `RNF05` pede contraste e labels. Mantém os estilos base de `styles.css` e não cries dependências novas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e prepara as decisões de UI antes da alteração.

5. Explicação do código.

Não há código porque primeiro tens de confirmar que este BK melhora acessibilidade, não autorização. O backend continua responsável por sessão, ownership, membership e validação final.

6. Validação do passo.

Confirma que os formulários alvo existem e que o próximo BK (`BK-MF5-08`) depende de erros por campo.

7. Cenário negativo/erro esperado.

Se tratares `RNF05` como apenas cor ou espaçamento, o formulário continua difícil de usar por teclado e por leitores de ecrã.

### Passo 2 - Criar FormField

1. Objetivo funcional do passo no contexto da app.

Criar um componente reutilizável que associa label, ajuda, erro e campo real.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/components/forms/FormField.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `components/forms` se ainda não existir. Depois cria `FormField.tsx` com `cloneElement`, IDs derivados de `id` e classes de contraste coerentes com `styles.css`.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/components/forms/FormField.tsx
import { cloneElement, type ReactElement, type ReactNode } from "react";

type FormControlElement = ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
}>;

type FormFieldProps = {
    id: string;
    label: string;
    helpText?: string;
    error?: string;
    children: FormControlElement;
};

/**
 * Envolve um controlo de formulário com label, ajuda e erro acessíveis.
 *
 * @param props Identificador, textos visíveis e controlo React.
 * @returns Campo pronto a ser usado por teclado e tecnologias de apoio.
 */
export function FormField({ id, label, helpText, error, children }: FormFieldProps) {
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-800" htmlFor={id}>
                {label}
            </label>
            {cloneElement(children, {
                id,
                "aria-describedby": describedBy,
                "aria-invalid": Boolean(error),
            })}
            {helpText ? (
                <p className="text-xs text-slate-600" id={helpId}>
                    {helpText}
                </p>
            ) : null}
            {error ? (
                <p className="text-xs font-medium text-red-700" id={errorId} role="alert">
                    {/* O erro fica junto ao campo para o utilizador saber onde corrigir. */}
                    {error}
                </p>
            ) : null}
        </div>
    );
}
```

5. Explicação do código.

`FormField` recebe um controlo React como filho e injeta `id`, `aria-describedby` e `aria-invalid`. O label usa `htmlFor={id}`, ligando texto e campo. `helpText` fica associado antes do erro, e `error` usa `role="alert"` para ser anunciado quando aparecer. O componente não guarda valores, não chama API e não decide permissões; apenas cria uma estrutura acessível e reutilizável.

6. Validação do passo.

Importa `FormField` num formulário e confirma que `getByLabel("Nome")` encontra o input correto.

7. Cenário negativo/erro esperado.

Se dois campos usarem o mesmo `id`, `aria-describedby` e `htmlFor` passam a apontar para o campo errado.

### Passo 3 - Aplicar FormField nas turmas do professor

1. Objetivo funcional do passo no contexto da app.

Garantir que criação de turmas e adição de alunos têm labels explícitas, ajuda associada e mensagens seguras.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `real_dev/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Importa `FormField`, substitui labels envolventes por labels explícitas e adiciona texto de ajuda. Mantém `listTeacherClasses`, `createTeacherClass` e `addClassStudent` iguais.

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

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Formulário acessível para criar turmas e adicionar alunos.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     */
    async function refresh(): Promise<void> {
        setClasses(await listTeacherClasses());
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas."),
        );
    }, []);

    /**
     * Cria turma oficial usando a API autenticada.
     *
     * @param event Evento de submissão do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            // A API continua a validar professor autenticado, payload e unicidade do código.
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        }
    }

    /**
     * Adiciona aluno a uma turma gerida pelo professor autenticado.
     *
     * @param classId Identificador da turma oficial.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        try {
            await addClassStudent(classId, emails[classId] ?? "");
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Turmas</h1>
                {error ? (
                    <p className="sf-error" role="alert">
                        {error}
                    </p>
                ) : null}
                <FormField id="teacherClassName" label="Nome" helpText="Nome visível da turma.">
                    <input value={name} onChange={(event) => setName(event.target.value)} />
                </FormField>
                <FormField id="teacherClassCode" label="Código" helpText="Código curto usado para identificar a turma.">
                    <input value={code} onChange={(event) => setCode(event.target.value)} />
                </FormField>
                <FormField id="teacherClassSchoolYear" label="Ano letivo" helpText="Formato esperado: 2025/2026.">
                    <input value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} />
                </FormField>
                <button className="sf-button-primary" disabled={name.trim().length < 2 || code.trim().length < 2}>
                    Criar turma
                </button>
            </form>
            <div className="grid gap-3">
                {classes.length === 0 ? (
                    <p className="sf-panel text-sm text-slate-600">Ainda não tens turmas.</p>
                ) : null}
                {classes.map((schoolClass) => (
                    <article className="sf-panel space-y-3" key={schoolClass._id}>
                        <div>
                            <h2 className="font-semibold">{schoolClass.name}</h2>
                            <p className="text-sm text-slate-600">
                                {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                            </p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <FormField
                                id={`studentEmail-${schoolClass._id}`}
                                label={`Email do aluno para ${schoolClass.name}`}
                                helpText="Usa o email da conta StudyFlow do aluno."
                            >
                                <input
                                    type="email"
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
                                onClick={() => void handleAddStudent(schoolClass._id)}
                                type="button"
                            >
                                Adicionar aluno
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
                                Projectos
                            </a>
                            <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>
                                Progresso
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
```

5. Explicação do código.

A página continua a usar os mesmos clientes API e a mesma sessão autenticada. A mudança principal é estrutural: cada campo passa por `FormField`, que associa label, ajuda e input. O email do aluno deixa de depender de texto dentro do campo e passa a ter label real. `type="button"` no botão de adicionar aluno evita submissões acidentais do formulário de criação de turma. O erro geral continua seguro e não revela dados internos.

6. Validação do passo.

No browser, entra como professor, abre `/app/professor/turmas` e confirma que `Nome`, `Código`, `Ano letivo` e `Email do aluno para ...` são encontrados por label.

7. Cenário negativo/erro esperado.

Se o email do aluno não tiver label real, `getByLabel(/Email do aluno/)` falha e o utilizador com leitor de ecrã perde contexto.

### Passo 4 - Aplicar FormField na submissão de materiais

1. Objetivo funcional do passo no contexto da app.

Garantir que o aluno submete materiais com labels, ajuda e erro seguro.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`
    - REVER: `real_dev/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Importa `FormField`, mantém os clientes `submitTextMaterial` e `submitFileMaterial`, adiciona labels explícitas e conserva o erro geral com `role="alert"`.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/components/materials/MaterialSubmitForm.tsx
import { FormEvent, useState } from "react";
import { FormField } from "../forms/FormField.js";
import { submitFileMaterial, submitTextMaterial } from "../../lib/apiClient.js";

type MaterialSubmitFormProps = {
    studyAreaId: string;
    onSubmitted: () => Promise<void>;
};

/**
 * Formulário de submissão de materiais.
 *
 * @param props Área alvo e callback de refresh.
 * @returns Controlos acessíveis para tópico, URL e ficheiro.
 */
export function MaterialSubmitForm({ studyAreaId, onSubmitted }: MaterialSubmitFormProps) {
    const [mode, setMode] = useState<"TOPIC" | "URL" | "FILE">("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const bodyLabel = mode === "URL" ? "URL do material" : "Texto ou tópico";
    const bodyHelpText =
        mode === "URL"
            ? "Indica um endereço que o backend possa validar."
            : "Escreve o tópico ou conteúdo base que será guardado na área.";

    /**
     * Submete o material conforme o modo escolhido.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            if (mode === "FILE") {
                if (!file) throw new Error("Escolhe um ficheiro.");
                await submitFileMaterial(studyAreaId, file, title);
            } else {
                // O userId vem da sessão HttpOnly no backend; o frontend envia apenas dados do material.
                await submitTextMaterial(studyAreaId, {
                    type: mode,
                    title,
                    url: mode === "URL" ? body : undefined,
                    topicText: mode === "TOPIC" ? body : undefined,
                });
            }
            setTitle("");
            setBody("");
            setFile(null);
            await onSubmitted();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível submeter.");
        }
    }

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-lg font-bold">Novo material</h2>
            {error ? (
                <p className="sf-error" role="alert">
                    {error}
                </p>
            ) : null}
            <FormField id="materialMode" label="Tipo" helpText="Escolhe se vais guardar tópico, URL ou ficheiro.">
                <select
                    value={mode}
                    onChange={(event) => setMode(event.target.value as "TOPIC" | "URL" | "FILE")}
                >
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="FILE">PDF/DOCX</option>
                </select>
            </FormField>
            <FormField id="materialTitle" label="Título" helpText="Usa um título curto para encontrares o material depois.">
                <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </FormField>
            {mode === "FILE" ? (
                <FormField id="materialFile" label="Ficheiro" helpText="Aceita PDF ou DOCX para processamento pela API.">
                    <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        required
                    />
                </FormField>
            ) : (
                <FormField id="materialBody" label={bodyLabel} helpText={bodyHelpText}>
                    <textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} required />
                </FormField>
            )}
            <button className="sf-button-primary" type="submit">
                Submeter
            </button>
        </form>
    );
}
```

5. Explicação do código.

O formulário mantém a lógica funcional anterior: para ficheiro chama `submitFileMaterial`, para URL ou tópico chama `submitTextMaterial`. A diferença é que cada controlo tem label e ajuda associados. O comentário dentro de `handleSubmit` reforça a regra de segurança: o aluno não envia `userId`; o backend obtém a identidade pela sessão. A mensagem de erro é geral, segura e anunciada por `role="alert"`.

6. Validação do passo.

Abre uma área de estudo, entra em materiais e confirma que `Tipo`, `Título`, `Texto ou tópico`, `URL do material` e `Ficheiro` são selecionáveis por label.

7. Cenário negativo/erro esperado.

Se removeres o label do ficheiro, o utilizador passa a ouvir apenas "button" ou "file upload" sem contexto suficiente.

### Passo 5 - Criar smoke E2E de acessibilidade

1. Objetivo funcional do passo no contexto da app.

Provar que os labels e textos associados existem nos formulários críticos.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/tests/e2e/mf5-accessibility.spec.ts`
    - REVER: `real_dev/web/playwright.config.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria um teste Playwright que entra como professor, valida o formulário de turmas, cria uma turma para validar o campo de email do aluno e depois entra como aluno para validar o formulário de materiais.

4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/tests/e2e/mf5-accessibility.spec.ts
import { expect, test, type Page } from "@playwright/test";

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra pela UI para validar sessão real e labels em páginas protegidas.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E locais.
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
 * Termina a sessão atual para validar outro fluxo.
 *
 * @param page Página Playwright.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

function extractIdFromHref(href: string | null, pattern: RegExp): string {
    const match = href?.match(pattern);
    if (!match) {
        throw new Error(`Não foi possível obter id a partir de ${href ?? "<sem href>"}.`);
    }
    return match[1];
}

test("MF5 acessibilidade: formulários críticos têm labels e ajuda associada", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const className = `Turma acessível ${suffix}`;
    const classCode = `AX${suffix}`.slice(-10).toUpperCase();
    const areaName = `Área acessível ${suffix}`;

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");

    const classForm = page.locator("form").filter({ has: page.getByRole("heading", { name: "Turmas" }) });
    await expect(classForm.getByLabel("Nome")).toHaveAttribute("aria-describedby", "teacherClassName-help");
    await expect(classForm.getByLabel("Código")).toHaveAttribute("aria-describedby", "teacherClassCode-help");
    await expect(classForm.getByLabel("Ano letivo")).toHaveAttribute("aria-describedby", "teacherClassSchoolYear-help");

    await classForm.getByLabel("Nome").fill(className);
    await classForm.getByLabel("Código").fill(classCode);
    await classForm.getByRole("button", { name: "Criar turma" }).click();

    const classCard = page.locator("article").filter({ hasText: className });
    await expect(classCard.getByLabel(new RegExp(`Email do aluno para ${className}`))).toBeVisible();

    await logout(page);

    await loginAs(page, student);
    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Área criada para validar acessibilidade da MF5.");
    await page.getByRole("button", { name: "Criar área" }).click();

    const areaLink = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaLink).toBeVisible();
    const areaId = extractIdFromHref(await areaLink.getAttribute("href"), /\/areas\/([^/]+)$/);

    await page.goto(`/app/areas/${areaId}/materiais`);
    const materialForm = page.locator("form").filter({ has: page.getByRole("heading", { name: "Novo material" }) });
    await expect(materialForm.getByLabel("Tipo")).toHaveAttribute("aria-describedby", "materialMode-help");
    await expect(materialForm.getByLabel("Título")).toHaveAttribute("aria-describedby", "materialTitle-help");
    await expect(materialForm.getByLabel("Texto ou tópico")).toHaveAttribute("aria-describedby", "materialBody-help");
});
```

5. Explicação do código.

O teste usa sessão real e navegação protegida para validar os formulários que o aluno e o professor usam. `getByLabel` prova que o label está ligado ao controlo. `aria-describedby` prova que a ajuda está associada ao campo. A criação de turma e área usa dados temporários com sufixo para evitar colisões. O teste não lê cookies nem grava segredos no browser.

6. Validação do passo.

Executa `npm --prefix real_dev/web run test:e2e -- mf5-accessibility.spec.ts`. Expected result: o teste passa e falha se removeres `htmlFor`, `id` ou `aria-describedby`.

7. Cenário negativo/erro esperado.

Se o campo de email do aluno voltar a ter apenas texto dentro do campo, `getByLabel(/Email do aluno/)` deixa de o encontrar.

### Passo 6 - Validar contraste, foco e mensagens

1. Objetivo funcional do passo no contexto da app.

Confirmar que o formulário fica legível, navegável por teclado e com mensagens compreensíveis.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/components/forms/FormField.tsx`
    - REVER: `real_dev/web/src/styles.css`
    - REVER: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`
    - LOCALIZAÇÃO: browser e terminal de validação.

3. Instruções do que fazer.

Percorre os formulários com `Tab`, confirma que o foco é visível e que texto cinzento, vermelho e verde continua legível sobre fundo branco.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo valida a experiência visual e de teclado depois da implementação.

5. Explicação do código.

`styles.css` já define foco com `focus:border-teal-600` e `focus:ring-2`. `FormField` usa `text-slate-800`, `text-slate-600` e `text-red-700`, que mantêm contraste legível em fundo branco.

6. Validação do passo.

Expected result: todos os campos recebem foco visível, labels continuam legíveis e erros aparecem junto do campo ou no alerta geral.

7. Cenário negativo/erro esperado.

Se um erro aparecer apenas no topo da página sem ligação ao campo, o utilizador pode não saber que controlo precisa de corrigir.

### Passo 7 - Preparar handoff para validação de formulários

1. Objetivo funcional do passo no contexto da app.

Entregar a base que `BK-MF5-08` vai usar para validação antes de submissão.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/components/forms/FormField.tsx`
    - REVER: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-08-validacao-completa-de-formularios-antes-de-submissao.md`
    - LOCALIZAÇÃO: secções `Handoff` e `Evidence para PR/defesa`.

3. Instruções do que fazer.

Regista que `BK-MF5-08` deve reutilizar `FormField` e preencher a prop `error` com erros por campo antes de chamar a API.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha o contrato para o BK seguinte.

5. Explicação do código.

O próximo BK não precisa criar outro componente de campo. Deve usar `FormField` e acrescentar validação frontend, mantendo a validação backend como barreira final.

6. Validação do passo.

Confirma que `Handoff` menciona `FormField`, `helpText`, `error`, `aria-describedby`, `aria-invalid` e `mf5-accessibility.spec.ts`.

7. Cenário negativo/erro esperado.

Se o próximo BK criar outro componente de campo, os formulários voltam a ficar inconsistentes.

#### Critérios de aceite

- `FormField.tsx` existe e associa label, ajuda e erro ao controlo.
- `TeacherClassesPage.tsx` usa `FormField` na criação de turma e no email de aluno.
- `MaterialSubmitForm.tsx` usa `FormField` no tipo, título, ficheiro e texto/URL.
- Campos têm `htmlFor`, `id`, `aria-describedby` e `aria-invalid` quando existe erro.
- Mensagens de erro não revelam cookies, tokens, prompts privados, respostas IA ou detalhes internos.
- O smoke `mf5-accessibility.spec.ts` valida labels e ajuda associada.
- A validação backend continua obrigatória.

#### Validação final

- Executar `npm --prefix real_dev/web run build`.
- Executar `npm --prefix real_dev/web run test:e2e -- mf5-accessibility.spec.ts`.
- Confirmar manualmente foco visível com teclado.
- Confirmar que `getByLabel("Nome")`, `getByLabel("Código")`, `getByLabel("Tipo")` e `getByLabel("Título")` encontram os campos.
- Confirmar que `BK-MF5-08` consegue reutilizar `FormField` sem criar componente paralelo.

#### Evidence para PR/defesa

- Output do build web.
- Output do smoke `mf5-accessibility.spec.ts`.
- Print do formulário de turmas com labels e ajuda.
- Print do formulário de materiais com labels e ajuda.
- Nota curta: acessibilidade melhora UX, mas segurança e validação final continuam no backend.

#### Handoff

`BK-MF5-08` deve reutilizar `FormField` e preencher a prop `error` com validações antes de submissão. Os contratos entregues são `FormField`, `helpText`, `error`, `aria-describedby`, `aria-invalid`, integração em `TeacherClassesPage.tsx`, integração em `MaterialSubmitForm.tsx` e smoke `mf5-accessibility.spec.ts`.

#### Changelog

- 2026-06-19: Guia alinhado com `RNF05`, com código completo para `FormField`, integração nos formulários reais e smoke E2E de acessibilidade.
