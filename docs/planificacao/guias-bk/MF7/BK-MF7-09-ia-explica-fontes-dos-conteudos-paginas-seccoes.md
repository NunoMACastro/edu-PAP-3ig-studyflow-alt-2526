# BK-MF7-09 - IA explica fontes dos conteúdos (páginas/secções).

## Header

- `doc_id`: `GUIA-BK-MF7-09`
- `bk_id`: `BK-MF7-09`
- `macro`: `MF7`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF31`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-10`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais reforçar a resposta de IA para devolver citações compreensíveis. O resultado observável é uma resposta com `sourceLabel`, `locator` e `excerpt`, permitindo ao aluno ver de que página, secção ou chunk veio a explicação.

No fim, a equipa consegue demonstrar `RNF31` com policy backend, integração em `SourceGroundedAiService.toCitation(...)`, apresentação segura do excerto no frontend, testes P0 e evidence sem materiais completos nem dados privados.

#### Importância

`RNF31` liga IA a confiança pedagógica. Se a IA responde sem fonte, o aluno não consegue verificar o conteúdo e a aplicação falha o contrato anti-alucinação já trabalhado em MF6.

Este BK é incremental: consome os contratos de fontes autorizadas, guardrails e isolamento de IA de MF6, usa o health-check de `BK-MF7-08` como pré-condição operacional e prepara `BK-MF7-10`, que separa perfis de IA por aluno, turma e professor.

#### Scope-in

- Criar `normalizePublicCitation(...)` para normalizar citações públicas.
- Integrar `normalizePublicCitation(...)` dentro de `SourceGroundedAiService.toCitation(...)`.
- Mostrar `sourceLabel`, `locator` e `excerpt` no painel frontend de IA com fontes.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo toca dados privados ou IA.
- Validar caminho principal e negativos P0: sem fonte localizável, sem excerto verificável e fonte proibida antes da fachada.
- Produzir evidence com expected/observed.

#### Scope-out

- Criar requisitos novos fora de `RNF31`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.
- Criar outro endpoint para IA com fontes.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, e `SourceGroundedAiService` já valida cada `sourceJobId` com `findReadableDoneJob(...)`, mas a citação pública ainda não tem uma policy isolada para normalizar página/secção/excerto.
- Estado depois: a app passa a ter `normalizePublicCitation(...)`, frontend com `excerpt` limitado e testes P0 que provam bloqueio antes da fachada quando a fonte não é autorizada.

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Citação pública:** parte pequena e segura da fonte, devolvida com label, localização e excerto.
- **Locator:** indicação curta de página, secção ou chunk processado.
- **Excerto:** fragmento limitado da fonte, suficiente para explicar origem sem devolver o material completo.
- **Provider IA:** integração isolada que gera a resposta depois de o backend validar fontes autorizadas.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.

#### Conceitos teóricos essenciais

- **Citação:** referência concreta ao material usado na resposta. Vem de um chunk indexado e segue para o frontend como prova de origem.
- **Locator:** localização legível da fonte. Pode ser página, secção ou chunk, conforme o material processado. Evita uma resposta vaga como "usei os teus materiais".
- **Fonte processável:** texto extraído e autorizado que a IA pode usar. Se não houver fontes processáveis, a resposta deve falhar de forma honesta.
- **Policy backend:** função pequena que centraliza uma regra de segurança ou domínio. Aqui impede citações vazias e limita excertos antes de devolver dados ao frontend.
- **Ownership/membership:** validação no backend que confirma se o aluno pode ler cada fonte. Neste BK essa validação continua em `findReadableDoneJob(actor, jobId)`.
- **Provider isolado:** serviço externo ou interno de IA chamado só depois de validar fontes. Evita que o frontend escolha fontes como autoridade.
- **Explicabilidade:** capacidade de mostrar de onde veio uma resposta. Neste BK é feita com `sourceLabel`, `locator` e `excerpt`.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado completo.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint: reutiliza `POST /api/ai/source-grounded-answers`.
- Modelo/schema: reutiliza `SourceGroundedCitation` dentro de `SourceGroundedAiAnswer`.
- Policy: cria `apps/api/src/modules/source-grounded-ai/citation-policy.ts`.
- Service: edita `SourceGroundedAiService.toCitation(...)` para chamar `normalizePublicCitation(...)`.
- Controller/route: `SourceGroundedAiController` continua a delegar no service.
- Guard/middleware: preserva `SessionGuard` no endpoint privado.
- Cliente API: preserva `askSourceGroundedAi(...)`, que usa o cliente MF3 com `credentials: "include"`.
- Frontend: edita `SourceGroundedAiPanel` para mostrar `sourceLabel`, `locator` e `excerpt`.
- Segurança/autorização: cada job é autorizado no backend antes de ser usado como fonte.
- Testes: policy com caminho principal e negativos; service com negativo de fonte proibida antes da fachada.
- Handoff para o próximo BK: `BK-MF7-10` separa perfis e contextos de IA usando a mesma disciplina de fontes autorizadas.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/source-grounded-ai/citation-policy.ts`
- CRIAR: `apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- EDITAR: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- REVER: `apps/api/src/modules/material-index/schemas/material-index-job.schema.ts`
- REVER: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-09` entrega `RNF31` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF31` em `docs/RNF.md`, confirma a linha `BK-MF7-09` na matriz e regista as decisões seguintes:

- `CANONICO`: `RNF31` exige fontes com páginas/secções.
- `CANONICO`: `BK-MF7-09` é `P0`, `S12`, owner `Kaua`, apoio `Guilherme`.
- `DERIVADO`: usar `locator` como campo comum para página, secção ou chunk.
- `DERIVADO`: limitar `excerpt` para não expor documento inteiro.
- `DERIVADO`: normalizar citação no backend antes de persistir e devolver ao frontend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental porque fixa o contrato antes da implementação.

5. Explicação do código.

Não existe código neste passo. A implementação só começa depois de confirmar requisito, domínio, sequência e fronteiras de segurança.

6. Validação do passo.

Resultado esperado: `BK-MF7-09` continua ligado a `RNF31`, `prioridade: P0`, `sprint: S12` e `proximo_bk: BK-MF7-10`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift na evidence da PR antes de alterar código.

### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de explicabilidade de IA com fontes.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
    - REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
    - REVER: `apps/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`
    - REVER: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
    - REVER: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
    - LOCALIZAÇÃO: `SourceGroundedAiService.ask(...)`, `SourceGroundedAiService.toCitation(...)`, tipo `SourceGroundedCitation`, tipo `SourceGroundedAnswer` e painel React.

3. Instruções do que fazer.

Confirma que a MF6 já entregou segurança, recovery e isolamento de IA. Este BK não substitui `SessionGuard`, ownership, membership, quotas ou guardrails; usa essas peças onde existirem. O ponto crítico é manter esta ordem:

1. `SourceGroundedAiController` recebe sessão autenticada.
2. `SourceGroundedAiService.ask(...)` chama `findReadableDoneJob(actor, jobId)`.
3. Só depois de cada job ser autorizado é criada a citação pública.
4. Só depois de existirem citações válidas é chamada a `GovernedAiExecutionService`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é preparatório porque identifica os contratos que não devem ser duplicados.

5. Explicação do código.

Não existe código neste passo. O aluno deve saber que cada ficheiro novo encaixa num contrato anterior: a policy normaliza citações, mas não decide ownership, membership, quotas nem guardrails.

6. Validação do passo.

Resultado esperado: lista curta de ficheiros existentes e decisão clara sobre o ponto exato de criação ou edição.

7. Cenário negativo/erro esperado.

Se a solução criar outro endpoint ou outro schema para uma responsabilidade já existente, rejeita a abordagem e usa `SourceGroundedAiService`.

### Passo 3 - Criar a policy de citações públicas

1. Objetivo funcional do passo no contexto da app.

Construir o ficheiro que torna `RNF31` implementável e testável.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/source-grounded-ai/citation-policy.ts`
    - LOCALIZAÇÃO: ficheiro completo `apps/api/src/modules/source-grounded-ai/citation-policy.ts`.

3. Instruções do que fazer.

Cria o ficheiro com o código abaixo. Mantém nomes, imports e mensagens em português de Portugal. Não guardes dados sensíveis nem deixes decisões de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/citation-policy.ts
export type PublicCitation = {
    sourceJobId: string;
    materialId: string;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};

const PUBLIC_EXCERPT_MAX_LENGTH = 420;

/**
 * Normaliza citações públicas para respostas de IA com fontes.
 *
 * @param citation Citação candidata criada depois de validar a fonte.
 * @returns Citação segura para persistência e resposta pública.
 */
export function normalizePublicCitation(citation: PublicCitation): PublicCitation {
    const sourceLabel = citation.sourceLabel.trim();
    const locator = citation.locator.trim();
    const excerpt = citation.excerpt.trim();

    if (!sourceLabel) {
        throw new Error("A citação precisa de nome de fonte.");
    }

    if (!locator) {
        throw new Error("A citação precisa de página, secção ou chunk.");
    }

    if (!excerpt) {
        throw new Error("A citação precisa de excerto verificável.");
    }

    // O excerto prova a origem sem devolver o material completo ao frontend.
    return {
        ...citation,
        sourceLabel,
        locator,
        excerpt: excerpt.slice(0, PUBLIC_EXCERPT_MAX_LENGTH),
    };
}
```

