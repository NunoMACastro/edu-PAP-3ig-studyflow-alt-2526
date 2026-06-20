# BK-MF5-06 - Navegação consistente entre módulos.

## Header

- `doc_id`: `GUIA-BK-MF5-06`
- `bk_id`: `BK-MF5-06`
- `macro`: `MF5`
- `owner`: `Kaua`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF04`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-07`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-06-navegacao-consistente-entre-modulos.md`
- `last_updated`: `2026-06-19`

#### Objetivo

Neste BK vais implementar uma navegação principal consistente para as páginas autenticadas do StudyFlow. A navegação passa a ter uma fonte única, usa os roles reais devolvidos pela sessão (`STUDENT`, `TEACHER`, `ADMIN`) e marca a página atual com `aria-current="page"`.

#### Importância

`RNF04` é CANONICO e pede navegação consistente entre módulos. Sem uma fonte única, cada página pode inventar labels, links e ordem diferentes, o que confunde alunos e professores. Navegação consistente ajuda o utilizador a perceber onde está, mas não substitui segurança: permissões, ownership, membership e sessão continuam a ser validados no backend.

#### Scope-in

- Criar `apps/web/src/components/layout/navigation.ts`.
- Atualizar `apps/web/src/components/layout/AppShell.tsx`.
- Usar os roles reais de `User.role`: `STUDENT`, `TEACHER`, `ADMIN`.
- Usar apenas rotas já existentes em `apps/web/src/routes/protectedRoutes.tsx`.
- Marcar o link ativo com `aria-current="page"`.
- Criar smoke Playwright focado em navegação por role e link ativo.

#### Scope-out

- Criar rotas novas.
- Alterar endpoints, DTOs, guards, sessão, ownership ou membership.
- Decidir autorização no frontend.
- Alterar a sequência de BKs da MF5.
- Adicionar dependências novas.

#### Estado antes e depois

- **Antes:** `AppShell` guarda arrays de navegação dentro do próprio componente e não marca o link ativo.
- **Depois:** `navigation.ts` guarda os itens de navegação, `AppShell` consome essa fonte única e o utilizador vê a página atual marcada de forma visual e acessível.

#### Pre-requisitos

- Ter concluído `BK-MF5-05`, para manter feedback e estados visíveis já estabilizados.
- Ler `RNF04` em `docs/RNF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `apps/web/src/lib/apiClient.ts`.
- Rever `apps/web/src/components/layout/AppShell.tsx`.
- Rever `apps/web/src/routes/protectedRoutes.tsx`.

#### Glossário

- **Navegação principal:** conjunto de links que aparece no topo das páginas autenticadas.
- **Role:** papel do utilizador autenticado. Nesta app os valores reais são `STUDENT`, `TEACHER` e `ADMIN`.
- **Link ativo:** link que corresponde ao módulo atual.
- **`aria-current`:** atributo usado por tecnologias de apoio para anunciar que um link representa a página atual.
- **Rota protegida:** caminho renderizado apenas depois de a sessão autenticada existir.
- **Fonte única:** ficheiro responsável por guardar uma decisão partilhada, evitando cópias divergentes.

#### Conceitos teóricos essenciais

- **Contrato incremental:** este BK consome os fluxos autenticados já criados nas MFs anteriores e entrega uma navegação que `BK-MF5-07` e `BK-MF5-08` podem reutilizar sem recriar menus.
- **Role autenticado:** o role vem da resposta de sessão do backend em `User.role`. O frontend usa o role para escolher links visíveis, mas não decide permissões reais.
- **Autorização backend:** mesmo que um link não apareça, o backend continua a validar sessão, ownership, membership e permissões em cada endpoint.
- **Rota real:** um link só deve apontar para um caminho resolvido por `ProtectedRoutes`. Links para caminhos inexistentes criam becos sem saída e quebram a confiança do utilizador.
- **Estado atual da interface:** `aria-current="page"` e classes visuais ajudam o aluno ou professor a perceber o módulo onde está.
- **Acessibilidade:** navegação com `aria-label` e link ativo anunciado ajuda utilizadores de teclado e leitores de ecrã.
- **Evidence técnico:** um smoke E2E confirma que aluno e professor veem links adequados ao role e que a página atual fica marcada.

