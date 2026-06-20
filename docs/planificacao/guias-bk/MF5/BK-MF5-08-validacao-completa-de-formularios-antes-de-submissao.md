# BK-MF5-08 - Validação completa de formulários antes de submissão.

## Header

- `doc_id`: `GUIA-BK-MF5-08`
- `bk_id`: `BK-MF5-08`
- `macro`: `MF5`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF06`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-09`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-08-validacao-completa-de-formularios-antes-de-submissao.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais implementar validação completa no frontend antes de submeter formulários, reutilizando o `FormField` entregue no `BK-MF5-07` e mantendo a validação backend como barreira final.

#### Importância

`RNF06` é CANONICO e pede validação completa de formulários antes da submissão. Isto melhora a experiência porque o utilizador percebe o erro junto ao campo certo, evita pedidos HTTP desnecessários e reduz respostas genéricas da API. Mesmo assim, o frontend nunca passa a ser uma fronteira de confiança: a API continua a validar sessão, payloads, ownership, membership e permissões.

#### Scope-in

- Criar `real_dev/web/src/features/mf5/form-validation.ts`.
- Reutilizar `FormField` de `BK-MF5-07`.
- Aplicar validação por campo em `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`.
- Aplicar validação por campo em `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`.
- Bloquear submit inválido antes de chamar `createTeacherClass`, `addClassStudent`, `submitTextMaterial` ou `submitFileMaterial`.
- Criar smoke Playwright para provar que formulários inválidos não disparam pedidos de criação.

#### Scope-out

- Alterar DTOs, schemas, controllers ou endpoints backend.
- Mover autorização, ownership, membership, roles ou sessão para o frontend.
- Criar outro componente de campo em paralelo ao `FormField`.
- Adicionar dependências novas.
- Implementar email, push ou notificações. Esse tema pertence a BKs próprios.

#### Estado antes e depois

- **Antes:** alguns handlers deixam o utilizador tentar submeter dados vazios ou incompletos e só depois mostram erro genérico vindo do fluxo.
- **Depois:** os campos obrigatórios mostram mensagens específicas antes do pedido HTTP, e o backend continua a rejeitar payloads inválidos ou utilizadores sem permissão.

#### Pre-requisitos