5. Explicação do código.

`PublicCitation` representa a parte pública de uma fonte autorizada: identificadores técnicos, nome legível, localização e excerto. `normalizePublicCitation(...)` valida `sourceLabel`, `locator` e `excerpt`, porque uma citação sem qualquer desses campos não ajuda o aluno a verificar a resposta. O limite de `420` caracteres evita devolver páginas inteiras ou material privado completo.

Esta policy não decide se o aluno pode ler a fonte. Essa decisão continua antes, em `findReadableDoneJob(actor, jobId)`. A policy só recebe uma citação candidata depois de o backend já ter confirmado acesso.

6. Validação do passo.

Executa uma leitura técnica do ficheiro e confirma que não há imports inexistentes, dados privados em logs, casts inseguros, payloads sem tipo ou decisões de autorização feitas no frontend.

7. Cenário negativo/erro esperado.

Se removeres a validação ou o comentário didático, o BK fica incompleto; se a falha expuser dados privados ou permitir mistura de contextos, bloqueia a PR.

### Passo 4 - Integrar a policy no SourceGroundedAiService

1. Objetivo funcional do passo no contexto da app.

Ligar `normalizePublicCitation(...)` ao ponto correto da app sem duplicar módulos.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
    - REVER: `apps/api/src/modules/material-index/schemas/material-index-job.schema.ts`
    - LOCALIZAÇÃO: import no topo do ficheiro e método privado completo `toCitation(...)`.

3. Instruções do que fazer.

Importa `normalizePublicCitation` em `source-grounded-ai.service.ts` e usa-o dentro de `toCitation(...)`. A autorização do job continua a acontecer em `findReadableDoneJob(...)`; este BK só normaliza a citação pública e limita o excerto devolvido ao frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts
import { normalizePublicCitation } from "./citation-policy.js";

// ...

/**
 * Converte um chunk interno numa citação pública.
 *
 * @param job Job autorizado.
 * @param chunk Chunk indexado.
 * @returns Citação com origem legível e excerto limitado.
 */
