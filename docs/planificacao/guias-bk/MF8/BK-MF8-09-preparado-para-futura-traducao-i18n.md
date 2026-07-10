# BK-MF8-09 - Preparado para futura tradução/i18n.

## Header

- `doc_id`: `GUIA-BK-MF8-09`
- `bk_id`: `BK-MF8-09`
- `macro`: `MF8`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P2`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF44`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-10`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais preparar o StudyFlow para uma futura tradução da interface, começando pelas mensagens visíveis dos fluxos de IA da MF8. O objetivo não é traduzir a aplicação inteira nem instalar uma biblioteca completa de i18n. O objetivo é criar um catálogo local de mensagens, tipado e simples, e usá-lo em componentes reais.

No fim deste BK, deves conseguir alterar uma mensagem em `apps/web/src/lib/messages.ts` e ver essa alteração refletida nos painéis de guardrails e respostas com fontes, sem mudar endpoints, serviços backend, permissões, privacidade ou regras de IA.

#### Importância

`RNF44` é CANONICO na planificação StudyFlow: a aplicação deve ficar preparada para futura tradução/i18n. Esta preparação melhora a manutenção porque evita mensagens repetidas em vários componentes. Se cada página guardar os seus próprios textos, qualquer revisão de linguagem obriga a procurar e alterar várias zonas da app.

Este BK também protege a arquitetura da MF8. Mensagens visíveis pertencem ao frontend; autorizações, membership, ownership, guardrails e validações de segurança continuam no backend e nos serviços existentes. Assim, a app ganha uma base para tradução futura sem misturar texto de interface com regras de negócio.

#### Scope-in

- Confirmar os metadados canónicos de `BK-MF8-09` em matriz, backlog e contrato de campos.
- Criar `apps/web/src/lib/messages.ts` como catálogo local de mensagens.
- Tipar chaves de mensagens com `MessageKey`.
- Substituir mensagens visíveis principais em `AiGuardrailsPanel`.
- Substituir mensagens visíveis principais em `SourceGroundedAiPanel`.
- Criar teste Playwright para chaves conhecidas, chaves desconhecidas e fallback seguro.
- Rever `RoomAiPage` como superfície relacionada, sem a reestruturar neste BK.
- Manter os contratos HTTP, serviços backend e permissões atuais.

#### Scope-out

- Instalar `i18next`, `FormatJS` ou outra biblioteca externa de i18n.
- Criar seletor de idioma.
- Guardar preferência de idioma.
- Traduzir toda a aplicação.
- Criar endpoint de mensagens.
- Criar controller, service, DTO, schema ou model backend para i18n.
- Alterar os contratos de `checkAiGuardrails(...)` ou `askSourceGroundedAi(...)`.
- Mover decisões de autorização, ownership, membership, role ou permissão para o frontend.
- Reestruturar `RoomAiPage`; essa página fica apenas registada como superfície futura de mensagens.

#### Estado antes e depois

- Estado antes: os painéis de IA da MF8 usam mensagens visíveis escritas diretamente nos componentes, como texto de botão, estados de carregamento e mensagens de erro. Isto funciona, mas dificulta uma futura tradução coerente.
- Estado depois: `BK-MF8-09` entrega um catálogo local tipado, integra esse catálogo nos dois painéis de IA mais diretos e deixa um teste Playwright focado para provar que chaves conhecidas e fallback continuam estáveis.

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `apps/web/src/features/mf3/request-mf3-json.ts`
- `apps/web/src/pages/student/RoomAiPage.tsx`
- `apps/web/package.json`

#### Glossário

- **i18n:** abreviatura técnica de internacionalização. Significa preparar a aplicação para suportar vários idiomas no futuro.
- **Localização:** adaptação de texto, datas, números e mensagens ao idioma e ao contexto do utilizador.
- **Catálogo de mensagens:** ficheiro central que guarda textos visíveis da UI por chave estável.
- **Chave de mensagem:** identificador como `guardrails.submit`, usado pelo código para pedir uma mensagem sem escrever o texto diretamente no componente.
- **Fallback:** mensagem segura usada quando uma chave dinâmica não existe.
- **Mensagem visível:** texto apresentado ao aluno, professor ou banca, como botão, título, erro ou estado de carregamento.
- **Guardrails:** regras que impedem pedidos IA inseguros, enviesados ou fora do contexto pedagógico.
- **Resposta com fontes:** resposta IA que deve ser fundamentada em materiais autorizados e citações.
- **Evidence:** prova objetiva de execução, como output de comando, resultado de teste ou captura sem dados sensíveis.
- **Handoff:** contrato que este BK deixa preparado para o BK seguinte.

#### Conceitos teóricos essenciais

- **Preparação i18n:** não é tradução completa. Neste BK, significa separar texto visível da lógica React para que uma tradução futura tenha um ponto central de entrada.
- **Separação entre UI e domínio:** o catálogo só guarda mensagens. Ele não decide se um pedido IA é permitido, não valida membership, não confirma ownership e não altera respostas da API.
- **Tipos TypeScript:** `MessageKey` impede chamadas a `t(...)` com chaves inexistentes quando a chave é conhecida em tempo de desenvolvimento.
- **Fallback seguro:** `tOrDefault(...)` evita mostrar texto técnico ou uma chave crua ao utilizador quando uma chave dinâmica falha.
- **Componente React:** `AiGuardrailsPanel` e `SourceGroundedAiPanel` continuam a gerir formulário, estado local, carregamento, erro e sucesso. A diferença é que os textos passam a vir de `messages.ts`.
- **Cliente HTTP existente:** `requestMf3Json(...)` continua a garantir `credentials: "include"` e o cabeçalho CSRF usado pelos painéis MF3/MF8. Este BK não altera autenticação.
- **Privacidade e logs:** erros técnicos não devem expor prompts, respostas IA completas, materiais privados ou dados pessoais em evidence. A UI mostra mensagens amigáveis e genéricas.
- **Teste Playwright sem browser obrigatório:** a suite Playwright pode testar funções TypeScript do catálogo sem abrir uma página, porque o objetivo é validar resolução de mensagens.

#### Arquitetura do BK

- Requisito canónico: `RNF44`.
- Tipo de entrega: frontend, preparação i18n, sem backend novo.
- Catálogo novo:
  - `apps/web/src/lib/messages.ts`
- Componentes que passam a consumir o catálogo:
  - `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
  - `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- Contratos frontend consumidos:
  - `checkAiGuardrails(...)`
  - `askSourceGroundedAi(...)`
  - `requestMf3Json(...)`
- Teste novo:
  - `apps/web/tests/e2e/mf8-messages.spec.ts`
- Endpoint novo: nenhum.
- Backend novo: nenhum.
- Decisão CANONICO: `BK-MF8-09` entrega `RNF44`, com owner `Kaua`, apoio `Guilherme`, prioridade `P2`, esforço `S`, sprint `S12`, dependências `-` e próximo BK `BK-MF8-10`.
- Decisões DERIVADO:
  - usar um catálogo local tipado antes de instalar biblioteca externa;
  - testar o catálogo com Playwright porque `apps/web` já tem `test:e2e`;
  - rever `RoomAiPage` sem editar nesta entrega para manter o BK pequeno e coerente.
- Handoff: `BK-MF8-10` pode assumir que mensagens visíveis de IA já têm uma base centralizada para evoluções futuras.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/lib/messages.ts`
- CRIAR: `apps/web/tests/e2e/mf8-messages.spec.ts`
- EDITAR: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- EDITAR: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- REVER: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- REVER: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
- REVER: `apps/web/src/pages/student/RoomAiPage.tsx`
- REVER: `apps/web/package.json`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-09` entrega apenas `RNF44` e que não vai alterar backend, permissões, endpoints ou requisitos canónicos.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: linhas de `RNF44` e `BK-MF8-09`.

3. Instruções do que fazer.

Confirma estes valores e não os alteres:

- `bk_id`: `BK-MF8-09`
- `rf_rnf`: `RNF44`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P2`
- `esforco`: `S`
- `sprint`: `S12`
- `dependencias`: `-`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-10`

Regista como `DERIVADO` apenas a decisão de usar um catálogo local tipado antes de instalar uma biblioteca externa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental, analítico e preparatório. Ele fixa a fronteira do BK antes de qualquer alteração técnica.

5. Explicação do código.

Não existe código neste passo. A utilidade está em impedir drift: se o aluno criar endpoint novo, instalar uma biblioteca ou mudar permissões, já saiu do escopo de `RNF44`.

6. Validação do passo.

Resultado esperado: `RNF44`, matriz, backlog, contrato de campos e sprint apontam para o mesmo `BK-MF8-09`, com os mesmos metadados do header.

7. Cenário negativo/erro esperado.

Se algum documento canónico indicar outro owner, sprint, requisito ou próximo BK, não alteres o guia silenciosamente. Regista o conflito como bloqueio de contrato antes de continuar.

### Passo 2 - Mapear mensagens e contratos existentes

1. Objetivo funcional do passo no contexto da app.

Identificar que mensagens visíveis vão para o catálogo e que contratos técnicos devem continuar iguais.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
    - REVER: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
    - REVER: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
    - REVER: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - REVER: `apps/web/src/pages/student/RoomAiPage.tsx`
    - LOCALIZAÇÃO: imports, tipos exportados, textos visíveis e chamadas HTTP dos ficheiros indicados.

3. Instruções do que fazer.

Confirma estes contratos atuais:

- `AiGuardrailContextType` usa `"SOLO"`, `"STUDY_ROOM"` e `"CLASS_SUBJECT"`.
- `checkAiGuardrails(...)` recebe `contextType`, `resourceId` e `prompt`.
- `SourceGroundedAnswer` usa `citations`, não `usedSources`.
- `askSourceGroundedAi(...)` recebe `sourceJobIds` e `question`.
- `requestMf3Json(...)` já envia cookies de sessão com `credentials: "include"`.

Levanta as mensagens visíveis dos dois painéis:

- títulos;
- labels;
- opções de contexto;
- botões;
- estados de carregamento;
- erros genéricos;
- estados permitido/bloqueado;
- texto de citações.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de leitura e inventário. O código só deve mudar depois de confirmares os contratos que os componentes já usam.

5. Explicação do código.

Não existe código novo neste passo. A validação evita dois erros: escrever o guia com tipos que não existem e criar um catálogo desligado dos componentes reais.

6. Validação do passo.

Resultado esperado: consegues apontar, no código existente, para `checkAiGuardrails(...)`, `askSourceGroundedAi(...)`, `AiGuardrailContextType`, `SourceGroundedAnswer.citations` e `requestMf3Json(...)`.

7. Cenário negativo/erro esperado.

Se o guia usar nomes como `student_question`, `jobIds` ou `usedSources`, o código final não encaixa com os contratos atuais. Corrige esses nomes antes de avançar.

### Passo 3 - Criar o catálogo local de mensagens

1. Objetivo funcional do passo no contexto da app.

Criar um ponto central para mensagens visíveis da MF8, com chaves tipadas e fallback seguro.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/messages.ts`
    - LOCALIZAÇÃO: ficheiro completo novo.