#### Arquitetura do BK

`navigation.ts` define todos os itens de navegação autenticada. Cada item tem `href`, `label` e `roles`. `AppShell.tsx` chama `getNavigationForRole(user.role)`, compara cada item com `window.location.pathname` e aplica `aria-current` ao link ativo. O smoke E2E entra como aluno e professor pela UI para validar cookies HttpOnly e sessão real.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/components/layout/navigation.ts`
- EDITAR: `apps/web/src/components/layout/AppShell.tsx`
- CRIAR: `apps/web/tests/e2e/mf5-navigation.spec.ts`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- REVER: `apps/web/playwright.config.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e rotas reais

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF5-06` implementa `RNF04` sem inventar roles, rotas ou regras de permissão.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/routes/protectedRoutes.tsx`
    - LOCALIZAÇÃO: `RNF04`, linha de `BK-MF5-06` e tipo `User`.

3. Instruções do que fazer.

Confirma que `RNF04` pede navegação consistente, que `BK-MF5-06` prepara `BK-MF5-07` e que `User.role` usa `STUDENT`, `TEACHER` e `ADMIN`. Lista apenas links que existem em `ProtectedRoutes`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita criar links para caminhos que a aplicação não renderiza.

5. Explicação do código.

Não há código porque primeiro tens de fechar a fonte de verdade. Esta revisão evita dois erros: usar roles em minúsculas que não batem com a sessão real e criar links para páginas inexistentes.

6. Validação do passo.

Confirma que os links principais existem em `ProtectedRoutes`: `/app/estudo`, `/app/areas`, `/app/salas`, `/app/turmas`, `/app/professor/turmas`, `/app/professor/acompanhamento`, `/app/admin/governanca`, `/app/privacidade`.

7. Cenário negativo/erro esperado.

Se adicionares um caminho sem rota correspondente, o link leva o utilizador para o fallback e a navegação deixa de ser confiável.

### Passo 2 - Criar a fonte única de navegação

1. Objetivo funcional do passo no contexto da app.

Criar um ficheiro central que associa cada link aos roles que o podem ver.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/components/layout/navigation.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `navigation.ts` e importa apenas o tipo `User`. Usa os roles reais, conserva rotas existentes e exporta uma função para filtrar por role e outra para calcular o link ativo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/components/layout/navigation.ts
import type { User } from "../../lib/apiClient.js";

export type NavigationItem = {
    href: string;
    label: string;
    roles: User["role"][];
};

const navigationItems: NavigationItem[] = [
    { href: "/app/estudo", label: "Estudo", roles: ["STUDENT"] },
    { href: "/app/perfil", label: "Perfil", roles: ["STUDENT"] },
    { href: "/app/privacidade", label: "Privacidade", roles: ["STUDENT", "TEACHER", "ADMIN"] },
    { href: "/app/rotinas", label: "Rotinas", roles: ["STUDENT"] },
    { href: "/app/historico", label: "Histórico", roles: ["STUDENT"] },
    { href: "/app/areas", label: "Áreas", roles: ["STUDENT"] },
    { href: "/app/salas", label: "Salas", roles: ["STUDENT"] },
    { href: "/app/comunidade", label: "Comunidade", roles: ["STUDENT"] },
    { href: "/app/turmas", label: "Turmas", roles: ["STUDENT"] },
    { href: "/app/professor/turmas", label: "Área docente", roles: ["TEACHER"] },
    { href: "/app/professor/acompanhamento", label: "Acompanhamento", roles: ["TEACHER"] },
    { href: "/app/admin/governanca", label: "Governança", roles: ["ADMIN"] },
];

/**
 * Devolve a navegação visível para o role autenticado.
 *
 * @param role Role real devolvido pela sessão autenticada.
 * @returns Lista de links visíveis para esse role.
 */
