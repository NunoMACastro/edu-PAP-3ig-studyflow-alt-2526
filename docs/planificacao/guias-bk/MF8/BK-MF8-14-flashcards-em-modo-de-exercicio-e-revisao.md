# BK-MF8-14 - Flashcards em modo de exercício e revisão.

## Header

- `doc_id`: `GUIA-BK-MF8-14`
- `bk_id`: `BK-MF8-14`
- `macro`: `MF8`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-12`
- `rf_rnf`: `RF12`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-15`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais transformar os flashcards gerados no `BK-MF0-12` numa experiência de estudo ativa: o aluno pode rever cartões com frente e verso visíveis ou treinar em modo exercício, vendo primeiro a pergunta e revelando a resposta apenas quando estiver pronto.

O BK não cria uma nova IA, não cria um novo endpoint e não altera a persistência de artefactos. O trabalho consiste em reutilizar o contrato `AiArtifact` já filtrado por sessão no backend, melhorar o componente `FlashcardsPanel`, criar uma pequena unidade de estado local e provar o comportamento com testes Playwright.

#### Importância

`RF12` é CANONICO: o StudyFlow deve permitir obter explicações, cards e quizzes personalizados. O `BK-MF0-12` já criou os cards como artefactos IA. Este BK fecha uma lacuna de produto: um cartão de estudo só é realmente útil se o aluno puder tentar responder antes de ver a solução.

Esta entrega também protege a defesa PAP. O aluno consegue demonstrar um fluxo visível, explicar que o ownership continua no backend, mostrar evidence sem dados sensíveis e deixar o `BK-MF8-15` com uma base concreta para verificar testes existentes e criar os testes em falta.

#### Scope-in

- Confirmar que `BK-MF8-14` mantém os metadados canónicos: owner `Daniel`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF0-12`, requisito `RF12`, sprint `S12` e próximo BK `BK-MF8-15`.
- Reutilizar `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`, criado a partir do contrato do `BK-MF0-12`.
- Criar `apps/web/src/features/mf8/flashcard-practice.ts` para estado local de exercício/revisão.
- Editar `apps/web/src/components/ai/FlashcardsPanel.tsx` com modo exercício, modo revisão, botão de revelar resposta, botão de avançar, reinício e fontes.
- Criar `apps/web/tests/e2e/mf8-flashcards.spec.ts` com testes ao estado local e à UI através de Playwright.
- Manter dados de aluno, materiais, fontes e artefactos IA protegidos por sessão e ownership no backend.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar endpoints novos para flashcards.
- Criar novo schema/model para progresso persistido de flashcards.
- Guardar estado de treino, respostas, prompts, tokens, cookies ou materiais em storage persistente do browser.
- Transformar flashcards em avaliação oficial de professor; isso pertence ao fluxo de mini-testes oficiais.
- Gerar novos flashcards neste BK; a geração continua no contrato de study tools do `BK-MF0-12`.
- Mover ownership, autenticação, autorização ou decisão de acesso para o frontend.

#### Estado antes e depois

- Estado antes: o aluno já pode receber artefactos `FLASHCARDS` associados à sua área de estudo, mas o componente mostra a pergunta e a resposta ao mesmo tempo, o que reduz o valor de treino ativo.
- Estado depois: o aluno pode alternar entre modo exercício e modo revisão, revelar respostas de forma controlada, avançar cartão a cartão, reiniciar o treino e provar o comportamento com testes focados.

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
- `docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `apps/api/src/modules/ai/study-tools.controller.ts`
- `apps/api/src/modules/ai/study-tools.service.ts`
- `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/pages/student/StudyToolsPage.tsx`
- `apps/web/src/components/ai/ArtifactSources.tsx`
- `apps/web/src/components/ai/FlashcardsPanel.tsx`
- `apps/web/playwright.config.ts`

#### Glossário