private toCitation(
    job: MaterialIndexJobView,
    chunk: MaterialTextChunk,
): SourceGroundedCitation {
    // A autorização já aconteceu em findReadableDoneJob(...); aqui só normalizamos a parte pública.
    return normalizePublicCitation({
        sourceJobId: job._id,
        materialId: job.materialId,
        sourceLabel: chunk.sourceLabel,
        locator: chunk.locator,
        excerpt: chunk.text,
    });
}
```

5. Explicação do código.

O import liga o service à policy nova. O método `toCitation(...)` fica completo e explícito: recebe um job já autorizado, recebe o chunk indexado e devolve a citação normalizada. Ao passar `chunk.text` completo para a policy, o corte de `excerpt` fica centralizado num só ficheiro e todos os fluxos source-grounded usam a mesma regra.

Se `findReadableDoneJob(actor, jobId)` rejeitar a fonte, `toCitation(...)` e a fachada não recebem excertos proibidos.

6. Validação do passo.

Resultado esperado: uma resposta de `POST /api/ai/source-grounded-answers` contém citações com `sourceLabel`, `locator` e `excerpt` limitado, e falha quando a localização ou o excerto estão vazios.

7. Cenário negativo/erro esperado.

Se a integração contornar `SessionGuard`, ownership, membership, quotas ou guardrails já existentes, a alteração deve ser revertida.

### Passo 5 - Mostrar o excerto no frontend

1. Objetivo funcional do passo no contexto da app.

Garantir que o aluno vê a origem da resposta sem receber o material completo.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
    - REVER: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
    - LOCALIZAÇÃO: componente completo `SourceGroundedAiPanel`.

3. Instruções do que fazer.

Substitui o componente pelo código abaixo ou aplica a mesma alteração ao componente existente. Mantém `askSourceGroundedAi(...)` como cliente tipado e não coloques tokens, sessões ou decisões de autorização no frontend.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx
/**
 * Implementa a funcionalidade frontend de IA com fontes obrigatórias e o respetivo contrato com a API.
 */
import { FormEvent, useState } from "react";
import {
    askSourceGroundedAi,
    SourceGroundedAnswer,
} from "./ask-source-grounded-ai.js";

/**
 * Painel de resposta com citações obrigatórias.
 *
 * @returns Formulário e resposta fundamentada.
 */
export function SourceGroundedAiPanel() {
    const [sourceJobIds, setSourceJobIds] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<SourceGroundedAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a ação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // O frontend envia apenas ids de jobs e pergunta; o backend decide se as fontes são legíveis.
            setAnswer(
                await askSourceGroundedAi({
                    sourceJobIds: sourceJobIds
                        .split(",")
                        .map((sourceJobId) => sourceJobId.trim())
                        .filter(Boolean),
                    question,
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao responder.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Resposta com fontes</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Jobs de indexação
                    <input
                        value={sourceJobIds}
                        onChange={(event) => setSourceJobIds(event.target.value)}
                    />
                </label>
                <label className="block">
                    Pergunta
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
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>
            {answer ? (
                <div className="space-y-3 text-sm">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    {answer.citations.map((citation) => (
                        <article
                            className="rounded-md border border-slate-200 p-3"
                            key={`${citation.sourceJobId}-${citation.locator}`}
                        >
                            <p className="font-medium text-slate-900">
                                {citation.sourceLabel} · {citation.locator}
                            </p>
                            {/* O excerto é limitado no backend para explicar a origem sem expor o material completo. */}
                            <p className="mt-1 text-slate-700">{citation.excerpt}</p>
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

O componente continua a usar `askSourceGroundedAi(...)`, que herda o cliente autenticado com cookies. O formulário recolhe apenas ids de jobs e pergunta; não recolhe `userId`, role, turma, ownership ou permissões, porque essas decisões pertencem ao backend.

Na resposta, cada citação passa a mostrar `sourceLabel`, `locator` e `excerpt`. O excerto vem limitado pelo backend, por isso o frontend não precisa de confiar em si próprio para proteger material privado. O comentário junto do excerto explica a razão de segurança e privacidade.

6. Validação do passo.

Resultado esperado: quando a API devolve uma citação, a UI mostra a resposta, o nome da fonte, a localização e o excerto limitado. O botão fica desativado sem jobs ou sem pergunta suficiente.

7. Cenário negativo/erro esperado.

Se tentares decidir ownership, membership, role, quota ou fonte autorizada neste componente, remove essa lógica. O frontend só apresenta dados já validados pelo backend.

### Passo 6 - Adicionar testes P0 de citação e acesso

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato de `BK-MF7-09` funciona e falha de forma controlada.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts`
    - EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo `citation-policy.spec.ts` e teste adicional dentro de `SourceGroundedAiService`.

3. Instruções do que fazer.

Cria `citation-policy.spec.ts` com caminho principal e três negativos. Depois adiciona o teste de fonte proibida ao ficheiro de testes do service, dentro do `describe("SourceGroundedAiService", ...)` que já existe.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts
import { normalizePublicCitation } from "./citation-policy.js";

describe("normalizePublicCitation", () => {
    it("normaliza campos públicos e limita o excerto", () => {
        const result = normalizePublicCitation({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: " PDF de Matemática ",
            locator: " página 2 ",
            excerpt: "x".repeat(500),
        });

        // O caminho principal prova rastreabilidade sem devolver a página inteira.
        expect(result).toEqual({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: "PDF de Matemática",
            locator: "página 2",
            excerpt: "x".repeat(420),
        });
    });

    it("recusa citação sem nome de fonte", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: " ",
                locator: "página 2",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citação precisa de nome de fonte.");
    });

    it("recusa citação sem localização verificável", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matemática",
                locator: "",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citação precisa de página, secção ou chunk.");
    });

    it("recusa citação sem excerto verificável", () => {
        // Sem excerto verificável, a UI não consegue mostrar ao aluno de onde veio a resposta.
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matemática",
                locator: "página 2",
                excerpt: " ",
            }),
        ).toThrow("A citação precisa de excerto verificável.");
    });
});
```

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts
it("bloqueia fonte proibida antes da fachada governada", async () => {
    const { governedAiExecutionService, answerModel, materialIndexService, service } = makeService();
    materialIndexService.findReadableDoneJob.mockRejectedValueOnce(
        new Error("MATERIAL_INDEX_ACCESS_DENIED"),
    );

    await expect(
        service.ask(student, {
            sourceJobIds: [jobId],
            question: "Explica esta fonte.",
        }),
    ).rejects.toThrow("MATERIAL_INDEX_ACCESS_DENIED");

    // A validação de leitura acontece antes do prompt; se falha, o provider não recebe dados.
    expect(governedAiExecutionService.execute).not.toHaveBeenCalled();
    expect(answerModel.create).not.toHaveBeenCalled();
});
```