export function getNavigationForRole(role: User["role"]): NavigationItem[] {
    // A filtragem só organiza a interface; autorização real continua nos guards e services do backend.
    return navigationItems.filter((item) => item.roles.includes(role));
}

/**
 * Indica se um link representa a página atual ou uma página filha.
 *
 * @param item Link de navegação que está a ser renderizado.
 * @param pathname Caminho atual do browser.
 * @returns Verdadeiro quando o link deve receber `aria-current`.
 */
export function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
    if (pathname === item.href) return true;
    if (item.href === "/app/estudo") return pathname === "/app";

    // Módulos com páginas filhas, como áreas e turmas, mantêm o item principal ativo.
    return pathname.startsWith(`${item.href}/`);
}
```

5. Explicação do código.

Este ficheiro guarda a navegação autenticada num único local. O tipo `User["role"]` força o código a usar `STUDENT`, `TEACHER` e `ADMIN`, que são os valores reais da sessão. A função `getNavigationForRole` evita arrays duplicados em `AppShell`. A função `isNavigationItemActive` marca também páginas filhas, por exemplo `/app/areas/:id`, sem ativar indevidamente `/app/estudo`. A filtragem é apenas visual: endpoints continuam protegidos pelo backend.

6. Validação do passo.

Executa uma pesquisa por `getNavigationForRole` e confirma que o ficheiro exporta a função. Confirma também que não aparecem links para rotas não resolvidas.

7. Cenário negativo/erro esperado.

Se escreveres um role que não exista no tipo `User["role"]`, TypeScript deve recusar a comparação.

### Passo 3 - Integrar a navegação no AppShell

1. Objetivo funcional do passo no contexto da app.

Fazer a shell autenticada renderizar a fonte única de navegação e marcar o link ativo.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/components/layout/AppShell.tsx`
    - REVER: `apps/web/src/components/layout/navigation.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Remove os arrays locais de `AppShell.tsx`, importa `getNavigationForRole` e `isNavigationItemActive`, calcula `currentPathname` com `window.location.pathname` e aplica `aria-current="page"` apenas ao link ativo.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/components/layout/AppShell.tsx
import { ReactNode } from "react";
import { User } from "../../lib/apiClient.js";
import {
    getNavigationForRole,
    isNavigationItemActive,
} from "./navigation.js";

type AppShellProps = {
    user: User;
    children: ReactNode;
    onLogout: () => Promise<void>;
};

/**
 * Layout principal das páginas protegidas.
 *
 * @param props Utilizador autenticado, conteúdo e ação de logout.
 * @returns Estrutura visual com navegação consistente.
 */
export function AppShell({ user, children, onLogout }: AppShellProps) {
    const navigation = getNavigationForRole(user.role);
    const currentPathname = window.location.pathname;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <a href="/app/estudo" className="text-xl font-bold text-teal-800">
                        StudyFlow
                    </a>
                    <nav aria-label="Navegação principal" className="flex flex-wrap gap-2">
                        {navigation.map((item) => {
                            const isActive = isNavigationItemActive(item, currentPathname);
                            return (
                                <a
                                    aria-current={isActive ? "page" : undefined}
                                    className={
                                        isActive
                                            ? "rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800"
                                            : "rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                    }
                                    href={item.href}
                                    key={item.href}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">{user.email}</span>
                        <button className="sf-button-secondary" onClick={() => void onLogout()}>
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            {/* A zona principal mantém o conteúdo da rota protegida sem decidir permissões. */}
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}
```

5. Explicação do código.

`AppShell` deixa de ter arrays locais e passa a consumir `navigation.ts`. O caminho atual vem de `window.location.pathname`, tal como `ProtectedRoutes` já faz. Quando `isActive` é verdadeiro, o link recebe estilo visual e `aria-current="page"`, permitindo que utilizadores de tecnologias de apoio saibam onde estão. A shell continua a receber `user` da sessão; não lê tokens, não guarda dados sensíveis e não decide autorização.

6. Validação do passo.

