# BK-MF5-05 - Feedback imediato em ações (guardar, IA, uploads).

## Header

- `doc_id`: `GUIA-BK-MF5-05`
- `bk_id`: `BK-MF5-05`
- `macro`: `MF5`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF03`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-06`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-05-feedback-imediato-em-acoes-guardar-ia-uploads.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar feedback imediato para ações assíncronas importantes: privacidade, perfil, materiais, publicações, projetos, versões, uploads, IA e logout. O utilizador deve perceber quando uma ação começou, quando terminou com sucesso e quando falhou.

Todas estas mutações usam o hook comum `useAsyncAction`, que impede submissões concorrentes, aceita `AbortSignal`, preserva erro por ação e só anuncia sucesso depois da resposta confirmada. O cliente HTTP comum devolve `ApiError`, trata JSON, texto e `204`, e invalida a sessão apenas perante `401`; `403`, `5xx`, timeout e offline não simulam logout.

#### Importância

`RNF03` é CANONICO e pede feedback imediato em ações como guardar, IA e uploads. Sem feedback, o aluno pode clicar várias vezes, abandonar o ecrã ou pensar que a aplicação perdeu dados. Feedback bem desenhado reduz incerteza e não substitui validações backend.

#### Scope-in

- Criar `ActionFeedbackProvider`, `useActionFeedback` e `useAsyncAction`.
- Envolver a zona autenticada em `App.tsx`.
- Integrar feedback no formulário de submissão de materiais.
- Integrar o padrão nas mutações de privacidade, perfil, materiais, publicações, projetos, versões, IA e logout.
- Criar smoke Playwright focado em feedback visível e `aria-live`.

#### Scope-out

- Criar sistema de notificações push, email ou in-app persistentes.
- Alterar endpoints, DTOs, roles, ownership, membership ou guardrails de IA.
- Guardar prompts, respostas IA, cookies, tokens ou URLs sensíveis em storage.
- Criar dependência nova para toasts.

#### Estado antes e depois

- **Antes:** cada componente trata mensagens localmente, e algumas ações assíncronas podem parecer silenciosas.
- **Depois:** páginas autenticadas têm uma região comum de feedback com loading, sucesso e erro, sem expor dados sensíveis.

#### Pre-requisitos

- Ter concluído `BK-MF5-03`, com estados visíveis e `PageHeader`.
- Ter concluído `BK-MF5-04`, com páginas organizadas por `ResponsivePageFrame`.
- Ler `RNF03` em `docs/RNF.md`.
- Rever `apps/web/src/App.tsx`.
- Rever `apps/web/src/components/materials/MaterialSubmitForm.tsx`.
- Rever `apps/web/src/pages/student/PrivateAreaAiPage.tsx`.

#### Glossário

- **Feedback imediato:** resposta visual ou acessível logo após o início, sucesso ou falha de uma ação.
- **Toast:** mensagem curta e temporária, apresentada sem mudar de página.
- **`aria-live`:** região anunciada por tecnologias de apoio quando o texto muda.
- **Loading:** estado que mostra que uma operação ainda está a decorrer.
- **Erro seguro:** mensagem útil para o utilizador, sem revelar detalhes internos, tokens, prompts ou dados privados.

#### Conceitos teóricos essenciais

- **Context React:** mecanismo para partilhar estado entre componentes sem passar props por muitos níveis. Aqui distribui funções de feedback.
- **Hook personalizado:** função React que encapsula acesso ao contexto. `useActionFeedback` impede uso fora do provider.
- **Estado assíncrono:** ações com `async/await` precisam de loading, sucesso e erro para evitar cliques repetidos e incerteza.
- **Acessibilidade:** `aria-live="polite"` anuncia mensagens sem interromper o utilizador de forma agressiva.
- **Privacidade:** feedback global não deve repetir pergunta privada, resposta IA, URL sensível, cookie, token ou identificador técnico desnecessário.
- **Segurança backend:** o feedback não autoriza nada. Ownership, membership, role, fontes IA e sessão continuam a ser validados no backend.
- **Evidence:** teste automatizado e prints devem provar que o feedback aparece, sem guardar credenciais no código.

#### Arquitetura do BK