- **Flashcard/Card:** par curto de pergunta e resposta usado para revisão ativa. Vem de `RF12` e do contrato `FLASHCARDS` criado no `BK-MF0-12`.
- **Modo exercício:** forma de treino em que a pergunta aparece primeiro e a resposta fica escondida até o aluno clicar em revelar.
- **Modo revisão:** forma de leitura em que pergunta e resposta aparecem juntas para recapitulação rápida.
- **Artefacto IA:** registo `AiArtifact` persistido pela API com `studyAreaId`, `type`, `contentJson` e `sourcesJson`.
- **Fonte:** material associado ao cartão, usado para rastreabilidade pedagógica. A UI mostra apenas metadados curtos, nunca o conteúdo completo do material.
- **Ownership:** regra backend que garante que o artefacto pertence à área do aluno autenticado.
- **Estado local React:** informação de interface guardada em memória durante a navegação, como índice do cartão atual e resposta visível.
- **Evidence:** prova objetiva para PR/defesa, com comando, expected result, observed result e negativo, sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Revisão ativa:** técnica em que o aluno tenta responder antes de ver a solução. No StudyFlow, isto transforma flashcards de simples leitura em exercício.
- **Contrato `AiArtifact`:** vem do `BK-MF0-12` e transporta artefactos `SUMMARY`, `EXPLANATION`, `FLASHCARDS` e `QUIZ`. Neste BK, só consomes `FLASHCARDS`; não alteras o schema.
- **Endpoint de listagem de study tools:** `GET /api/study-areas/:id/study-tools?type=FLASHCARDS` devolve apenas artefactos da área do aluno autenticado. O `userId` vem da sessão no backend.
- **Frontend como consumidor:** React mostra o resultado autorizado, mas não decide se o aluno pode ver o artefacto. Essa decisão continua no service backend.
- **Estado local não persistente:** índice atual, modo e resposta visível ficam em memória React. Isto evita guardar hábitos de estudo, respostas ou conteúdos privados no browser.
- **Acessibilidade:** botões precisam de texto claro, foco previsível, `aria-live` para mudança de estado e contraste adequado.
- **Privacidade e RGPD:** flashcards podem refletir materiais privados. O componente não deve expor prompts, respostas IA completas em logs, cookies, tokens ou conteúdo integral das fontes.
- **Teste Playwright:** valida comportamento observável na UI e pode também testar funções puras sem adicionar dependências novas ao projeto.

#### Arquitetura do BK

- Requisito canónico: `RF12`.
- Dependência principal: `BK-MF0-12`, que criou `AiArtifact`, `StudyToolsService`, `StudyToolsController`, `listStudyTools(...)`, `generateStudyTool(...)` e o painel inicial de flashcards.
- Endpoint consumido: `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`.
- Backend: sem ficheiros novos; o backend continua responsável por sessão, ownership, filtro por `userId` e `studyAreaId`, e bloqueio quando a área não pertence ao aluno.
- Frontend: `FlashcardsPanel` passa a gerir modo exercício/revisão e navegação por cartões.
- Testes: `apps/web/tests/e2e/mf8-flashcards.spec.ts` valida unidade de estado e comportamento visual.
- Decisão CANONICO: `RF12` exige cards personalizados; a matriz e o backlog apontam `BK-MF8-14` para esse requisito.
- Decisões DERIVADO:
  - o estado do treino fica local no frontend porque não há contrato canónico para persistir progresso de flashcards;
  - modo exercício significa resposta escondida até interação do aluno;
  - modo revisão significa resposta visível por defeito;
  - a suite usa Playwright porque `apps/web` já tem esse runner e não tem Vitest/Jest configurado.
- Handoff: `BK-MF8-15` pode assumir que existe UI testável para flashcards.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/features/mf8/flashcard-practice.ts`
- EDITAR: `apps/web/src/components/ai/FlashcardsPanel.tsx`
- CRIAR: `apps/web/tests/e2e/mf8-flashcards.spec.ts`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/web/src/pages/student/StudyToolsPage.tsx`
- REVER: `apps/web/src/components/ai/ArtifactSources.tsx`
- REVER: `apps/api/src/modules/ai/study-tools.controller.ts`
- REVER: `apps/api/src/modules/ai/study-tools.service.ts`
- REVER: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- REVER: `apps/web/package.json`
- REVER: `apps/web/playwright.config.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega `RF12` como melhoria de uso dos flashcards, sem alterar a matriz, o backlog, a ordem dos BKs ou o backend já criado no `BK-MF0-12`.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
    - LOCALIZAÇÃO: linhas de `RF12`, `BK-MF8-14`, dependência `BK-MF0-12` e próximo BK `BK-MF8-15`.

3. Instruções do que fazer.

Confirma estes factos antes de escrever código:

- `CANONICO`: `RF12` é "Obter explicações, cards e quizzes personalizados".
- `CANONICO`: `BK-MF8-14` pertence à `MF8`, owner `Daniel`, apoio `Guilherme`, prioridade `P1`, esforço `S`, sprint `S12`, core, dependência `BK-MF0-12` e handoff para `BK-MF8-15`.
- `DERIVADO`: o BK melhora a experiência dos cards já gerados, não a geração IA em si.
- `DERIVADO`: não há novo endpoint porque o contrato de listagem por área já existe.

Não alteres documentos canónicos neste BK. Se algum destes valores estiver diferente, regista o bloqueio no relatório antes de continuar.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e evita que a equipa implemente uma funcionalidade que pareça útil, mas saia do contrato oficial.

5. Explicação do código.

Não há código porque a decisão importante é de escopo. O aluno deve perceber que um BK não começa por programar: começa por confirmar que o requisito, a dependência e o handoff estão certos.

6. Validação do passo.

Resultado esperado: a matriz, o backlog e o contrato de campos continuam alinhados com `BK-MF8-14`, `RF12`, `BK-MF0-12`, `S12` e `BK-MF8-15`.

7. Cenário negativo/erro esperado.

Se alguém tentar transformar este BK em ranking, mini-teste oficial ou persistência de progresso, rejeita a alteração: esses domínios não pertencem a `RF12` neste ponto.

### Passo 2 - Rever o contrato backend já existente

1. Objetivo funcional do passo no contexto da app.

Garantir que a UI de flashcards consome artefactos autorizados pelo backend, sem duplicar endpoints nem aceitar `userId` vindo do frontend.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/ai/study-tools.controller.ts`
    - REVER: `apps/api/src/modules/ai/study-tools.service.ts`
    - REVER: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: `StudyToolsController.list(...)`, `StudyToolsService.listTools(...)`, tipo `AiArtifact` e função `listStudyTools(...)`.