Entra como aluno, abre `/app/areas` e confirma que o link "Áreas" está destacado e tem `aria-current="page"`. Entra como professor, abre `/app/professor/turmas` e confirma que "Área docente" está ativo.

7. Cenário negativo/erro esperado.

Se `AppShell` continuar a ter arrays locais, o próximo ajuste de navegação pode ficar duplicado e divergir de `navigation.ts`.

### Passo 4 - Confirmar que as rotas protegidas ficam alinhadas

1. Objetivo funcional do passo no contexto da app.

Garantir que todos os links renderizados apontam para rotas existentes.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/routes/protectedRoutes.tsx`
    - REVER: `apps/web/src/components/layout/navigation.ts`
    - LOCALIZAÇÃO: função `resolveProtectedPage` e lista `navigationItems`.

3. Instruções do que fazer.

Compara cada `href` de `navigationItems` com os caminhos tratados em `resolveProtectedPage`. Mantém apenas rotas reais ou rotas filhas já cobertas por expressões regulares.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é uma verificação de contrato entre o ficheiro de navegação e o router protegido.

5. Explicação do código.

Não há código novo porque a tarefa é confirmar alinhamento. Esta verificação evita que a UI prometa módulos que a aplicação ainda não renderiza.

6. Validação do passo.

Pesquisa cada caminho no router protegido. Expected result: todos os caminhos principais aparecem em `resolveProtectedPage` ou são o caminho default autenticado `/app/estudo`.

7. Cenário negativo/erro esperado.

Se adicionares um link sem rota, o utilizador pode clicar e cair no dashboard default sem perceber que o módulo não existe.

### Passo 5 - Criar smoke E2E da navegação

1. Objetivo funcional do passo no contexto da app.

Provar que a navegação muda por role e que o link ativo é anunciado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf5-navigation.spec.ts`
    - REVER: `apps/web/playwright.config.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria um teste Playwright que entra como aluno e professor usando a UI de login. Valida links visíveis, links ausentes e `aria-current`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf5-navigation.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

/**
 * Entra pela UI para validar cookies HttpOnly e navegação autenticada.
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
 * Termina a sessão atual para validar outro role no mesmo teste.
 *
 * @param page Página Playwright.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

test("MF5 navegação: links mudam por role e página atual fica marcada", async ({ page }) => {
    await loginAs(page, student);
    await page.goto("/app/areas");

    const studentNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(studentNav.getByRole("link", { name: "Áreas" })).toHaveAttribute("aria-current", "page");
    await expect(studentNav.getByRole("link", { name: "Área docente" })).toHaveCount(0);
    await expect(studentNav.getByRole("link", { name: "Governança" })).toHaveCount(0);

    await logout(page);

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");

    const teacherNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(teacherNav.getByRole("link", { name: "Área docente" })).toHaveAttribute("aria-current", "page");
    await expect(teacherNav.getByRole("link", { name: "Acompanhamento" })).toBeVisible();
    await expect(teacherNav.getByRole("link", { name: "Estudo" })).toHaveCount(0);
});
```

5. Explicação do código.

O teste usa login real pela UI para manter o contrato de sessão por cookies HttpOnly. Primeiro confirma que o aluno vê navegação de aluno e não vê links de professor ou admin. Depois termina sessão, entra como professor e confirma a navegação docente. `aria-current="page"` prova a parte acessível do BK. As credenciais vêm de variáveis de ambiente com defaults de E2E já usados pelo projeto.

6. Validação do passo.

Executa `npm --prefix apps/web run test:e2e -- mf5-navigation.spec.ts`. Expected result: o teste passa em Chromium e mostra aluno/professor com menus diferentes.

7. Cenário negativo/erro esperado.

Se o link ativo não receber `aria-current`, o teste falha em `toHaveAttribute("aria-current", "page")`.

### Passo 6 - Validar experiência final

1. Objetivo funcional do passo no contexto da app.