3. Instruções do que fazer.

Cria `messageKeys`, `MessageKey`, `isMessageKey(...)`, `t(...)` e `tOrDefault(...)`. O catálogo deve guardar apenas mensagens estáticas da interface. Não coloques aqui regras de autorização, dados privados, prompts ou respostas completas de IA.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/messages.ts
/**
 * Catálogo local de mensagens visíveis da MF8.
 *
 * Este ficheiro prepara a aplicação para futura tradução sem instalar uma
 * biblioteca externa de i18n nesta fase da PAP.
 */
export const messageKeys = {
    aiNoSources: "ai.noSources",
    formGenericError: "form.genericError",
    guardrailsAllowed: "guardrails.allowed",
    guardrailsBlocked: "guardrails.blocked",
    guardrailsContextLabel: "guardrails.contextLabel",
    guardrailsError: "guardrails.error",
    guardrailsLoading: "guardrails.loading",
    guardrailsOptionClassSubject: "guardrails.optionClassSubject",
    guardrailsOptionSolo: "guardrails.optionSolo",
    guardrailsOptionStudyRoom: "guardrails.optionStudyRoom",
    guardrailsPromptLabel: "guardrails.promptLabel",
    guardrailsResourceLabel: "guardrails.resourceLabel",
    guardrailsSubmit: "guardrails.submit",
    guardrailsTitle: "guardrails.title",
    sourceAnswerTitle: "source.answerTitle",
    sourceCitationsTitle: "source.citationsTitle",
    sourceError: "source.error",
    sourceJobIdsLabel: "source.jobIdsLabel",
    sourceLoading: "source.loading",
    sourceQuestionLabel: "source.questionLabel",
    sourceSubmit: "source.submit",
    sourceTitle: "source.title",
    stateUnavailable: "state.unavailable",
} as const;