O provider vive em `apps/web/src/features/mf5/action-feedback.tsx` e envolve apenas rotas protegidas. Componentes com ações assíncronas chamam `notifyLoading`, `notifySuccess`, `notifyError` e `clearFeedback`. O provider mostra uma mensagem visual e uma região `aria-live`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/features/mf5/action-feedback.tsx`
- EDITAR: `apps/web/src/App.tsx`
- EDITAR: `apps/web/src/components/materials/MaterialSubmitForm.tsx`
- EDITAR: `apps/web/src/pages/student/PrivateAreaAiPage.tsx`
- CRIAR: `apps/web/tests/e2e/mf5-action-feedback.spec.ts`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e pontos de feedback

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF5-05` corrige feedback de UX e não altera regras de domínio.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-04-layout-responsivo-para-desktop-tablet-mobile.md`
    - REVER: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: `RNF03`, header de `BK-MF5-05` e handoff de `BK-MF5-04`.

3. Instruções do que fazer.

Lista ações assíncronas visíveis e escolhe pelo menos duas: submissão de material e pergunta à IA privada. Mantém autorização, ownership e fontes IA no backend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de análise de contrato e evita misturar feedback visual com segurança de dados.

5. Explicação do código.

Não há código porque primeiro precisas de fechar o que é feedback e o que continua a ser regra backend. O feedback informa o utilizador; não decide se ele pode submeter material ou perguntar à IA.

6. Validação do passo.

Confirma que os pontos escolhidos têm chamadas `async/await` reais e mensagens visíveis para o utilizador.

7. Cenário negativo/erro esperado.

Se tentares usar feedback para esconder uma falha de autorização, o BK fica errado. O erro deve aparecer como mensagem segura e o backend deve continuar a devolver `401`, `403` ou `400`.

### Passo 2 - Criar ActionFeedbackProvider

1. Objetivo funcional do passo no contexto da app.

Criar um provider global para feedback imediato nas rotas autenticadas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/features/mf5/action-feedback.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. O provider deve guardar apenas `tone` e `text`, sem dados sensíveis. O hook deve falhar de forma clara se for usado fora do provider.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/mf5/action-feedback.tsx
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type FeedbackTone = "loading" | "success" | "error";

type FeedbackMessage = {
    tone: FeedbackTone;
    text: string;
};

type ActionFeedbackContextValue = {
    feedback: FeedbackMessage | null;
    notifyLoading: (text: string) => void;
    notifySuccess: (text: string) => void;
    notifyError: (text: string) => void;
    clearFeedback: () => void;
};

const ActionFeedbackContext = createContext<ActionFeedbackContextValue | null>(null);

const toneClasses: Record<FeedbackTone, string> = {
    loading: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
};

/**
 * Disponibiliza feedback imediato para ações autenticadas.
 *
 * @param props Conteúdo protegido que pode emitir mensagens de feedback.
 * @returns Provider com região visual e região acessível.
 */
export function ActionFeedbackProvider({ children }: { children: ReactNode }) {
    const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

    const value = useMemo<ActionFeedbackContextValue>(
        () => ({
            feedback,
            notifyLoading: (text) => setFeedback({ tone: "loading", text }),
            notifySuccess: (text) => setFeedback({ tone: "success", text }),
            notifyError: (text) => setFeedback({ tone: "error", text }),
            clearFeedback: () => setFeedback(null),
        }),
        [feedback],
    );

    return (
        <ActionFeedbackContext.Provider value={value}>
            {/* aria-live anuncia mudanças de estado sem expor prompts, tokens ou dados privados. */}
            <div aria-live="polite" className="sr-only" data-testid="action-feedback-live">
                {feedback?.text ?? ""}
            </div>

            {children}

            {feedback ? (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm px-4" role="status">
                    <div className={`rounded-lg border p-4 text-sm shadow-lg ${toneClasses[feedback.tone]}`}>
                        {/* A mensagem deve ser curta e segura; detalhes técnicos ficam nos logs controlados do backend. */}
                        {feedback.text}
                    </div>
                </div>
            ) : null}
        </ActionFeedbackContext.Provider>
    );
}

/**
 * Lê o contrato de feedback imediato dentro das rotas protegidas.
 *
 * @returns Funções para emitir loading, sucesso, erro e limpar feedback.
 */
export function useActionFeedback(): ActionFeedbackContextValue {
    const context = useContext(ActionFeedbackContext);
    if (!context) {
        throw new Error("useActionFeedback deve ser usado dentro de ActionFeedbackProvider.");
    }

    return context;
}
```

5. Explicação do código.

