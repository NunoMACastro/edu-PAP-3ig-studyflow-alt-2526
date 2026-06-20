# BK-MF5-09 - Notificações discretas e contextualizadas.

## Header

- `doc_id`: `GUIA-BK-MF5-09`
- `bk_id`: `BK-MF5-09`
- `macro`: `MF5`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF07`
- `fase_documental`: `Fase 2`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-10`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-09-notificacoes-discretas-e-contextualizadas.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais implementar um tray de notificações in-app discreto e contextualizado, integrado no `AppShell` autenticado e alinhado com o cliente MF4 já existente.

#### Importância

`RNF07` é CANONICO e pede notificações discretas e contextualizadas. Uma notificação in-app deve orientar o utilizador sem bloquear o estudo, sem prometer email/push e sem expor dados sensíveis. Este BK reutiliza o endpoint real `GET /api/context-notifications`, onde a mensagem textual vem no campo `body`.

#### Scope-in

- Criar `real_dev/web/src/features/mf5/notification-tray.tsx`.
- Consumir `listContextNotifications()` de `real_dev/web/src/features/mf4/mf4-client.ts`.
- Usar o tipo real `ContextNotification`.
- Integrar `NotificationTray` em `real_dev/web/src/components/layout/AppShell.tsx`.
- Mostrar estados `loading`, `error`, `empty` e lista.
- Criar smoke Playwright para lista e erro.

#### Scope-out

- Criar email, push, web push ou entregas externas.
- Alterar endpoints, DTOs, policies de notificação ou backend MF4.
- Mostrar notificações de outros utilizadores, turmas ou grupos.
- Guardar notificações no armazenamento persistente do browser.
- Mover autorização, ownership, membership ou filtragem de destinatários para o frontend.
- Adicionar dependências novas.

#### Estado antes e depois

- **Antes:** MF4 já expõe notificações contextuais, mas a shell autenticada não tem uma entrada discreta para o utilizador as consultar.
- **Depois:** a shell mostra um botão de notificações, carrega avisos in-app da API, apresenta vazio/erro/lista e mantém a página utilizável se o carregamento falhar.

#### Pre-requisitos

- Ter concluído `BK-MF5-08`, para manter formulários e estados de erro consistentes.
- Ler `RNF07` em `docs/RNF.md`.
- Rever a linha de `BK-MF5-09` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `real_dev/web/src/features/mf4/mf4-client.ts`.
- Rever `real_dev/web/src/components/layout/AppShell.tsx`.
- Rever `real_dev/web/tests/e2e/README.md`.

#### Glossário

- **Notificação contextual:** aviso ligado a uma turma, grupo ou ação concreta no StudyFlow.
- **Tray:** painel pequeno que abre e fecha sem mudar de página.
- **In-app:** notificação mostrada dentro da aplicação, não por email ou push.
- **`ContextNotification`:** tipo frontend vindo da MF4, com `title`, `body`, `contextType` e `contextId`.
- **Estado vazio:** mensagem mostrada quando a API devolve uma lista sem itens.
- **Estado de erro:** mensagem segura mostrada quando a lista não carrega.
- **Shell autenticada:** layout comum das páginas protegidas.

#### Conceitos teóricos essenciais

- **Contrato real da API:** `listContextNotifications()` devolve `ContextNotification[]`. O campo da mensagem é `body`, não `message`; usar outro nome quebra TypeScript ou mostra texto vazio.
- **Carregamento assíncrono:** o tray usa `useEffect` para pedir notificações depois de montar. Enquanto espera, mostra estado de carregamento.
- **Falha isolada:** se o pedido de notificações falhar, o resto da página continua funcional. Notificações não podem impedir estudo, turmas ou materiais.
- **Privacidade:** notificações ficam em memória React e não são persistidas pelo frontend.
- **Autorização backend:** o frontend não decide destinatários. A API filtra o que o utilizador autenticado pode ver.
- **Acessibilidade:** o botão usa `aria-expanded`, `aria-controls` e texto visível para indicar se o painel está aberto.
- **Evidence técnico:** o smoke deve provar que `body` aparece no tray e que a falha da API mostra mensagem controlada.

#### Arquitetura do BK