3. Instruções do que fazer.

Confirma que o contrato existente é suficiente:

- método HTTP: `GET`;
- endpoint: `/api/study-areas/:id/study-tools?type=FLASHCARDS`;
- payload: sem body;
- autenticação: `SessionGuard`;
- ownership: `StudyToolsService.listTools(...)` chama `areasService.getMyStudyArea(userId, studyAreaId)`;
- resposta esperada: lista de `AiArtifact[]`;
- erro esperado sem sessão: `401`;
- erro esperado para área inexistente ou de outro aluno: `404` ou erro equivalente do service de áreas;
- erro esperado para `type` inválido: `400 INVALID_STUDY_TOOL_TYPE`.

Não cries controller, DTO, schema ou service novo neste BK. A alteração visual fica no frontend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de revisão técnica porque o backend necessário já foi criado em BK anterior. Reescrever aqui o controller ou o service criaria risco de duplicação.

5. Explicação do código.

Não há código novo porque a responsabilidade do backend já está fechada: a sessão identifica o aluno, o service valida ownership e o modelo `AiArtifact` guarda apenas os artefactos da área. O frontend recebe dados já autorizados e não decide acesso.

6. Validação do passo.

Resultado esperado: o aluno consegue apontar para `StudyToolsController.list(...)`, `StudyToolsService.listTools(...)` e `listStudyTools(...)` como cadeia completa entre UI e API.

7. Cenário negativo/erro esperado.

Se a solução proposta aceitar `userId`, `studentId` ou `ownerId` no body/query do frontend, está errada. O `userId` vem sempre da sessão autenticada no backend.

### Passo 3 - Criar estado local de prática de flashcards

1. Objetivo funcional do passo no contexto da app.

Criar uma unidade pequena, previsível e testável para o modo exercício/revisão, sem guardar dados privados no browser.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/features/mf8/flashcard-practice.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Ele define o estado local do treino, valida o número de cartões, revela respostas, avança para o próximo cartão, troca de modo e reinicia a sessão.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/mf8/flashcard-practice.ts
/**
 * Regras locais para praticar flashcards sem persistir dados privados.
 */
export type FlashcardPracticeMode = "exercise" | "review";

export type FlashcardPracticeState = {
    currentIndex: number;
    answerVisible: boolean;
    completed: boolean;
    mode: FlashcardPracticeMode;
};

/**
 * Cria o estado inicial do treino.
 *
 * @param mode Modo visual escolhido pelo aluno.
 * @returns Estado inicial seguro para a UI.
 */
export function createFlashcardPracticeState(
    mode: FlashcardPracticeMode = "exercise",
): FlashcardPracticeState {
    return {
        currentIndex: 0,
        answerVisible: mode === "review",
        completed: false,
        mode,
    };
}

/**
 * Revela a resposta do cartão atual sem mudar de cartão.
 *
 * @param state Estado atual do treino.
 * @returns Novo estado com resposta visível.
 */
export function revealFlashcardAnswer(
    state: FlashcardPracticeState,
): FlashcardPracticeState {
    return {
        ...state,
        answerVisible: true,
    };
}