5. Explicação do código.

`citation-policy.spec.ts` prova o caminho principal e três negativos P0: nome de fonte vazio, localização vazia e excerto vazio. Estes negativos protegem a explicabilidade: uma citação sem nome, localização ou excerto não permite verificar a resposta.

O teste prova que uma fonte rejeitada impede a chamada à fachada e a persistência, preservando ownership/membership.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run test:unit -- citation-policy source-grounded-ai
```

Resultado esperado: os testes de policy passam, os testes source-grounded passam e o negativo de fonte proibida confirma que o provider não é chamado.

7. Cenário negativo/erro esperado.

Se o teste só confirmar que a função existe, sem validar comportamento ou erro esperado, não é evidence suficiente para `P0`.

### Passo 7 - Validar por camada e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-09` com prova técnica e instrução clara para `BK-MF7-10`.

2. Ficheiros envolvidos:
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
    - LOCALIZAÇÃO: comandos de validação, evidence de PR e handoff.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Para `P0`, a PR deve ter teste unitário, integração source-grounded e três negativos. A evidence deve separar backend, frontend, documentação e privacidade.

4. Código completo, correto e integrado com a app final.

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- citation-policy source-grounded-ai
npm --prefix apps/web run build
```

5. Explicação do código.

O build backend confirma imports e tipos. Os testes unitários provam policy, source-grounded e negativos P0. O build frontend confirma que `SourceGroundedAiPanel` continua tipado com `SourceGroundedAnswer` e apresenta `excerpt` sem quebrar a aplicação.

Esta validação não depende de segredos locais nem deve guardar prompts privados, respostas completas de IA ou materiais privados na evidence.

6. Validação do passo.

Resultados esperados: comandos verdes ou bloqueio explicado com caminho, comando e erro observado.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se a falha vier de dívida externa, regista o caminho e o erro exato.

#### Critérios de aceite

- `RNF31` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- `normalizePublicCitation(...)` valida `sourceLabel`, `locator` e `excerpt`.
- `SourceGroundedAiService.toCitation(...)` usa `normalizePublicCitation(...)`.
- O frontend apresenta `sourceLabel`, `locator` e `excerpt`.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os negativos mínimos respeitam a prioridade `P0`.

#### Validação final

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- citation-policy source-grounded-ai
npm --prefix apps/web run build
rg -n "console\\.log|logger\\.|prompt" apps/api/src/modules/source-grounded-ai apps/web/src/features/source-grounded-ai
rg -n "cookie|password" apps/api/src/modules/source-grounded-ai apps/web/src/features/source-grounded-ai
rg -n "authorization|bearer" apps/api/src/modules/source-grounded-ai apps/web/src/features/source-grounded-ai
rg -n "sessionStorage" apps/api/src/modules/source-grounded-ai apps/web/src/features/source-grounded-ai
```

Resultado esperado:

- `build` backend passa.
- `test:unit` passa com policy e source-grounded.
- `build` frontend passa.
- pesquisas não encontram logs de prompts privados, cookies, passwords, credenciais de autorização ou storage de sessão no fluxo source-grounded.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-09`.
- `proof_backend_build`: output de `npm --prefix apps/api run build`.
- `proof_backend_tests`: output de `npm --prefix apps/api run test:unit -- citation-policy source-grounded-ai`.
- `proof_frontend_build`: output de `npm --prefix apps/web run build`.
- `proof_negativos`: erros controlados para fonte sem nome, localização/excerto e fonte proibida antes da fachada.
- `proof_fontes`: lista limitada de `sourceLabel`, `locator` e `excerpt`.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF31` melhora a aplicação para alunos e professores.

#### Handoff

`BK-MF7-10` separa perfis e contextos de IA usando a mesma disciplina de fontes autorizadas.

O próximo BK deve reutilizar:

- `normalizePublicCitation(...)`;
- `SourceGroundedAiService.toCitation(...)` já normalizado;
- UI que apresenta `sourceLabel`, `locator` e `excerpt`;
- negativos que provam bloqueio antes da fachada quando a fonte não é autorizada.

O próximo BK não deve criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-07-10`: guia alinhado com a fachada governada, mantendo citações públicas normalizadas e negativos antes da execução.