`NotificationTray` fica em `real_dev/web/src/features/mf5` porque pertence à UX transversal da MF5. O componente consome `listContextNotifications()` da MF4, mas não altera esse cliente. `AppShell.tsx` importa o tray e coloca-o junto ao email e logout do utilizador autenticado. O teste `mf5-notification-tray.spec.ts` valida lista, vazio funcional e erro.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/features/mf5/notification-tray.tsx`
- EDITAR: `real_dev/web/src/components/layout/AppShell.tsx`
- CRIAR: `real_dev/web/tests/e2e/mf5-notification-tray.spec.ts`
- REVER: `real_dev/web/src/features/mf4/mf4-client.ts`
- REVER: `real_dev/web/playwright.config.ts`
- REVER: `real_dev/web/tests/e2e/README.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato de notificações

1. Objetivo funcional do passo no contexto da app.

Confirmar que o BK usa `RNF07` e o cliente real da MF4 sem inventar outro contrato.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `real_dev/web/src/features/mf4/mf4-client.ts`
    - LOCALIZAÇÃO: `RNF07`, linha canónica de `BK-MF5-09`, tipo `ContextNotification` e função `listContextNotifications`.

3. Instruções do que fazer.

Confirma que `ContextNotification` tem `title` e `body`. Não cries `NotificationItem.message`, porque esse campo não existe no contrato real.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo confirma o contrato antes da implementação.

5. Explicação do código.

Não há código porque a decisão principal é de alinhamento. A MF4 já entregou o cliente e o tipo. Este BK só acrescenta apresentação discreta na UI.

6. Validação do passo.

Confirma que `listContextNotifications()` devolve `Promise<ContextNotification[]>` e chama `GET /api/context-notifications`.

7. Cenário negativo/erro esperado.

Se usares `message` em vez de `body`, o componente fica incompatível com o contrato real.

### Passo 2 - Criar NotificationTray

1. Objetivo funcional do passo no contexto da app.

Mostrar notificações in-app com carregamento, erro, vazio e lista contextual.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/features/mf5/notification-tray.tsx`
    - REVER: `real_dev/web/src/features/mf4/mf4-client.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o componente com `useEffect`, estado local e consumo de `listContextNotifications()`. Usa `ContextNotification.body` para a mensagem.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/features/mf5/notification-tray.tsx
import { useEffect, useState } from "react";
import {
    ContextNotification,
    listContextNotifications,
} from "../mf4/mf4-client.js";

type NotificationStatus = "loading" | "success" | "error";

/**
 * Converte o contexto técnico numa palavra curta para a interface.
 *
 * @param notification Notificação recebida da API.
 * @returns Texto visível para enquadrar o aviso.
 */
function getContextLabel(notification: ContextNotification): string {
    if (notification.contextType === "CLASS") return "Turma";
    if (notification.contextType === "GROUP") return "Grupo";
    return "Contexto";
}

/**
 * Painel discreto de notificações autenticadas do StudyFlow.
 *
 * @returns Botão e painel com estados de carregamento, erro, vazio e lista.
 */