/**
 * Avança para o cartão seguinte ou termina o treino.
 *
 * @param state Estado atual do treino.
 * @param totalCards Número de cartões autorizados recebidos da API.
 * @returns Novo estado, sempre limitado à lista recebida.
 */
export function moveToNextFlashcard(
    state: FlashcardPracticeState,
    totalCards: number,
): FlashcardPracticeState {
    const safeTotal = Math.max(0, Math.floor(totalCards));

    if (safeTotal === 0 || state.currentIndex + 1 >= safeTotal) {
        return {
            ...state,
            answerVisible: state.mode === "review",
            completed: true,
        };
    }

    return {
        currentIndex: state.currentIndex + 1,
        // No modo exercício, cada cartão novo volta a esconder a resposta.
        answerVisible: state.mode === "review",
        completed: false,
        mode: state.mode,
    };
}

/**
 * Alterna entre modo exercício e modo revisão.
 *
 * @param state Estado atual do treino.
 * @param mode Novo modo escolhido pelo aluno.
 * @returns Estado atualizado sem perder o cartão atual.
 */
export function setFlashcardPracticeMode(
    state: FlashcardPracticeState,
    mode: FlashcardPracticeMode,
): FlashcardPracticeState {
    return {
        ...state,
        answerVisible: mode === "review" ? true : state.answerVisible,
        mode,
    };
}

/**
 * Recomeça a sessão no cartão inicial.
 *
 * @param mode Modo visual escolhido para o recomeço.
 * @returns Estado inicial do treino.
 */
export function restartFlashcardPractice(
    mode: FlashcardPracticeMode = "exercise",
): FlashcardPracticeState {
    return createFlashcardPracticeState(mode);
}
```

5. Explicação do código.

Este ficheiro concentra regras de navegação que seriam fáceis de duplicar dentro do componente. Ele existe neste BK porque `RF12` precisa de uma experiência real de treino, não apenas uma grelha de pergunta/resposta.

Os dados que entram são o estado atual, o modo escolhido e o número de cartões que veio do backend. Os dados que saem são apenas flags de UI: índice atual, resposta visível, treino concluído e modo. Não entram prompts, cookies, tokens, texto completo de materiais nem ownership.

A validação principal é `safeTotal`: mesmo que a UI receba uma lista vazia ou um valor inválido, a função termina o treino de forma controlada. Isto evita índices fora da lista e prepara os testes do `BK-MF8-15`.

6. Validação do passo.

Resultado esperado: o ficheiro exporta `createFlashcardPracticeState(...)`, `revealFlashcardAnswer(...)`, `moveToNextFlashcard(...)`, `setFlashcardPracticeMode(...)` e `restartFlashcardPractice(...)`.

7. Cenário negativo/erro esperado.

Chama `moveToNextFlashcard(createFlashcardPracticeState(), 0)`. O resultado esperado é `completed: true`, sem erro e sem tentativa de ler um cartão inexistente.

### Passo 4 - Integrar o painel de flashcards na UI

1. Objetivo funcional do passo no contexto da app.

Substituir a grelha estática de flashcards por um componente que suporta exercício, revisão, revelação de resposta, avanço, fim da lista e fontes.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/components/ai/FlashcardsPanel.tsx`
    - REVER: `apps/web/src/components/ai/ArtifactSources.tsx`
    - LOCALIZAÇÃO: ficheiro completo `FlashcardsPanel.tsx`.

3. Instruções do que fazer.

Substitui o conteúdo de `FlashcardsPanel.tsx` pelo código abaixo. Mantém o import de `ArtifactSources`, porque as fontes continuam a explicar de onde veio cada cartão.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/components/ai/FlashcardsPanel.tsx
/**
 * Painel de flashcards com modo exercício e modo revisão.
 */
import { useEffect, useMemo, useState } from "react";
import { AiArtifact } from "../../lib/apiClient.js";
import {
    createFlashcardPracticeState,
    moveToNextFlashcard,
    restartFlashcardPractice,
    revealFlashcardAnswer,
    setFlashcardPracticeMode,
    type FlashcardPracticeMode,
    type FlashcardPracticeState,
} from "../../features/mf8/flashcard-practice.js";
import { ArtifactSources } from "./ArtifactSources.js";

type Flashcard = {
    front: string;
    back: string;
    sourceMaterialIds?: string[];
};

type FlashcardsPanelProps = {
    artifact: AiArtifact | null;
};

/**
 * Lê cartões de um artefacto IA sem confiar cegamente no formato dinâmico.
 *
 * @param artifact Artefacto autorizado recebido da API.
 * @returns Lista de cartões válidos para renderizar.
 */