- Ter concluído `BK-MF5-07`, especialmente `real_dev/web/src/components/forms/FormField.tsx`.
- Ler `RNF06` em `docs/RNF.md`.
- Rever a linha de `BK-MF5-08` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`.
- Rever `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`.
- Rever `real_dev/web/src/lib/apiClient.ts`.
- Rever `real_dev/web/tests/e2e/README.md`.

#### Glossário

- **Validação frontend:** verificação feita no browser para orientar o utilizador antes do pedido HTTP.
- **Validação backend:** verificação final feita pela API; é a barreira de segurança real.
- **Erro por campo:** mensagem associada a um campo específico, por exemplo `Nome é obrigatório.`.
- **Submit:** ação de enviar o formulário.
- **Handler:** função React que reage a uma ação, como `handleCreate` ou `handleSubmit`.
- **`FormField`:** componente criado no `BK-MF5-07` que liga label, ajuda, erro e controlo real.
- **Smoke E2E:** teste curto que percorre a UI real e prova um comportamento essencial.

#### Conceitos teóricos essenciais

- **Contrato incremental:** este BK consome `FormField` do `BK-MF5-07` e entrega `requireFields` para os BKs seguintes reutilizarem. Isto evita que cada formulário invente a sua própria regra de erro.
- **Campos obrigatórios:** são valores sem os quais a ação não deve avançar. No StudyFlow, criar turma sem nome, adicionar aluno sem email ou submeter material sem título cria má experiência e devolve erros tardios.
- **Estado React:** os valores dos campos ficam em `useState`; os erros por campo também ficam em estado local para a UI reagir assim que o utilizador tenta submeter.
- **Validação antes da API:** o handler valida primeiro, preenche `fieldErrors` e faz `return` quando há erro. Esse `return` é a linha que impede o pedido HTTP.
- **DTO backend:** continua a ser obrigatório porque o utilizador pode alterar o frontend, repetir pedidos ou chamar a API diretamente.
- **Sessão autenticada:** a identidade vem do cookie HttpOnly e da API. O frontend não envia `userId` para decidir quem pode criar turmas ou materiais.
- **Privacidade:** erros visíveis devem ser úteis, mas não devem revelar dados internos, cookies, prompts privados, respostas IA ou IDs desnecessários.
- **Evidence técnico:** o smoke deve provar que, com campos vazios, a página mostra erro e não chama o endpoint de criação.

#### Arquitetura do BK

`form-validation.ts` fica em `real_dev/web/src/features/mf5` porque é uma regra transversal da macrofase. `TeacherClassesPage.tsx` usa esse utilitário para criação de turmas e adição de alunos. `MaterialSubmitForm.tsx` usa o mesmo utilitário para validar título, texto/URL ou ficheiro. O smoke `mf5-form-validation.spec.ts` prova o comportamento no browser com sessão real.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/features/mf5/form-validation.ts`
- EDITAR: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
- EDITAR: `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`
- CRIAR: `real_dev/web/tests/e2e/mf5-form-validation.spec.ts`
- REVER: `real_dev/web/src/components/forms/FormField.tsx`
- REVER: `real_dev/web/src/lib/apiClient.ts`
- REVER: `real_dev/web/playwright.config.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato de validação

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF5-08` implementa `RNF06` sem mudar endpoints, DTOs ou permissões.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-07-regras-basicas-de-acessibilidade-contraste-labels.md`
    - LOCALIZAÇÃO: `RNF06`, linha canónica de `BK-MF5-08` e handoff de `BK-MF5-07`.

3. Instruções do que fazer.

Confirma que `RNF06` fala de validação antes da submissão e que `BK-MF5-07` entregou `FormField`. Mantém `dependencias: -` no header porque essa é a matriz canónica, mas usa o handoff técnico de `BK-MF5-07` na implementação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e fixa o contrato antes da alteração.

5. Explicação do código.

Não há código porque primeiro tens de separar duas responsabilidades: a UI ajuda o utilizador antes da submissão, e a API continua a proteger dados e permissões. Esta separação evita transformar validação frontend numa falsa regra de segurança.

6. Validação do passo.

Confirma que o header mantém `RNF06`, `P0`, `S08`, `Reforco` e `proximo_bk: BK-MF5-09`.

7. Cenário negativo/erro esperado.

Se alterares endpoint, role ou regra de ownership neste BK, estás a misturar UX com autorização backend.

### Passo 2 - Criar utilitário de validação por campo

1. Objetivo funcional do passo no contexto da app.

Criar uma função pequena e tipada para validar campos obrigatórios antes de qualquer pedido HTTP.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/features/mf5/form-validation.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `features/mf5` se ainda não existir. Depois cria `form-validation.ts` com tipos reutilizáveis, `requireFields` e `hasFieldErrors`.

4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/src/features/mf5/form-validation.ts
export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export type RequiredField<TField extends string> = {
    name: TField;
    label: string;
    value: string;
};

/**
 * Cria mensagens de erro para campos obrigatórios vazios.
 *
 * @param fields Campos que devem ter valor antes da submissão.
 * @returns Mapa de mensagens por nome de campo.
 */
export function requireFields<TField extends string>(
    fields: Array<RequiredField<TField>>,
): FieldErrors<TField> {
    return fields.reduce<FieldErrors<TField>>((errors, field) => {
        if (field.value.trim().length === 0) {
            // A mensagem usa o label visível para o utilizador corrigir o campo certo.
            errors[field.name] = `${field.label} é obrigatório.`;
        }

        return errors;
    }, {});
}

/**
 * Indica se ainda existe algum erro por campo.
 *
 * @param errors Mapa devolvido por `requireFields`.
 * @returns `true` quando pelo menos um campo falhou a validação.
 */
export function hasFieldErrors<TField extends string>(
    errors: FieldErrors<TField>,
): boolean {
    return Object.keys(errors).length > 0;
}
```

5. Explicação do código.

`FieldErrors` guarda mensagens por nome de campo, permitindo que `FormField` mostre cada erro no sítio certo. `RequiredField` junta `name`, `label` e `value`; assim, cada formulário escolhe os campos obrigatórios sem duplicar a regra. `requireFields` percorre os campos, usa `trim()` para impedir valores só com espaços e devolve mensagens seguras. `hasFieldErrors` evita repetir `Object.keys(errors).length > 0` nos handlers. Este ficheiro não chama a API, não lê sessão e não decide permissões; apenas melhora a UX antes do submit.