export type MessageKey = (typeof messageKeys)[keyof typeof messageKeys];

const ptMessages: Record<MessageKey, string> = {
    [messageKeys.aiNoSources]: "Não existem fontes autorizadas para responder.",
    [messageKeys.formGenericError]: "Não foi possível concluir a operação.",
    [messageKeys.guardrailsAllowed]: "Pedido permitido.",
    [messageKeys.guardrailsBlocked]: "Pedido bloqueado.",
    [messageKeys.guardrailsContextLabel]: "Contexto",
    [messageKeys.guardrailsError]: "Erro ao validar o pedido.",
    [messageKeys.guardrailsLoading]: "A validar...",
    [messageKeys.guardrailsOptionClassSubject]: "Disciplina",
    [messageKeys.guardrailsOptionSolo]: "Solo",
    [messageKeys.guardrailsOptionStudyRoom]: "Grupo",
    [messageKeys.guardrailsPromptLabel]: "Pedido",
    [messageKeys.guardrailsResourceLabel]: "Recurso",
    [messageKeys.guardrailsSubmit]: "Validar",
    [messageKeys.guardrailsTitle]: "Guardrails IA",
    [messageKeys.sourceAnswerTitle]: "Resposta",
    [messageKeys.sourceCitationsTitle]: "Fontes usadas:",
    [messageKeys.sourceError]: "Erro ao responder.",
    [messageKeys.sourceJobIdsLabel]: "Jobs de indexação",
    [messageKeys.sourceLoading]: "A responder...",
    [messageKeys.sourceQuestionLabel]: "Pergunta",
    [messageKeys.sourceSubmit]: "Responder",
    [messageKeys.sourceTitle]: "Resposta com fontes",
    [messageKeys.stateUnavailable]: "Mensagem indisponível.",
};