function readFlashcards(artifact: AiArtifact): Flashcard[] {
    const maybeCards = artifact.contentJson.cards;

    if (!Array.isArray(maybeCards)) {
        return [];
    }

    return maybeCards.filter((card): card is Flashcard => {
        if (!card || typeof card !== "object") return false;

        const candidate = card as Record<string, unknown>;
        return (
            typeof candidate.front === "string" &&
            candidate.front.trim().length > 0 &&
            typeof candidate.back === "string" &&
            candidate.back.trim().length > 0
        );
    });
}

/**
 * Mostra flashcards gerados pela IA em modo exercício ou revisão.
 *
 * @param props Artefacto de flashcards autorizado para a área do aluno.
 * @returns Painel interativo de estudo.
 */
export function FlashcardsPanel({ artifact }: FlashcardsPanelProps) {
    const cards = useMemo(
        () => (artifact ? readFlashcards(artifact) : []),
        [artifact],
    );
    const [practice, setPractice] = useState<FlashcardPracticeState>(
        createFlashcardPracticeState(),
    );

    useEffect(() => {
        setPractice(createFlashcardPracticeState());
    }, [artifact?._id]);

    if (!artifact) return null;

    if (cards.length === 0) {
        return (
            <section className="sf-panel" aria-label="Flashcards">
                <h2 className="text-lg font-bold">Flashcards</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Este artefacto não tem cartões válidos para rever.
                </p>
            </section>
        );
    }

    const currentCard = cards[Math.min(practice.currentIndex, cards.length - 1)];
    const progressLabel = `${Math.min(practice.currentIndex + 1, cards.length)} de ${cards.length}`;

    /**
     * Troca o modo visual sem persistir dados privados.
     *
     * @param mode Novo modo escolhido pelo aluno.
     */
    function handleModeChange(mode: FlashcardPracticeMode): void {
        setPractice((current) => setFlashcardPracticeMode(current, mode));
    }

    return (
        <section className="sf-panel space-y-4" aria-label="Flashcards">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">Flashcards</h2>
                    <p className="text-sm text-slate-600">
                        Treina a resposta antes de veres a solução, ou usa revisão para ler tudo de seguida.
                    </p>
                </div>
                <p className="rounded-full bg-studyflow-page px-3 py-1 text-sm font-semibold text-studyflow-brand">
                    {progressLabel}
                </p>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Modo de estudo">
                <button
                    className={practice.mode === "exercise" ? "sf-button-primary" : "sf-button-secondary"}
                    onClick={() => handleModeChange("exercise")}
                    type="button"
                >
                    Modo exercício
                </button>
                <button
                    className={practice.mode === "review" ? "sf-button-primary" : "sf-button-secondary"}
                    onClick={() => handleModeChange("review")}
                    type="button"
                >
                    Modo revisão
                </button>
            </div>

            {practice.completed ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4" role="status">
                    <p className="font-semibold text-emerald-900">Sessão concluída.</p>
                    <p className="mt-1 text-sm text-emerald-800">
                        Recomeça para repetir os cartões e reforçar a memória.
                    </p>
                    <button
                        className="sf-button-secondary mt-3"
                        onClick={() => setPractice(restartFlashcardPractice(practice.mode))}
                        type="button"
                    >
                        Recomeçar
                    </button>
                </div>
            ) : (
                <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-studyflow-brand">Pergunta</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{currentCard.front}</h3>

                    {practice.answerVisible ? (
                        <div className="mt-4 rounded-md bg-studyflow-page p-4" aria-live="polite">
                            <p className="text-xs font-semibold uppercase text-slate-500">Resposta</p>
                            <p className="mt-1 text-slate-800">{currentCard.back}</p>
                        </div>
                    ) : (
                        <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600" aria-live="polite">
                            Resposta escondida. Tenta responder antes de a revelar.
                        </p>
                    )}

                    <div className="mt-4">
                        <ArtifactSources
                            sourceMaterialIds={currentCard.sourceMaterialIds}
                            sources={artifact.sourcesJson}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {practice.answerVisible ? null : (
                            <button
                                className="sf-button-primary"
                                onClick={() => setPractice((current) => revealFlashcardAnswer(current))}
                                type="button"
                            >
                                Mostrar resposta
                            </button>
                        )}
                        <button
                            className="sf-button-secondary"
                            onClick={() => setPractice((current) => moveToNextFlashcard(current, cards.length))}
                            type="button"
                        >
                            {practice.currentIndex + 1 >= cards.length ? "Concluir" : "Seguinte"}
                        </button>
                    </div>
                </article>
            )}
        </section>
    );
}
```

5. Explicação do código.

O componente lê apenas cartões válidos, com `front` e `back` não vazios. Isto evita que a UI rebente se um artefacto antigo ou inválido tiver `contentJson` incompleto. A fonte dos dados continua a ser o endpoint já autorizado pelo backend.

`useMemo` evita recalcular a lista de cartões em cada render quando o artefacto não muda. `useEffect` reinicia o treino quando muda o `_id` do artefacto, impedindo que o aluno fique no cartão 4 de uma lista nova com apenas 2 cartões.

O estado local não guarda tokens, cookies, prompts, respostas em storage nem progresso persistido. Ele vive só na sessão React. A regra de ownership continua no `StudyToolsService`, que usa `userId` da sessão e `studyAreaId`.

Os botões têm texto visível e o grupo de modo tem `aria-label`, o que melhora acessibilidade básica. `aria-live` comunica a resposta revelada ou escondida sem depender de logs ou dados sensíveis.

6. Validação do passo.

Resultado esperado: ao abrir um artefacto `FLASHCARDS`, o aluno vê a pergunta, a resposta escondida no modo exercício, botão "Mostrar resposta", botão "Seguinte" e fontes associadas quando existirem.

7. Cenário negativo/erro esperado.

Se `contentJson.cards` vier vazio ou inválido, a UI deve mostrar "Este artefacto não tem cartões válidos para rever." e não deve lançar erro no browser.

### Passo 5 - Confirmar cliente API e página consumidora

1. Objetivo funcional do passo no contexto da app.

Garantir que a página real de ferramentas IA continua a selecionar artefactos `FLASHCARDS` e a enviar esses artefactos para o painel corrigido.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/pages/student/StudyToolsPage.tsx`
    - LOCALIZAÇÃO: tipo `AiArtifact`, função `listStudyTools(...)`, função `generateStudyTool(...)` e renderização condicional de `FlashcardsPanel`.