6. Validação do passo.

Confirma que `requireFields([{ name: "name", label: "Nome", value: "" }])` devolve `{ name: "Nome é obrigatório." }`.

7. Cenário negativo/erro esperado.

Se a função aceitar valores só com espaços, o utilizador consegue submeter um formulário visualmente vazio.

### Passo 3 - Validar criação de turmas e adição de alunos

1. Objetivo funcional do passo no contexto da app.

Aplicar erros por campo na página real de turmas do professor, antes de chamar os clientes API.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `real_dev/web/src/components/forms/FormField.tsx`
    - REVER: `real_dev/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Importa `FormField`, `requireFields` e `hasFieldErrors`. Guarda erros separados para criação de turma e email por turma. Antes de `createTeacherClass` ou `addClassStudent`, valida os campos e faz `return` se houver erro.

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

type TeacherClassField = "name" | "code" | "schoolYear";
type StudentEmailField = "studentEmail";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Formulários com validação frontend antes dos pedidos HTTP.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [classFieldErrors, setClassFieldErrors] = useState<FieldErrors<TeacherClassField>>({});
    const [studentFieldErrors, setStudentFieldErrors] = useState<Record<string, FieldErrors<StudentEmailField>>>({});
    const [creating, setCreating] = useState(false);
    const [addingStudentId, setAddingStudentId] = useState<string | null>(null);
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
     * Remove o erro de um campo quando o professor começa a corrigir esse valor.
     *
     * @param field Campo de criação de turma que mudou.
     */
    function clearClassFieldError(field: TeacherClassField): void {
        setClassFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Remove o erro do email dentro de uma turma específica.
     *
     * @param classId Turma onde o professor está a escrever.
     */
    function clearStudentFieldError(classId: string): void {
        setStudentFieldErrors((current) => ({
            ...current,
            [classId]: {},
        }));
    }

    /**
     * Valida e cria uma turma oficial.
     *
     * @param event Evento de submissão do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);

        const nextErrors = requireFields<TeacherClassField>([
            { name: "name", label: "Nome", value: name },
            { name: "code", label: "Código", value: code },
            { name: "schoolYear", label: "Ano letivo", value: schoolYear },
        ]);

        if (hasFieldErrors(nextErrors)) {
            // Este return é a barreira de UX: sem campos válidos, não há pedido HTTP.
            setClassFieldErrors(nextErrors);
            return;
        }

        setClassFieldErrors({});
        setCreating(true);
        try {
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setCreating(false);
        }
    }

    /**
     * Valida e adiciona um aluno a uma turma oficial.
     *
     * @param classId Identificador da turma gerida pelo professor autenticado.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        const email = emails[classId] ?? "";

        const nextErrors = requireFields<StudentEmailField>([
            { name: "studentEmail", label: "Email do aluno", value: email },
        ]);

        if (hasFieldErrors(nextErrors)) {
            // A API continua a validar permissões; aqui só evitamos uma submissão vazia.
            setStudentFieldErrors((current) => ({ ...current, [classId]: nextErrors }));
            return;
        }

        setStudentFieldErrors((current) => ({ ...current, [classId]: {} }));
        setAddingStudentId(classId);
        try {
            await addClassStudent(classId, email);
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        } finally {
            setAddingStudentId(null);
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Turmas</h1>
                {error ? <p className="sf-error">{error}</p> : null}

                <FormField
                    id="teacherClassName"
                    label="Nome"
                    helpText="Nome visível da turma para alunos e professores."
                    error={classFieldErrors.name}
                >
                    <input value={name} onChange={(event) => {
                        setName(event.target.value);
                        clearClassFieldError("name");
                    }} />
                </FormField>

                <FormField
                    id="teacherClassCode"
                    label="Código"
                    helpText="Código curto usado para identificar a turma."
                    error={classFieldErrors.code}
                >
                    <input value={code} onChange={(event) => {
                        setCode(event.target.value);
                        clearClassFieldError("code");
                    }} />
                </FormField>

                <FormField
                    id="teacherClassSchoolYear"
                    label="Ano letivo"
                    helpText="Formato recomendado: 2025/2026."
                    error={classFieldErrors.schoolYear}
                >
                    <input value={schoolYear} onChange={(event) => {
                        setSchoolYear(event.target.value);
                        clearClassFieldError("schoolYear");
                    }} />
                </FormField>

                <button className="sf-button-primary" disabled={creating} type="submit">
                    {creating ? "A criar..." : "Criar turma"}
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
                                error={studentFieldErrors[schoolClass._id]?.studentEmail}
                            >
                                <input
                                    type="email"
                                    value={emails[schoolClass._id] ?? ""}
                                    onChange={(event) => {
                                        setEmails((current) => ({ ...current, [schoolClass._id]: event.target.value }));
                                        clearStudentFieldError(schoolClass._id);
                                    }}
                                />
                            </FormField>
                            <button
                                className="sf-button-secondary"
                                disabled={addingStudentId === schoolClass._id}
                                onClick={() => void handleAddStudent(schoolClass._id)}
                                type="button"
                            >
                                {addingStudentId === schoolClass._id ? "A adicionar..." : "Adicionar aluno"}
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
                ))}
            </div>
        </section>
    );
}
```