/**
 * Confirma se uma string corresponde a uma chave conhecida do catálogo.
 *
 * @param key Chave recebida de código dinâmico.
 * @returns `true` quando a chave existe no catálogo local.
 */
export function isMessageKey(key: string): key is MessageKey {
    return Object.values(messageKeys).includes(key as MessageKey);
}

/**
 * Resolve uma mensagem cuja chave é conhecida em tempo de desenvolvimento.
 *
 * @param key Chave tipada do catálogo.
 * @returns Mensagem em português de Portugal.
 */
export function t(key: MessageKey): string {
    return ptMessages[key];
}

/**
 * Resolve uma chave dinâmica com fallback seguro.
 *
 * @param key Chave que pode vir de configuração ou outro ponto dinâmico.
 * @returns Mensagem conhecida ou fallback genérico.
 */
export function tOrDefault(key: string): string {
    if (isMessageKey(key)) {
        return ptMessages[key];
    }

    // O fallback evita mostrar chaves técnicas cruas na interface do aluno.
    return ptMessages[messageKeys.stateUnavailable];
}
```

5. Explicação do código.

Este ficheiro cria a base de mensagens de `RNF44`. `messageKeys` concentra os identificadores para impedir strings soltas nos componentes. `MessageKey` faz com que `t(...)` só aceite chaves conhecidas. `isMessageKey(...)` valida chaves dinâmicas. `tOrDefault(...)` devolve uma mensagem segura quando a chave não existe.

Os dados que entram são chaves de mensagem. Os dados que saem são textos visíveis em português. Não entra nenhum `userId`, prompt, material privado, resposta IA completa ou permissão. Isto evita misturar localização com segurança.

6. Validação do passo.

Confirma que `apps/web/src/lib/messages.ts` exporta `messageKeys`, `MessageKey`, `isMessageKey`, `t` e `tOrDefault`. Confirma também que o ficheiro não importa React, API client ou serviços backend.

7. Cenário negativo/erro esperado.

Chamar `tOrDefault("missing.key")` deve devolver `"Mensagem indisponível."`. Chaves desconhecidas não devem aparecer cruas na UI.

### Passo 4 - Confirmar fronteira backend e ausência de endpoint novo

1. Objetivo funcional do passo no contexto da app.

Garantir que este BK não cria backend desnecessário para mensagens estáticas de interface.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - REVER: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
    - REVER: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
    - LOCALIZAÇÃO: chamadas HTTP existentes e helper `requestMf3Json(...)`.

3. Instruções do que fazer.

Confirma que os endpoints continuam a ser:

- `POST /api/ai/guardrails/check`
- `POST /api/ai/source-grounded-answers`

Não cries rota, controller, service, DTO, schema ou model para i18n. Se a API devolver erros técnicos, a UI pode mostrar uma mensagem genérica do catálogo, mas a regra de autorização continua fora do catálogo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de confirmação de fronteira. A implementação deste BK acontece no frontend.

5. Explicação do código.

Não há código novo porque `requestMf3Json(...)` já trata o pedido HTTP com cookies de sessão. O catálogo de mensagens não deve saber como autenticar, autorizar ou chamar a API. Essa separação evita que uma futura tradução altere comportamento de segurança.

6. Validação do passo.

Corre uma pesquisa por `guardrails` e `source-grounded` em `apps/api/src` e `apps/web/src`. O resultado esperado é encontrares os contratos existentes, sem rota nova de i18n.

7. Cenário negativo/erro esperado.

Se aparecer um endpoint como `/api/i18n/messages` criado apenas para estas mensagens estáticas, remove-o desta entrega. Isso acrescenta complexidade sem necessidade funcional.

### Passo 5 - Integrar o catálogo nos painéis reais

1. Objetivo funcional do passo no contexto da app.

Substituir mensagens visíveis principais nos painéis de IA, mantendo estado React, chamadas HTTP e contratos existentes.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
    - EDITAR: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
    - REVER: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
    - REVER: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
    - LOCALIZAÇÃO: componentes completos `AiGuardrailsPanel` e `SourceGroundedAiPanel`.

3. Instruções do que fazer.

Importa `messageKeys` e `t` nos dois componentes. Substitui títulos, labels, botões, loading, erro genérico e estados principais por mensagens do catálogo. Mantém os tipos reais: `AiGuardrailContextType`, `AiGuardrailDecision` e `SourceGroundedAnswer`.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx
/**
 * Implementa a funcionalidade frontend de guardrails de IA e o respetivo contrato com a API.
 */
import { type FormEvent, useState } from "react";
import { messageKeys, t } from "../../lib/messages.js";
import {
    AiGuardrailContextType,
    AiGuardrailDecision,
    checkAiGuardrails,
} from "./check-ai-guardrails.js";

/**
 * Painel manual para validar guardrails de IA.
 *
 * @returns Formulário e decisão devolvida pelo backend.
 */
export function AiGuardrailsPanel() {
    const [contextType, setContextType] =
        useState<AiGuardrailContextType>("SOLO");
    const [resourceId, setResourceId] = useState("");
    const [prompt, setPrompt] = useState("");
    const [decision, setDecision] = useState<AiGuardrailDecision | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Envia o pedido ao backend e atualiza o estado visual do painel.
     *
     * @param event Submissão do formulário de guardrails.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setDecision(null);

        try {
            // A decisão continua a vir do backend; o catálogo só resolve texto visível.
            setDecision(await checkAiGuardrails({ contextType, resourceId, prompt }));
        } catch {
            setError(t(messageKeys.guardrailsError));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">
                {t(messageKeys.guardrailsTitle)}
            </h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    {t(messageKeys.guardrailsContextLabel)}
                    <select
                        value={contextType}
                        onChange={(event) =>
                            setContextType(event.target.value as AiGuardrailContextType)
                        }
                    >
                        <option value="SOLO">{t(messageKeys.guardrailsOptionSolo)}</option>
                        <option value="STUDY_ROOM">
                            {t(messageKeys.guardrailsOptionStudyRoom)}
                        </option>
                        <option value="CLASS_SUBJECT">
                            {t(messageKeys.guardrailsOptionClassSubject)}
                        </option>
                    </select>
                </label>
                <label className="block">
                    {t(messageKeys.guardrailsResourceLabel)}
                    <input
                        value={resourceId}
                        onChange={(event) => setResourceId(event.target.value)}
                    />
                </label>
                <label className="block">
                    {t(messageKeys.guardrailsPromptLabel)}
                    <textarea
                        rows={3}
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                    />
                </label>
                <button
                    className="sf-button-primary"
                    disabled={loading || prompt.trim().length < 5}
                >
                    {loading
                        ? t(messageKeys.guardrailsLoading)
                        : t(messageKeys.guardrailsSubmit)}
                </button>
            </form>
            {decision ? (
                <div className="rounded-md border border-slate-200 p-3 text-sm">
                    <p className={decision.allowed ? "text-emerald-700" : "text-red-700"}>
                        {decision.allowed
                            ? t(messageKeys.guardrailsAllowed)
                            : t(messageKeys.guardrailsBlocked)}
                    </p>
                    <p className="text-slate-700">{decision.reason}</p>
                </div>
            ) : null}
        </section>
    );
}
```