Confirmar que a navegação fica previsível para aluno e professor em páginas principais e páginas filhas.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/components/layout/navigation.ts`
    - REVER: `apps/web/src/components/layout/AppShell.tsx`
    - REVER: `apps/web/tests/e2e/mf5-navigation.spec.ts`
    - LOCALIZAÇÃO: browser e terminal de validação.

3. Instruções do que fazer.

Abre páginas de aluno e professor, observa o menu, usa teclado para percorrer links e confirma que foco, hover e link ativo são visíveis.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo valida comportamento observável depois de o código anterior existir.

5. Explicação do código.

A validação manual complementa o smoke. O teste prova contratos mínimos; a revisão em browser confirma que a navegação continua clara em desktop e mobile.

6. Validação do passo.

Expected result: cada role vê apenas links do seu fluxo, o link ativo fica destacado e a navegação funciona com teclado.

7. Cenário negativo/erro esperado.

Se o foco visual desaparecer ou o link ativo não for distinguível, ajusta as classes Tailwind antes de fechar o BK.

### Passo 7 - Preparar handoff para acessibilidade

1. Objetivo funcional do passo no contexto da app.

Deixar claro o que `BK-MF5-07` deve reutilizar.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/components/layout/navigation.ts`
    - REVER: `apps/web/src/components/layout/AppShell.tsx`
    - REVER: `apps/web/tests/e2e/mf5-navigation.spec.ts`
    - LOCALIZAÇÃO: secções `Handoff` e `Evidence para PR/defesa`.

3. Instruções do que fazer.

Regista os exports criados, os atributos acessíveis aplicados e o smoke que prova a navegação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha o contrato para o BK seguinte.

5. Explicação do código.

`BK-MF5-07` vai tratar labels, contraste e mensagens por campo. Para isso, precisa de uma shell estável e uma navegação que já usa `aria-label` e `aria-current`.

6. Validação do passo.

Confirma que `Handoff` menciona `getNavigationForRole`, `isNavigationItemActive`, `aria-current` e `mf5-navigation.spec.ts`.

7. Cenário negativo/erro esperado.

Se o handoff não citar nomes concretos, o BK seguinte pode recriar navegação em vez de reutilizar o contrato.

#### Critérios de aceite

- `navigation.ts` existe e exporta `getNavigationForRole` e `isNavigationItemActive`.
- `AppShell.tsx` usa `navigation.ts` e já não mantém arrays locais de navegação.
- Os roles usados no guia são `STUDENT`, `TEACHER` e `ADMIN`.
- Todos os links principais apontam para rotas existentes em `ProtectedRoutes`.
- O link ativo recebe `aria-current="page"`.
- O smoke `mf5-navigation.spec.ts` valida aluno e professor com sessão real.
- A navegação não guarda cookies, tokens, prompts, respostas IA ou dados pessoais em storage.
- Autorização, ownership e membership continuam no backend.

#### Validação final

- Executar `npm --prefix apps/web run build`.
- Executar `npm --prefix apps/web run test:e2e -- mf5-navigation.spec.ts`.
- Confirmar manualmente `/app/areas` como aluno e `/app/professor/turmas` como professor.
- Confirmar ausência de links para rotas inexistentes.
- Confirmar que o smoke falha se `aria-current` for removido.

#### Evidence para PR/defesa

- Output do build web.
- Output do smoke `mf5-navigation.spec.ts`.
- Print de `/app/areas` com link "Áreas" ativo.
- Print de `/app/professor/turmas` com link "Área docente" ativo.
- Nota curta: navegação por role é UX; permissões reais continuam no backend.

#### Handoff

`BK-MF5-07` deve reutilizar a shell autenticada deste BK. Os contratos entregues são `getNavigationForRole`, `isNavigationItemActive`, `aria-label="Navegação principal"`, `aria-current="page"` e o smoke `mf5-navigation.spec.ts`. O próximo BK não deve recriar navegação; deve focar labels, contraste, ajuda e erros de formulário.

#### Changelog

- 2026-06-19: Guia alinhado com roles e rotas reais de `apps`, com código completo para `navigation.ts`, `AppShell.tsx` e smoke E2E de navegação.