5. Explicação do código.

A página passa a guardar `classFieldErrors` para o formulário de criação de turma e `studentFieldErrors` por `classId` para o email de aluno. Antes de chamar `createTeacherClass`, o handler valida `name`, `code` e `schoolYear`; se faltar algum valor, preenche erros e termina com `return`. Antes de chamar `addClassStudent`, o handler valida o email da turma concreta. `FormField` recebe a mensagem no campo `error`, por isso o erro fica associado ao input através de `aria-describedby` e `aria-invalid`. `creating` e `addingStudentId` evitam cliques repetidos durante chamadas assíncronas. A segurança continua no backend: esta página não envia `userId`, não decide ownership e não substitui as validações da API.

6. Validação do passo.

Abre `/app/professor/turmas`, clica em `Criar turma` com campos vazios e confirma `Nome é obrigatório.`, `Código é obrigatório.` e `Ano letivo é obrigatório.` sem pedido `POST /api/teacher/classes`. Depois tenta adicionar aluno com email vazio e confirma `Email do aluno é obrigatório.` sem pedido `POST /api/teacher/classes/:id/students`.

7. Cenário negativo/erro esperado.

Se o handler chamar a API antes de validar os campos, a página volta a depender de erro tardio e não cumpre `RNF06`.

### Passo 4 - Validar submissão de materiais privados

1. Objetivo funcional do passo no contexto da app.

Impedir que o aluno submeta material privado sem título, sem texto/URL ou sem ficheiro, mantendo a validação backend ativa.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`
    - REVER: `real_dev/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Importa `FormField`, `FieldErrors`, `RequiredField`, `hasFieldErrors` e `requireFields`. Cria uma função local que monta os campos obrigatórios conforme `mode`. Faz `return` antes de `submitTextMaterial` ou `submitFileMaterial` quando existirem erros.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/components/materials/MaterialSubmitForm.tsx