```tsx
// apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx
/**
 * Implementa a funcionalidade frontend de IA com fontes obrigatórias.
 */
import { type FormEvent, useState } from "react";
import { messageKeys, t } from "../../lib/messages.js";
import {
    askSourceGroundedAi,
    SourceGroundedAnswer,
} from "./ask-source-grounded-ai.js";

/**
 * Painel de resposta fundamentada em fontes autorizadas.
 *
 * @returns Formulário e resposta fundamentada com citações.
 */
export function SourceGroundedAiPanel() {
    const [sourceJobIds, setSourceJobIds] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<SourceGroundedAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Envia a pergunta para a API de IA fundamentada em fontes.
     *
     * @param event Submissão do formulário de pergunta.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            // A lista é normalizada no frontend, mas a autorização das fontes continua no backend.
            setAnswer(
                await askSourceGroundedAi({
                    sourceJobIds: sourceJobIds
                        .split(",")
                        .map((sourceJobId) => sourceJobId.trim())
                        .filter(Boolean),
                    question,
                }),
            );
        } catch {
            setError(t(messageKeys.sourceError));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">{t(messageKeys.sourceTitle)}</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    {t(messageKeys.sourceJobIdsLabel)}
                    <input
                        value={sourceJobIds}
                        onChange={(event) => setSourceJobIds(event.target.value)}
                    />
                </label>
                <label className="block">
                    {t(messageKeys.sourceQuestionLabel)}
                    <textarea
                        rows={3}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                    />
                </label>
                <button
                    className="sf-button-primary"
                    disabled={
                        loading ||
                        sourceJobIds.trim().length === 0 ||
                        question.trim().length < 5
                    }
                >
                    {loading ? t(messageKeys.sourceLoading) : t(messageKeys.sourceSubmit)}
                </button>
            </form>
            {answer ? (
                <div className="space-y-3 text-sm">
                    <h3 className="font-semibold">{t(messageKeys.sourceAnswerTitle)}</h3>
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    {answer.citations.length > 0 ? (
                        <div className="space-y-2">
                            <p className="font-semibold">{t(messageKeys.sourceCitationsTitle)}</p>
                            {answer.citations.map((citation) => (
                                <p
                                    className="rounded-md border border-slate-200 p-2"
                                    key={`${citation.sourceJobId}-${citation.locator}`}
                                >
                                    {citation.sourceLabel} · {citation.locator}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p>{t(messageKeys.aiNoSources)}</p>
                    )}
                </div>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

`AiGuardrailsPanel` continua a enviar `contextType`, `resourceId` e `prompt` para `checkAiGuardrails(...)`. O backend continua a decidir se o pedido é permitido ou bloqueado. O catálogo só fornece títulos, labels, botão, loading, erro e estados visíveis.

`SourceGroundedAiPanel` continua a enviar `sourceJobIds` e `question` para `askSourceGroundedAi(...)`. O backend continua a validar fontes, permissões e resposta fundamentada. O componente apenas normaliza a lista escrita no input e usa mensagens centralizadas.

Os dados que entram são inputs de formulário. Os dados que saem são chamadas aos serviços frontend já existentes e renderização controlada. As validações frontend continuam mínimas e ergonómicas; a segurança real fica no backend. Isto evita que uma alteração de linguagem mude regras de IA, membership ou autorização.

6. Validação do passo.

Confirma que os dois componentes importam `messageKeys` e `t` de `../../lib/messages.js`. Confirma que `checkAiGuardrails(...)` e `askSourceGroundedAi(...)` continuam a ser chamados com os mesmos payloads.

7. Cenário negativo/erro esperado.

Força a API a responder erro ou interrompe o pedido. A UI deve mostrar `"Erro ao validar o pedido."` ou `"Erro ao responder."` vindos do catálogo, sem expor detalhes técnicos ao utilizador.

### Passo 6 - Criar teste Playwright para o catálogo

1. Objetivo funcional do passo no contexto da app.

Provar que o catálogo resolve chaves conhecidas, deteta chave desconhecida e usa fallback seguro.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf8-messages.spec.ts`
    - REVER: `apps/web/package.json`
    - LOCALIZAÇÃO: suite Playwright nova.