O provider guarda só `tone` e `text`. Não guarda cookies, tokens, prompts, respostas IA nem URLs privados. `toneClasses` separa estilos de loading, sucesso e erro sem dependência nova.

`aria-live="polite"` permite que leitores de ecrã anunciem mudanças. O `role="status"` torna a mensagem visual semanticamente reconhecível. O hook protege o contrato: se alguém tentar usar feedback fora da zona autenticada, recebe um erro claro durante desenvolvimento.

6. Validação do passo.

Confirma que o ficheiro exporta `ActionFeedbackProvider` e `useActionFeedback`.

7. Cenário negativo/erro esperado.

Se uma mensagem de feedback incluir a pergunta privada do aluno ou uma URL sensível, troca por texto genérico como "A IA privada respondeu." ou "Não foi possível concluir a ação."

### Passo 3 - Envolver rotas protegidas no App

1. Objetivo funcional do passo no contexto da app.

Disponibilizar o provider apenas depois de existir sessão autenticada.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/routes/protectedRoutes.tsx`
    - LOCALIZAÇÃO: componente completo `App`.

3. Instruções do que fazer.

Substitui o conteúdo completo de `App.tsx` pelo código abaixo. Mantém login, registo e loading fora do provider.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/App.tsx
import { ActionFeedbackProvider } from "./features/mf5/action-feedback.js";
import { useSession } from "./hooks/useSession.js";
import { AppErrorBoundary } from "./routes/AppErrorBoundary.js";
import { AppRouter } from "./routes/AppRouter.js";

/**
 * Componente raiz da aplicação.
 *
 * @returns Árvore React correspondente à rota atual.
 */
export function App() {
    const session = useSession();

    if (session.status === "checking") {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-slate-600">A carregar sessão...</p>
            </main>
        );
    }

    if (session.status === "unavailable") {
        return (
            <main className="flex min-h-screen items-center justify-center" role="alert">
                <p>Não foi possível contactar o serviço. Tenta novamente.</p>
            </main>
        );
    }

    return (
        <AppErrorBoundary>
            <ActionFeedbackProvider>
                <AppRouter session={session} />
            </ActionFeedbackProvider>
        </AppErrorBoundary>
    );
}
```

5. Explicação do código.

O `BrowserRouter` é montado uma única vez em `main.tsx`; `AppRouter` declara as rotas públicas e lazy, o `ProtectedLayout`, os `RoleGuard`, 403 e 404. `App` trata separadamente `checking` e `unavailable`: uma falha de rede ou `5xx` não simula logout nem monta a página de login.

Isto cumpre `RNF03` porque qualquer ação passa a poder mostrar feedback imediato. A sessão continua no hook `useSession` e nos cookies HttpOnly; apenas um `401` muda o estado para `anonymous`. `403`, `5xx`, timeout e offline conservam semânticas distintas.

6. Validação do passo.

Faz login e confirma que a aplicação continua a mostrar a shell protegida. Depois usa um componente com `useActionFeedback` e confirma que não lança erro.

7. Cenário negativo/erro esperado.

Se `useSession` mapear indisponibilidade para `anonymous`, a UI mostra login a alguém que ainda pode ter uma sessão válida. Testa obrigatoriamente `401`, `403`, `500` e erro de rede como casos separados.

### Passo 4 - Integrar feedback na submissão de materiais

1. Objetivo funcional do passo no contexto da app.

Mostrar feedback durante submissão de tópico, URL ou ficheiro, incluindo upload.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/components/materials/MaterialSubmitForm.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: componente completo `MaterialSubmitForm`.

3. Instruções do que fazer.

Substitui o conteúdo completo de `MaterialSubmitForm.tsx` pelo código abaixo. Preserva `submitTextMaterial`, `submitFileMaterial` e `onSubmitted`.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/components/materials/MaterialSubmitForm.tsx
import { FormEvent, useState } from "react";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import { submitFileMaterial, submitTextMaterial } from "../../lib/apiClient.js";

type MaterialMode = "TOPIC" | "URL" | "FILE";

/**
 * Props do formulário de materiais privados.
 */
type MaterialSubmitFormProps = {
    /** Área privada onde o material será submetido. */
    studyAreaId: string;
    /** Callback para atualizar a página depois de criar o material. */
    onSubmitted: () => Promise<void>;
};

/**
 * Formulário de submissão de materiais com feedback imediato.
 *
 * @param props Área alvo e callback de atualização.
 * @returns Formulário para tópico, URL ou ficheiro.
 */