3. Instruções do que fazer.

Confirma estes pontos:

- `AiArtifact.type` aceita `"FLASHCARDS"`;
- `contentJson` continua como `Record<string, unknown>` porque o formato depende do tipo de artefacto;
- `listStudyTools(studyAreaId)` chama `/api/study-areas/${studyAreaId}/study-tools`;
- `generateStudyTool(studyAreaId, { type: "FLASHCARDS" })` chama o endpoint existente com cookies via `requestJson`;
- `StudyToolsPage` renderiza `<FlashcardsPanel artifact={artifact} />` quando `artifact?.type === "FLASHCARDS"`.

Não alteres `apiClient.ts` neste BK se estes contratos já existirem. A função central `requestJson` já usa `credentials: "include"` e CSRF marker.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de verificação de integração: a alteração principal está no componente e no estado local. O cliente API já cumpre o contrato.

5. Explicação do código.

Não há código novo porque o cliente e a página já entregam o artefacto certo ao painel. A validação protege contra duas más decisões: criar outro cliente API para o mesmo endpoint, ou fazer fetch dentro do `FlashcardsPanel` sem necessidade.

6. Validação do passo.

Resultado esperado: a página `/app/areas/:id/ferramentas` continua a compilar e, quando o artefacto selecionado é `FLASHCARDS`, renderiza o painel interativo.

7. Cenário negativo/erro esperado.

Se alguém tentar filtrar ownership no frontend ou passar `userId` para o endpoint, rejeita a alteração. A UI só passa `studyAreaId`; o backend resolve o utilizador pela sessão.

### Passo 6 - Criar testes Playwright para exercício e revisão

1. Objetivo funcional do passo no contexto da app.