3. Instruções do que fazer.

Cria uma suite pequena com `@playwright/test`. O teste não precisa de abrir browser porque valida funções puras de `messages.ts`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf8-messages.spec.ts
import { expect, test } from "@playwright/test";

import {
    isMessageKey,
    messageKeys,
    t,
    tOrDefault,
} from "../../src/lib/messages.js";

test.describe("MF8 message catalog", () => {
    test("resolve chaves conhecidas do catálogo", () => {
        expect(t(messageKeys.guardrailsSubmit)).toBe("Validar");
        expect(t(messageKeys.sourceSubmit)).toBe("Responder");
        expect(t(messageKeys.sourceCitationsTitle)).toBe("Fontes usadas:");
    });

    test("distingue chaves conhecidas e desconhecidas", () => {
        expect(isMessageKey(messageKeys.guardrailsTitle)).toBe(true);
        expect(isMessageKey("missing.key")).toBe(false);
    });

    test("usa fallback seguro para chave dinâmica desconhecida", () => {
        // O fallback impede que uma chave técnica apareça diretamente na interface.
        expect(tOrDefault("missing.key")).toBe("Mensagem indisponível.");
    });

    test("mantém mensagens de MF8 sem dependência externa de i18n", () => {
        // Este teste protege a decisão DERIVADO deste BK: catálogo local primeiro.
        expect(t(messageKeys.guardrailsLoading)).toBe("A validar...");
        expect(t(messageKeys.sourceLoading)).toBe("A responder...");
    });
});
```

5. Explicação do código.

A suite importa diretamente as funções do catálogo. O primeiro teste prova o caminho feliz. O segundo confirma que `isMessageKey(...)` separa chave conhecida de chave inválida. O terceiro confirma o fallback. O quarto protege a decisão deste BK: preparar i18n sem nova dependência.

Os dados que entram são chaves de mensagem. Os dados que saem são strings esperadas. Não há dados pessoais nem chamadas HTTP. O teste evita que uma refatoração futura remova uma chave usada pelos painéis.

6. Validação do passo.

Corre:

```bash
cd apps/web
npm run test:e2e -- mf8-messages.spec.ts
```

Resultado esperado: a suite `MF8 message catalog` passa.

7. Cenário negativo/erro esperado.

Se mudares uma chave em `messageKeys` e não atualizares `ptMessages`, o TypeScript deve acusar erro de tipagem ou o teste deve falhar por mensagem em falta.

### Passo 7 - Validar integração e preparar evidence

1. Objetivo funcional do passo no contexto da app.

Confirmar que a app continua a compilar, que as mensagens migradas vêm do catálogo e que nenhum backend novo foi criado.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/messages.ts`
    - REVER: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
    - REVER: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
    - REVER: `apps/web/tests/e2e/mf8-messages.spec.ts`
    - LOCALIZAÇÃO: diff final e outputs de validação.