export function MaterialSubmitForm({ studyAreaId, onSubmitted }: MaterialSubmitFormProps) {
    const [mode, setMode] = useState<MaterialMode>("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clearFeedback, notifyError, notifyLoading, notifySuccess } = useActionFeedback();

    /**
     * Submete o material conforme o modo escolhido.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar e atualizar a lista.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        clearFeedback();

        try {
            setIsSubmitting(true);
            notifyLoading(mode === "FILE" ? "A enviar ficheiro..." : "A guardar material...");

            if (mode === "FILE") {
                if (!file) {
                    throw new Error("Escolhe um ficheiro.");
                }
                // O ficheiro segue por multipart com cookies HttpOnly; não guardes ficheiros nem tokens no browser.
                await submitFileMaterial(studyAreaId, file, title);
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
            notifySuccess("Material submetido com sucesso.");
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Não foi possível submeter.";
            setError(message);
            // A mensagem é segura para UI e não expõe storage, cookie, prompt ou conteúdo privado.
            notifyError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-lg font-bold">Novo material</h2>
            {error ? <p className="sf-error">{error}</p> : null}

            <div className="space-y-2">
                <label htmlFor="materialMode">Tipo</label>
                <select
                    disabled={isSubmitting}
                    id="materialMode"
                    onChange={(event) => setMode(event.target.value as MaterialMode)}
                    value={mode}
                >
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="FILE">PDF/DOCX</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="materialTitle">Título</label>
                <input
                    disabled={isSubmitting}
                    id="materialTitle"
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    value={title}
                />
            </div>

            {mode === "FILE" ? (
                <div className="space-y-2">
                    <label htmlFor="materialFile">Ficheiro</label>
                    <input
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        disabled={isSubmitting}
                        id="materialFile"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        required
                        type="file"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="materialBody">{mode === "URL" ? "URL" : "Texto"}</label>
                    <textarea
                        disabled={isSubmitting}
                        id="materialBody"
                        onChange={(event) => setBody(event.target.value)}
                        required
                        rows={4}
                        value={body}
                    />
                </div>
            )}

            <button className="sf-button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "A submeter..." : "Submeter"}
            </button>
        </form>
    );
}
```

5. Explicação do código.

Este código adiciona `useActionFeedback` e `isSubmitting` ao formulário. Antes da chamada, mostra loading. Depois de guardar e atualizar a lista, mostra sucesso. Se falhar, mostra erro local e erro global.

Entram `studyAreaId`, título, modo, texto ou ficheiro. Saem chamadas a `submitTextMaterial` ou `submitFileMaterial`. A submissão de ficheiro usa `fetch` com `credentials: "include"` dentro de `apiClient.ts`, mantendo sessão por cookie HttpOnly. O formulário não guarda tokens nem ficheiros em storage. Isto prepara os smokes de feedback e evita cliques duplicados durante uploads.

6. Validação do passo.

Submete um tópico válido. Deves ver "A guardar material..." e depois "Material submetido com sucesso.". Submete ficheiro sem escolher ficheiro; deves ver "Escolhe um ficheiro."

7. Cenário negativo/erro esperado.

Se o backend devolver erro, o formulário deve manter o ecrã estável, mostrar mensagem segura e voltar a permitir nova tentativa.

### Passo 5 - Integrar feedback na IA privada da área

1. Objetivo funcional do passo no contexto da app.

Mostrar feedback durante o pedido à IA privada sem expor a pergunta nem a resposta na mensagem global.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/student/PrivateAreaAiPage.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: componente completo `PrivateAreaAiPage`.

3. Instruções do que fazer.

Substitui o conteúdo completo de `PrivateAreaAiPage.tsx` pelo código abaixo. Mantém `askPrivateAreaAi` e a apresentação da resposta no cartão da página.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/student/PrivateAreaAiPage.tsx
import { FormEvent, useState } from "react";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import { askPrivateAreaAi, PrivateAreaAiAnswer } from "../../lib/apiClient.js";

/**
 * Props da página de IA privada.
 */
type PrivateAreaAiPageProps = {
    /** Área privada usada pelo backend para validar ownership e fontes autorizadas. */
    studyAreaId: string;
};

/**
 * Página do assistente IA privado por área.
 *
 * @param props Identificador da área privada.
 * @returns Formulário de pergunta e resposta IA autorizada.
 */
export function PrivateAreaAiPage({ studyAreaId }: PrivateAreaAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<PrivateAreaAiAnswer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAsking, setIsAsking] = useState(false);
    const { clearFeedback, notifyError, notifyLoading, notifySuccess } = useActionFeedback();

    /**
     * Envia uma pergunta para a IA privada da área autenticada.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de receber resposta ou erro.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        clearFeedback();

        try {
            setIsAsking(true);
            notifyLoading("A perguntar à IA privada...");

            // O backend limita fontes e ownership; a UI não envia userId nem decide permissões.
            const createdAnswer = await askPrivateAreaAi(studyAreaId, question);
            setAnswer(createdAnswer);
            setQuestion("");
            notifySuccess("IA privada respondeu com fontes autorizadas.");
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Erro ao perguntar à IA.";
            setError(message);
            // Não repetimos a pergunta nem a resposta no feedback global para proteger conteúdo privado.
            notifyError("Não foi possível concluir o pedido à IA privada.");
        } finally {
            setIsAsking(false);
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA privada da área</h1>
                {error ? <p className="sf-error">{error}</p> : null}

                <label className="block" htmlFor="privateAreaQuestion">
                    Pergunta
                    <textarea
                        disabled={isAsking}
                        id="privateAreaQuestion"
                        onChange={(event) => setQuestion(event.target.value)}
                        rows={5}
                        value={question}
                    />
                </label>

                <button
                    className="sf-button-primary"
                    disabled={isAsking || question.trim().length < 3}
                    type="submit"
                >
                    {isAsking ? "A perguntar..." : "Perguntar"}
                </button>
            </form>

            {answer ? (
                <article className="sf-panel">
                    <p className="text-sm text-slate-600">{answer.question}</p>
                    <p className="mt-3 whitespace-pre-wrap">{answer.answer}</p>
                </article>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

Este código adiciona loading, sucesso e erro à página de IA privada. A pergunta continua no formulário e a resposta continua no cartão da página. A mensagem global diz apenas que a IA respondeu ou que o pedido falhou.

O backend continua a validar área, ownership, fontes suficientes e guardrails. A UI não envia `userId` e não decide acesso. Isto evita duas falhas comuns: clicar várias vezes no pedido IA e expor conteúdo privado em mensagens globais.

6. Validação do passo.

Faz uma pergunta com pelo menos três caracteres. Deves ver "A perguntar à IA privada..." e, depois, sucesso ou erro seguro. Se não houver fontes processáveis, o backend deve bloquear e a UI deve mostrar falha controlada.

7. Cenário negativo/erro esperado.

Se a mensagem global mostrar a pergunta completa ou a resposta IA, remove esse conteúdo do feedback. Conteúdo privado só deve aparecer no cartão da página autorizada.

### Passo 6 - Criar smoke de feedback imediato

1. Objetivo funcional do passo no contexto da app.

Provar que o provider existe, que `aria-live` recebe mensagens e que uma ação real mostra feedback.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf5-action-feedback.spec.ts`
    - REVER: `apps/web/playwright.config.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele usa login real, cria uma área de estudo, entra na página de materiais e valida feedback de submissão.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf5-action-feedback.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra pela UI para validar sessão real com cookies HttpOnly.
 *
 * @param page Página Playwright.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(student.email)).toBeVisible();
}

/**
 * Cria uma área de estudo para o smoke usar dados próprios do aluno autenticado.
 *
 * @param page Página Playwright.
 * @returns Nome da área criada.
 */
async function createStudyArea(page: Page): Promise<string> {
    const areaName = `Área MF5 Feedback ${Date.now().toString(36)}`;

    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Área criada para validar feedback imediato.");
    await page.getByRole("button", { name: "Criar área" }).click();
    await expect(page.getByRole("link", { name: new RegExp(areaName) })).toBeVisible();

    return areaName;
}

test("MF5 feedback: submissão de material mostra loading, sucesso e aria-live", async ({ page }) => {
    await loginAsStudent(page);
    const areaName = await createStudyArea(page);

    await page.getByRole("link", { name: new RegExp(areaName) }).click();
    await page.getByRole("link", { name: "Materiais" }).click();

    await expect(page.getByTestId("action-feedback-live")).toBeAttached();

    await page.getByLabel("Título").fill("Material feedback MF5");
    await page.getByLabel("Texto").fill("Conteúdo mínimo para validar feedback imediato.");
    await page.getByRole("button", { name: "Submeter" }).click();

    // O feedback visual e o aria-live devem receber uma mensagem segura e curta.
    await expect(page.getByText("Material submetido com sucesso.")).toBeVisible();
    await expect(page.getByTestId("action-feedback-live")).toContainText(
        "Material submetido com sucesso.",
    );
});
```

5. Explicação do código.

O teste entra pela UI, cria uma área e submete um material textual. Isto evita usar IDs escritos manualmente e mantém ownership no backend. O teste valida `data-testid="action-feedback-live"` e a mensagem de sucesso visível.

O contrato de `RNF03` fica provado por comportamento observável. As credenciais vêm de variáveis de ambiente ou dos defaults E2E já usados no projeto. O teste não guarda segredos no browser nem manipula storage local.

6. Validação do passo.

Executa `npm --prefix apps/web run test:e2e -- mf5-action-feedback.spec.ts` com API e web E2E disponíveis.

7. Cenário negativo/erro esperado.

Se o teste não encontrar `action-feedback-live`, confirma se `App.tsx` envolve `ProtectedRoutes` no provider. Se a mensagem não aparecer, confirma se `MaterialSubmitForm` chama `notifySuccess`.

### Passo 7 - Preparar handoff para navegação consistente

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com contratos reutilizáveis para `BK-MF5-06`.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/features/mf5/action-feedback.tsx`
    - REVER: `apps/web/src/components/materials/MaterialSubmitForm.tsx`
    - REVER: `apps/web/src/pages/student/PrivateAreaAiPage.tsx`
    - LOCALIZAÇÃO: secções `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista que o próximo BK deve preservar provider, região `aria-live` e mensagens seguras ao mexer na navegação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo documenta o contrato entregue ao próximo BK.

5. Explicação do código.

O handoff evita que `BK-MF5-06` recrie feedback ou coloque mensagens em cada rota sem padrão. Navegação consistente deve manter o provider global e não apagar feedback durante transições normais.

6. Validação do passo.

Confirma que o handoff menciona `ActionFeedbackProvider`, `useActionFeedback`, `MaterialSubmitForm`, `PrivateAreaAiPage` e `mf5-action-feedback.spec.ts`.

7. Cenário negativo/erro esperado.

Se o próximo BK trocar toda a shell e remover o provider, ações assíncronas voltam a ficar silenciosas.

#### Critérios de aceite

- `action-feedback.tsx` existe e exporta `ActionFeedbackProvider` e `useActionFeedback`.
- `App.tsx` envolve `ProtectedRoutes` em `ActionFeedbackProvider`.
- `MaterialSubmitForm.tsx` mostra loading, sucesso e erro seguro.
- `PrivateAreaAiPage.tsx` mostra loading, sucesso e erro seguro sem expor pergunta/resposta no feedback global.
- O feedback visual tem `role="status"` e a região acessível tem `aria-live="polite"`.
- O smoke `mf5-action-feedback.spec.ts` valida uma ação real e a região `aria-live`.

#### Validação final

- Executar `npm --prefix apps/web run build`.
- Executar `npm --prefix apps/web run test:e2e -- mf5-action-feedback.spec.ts`.
- Validar manualmente submissão de tópico, upload sem ficheiro e pedido à IA privada.
- Confirmar ausência de tokens, cookies, prompts privados, respostas IA privadas e URLs sensíveis em mensagens globais ou storage.

#### Evidence para PR/defesa

- Output do build web.
- Output do smoke de feedback.
- Print ou vídeo curto da submissão de material com feedback de sucesso.
- Print ou vídeo curto de pedido à IA privada com loading e resultado controlado.
- Nota: `RNF03 cumprida com ActionFeedbackProvider, aria-live, role=status e integrações em material/IA`.

#### Handoff

`BK-MF5-06` recebe `ActionFeedbackProvider`, `useActionFeedback`, `MaterialSubmitForm` com feedback, `PrivateAreaAiPage` com feedback seguro e o smoke `mf5-action-feedback.spec.ts`. Ao reforçar navegação consistente, não removas o provider de `App.tsx` nem dupliques sistemas de feedback por rota.

#### Changelog

- 2026-06-19: Guia corrigido para incluir provider completo, integração em `App.tsx`, submissão de materiais, IA privada, smoke Playwright e handoff concreto para `BK-MF5-06`.