Provar que o estado local e o comportamento visível dos flashcards funcionam sem adicionar dependências novas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf8-flashcards.spec.ts`
    - REVER: `apps/web/package.json`
    - REVER: `apps/web/playwright.config.ts`
    - LOCALIZAÇÃO: ficheiro completo de teste Playwright.

3. Instruções do que fazer.

Cria o teste abaixo. Ele valida funções puras e valida a UI com API intercetada no browser, sem expor materiais reais nem depender de uma chave de IA externa.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf8-flashcards.spec.ts
import { expect, test, type Page } from "@playwright/test";
import {
    createFlashcardPracticeState,
    moveToNextFlashcard,
    revealFlashcardAnswer,
    setFlashcardPracticeMode,
} from "../../src/features/mf8/flashcard-practice.js";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra como aluno para manter sessão real baseada em cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando a shell autenticada está pronta.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("MF8 flashcards: estado local esconde resposta e termina lista", () => {
    const initial = createFlashcardPracticeState();
    expect(initial.answerVisible).toBe(false);

    const revealed = revealFlashcardAnswer(initial);
    expect(revealed.answerVisible).toBe(true);

    const completed = moveToNextFlashcard(revealed, 1);
    expect(completed.completed).toBe(true);
    expect(completed.answerVisible).toBe(false);
});

test("MF8 flashcards: modo revisão mantém resposta visível ao avançar", () => {
    const review = setFlashcardPracticeMode(createFlashcardPracticeState(), "review");
    const next = moveToNextFlashcard(review, 2);

    expect(next.currentIndex).toBe(1);
    expect(next.answerVisible).toBe(true);
    expect(next.completed).toBe(false);
});

test("MF8 flashcards: aluno revela resposta e conclui treino na UI", async ({ page }) => {
    await loginAsStudent(page);

    await page.route("**/api/study-areas/area-mf8-flashcards/summaries", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: "[]",
        });
    });

    await page.route("**/api/study-areas/area-mf8-flashcards/study-tools", async (route) => {
        // O teste devolve apenas dados mínimos e públicos para não expor materiais reais.
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify([
                {
                    _id: "artifact-flashcards-mf8",
                    studyAreaId: "area-mf8-flashcards",
                    type: "FLASHCARDS",
                    contentJson: {
                        cards: [
                            {
                                front: "Qual é a capital de Portugal?",
                                back: "Lisboa.",
                                sourceMaterialIds: ["material-geografia"],
                            },
                            {
                                front: "Que oceano banha Portugal continental?",
                                back: "Oceano Atlântico.",
                                sourceMaterialIds: ["material-geografia"],
                            },
                        ],
                    },
                    sourcesJson: [
                        {
                            materialId: "material-geografia",
                            title: "Resumo de Geografia",
                        },
                    ],
                },
            ]),
        });
    });

    await page.goto("/app/areas/area-mf8-flashcards/ferramentas");

    await expect(page.getByRole("heading", { name: "Flashcards" })).toBeVisible();
    await expect(page.getByText("Qual é a capital de Portugal?")).toBeVisible();
    await expect(page.getByText("Lisboa.")).toHaveCount(0);

    await page.getByRole("button", { name: "Mostrar resposta" }).click();
    await expect(page.getByText("Lisboa.")).toBeVisible();

    await page.getByRole("button", { name: "Seguinte" }).click();
    await expect(page.getByText("Que oceano banha Portugal continental?")).toBeVisible();
    await expect(page.getByText("Oceano Atlântico.")).toHaveCount(0);

    await page.getByRole("button", { name: "Concluir" }).click();
    await expect(page.getByRole("status")).toContainText("Sessão concluída.");
});
```

5. Explicação do código.

Os dois primeiros testes exercitam a unidade de estado sem browser. Isto é rápido e prova que o modo exercício esconde respostas e que o modo revisão mantém respostas visíveis.

O terceiro teste usa a rota real `/app/areas/:id/ferramentas`, mas interceta apenas as respostas dos endpoints de artefactos para evitar depender de materiais reais ou do provider de IA. A sessão continua real, feita pelo login da UI, mantendo o contrato de cookies HttpOnly.

Os dados de teste são mínimos: perguntas gerais, fonte curta e sem conteúdo integral de materiais. Isto respeita privacidade e permite evidence limpa para PR.

6. Validação do passo.

Resultado esperado: `npm run test:e2e -- mf8-flashcards.spec.ts` passa em `apps/web` quando o ambiente E2E estiver disponível.

7. Cenário negativo/erro esperado.

Se a resposta aparecer antes do clique em "Mostrar resposta", o teste falha. Essa falha indica que o modo exercício deixou de treinar memória ativa.

### Passo 7 - Validar, recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com provas objetivas, riscos explícitos e handoff para a fase de verificação de testes.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/features/mf8/flashcard-practice.ts`
    - REVER: `apps/web/src/components/ai/FlashcardsPanel.tsx`
    - REVER: `apps/web/tests/e2e/mf8-flashcards.spec.ts`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
    - LOCALIZAÇÃO: validação final, critérios de aceite, evidence e handoff.

3. Instruções do que fazer.

Executa e regista:

- `npm run build` em `apps/web`;
- `npm run test:e2e -- mf8-flashcards.spec.ts` em `apps/web`, quando o ambiente E2E estiver disponível;
- pesquisa textual de termos proibidos nos guias MF8;
- `git diff --check`;
- `bash scripts/validate-planificacao.sh`.

No PR/evidence, regista expected result, observed result, comando, ficheiros alterados, negativo testado e risco residual. Não incluas prompts privados, cookies, tokens, materiais integrais ou respostas privadas de alunos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de validação e evidence; o código já foi entregue nos passos anteriores.

5. Explicação do código.

Não há código novo. A utilidade deste passo é provar que o BK ficou pronto para o próximo. O `BK-MF8-15` vai verificar testes atuais e criar testes em falta; por isso precisa de saber exatamente que suite de flashcards existe e que comportamento cobre.

6. Validação do passo.

Resultado esperado:

- build frontend sem erros TypeScript;
- teste Playwright de flashcards com caminho feliz e negativos principais;
- ausência de caminhos privados nos guias;
- validador de planificação em PASS;
- relatório MF8 atualizado com estado final.

7. Cenário negativo/erro esperado.

Se o Playwright falhar por ambiente, regista o erro observado como risco operacional e mantém as outras validações documentais. Se falhar por seletor ou comportamento, corrige o guia/código antes de marcar o BK como pronto.

#### Critérios de aceite

- Header e metadados iguais à matriz, backlog, contrato de campos e anexo de owner.
- O BK entrega `RF12` sem alterar requisitos fora do escopo.
- O backend não recebe endpoints duplicados nem novos modelos para flashcards.
- `FlashcardsPanel` mostra modo exercício, modo revisão, revelar resposta, avanço, conclusão e reinício.
- O estado de treino fica apenas em memória React e não usa `localStorage` nem `sessionStorage`.
- A UI mantém fontes via `ArtifactSources` e não expõe materiais completos.
- Código TypeScript/TSX inclui JSDoc nos elementos principais e comentários didáticos nas decisões relevantes.
- Testes Playwright cobrem estado local, resposta escondida, revelar resposta, avanço e conclusão.
- Evidence de PR/defesa inclui caminho feliz e pelo menos um negativo observável.

Erros comuns a evitar:

- Criar endpoint novo para listar flashcards quando `listStudyTools(...)` já existe.
- Guardar progresso local em storage sem contrato de privacidade.
- Mostrar resposta no modo exercício antes de o aluno clicar.
- Remover fontes do cartão e quebrar explicabilidade.
- Testar só a existência do botão sem validar o comportamento observável.

#### Validação final

- `cd apps/web && npm run build`
- `cd apps/web && npm run test:e2e -- mf8-flashcards.spec.ts`
- Executar a pesquisa textual obrigatória de linguagem interna nos guias MF8.
- Executar a pesquisa textual obrigatória de caminhos privados nos guias MF8.
- `git diff --check`
- `bash scripts/validate-planificacao.sh`

Expected results:

- build frontend sem erros;
- Playwright passa no ficheiro `mf8-flashcards.spec.ts`;
- pesquisas sem ocorrências proibidas;
- `git diff --check` sem output;
- validador de planificação com `overall_pass=true`;
- nenhum dado sensível em logs/evidence.

#### Evidence para PR/defesa

- `pr`: `BK-MF8-14` entrega exercício/revisão de flashcards sobre `RF12`, sem criar backend novo.
- `proof`: screenshot ou output do teste mostrando pergunta, resposta escondida, resposta revelada e sessão concluída.
- `neg`: prova de que a resposta não aparece antes do clique em "Mostrar resposta".
- `privacy`: nota de que estado local não usa storage e que fontes são metadados curtos.
- `handoff`: `BK-MF8-15` pode usar `mf8-flashcards.spec.ts` como teste existente a inventariar.

#### Handoff

O próximo BK é `BK-MF8-15`. Ele pode assumir que `BK-MF8-14` deixa:

- `apps/web/src/features/mf8/flashcard-practice.ts`;
- `apps/web/src/components/ai/FlashcardsPanel.tsx` com exercício/revisão;
- `apps/web/tests/e2e/mf8-flashcards.spec.ts`;
- contrato frontend baseado em artefactos `FLASHCARDS` já autorizados pelo backend.

`BK-MF8-15` deve verificar se estes testes existem no projeto aplicado, se correm no ambiente E2E e se ainda falta cobertura noutras áreas críticas.

#### Changelog

- `2026-07-02`: correção focada; removida linguagem interna, clarificado contrato backend existente, entregue componente frontend completo, estado local de prática, teste Playwright real e handoff testável para BK-MF8-15.