3. Instruções do que fazer.

Executa as validações finais e guarda evidence sem dados sensíveis:

```bash
git diff -- apps/web/src/lib/messages.ts apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx apps/web/tests/e2e/mf8-messages.spec.ts
npm --prefix apps/web run build
npm --prefix apps/web run test:e2e -- mf8-messages.spec.ts
rg -n "api/i18n|I18nController|I18nService" apps/api/src apps/web/src
```

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo valida a entrega e recolhe evidence objetiva.

5. Explicação do código.

Não existe código novo neste passo. A validação garante que `messages.ts` compila, que os componentes continuam a chamar os serviços reais e que não apareceu backend artificial para mensagens estáticas.

6. Validação do passo.

Resultado esperado:

- `npm --prefix apps/web run build` passa;
- `npm --prefix apps/web run test:e2e -- mf8-messages.spec.ts` passa;
- a pesquisa por controller/service i18n não encontra backend novo;
- o diff mostra apenas frontend e teste do catálogo.

7. Cenário negativo/erro esperado.

Se o build falhar por import inexistente, corrige o caminho antes de fechar o BK. Se a pesquisa encontrar backend novo de i18n, remove essa alteração desta entrega.

#### Critérios de aceite

- [ ] `apps/web/src/lib/messages.ts` existe.
- [ ] O catálogo exporta `messageKeys`, `MessageKey`, `isMessageKey`, `t` e `tOrDefault`.
- [ ] `AiGuardrailsPanel` usa `t(...)` para título, labels, botão, loading, erro e estado permitido/bloqueado.
- [ ] `SourceGroundedAiPanel` usa `t(...)` para título, labels, botão, loading, erro, resposta e citações.
- [ ] `checkAiGuardrails(...)` mantém `contextType`, `resourceId` e `prompt`.
- [ ] `askSourceGroundedAi(...)` mantém `sourceJobIds` e `question`.
- [ ] Nenhum endpoint novo foi criado.
- [ ] Nenhuma biblioteca externa de i18n foi instalada.
- [ ] Existe teste para chave conhecida.
- [ ] Existe teste para chave desconhecida.
- [ ] Existe teste para fallback seguro.
- [ ] O build do frontend passa.