export function NotificationTray() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ContextNotification[]>([]);
    const [status, setStatus] = useState<NotificationStatus>("loading");

    useEffect(() => {
        let active = true;

        listContextNotifications()
            .then((notifications) => {
                if (!active) return;
                // As notificações ficam apenas em memória React para reduzir exposição de dados.
                setItems(notifications);
                setStatus("success");
            })
            .catch(() => {
                if (!active) return;
                setItems([]);
                setStatus("error");
            });

        return () => {
            active = false;
        };
    }, []);

    const countLabel = items.length === 1 ? "1" : String(items.length);

    return (
        <div className="relative">
            <button
                aria-controls="studyflow-notification-tray"
                aria-expanded={open}
                className="sf-button-secondary"
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                Notificações ({countLabel})
            </button>

            {open ? (
                <section
                    aria-label="Notificações contextualizadas"
                    className="absolute right-0 z-20 mt-2 w-80 rounded-md border border-slate-200 bg-white p-4 shadow-lg"
                    id="studyflow-notification-tray"
                >
                    {status === "loading" ? (
                        <p className="text-sm text-slate-600">A carregar notificações...</p>
                    ) : null}

                    {status === "error" ? (
                        <p className="text-sm text-red-700">Não foi possível carregar notificações.</p>
                    ) : null}

                    {status === "success" && items.length === 0 ? (
                        <p className="text-sm text-slate-600">Sem notificações novas.</p>
                    ) : null}

                    {items.length > 0 ? (
                        <ul className="space-y-3">
                            {items.map((item) => (
                                <li className="rounded-md bg-slate-50 p-3" key={item.id}>
                                    <p className="text-xs font-medium uppercase text-teal-700">
                                        {getContextLabel(item)}
                                    </p>
                                    <strong className="block text-sm text-slate-900">{item.title}</strong>
                                    <p className="mt-1 text-sm text-slate-700">{item.body}</p>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </section>
            ) : null}
        </div>
    );
}
```

5. Explicação do código.

O componente importa `ContextNotification` e `listContextNotifications` do cliente real da MF4. `getContextLabel` transforma `CLASS` e `GROUP` em texto simples para a UI. `useEffect` carrega notificações quando o tray é montado, guarda a lista em memória React e marca `success` ou `error`. O botão usa `aria-expanded` e `aria-controls`, ajudando tecnologias de apoio a perceber se o painel está aberto. A lista usa `item.body`, que é o campo real da mensagem. Se a API falhar, o componente mostra erro seguro e não bloqueia a página.

6. Validação do passo.

Com uma resposta da API contendo uma notificação com `body`, abre o painel e confirma que o título e o corpo aparecem.

7. Cenário negativo/erro esperado.

Se a API devolver erro, a shell deve continuar navegável e mostrar `Não foi possível carregar notificações.` apenas dentro do painel.

### Passo 3 - Integrar o tray no AppShell

1. Objetivo funcional do passo no contexto da app.

Mostrar notificações no topo das páginas protegidas, sem duplicar navegação ou mexer nas rotas.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/components/layout/AppShell.tsx`
    - REVER: `real_dev/web/src/features/mf5/notification-tray.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Importa `NotificationTray` e renderiza-o junto do email e botão `Sair`. Mantém `studentNavigation`, `teacherNavigation` e `adminNavigation`.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/components/layout/AppShell.tsx
import type { ReactNode } from "react";
import { NotificationTray } from "../../features/mf5/notification-tray.js";
import { User } from "../../lib/apiClient.js";

type AppShellProps = {
    user: User;
    children: ReactNode;
    onLogout: () => Promise<void>;
};

const studentNavigation = [
    { href: "/app/estudo", label: "Estudo" },
    { href: "/app/perfil", label: "Perfil" },
    { href: "/app/privacidade", label: "Privacidade" },
    { href: "/app/rotinas", label: "Rotinas" },
    { href: "/app/historico", label: "Histórico" },
    { href: "/app/areas", label: "Áreas" },
    { href: "/app/salas", label: "Salas" },
    { href: "/app/comunidade", label: "Comunidade" },
    { href: "/app/turmas", label: "Turmas" },
];

const teacherNavigation = [
    { href: "/app/professor/turmas", label: "Área docente" },
    { href: "/app/professor/acompanhamento", label: "Acompanhamento" },
    { href: "/app/privacidade", label: "Privacidade" },
];

const adminNavigation = [
    { href: "/app/admin/governanca", label: "Governança" },
    { href: "/app/privacidade", label: "Privacidade" },
];

/**
 * Layout principal das páginas protegidas.
 *
 * @param props Utilizador autenticado, conteúdo e ação de logout.
 * @returns Estrutura visual com navegação consistente e notificações in-app.
 */
export function AppShell({ user, children, onLogout }: AppShellProps) {
    const navigation =
        user.role === "ADMIN"
            ? adminNavigation
            : user.role === "TEACHER"
              ? teacherNavigation
              : studentNavigation;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <a href="/app/estudo" className="text-xl font-bold text-teal-800">
                        StudyFlow
                    </a>
                    <nav className="flex flex-wrap gap-2">
                        {navigation.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        {/* O tray é apenas apresentação; a API decide que notificações o utilizador pode ver. */}
                        <NotificationTray />
                        <span className="text-sm text-slate-600">{user.email}</span>
                        <button className="sf-button-secondary" onClick={() => void onLogout()}>
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}
```

5. Explicação do código.

`AppShell` continua a escolher navegação por role, mas passa a mostrar `NotificationTray` na zona autenticada. A posição junto do email faz sentido porque as notificações pertencem ao utilizador atual. O comentário dentro do JSX lembra a fronteira de segurança: o tray só apresenta dados; a API filtra destinatários e permissões. Nenhuma rota, endpoint ou regra de sessão muda neste passo.

6. Validação do passo.

Entra como professor e como aluno. Confirma que o botão `Notificações (...)` aparece em páginas protegidas e que `Sair` continua funcional.

7. Cenário negativo/erro esperado.

Se uma falha no carregamento das notificações impedir logout ou navegação, o componente está demasiado acoplado à shell.

### Passo 4 - Garantir privacidade e estados seguros

1. Objetivo funcional do passo no contexto da app.

Confirmar que notificações são úteis, discretas e não expõem dados sensíveis.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/features/mf5/notification-tray.tsx`
    - REVER: `real_dev/web/src/features/mf4/mf4-client.ts`
    - REVER: `real_dev/web/src/components/layout/AppShell.tsx`
    - LOCALIZAÇÃO: estado `items`, mensagens visíveis e tratamento de erro.

3. Instruções do que fazer.

Confirma que o componente não persiste notificações no browser, não mostra IDs internos e não apresenta mensagens técnicas brutas ao utilizador.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo revê o comportamento dos ficheiros criados e editados.

5. Explicação do código.

As notificações podem referir turmas ou grupos, por isso devem ser tratadas como dados contextuais do utilizador autenticado. O frontend mostra `title`, `body` e uma etiqueta de contexto curta. Não precisa mostrar `contextId`, `recipientIds` ou `suppressedRecipientIds`; esses campos são úteis para a API e para auditoria, mas não para a UI do tray.

6. Validação do passo.

Abre o tray com notificações reais ou controladas e confirma que a UI não mostra IDs, listas de destinatários ou detalhes internos.

7. Cenário negativo/erro esperado.

Se o painel expuser `recipientIds` ou `contextId`, remove esses campos da interface.

### Passo 5 - Criar smoke do tray

1. Objetivo funcional do passo no contexto da app.

Provar que o tray apresenta `body` corretamente e falha de forma controlada quando a API falha.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/tests/e2e/mf5-notification-tray.spec.ts`
    - REVER: `real_dev/web/playwright.config.ts`
    - REVER: `real_dev/web/tests/e2e/README.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria dois testes: um com resposta de lista e outro com resposta de erro. Usa login real e resposta controlada só para tornar o resultado determinístico.

4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/tests/e2e/mf5-notification-tray.spec.ts
import { expect, test, type Page } from "@playwright/test";

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

/**
 * Entra pela UI para manter o fluxo real de sessão.
 *
 * @param page Página Playwright.
 */
async function loginAsTeacher(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(teacher.email);
    await page.getByLabel("Password").fill(teacher.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(teacher.email)).toBeVisible();
}

test("MF5 mostra notificações in-app com o campo body", async ({ page }) => {
    await page.route("**/api/context-notifications", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify([
                {
                    id: "notification-mf5-1",
                    contextType: "CLASS",
                    contextId: "class-mf5",
                    type: "TASK",
                    title: "Novo material disponível",
                    body: "A turma recebeu uma tarefa de estudo.",
                    recipientIds: [],
                    suppressedRecipientIds: [],
                },
            ]),
        });
    });

    await loginAsTeacher(page);
    await page.getByRole("button", { name: "Notificações (1)" }).click();

    await expect(page.getByRole("region", { name: "Notificações contextualizadas" })).toBeVisible();
    await expect(page.getByText("Novo material disponível")).toBeVisible();
    await expect(page.getByText("A turma recebeu uma tarefa de estudo.")).toBeVisible();
    await expect(page.getByText("Turma")).toBeVisible();
});

test("MF5 isola erro de notificações sem bloquear a shell", async ({ page }) => {
    await page.route("**/api/context-notifications", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            status: 500,
            body: JSON.stringify({ message: "Erro controlado no smoke." }),
        });
    });

    await loginAsTeacher(page);
    await page.getByRole("button", { name: "Notificações (0)" }).click();

    // Mesmo com erro, a navegação e o logout continuam disponíveis.
    await expect(page.getByText("Não foi possível carregar notificações.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
```

5. Explicação do código.

O primeiro teste responde ao endpoint de notificações com um item que usa `body`. Depois abre o tray e confirma que `title`, `body` e contexto aparecem. O segundo teste força uma resposta HTTP 500 e confirma que a mensagem de erro fica limitada ao painel, enquanto o botão `Sair` continua visível. Isto prova que o tray é discreto, contextualizado e não bloqueia a shell.

6. Validação do passo.

Executa `npm --prefix real_dev/web run test:e2e -- mf5-notification-tray.spec.ts` e confirma os dois testes a passar.

7. Cenário negativo/erro esperado.

Se o teste não encontrar o texto vindo de `body`, o componente voltou a usar um campo errado.

### Passo 6 - Validar experiência desktop e mobile

1. Objetivo funcional do passo no contexto da app.

Confirmar que o tray não tapa a navegação principal nem impede ações comuns.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/features/mf5/notification-tray.tsx`
    - REVER: `real_dev/web/src/components/layout/AppShell.tsx`
    - LOCALIZAÇÃO: header, botão, painel e estados visíveis.

3. Instruções do que fazer.

Testa o header com lista vazia, lista com um item, erro de API e ecrã estreito. O painel deve continuar pequeno, alinhado à direita e fácil de fechar.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo valida o comportamento visual e funcional do código já escrito.

5. Explicação do código.

O tray usa `absolute right-0`, largura fixa controlada e `z-20` para ficar acima do conteúdo sem redesenhar a página. Como só aparece quando `open` é verdadeiro, não ocupa espaço enquanto o utilizador estuda. Este comportamento cumpre `RNF07` porque a notificação informa sem interromper.

6. Validação do passo.

Confirma manualmente:

- Lista vazia mostra `Sem notificações novas.`
- Falha da API mostra `Não foi possível carregar notificações.`
- Uma notificação mostra `title`, `body` e contexto.
- O botão `Sair` continua clicável depois de abrir e fechar o painel.

7. Cenário negativo/erro esperado.

Se o painel cobrir o botão `Sair` ou empurrar toda a navegação, ajusta posição e largura.

### Passo 7 - Preparar handoff para performance

1. Objetivo funcional do passo no contexto da app.

Garantir que `BK-MF5-10` consegue medir performance sem receber uma shell quebrada.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/features/mf5/notification-tray.tsx`
    - REVER: `real_dev/web/src/components/layout/AppShell.tsx`
    - REVER: `real_dev/web/tests/e2e/mf5-notification-tray.spec.ts`
    - LOCALIZAÇÃO: secção `Handoff` e evidence.

3. Instruções do que fazer.

Regista que o tray não deve bloquear renderização de dashboards. `BK-MF5-10` pode medir carregamento da página sem alterar notificações.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha os contratos para o BK seguinte.

5. Explicação do código.

O próximo BK vai tratar performance. Para esse BK funcionar, o `AppShell` deve renderizar mesmo que notificações falhem. Este BK entrega essa garantia ao isolar o erro no componente.

6. Validação do passo.

Confirma que o smoke de erro mantém `Sair` visível e que a página autenticada não desaparece.

7. Cenário negativo/erro esperado.

Se o erro de notificações fizer a página protegida falhar inteira, `BK-MF5-10` herdará uma base instável.

#### Critérios de aceite

- `notification-tray.tsx` existe e consome `listContextNotifications()`.
- O tray usa `ContextNotification.body` para mostrar a mensagem.
- O tray mostra estados `loading`, `error`, `empty` e lista.
- `AppShell.tsx` renderiza `NotificationTray` no header autenticado.
- Falhas de notificações não bloqueiam navegação nem logout.
- Nenhuma notificação é persistida pelo frontend.
- O smoke `mf5-notification-tray.spec.ts` valida lista e erro.

#### Validação final

- Executar `npm --prefix real_dev/web run build`.
- Executar `npm --prefix real_dev/web run test:e2e -- mf5-notification-tray.spec.ts`.
- Confirmar que `Notificações (1)` abre o painel.
- Confirmar que o texto vindo de `body` aparece.
- Confirmar que erro HTTP mostra mensagem segura.
- Confirmar que a shell continua funcional.

#### Evidence para PR/defesa

- Output do build web.
- Output do smoke `mf5-notification-tray.spec.ts`.
- Print do tray com uma notificação.
- Print do estado vazio ou de erro.
- Nota curta: notificações in-app orientam o utilizador, mas a API continua a filtrar destinatários e permissões.

#### Handoff

`BK-MF5-10` recebe uma shell autenticada com `NotificationTray` não bloqueante. Os contratos entregues são `notification-tray.tsx`, uso de `ContextNotification.body`, integração no `AppShell` e smoke `mf5-notification-tray.spec.ts`.

#### Changelog

- 2026-06-20: Guia corrigido para usar `ContextNotification.body`, integrar o tray no `AppShell`, cobrir estados de UI e entregar smoke E2E.