import { FormEvent, useState } from "react";
import { FormField } from "../forms/FormField.js";
import { submitFileMaterial, submitTextMaterial } from "../../lib/apiClient.js";
import {
    FieldErrors,
    RequiredField,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";

type MaterialSubmitFormProps = {
    studyAreaId: string;
    onSubmitted: () => Promise<void>;
};

type MaterialMode = "TOPIC" | "URL" | "FILE";
type MaterialField = "title" | "body" | "fileName";

/**
 * Formulário de submissão de materiais privados.
 *
 * @param props Área de estudo alvo e callback de refresh.
 * @returns Controlos com validação frontend antes da submissão.
 */
export function MaterialSubmitForm({ studyAreaId, onSubmitted }: MaterialSubmitFormProps) {
    const [mode, setMode] = useState<MaterialMode>("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<MaterialField>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bodyLabel = mode === "URL" ? "URL" : "Texto";
    const bodyHelpText =
        mode === "URL"
            ? "Indica o endereço do material que queres guardar."
            : "Escreve o tópico ou apontamento que queres estudar.";

    /**
     * Remove a mensagem de erro de um campo quando o aluno começa a corrigi-lo.
     *
     * @param field Campo alterado pelo utilizador.
     */
    function clearFieldError(field: MaterialField): void {
        setFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Monta os campos obrigatórios conforme o modo escolhido.
     *
     * @returns Erros por campo que devem ser mostrados antes da API.
     */
    function validateFields(): FieldErrors<MaterialField> {
        const fields: Array<RequiredField<MaterialField>> = [
            { name: "title", label: "Título", value: title },
        ];

        if (mode === "FILE") {
            // O ficheiro é validado pelo nome aqui; a API continua a validar tipo e tamanho.
            fields.push({ name: "fileName", label: "Ficheiro", value: file?.name ?? "" });
        } else {
            fields.push({ name: "body", label: bodyLabel, value: body });
        }

        return requireFields(fields);
    }

    /**
     * Submete o material conforme o modo escolhido.
     *
     * @param event Evento de submissão.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);

        const nextErrors = validateFields();
        if (hasFieldErrors(nextErrors)) {
            // Sem dados mínimos, não chamamos a API e mostramos erros junto aos campos.
            setFieldErrors(nextErrors);
            return;
        }

        setFieldErrors({});
        setSubmitting(true);
        try {
            if (mode === "FILE") {
                await submitFileMaterial(studyAreaId, file!, title);
            } else {
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
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-lg font-bold">Novo material</h2>
            {error ? <p className="sf-error">{error}</p> : null}

            <FormField id="materialMode" label="Tipo" helpText="Escolhe se vais guardar tópico, URL ou ficheiro.">
                <select
                    value={mode}
                    onChange={(event) => {
                        setMode(event.target.value as MaterialMode);
                        setFieldErrors({});
                    }}
                >
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="FILE">PDF/DOCX</option>
                </select>
            </FormField>

            <FormField
                id="materialTitle"
                label="Título"
                helpText="Usa um título curto para encontrares o material depois."
                error={fieldErrors.title}
            >
                <input value={title} onChange={(event) => {
                    setTitle(event.target.value);
                    clearFieldError("title");
                }} />
            </FormField>

            {mode === "FILE" ? (
                <FormField
                    id="materialFile"
                    label="Ficheiro"
                    helpText="Escolhe um PDF ou DOCX para a API processar."
                    error={fieldErrors.fileName}
                >
                    <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => {
                            setFile(event.target.files?.[0] ?? null);
                            clearFieldError("fileName");
                        }}
                    />
                </FormField>
            ) : (
                <FormField
                    id="materialBody"
                    label={bodyLabel}
                    helpText={bodyHelpText}
                    error={fieldErrors.body}
                >
                    <textarea rows={4} value={body} onChange={(event) => {
                        setBody(event.target.value);
                        clearFieldError("body");
                    }} />
                </FormField>
            )}

            <button className="sf-button-primary" disabled={submitting} type="submit">
                {submitting ? "A submeter..." : "Submeter"}
            </button>
        </form>
    );
}
```

5. Explicação do código.

`MaterialSubmitForm` valida campos diferentes conforme o modo. Em `TOPIC` e `URL`, o formulário exige `title` e `body`; em `FILE`, exige `title` e `fileName`. O campo `fileName` é apenas a validação rápida do browser para impedir submit sem ficheiro; a API continua a validar extensão, tamanho, ownership da área e sessão. O `return` antes da chamada HTTP garante que `submitTextMaterial` e `submitFileMaterial` só correm quando existe input mínimo. `FormField` mostra o erro no campo certo e preserva acessibilidade. `submitting` evita cliques repetidos durante a chamada assíncrona.

6. Validação do passo.

Abre a página de materiais de uma área, clica em `Submeter` com título e texto vazios e confirma `Título é obrigatório.` e `Texto é obrigatório.`. Troca para `PDF/DOCX`, deixa o ficheiro vazio e confirma `Ficheiro é obrigatório.`.

7. Cenário negativo/erro esperado.

Se o modo `FILE` tentar chamar `submitFileMaterial` sem ficheiro, o frontend fica frágil e o utilizador recebe um erro tardio.

### Passo 5 - Criar smoke de validação antes da API

1. Objetivo funcional do passo no contexto da app.

Provar que campos vazios mostram erro no browser e não disparam pedidos de criação.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/tests/e2e/mf5-form-validation.spec.ts`
    - REVER: `real_dev/web/playwright.config.ts`
    - REVER: `real_dev/web/tests/e2e/README.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria um smoke Playwright com sessão real. Conta pedidos `POST` relevantes e confirma que os pedidos não acontecem quando o formulário está vazio.

4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/tests/e2e/mf5-form-validation.spec.ts
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
 * Entra pela UI para validar que a sessão usa o fluxo real da aplicação.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais de desenvolvimento.
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
 * Extrai o id de uma rota criada pela própria UI.
 *
 * @param href Endereço lido de um link.
 * @param pattern Expressão regular com o grupo do id.
 */
function extractIdFromHref(href: string | null, pattern: RegExp): string {
    const match = href?.match(pattern);
    if (!match) {
        throw new Error(`Não foi possível extrair id a partir de href: ${href ?? "<null>"}`);
    }

    return match[1];
}

test("MF5 valida criação de turma antes de chamar a API", async ({ page }) => {
    let createClassRequests = 0;

    await page.route("**/api/teacher/classes", async (route, request) => {
        if (request.method() === "POST") {
            // Este contador prova que o handler bloqueou o submit inválido antes da rede.
            createClassRequests += 1;
        }
        await route.continue();
    });

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");
    await page.getByRole("button", { name: "Criar turma" }).click();

    await expect(page.getByText("Nome é obrigatório.")).toBeVisible();
    await expect(page.getByText("Código é obrigatório.")).toBeVisible();
    await expect(page.getByText("Ano letivo é obrigatório.")).toBeVisible();
    expect(createClassRequests).toBe(0);
});

test("MF5 valida material privado antes de chamar a API", async ({ page }) => {
    let createMaterialRequests = 0;
    const suffix = Date.now().toString(36);
    const areaName = `Área MF5 validação ${suffix}`;

    await page.route("**/api/study-areas/*/materials**", async (route, request) => {
        if (request.method() === "POST") {
            createMaterialRequests += 1;
        }
        await route.continue();
    });

    await loginAs(page, student);
    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Área criada para validar formulários.");
    await page.getByRole("button", { name: "Criar área" }).click();

    const areaLink = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaLink).toBeVisible();
    const areaId = extractIdFromHref(await areaLink.getAttribute("href"), /\/areas\/([^/]+)$/);

    await page.goto(`/app/areas/${areaId}/materiais`);
    await page.getByRole("button", { name: "Submeter" }).click();

    await expect(page.getByText("Título é obrigatório.")).toBeVisible();
    await expect(page.getByText("Texto é obrigatório.")).toBeVisible();
    expect(createMaterialRequests).toBe(0);
});
```

5. Explicação do código.

O smoke entra pela UI para manter o fluxo de sessão real. No primeiro teste, a rota `POST /api/teacher/classes` é observada; se a validação frontend funcionar, o contador fica em `0`. No segundo teste, o aluno cria uma área real, abre os materiais e tenta submeter sem título nem texto; o contador de `POST /api/study-areas/:id/materials` também deve ficar em `0`. O teste não substitui validações backend, mas prova que `RNF06` ficou observável no browser.

6. Validação do passo.

Executa `npm --prefix real_dev/web run test:e2e -- mf5-form-validation.spec.ts` e confirma os dois testes a passar.

7. Cenário negativo/erro esperado.

Se o contador ficar maior que `0`, o submit inválido chegou à API e o BK não cumpre a regra antes de submissão.

### Passo 6 - Validar segurança, privacidade e experiência

1. Objetivo funcional do passo no contexto da app.

Confirmar que a validação frontend ajuda sem expor dados sensíveis nem substituir a API.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/features/mf5/form-validation.ts`
    - REVER: `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`
    - REVER: `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`
    - REVER: `real_dev/web/tests/e2e/mf5-form-validation.spec.ts`
    - LOCALIZAÇÃO: mensagens visíveis, handlers `async` e expected results.

3. Instruções do que fazer.

Confirma manualmente que as mensagens são úteis para alunos/professores, que não mostram detalhes internos e que os handlers continuam a usar os clientes API existentes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo valida o resultado dos ficheiros criados e editados.

5. Explicação do código.

A revisão garante que o frontend apenas evita pedidos inválidos óbvios. A API continua a validar autenticação, autorização, ownership, membership, tipo de material e permissões de professor/aluno. A UI também não guarda dados sensíveis no browser nem escreve mensagens com detalhes internos.

6. Validação do passo.

Executa:

```bash
npm --prefix real_dev/web run build
npm --prefix real_dev/web run test:e2e -- mf5-form-validation.spec.ts
```

Expected result:

- Build TypeScript/Vite concluído sem erros.
- Smoke E2E com `2 passed`.
- Formulários vazios mostram erros junto aos campos.
- Pedidos HTTP de criação não ocorrem antes de campos obrigatórios válidos.

7. Cenário negativo/erro esperado.

Se a UI mostrar uma mensagem como erro técnico bruto da API, troca por texto visível seguro e deixa detalhes técnicos para logs controlados do backend.

### Passo 7 - Preparar handoff para notificações

1. Objetivo funcional do passo no contexto da app.

Registar o que `BK-MF5-09` pode reutilizar sem criar contratos paralelos.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/features/mf5/form-validation.ts`
    - REVER: `real_dev/web/tests/e2e/mf5-form-validation.spec.ts`
    - REVER: `proximo_bk` no header
    - LOCALIZAÇÃO: secção `Handoff` e evidence.

3. Instruções do que fazer.

Confirma que `BK-MF5-09` não precisa alterar validação de formulários. Ele deve focar-se no tray de notificações e manter a mesma regra: UI ajuda, backend autoriza.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha contratos para o BK seguinte.

5. Explicação do código.

O handoff evita que o próximo BK reabra validação de formulários ou crie outro utilitário para o mesmo problema. `BK-MF5-09` pode usar a mesma abordagem de estados `loading`, `error`, `empty` e `success`, mas aplicada a notificações.

6. Validação do passo.

Confirma que `Handoff` menciona `form-validation.ts`, `FieldErrors`, `requireFields`, `hasFieldErrors` e `mf5-form-validation.spec.ts`.

7. Cenário negativo/erro esperado.

Se o próximo BK tentar resolver erros de formulário dentro do tray de notificações, está a misturar responsabilidades.

#### Critérios de aceite

- `form-validation.ts` existe e exporta `FieldErrors`, `RequiredField`, `requireFields` e `hasFieldErrors`.
- `TeacherClassesPage.tsx` bloqueia criação de turma vazia antes de `POST /api/teacher/classes`.
- `TeacherClassesPage.tsx` bloqueia adição de aluno sem email antes de `POST /api/teacher/classes/:id/students`.
- `MaterialSubmitForm.tsx` bloqueia título vazio, texto/URL vazio e ficheiro em falta antes da API.
- Os erros aparecem junto aos campos através de `FormField.error`.
- A validação backend continua obrigatória.
- O smoke `mf5-form-validation.spec.ts` prova que pedidos inválidos não chegam à API.

#### Validação final

- Executar `npm --prefix real_dev/web run build`.
- Executar `npm --prefix real_dev/web run test:e2e -- mf5-form-validation.spec.ts`.
- Confirmar que `getByText("Nome é obrigatório.")`, `getByText("Código é obrigatório.")`, `getByText("Título é obrigatório.")` e `getByText("Texto é obrigatório.")` aparecem nos cenários negativos.
- Confirmar que os contadores de pedidos `POST` ficam em `0` nos submits inválidos.
- Confirmar que nenhuma validação de ownership, membership, role ou sessão foi movida para o frontend.

#### Evidence para PR/defesa

- Output do build web.
- Output do smoke `mf5-form-validation.spec.ts`.
- Print do formulário de turmas com erros por campo.
- Print do formulário de materiais com erros por campo.
- Nota curta: a validação frontend reduz pedidos inválidos, mas a API continua a proteger dados e permissões.

#### Handoff

`BK-MF5-09` deve focar-se em notificações discretas e contextualizadas. Os contratos entregues por este BK são `form-validation.ts`, `FieldErrors`, `RequiredField`, `requireFields`, `hasFieldErrors`, integração com `FormField` e smoke `mf5-form-validation.spec.ts`.

#### Changelog

- 2026-06-20: Guia corrigido para incluir validação frontend completa, integração real em turmas e materiais, smoke E2E e handoff para `BK-MF5-09`.