#### Validação final

Executa:

```bash
npm --prefix apps/web run build
npm --prefix apps/web run test:e2e -- mf8-messages.spec.ts
rg -n "api/i18n|I18nController|I18nService" apps/api/src apps/web/src
```

Expected results:

- build frontend sem erros TypeScript;
- teste Playwright do catálogo em `PASS`;
- pesquisa por backend i18n sem ocorrências;
- interface continua a usar os mesmos serviços frontend;
- mensagens principais dos dois painéis já vêm de `messages.ts`.

#### Evidence para PR/defesa

Inclui no PR ou na defesa:

- output do build frontend;
- output da suite `mf8-messages.spec.ts`;
- excerto do diff que mostra `messages.ts`;
- excerto do diff que mostra os dois painéis a importar `messageKeys` e `t`;
- confirmação de que não foi criado endpoint novo;
- confirmação de que não foi instalada biblioteca externa;
- nota de privacidade: evidence não contém prompts privados, respostas IA completas, cookies, dados pessoais ou materiais privados.

#### Handoff

`BK-MF8-10` pode partir desta base sabendo que mensagens visíveis de IA já têm um ponto central. Se o próximo BK precisar de mensagens novas para histórico privado de chats IA da sala, deve adicionar chaves ao catálogo em vez de voltar a espalhar textos diretamente pela UI.

Este BK não fecha a tradução completa. Ele fecha apenas a preparação técnica mínima para a equipa poder evoluir para múltiplos idiomas com menos risco.

#### Changelog

```md
### MF8 - BK-MF8-09

- Criado catálogo local de mensagens para fluxos IA de MF8.
- Integrado catálogo no painel de guardrails de IA.
- Integrado catálogo no painel de respostas com fontes.
- Adicionado teste Playwright para chaves conhecidas, chave desconhecida e fallback.
- Mantidos contratos backend existentes, sem endpoint novo e sem biblioteca externa de i18n.
```
