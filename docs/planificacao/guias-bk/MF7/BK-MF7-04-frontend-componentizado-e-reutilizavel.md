# BK-MF7-04 - Frontend componentizado e reutilizável.

## Header

- `doc_id`: `GUIA-BK-MF7-04`
- `bk_id`: `BK-MF7-04`
- `macro`: `MF7`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF26`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-05`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md`
- `last_updated`: `2026-06-28`

#### Objetivo

Neste BK vais extrair um componente reutilizável para estados de página. O resultado observável é uma peça React tipada que apresenta loading, erro, vazio e sucesso de forma consistente em páginas de aluno e professor.

No fim, a equipa consegue demonstrar `RNF26` com código, validação e evidence, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF26` reduz duplicação e melhora manutenção. Como a MF5 já definiu responsividade, acessibilidade e feedback, este BK transforma esses padrões em componentes reutilizáveis em vez de repetir blocos visuais em cada página.

Este BK é incremental: consome contratos já fechados nas MFs anteriores e entrega uma peça pequena, testável e explicável para o próximo BK.

#### Scope-in

- Implementar ou documentar o contrato de componentização frontend.
- Usar caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Validar pelo menos um caminho principal e um cenário negativo.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo tocar dados privados ou IA.
- Produzir evidence com expected/observed.

#### Scope-out

- Criar requisitos novos fora de `RNF26`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, e o frontend já tem páginas e clientes API, mas ainda há estados assíncronos repetidos em páginas de aluno/professor.
- Estado depois: a app passa a ter `AsyncStateBlock` e integração prevista em `StudyToolsPage` e `TeacherOfficialMaterialsPage`, preparando documentação técnica em `BK-MF7-05`.

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Componentização frontend:** foco técnico deste BK para cumprir `RNF26`.

#### Conceitos teóricos essenciais

- **Componente reutilizável:** bloco UI com props claras e sem regras de negócio escondidas.
- **Estado assíncrono:** loading, erro, vazio ou conteúdo depois de uma chamada HTTP.
- **Acessibilidade:** mensagens de erro precisam de ser legíveis e associadas a estado visível.
- **Erro comum a evitar:** deixar o componente visual decidir ownership, role ou membership.
- **Segurança no backend:** sessão, role, ownership e membership são validados por controllers/services, não por componentes visuais.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint(s): não cria endpoint; consome clientes API existentes.
- Modelo/schema: não cria schema.
- Service(s): não cria service backend.
- Frontend component: componente React `AsyncStateBlock`.
- Guard/middleware: reutiliza `SessionGuard` quando o endpoint for privado; health e operação pública nunca expõem dados pessoais.
- Cliente API: usa clientes existentes com `credentials: 'include'` quando houver frontend autenticado.
- Segurança/autorização: não decide permissões no frontend; apenas mostra estados recebidos de endpoints protegidos.
- Testes: validação manual e build TypeScript/Vite.
- Handoff para o próximo BK: `BK-MF7-05` documenta o componente no mapa técnico mínimo.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/components/ui/AsyncStateBlock.tsx`
- EDITAR: `apps/web/src/pages/student/StudyToolsPage.tsx`
- EDITAR: `apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-04` entrega `RNF26` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF26` em `docs/RNF.md`, confirma a linha `BK-MF7-04` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF26` exige frontend componentizado e reutilizável.
- `DERIVADO`: criar componente de estado assíncrono comum porque várias páginas já repetem loading/error/empty.
- `DERIVADO`: manter `credentials: 'include'` nos clientes API, nunca no componente visual.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-04` continua ligado a `RNF26`, `prioridade: P0`, `sprint: S11` e `proximo_bk: BK-MF7-05`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.
### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de componentização frontend.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md`
- LOCALIZAÇÃO: módulos já criados nas macrofases anteriores e ponto de integração deste BK.

3. Instruções do que fazer.

Confirma que a MF6 já entregou segurança, recovery e isolamento de IA. Este BK não substitui `SessionGuard`, ownership, membership, quotas ou guardrails; usa essas peças onde existirem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é evitar duplicação. O aluno deve saber que cada ficheiro novo encaixa num contrato anterior.

6. Validação do passo.

Resultado esperado: lista curta de ficheiros existentes e decisão clara sobre o ponto exato de criação ou edição.

7. Cenário negativo/erro esperado.

Se a solução criar outro endpoint ou outro schema para uma responsabilidade já existente, rejeita a abordagem e usa o service existente.
### Passo 3 - Criar o componente reutilizável

1. Objetivo funcional do passo no contexto da app.

Criar a peça comum que transforma `RNF26` em código aplicável nas páginas reais da app.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/components/ui/AsyncStateBlock.tsx`
- LOCALIZAÇÃO: ficheiro completo `apps/web/src/components/ui/AsyncStateBlock.tsx`.

3. Instruções do que fazer.

Cria o ficheiro com o código abaixo. Mantém nomes, imports e mensagens em português de Portugal. O componente recebe estado já calculado pela página; não faz chamadas HTTP, não decide permissões e não guarda dados sensíveis.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/components/ui/AsyncStateBlock.tsx
/**
 * Apresenta estados assíncronos reutilizáveis nas páginas StudyFlow.
 */
import type { ReactNode } from "react";

export type AsyncStateBlockProps = {
    isLoading: boolean;
    error?: string;
    isEmpty: boolean;
    emptyMessage: string;
    children: ReactNode;
};

/**
 * Componente visual para loading, erro, vazio e conteúdo com dados.
 *
 * @param props Estado assíncrono calculado pela página chamadora.
 * @returns Bloco React acessível e reutilizável.
 */
export function AsyncStateBlock(props: AsyncStateBlockProps) {
    if (props.isLoading) {
        return (
            <p className="text-sm text-slate-600" aria-live="polite">
                A carregar dados...
            </p>
        );
    }

    if (props.error) {
        // A mensagem fica visível, mas autorização e ownership continuam a pertencer ao backend.
        return <p className="sf-error" role="alert">{props.error}</p>;
    }

    if (props.isEmpty) {
        // O estado vazio fica explícito para evitar listas silenciosamente sem conteúdo.
        return (
            <p className="text-sm text-slate-600" aria-live="polite">
                {props.emptyMessage}
            </p>
        );
    }

    return <>{props.children}</>;
}
```

5. Explicação do código.

O componente concentra quatro estados repetidos: carregamento, erro, vazio e conteúdo. A página chamadora continua responsável por chamar a API, receber dados tipados e decidir que mensagem mostrar. Isto mantém a segurança no backend e deixa o frontend apenas com a responsabilidade de apresentação.

6. Validação do passo.

Confirma que o ficheiro importa apenas `type ReactNode`, exporta `AsyncStateBlock` e não lê sessão, role, ownership, quotas, fontes IA, storage do browser ou variáveis de ambiente.

7. Cenário negativo/erro esperado.

Se a mensagem de erro for escondida ou se o componente passar a decidir permissões, o BK falha: erro visível pertence ao frontend; autorização pertence aos endpoints protegidos.

### Passo 4 - Integrar o componente nas páginas reais

1. Objetivo funcional do passo no contexto da app.

Substituir estados repetidos em páginas existentes de aluno e professor, sem alterar endpoints nem regras de negócio.

2. Ficheiros envolvidos:
- EDITAR: `apps/web/src/pages/student/StudyToolsPage.tsx`
- EDITAR: `apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`
- LOCALIZAÇÃO: imports, estados de erro/carregamento e zonas de lista em `StudyToolsPage` e `TeacherOfficialMaterialsPage`.

3. Instruções do que fazer.

Importa `AsyncStateBlock` nas duas páginas indicadas e substitui os blocos locais repetidos de loading, erro e vazio. Mantém o estado de carregamento inicial alinhado com a primeira chamada remota, separa erros de carregamento de erros de ação e não mudes clientes API, endpoints, sessão, permissões ou ownership: o frontend só apresenta estados vindos de chamadas já protegidas.

4. Código completo, correto e integrado com a app final.

Substitui o conteúdo final de `StudyToolsPage` pelo ficheiro abaixo. A página já vinha de BKs anteriores, por isso este passo não recria clientes API nem altera o fluxo de quiz em background entregue na MF6.

```tsx
// apps/web/src/pages/student/StudyToolsPage.tsx
/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { type FormEvent, useEffect, useState } from "react";
import { ExplanationPanel } from "../../components/ai/ExplanationPanel.js";
import { FlashcardsPanel } from "../../components/ai/FlashcardsPanel.js";
import { QuizPanel } from "../../components/ai/QuizPanel.js";
import { SummaryPanel } from "../../components/ai/SummaryPanel.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import {
    createQuizGenerationJob,
    generateStudyTool,
    generateSummary,
    getQuizGenerationJob,
    listStudyTools,
    listSummaries,
    type AiArtifact,
    type QuizGenerationJob,
    type StudyToolType,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudyToolsPageProps = {
    studyAreaId: string;
};

/**
 * Página de resumos e ferramentas IA da área.
 *
 * @param props Identificador da área.
 * @returns Controlos de geração e resultado.
 */
export function StudyToolsPage({ studyAreaId }: StudyToolsPageProps) {
    const [type, setType] = useState<StudyToolType>("EXPLANATION");
    const [topic, setTopic] = useState("");
    const [artifact, setArtifact] = useState<AiArtifact | null>(null);
    const [summaries, setSummaries] = useState<AiArtifact[]>([]);
    const [studyTools, setStudyTools] = useState<AiArtifact[]>([]);
    const [quizJob, setQuizJob] = useState<QuizGenerationJob | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isLoadingExisting, setIsLoadingExisting] = useState(true);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isGeneratingTool, setIsGeneratingTool] = useState(false);

    /**
     * Recarrega artefactos IA já persistidos para a área.
     *
     * @returns Promise resolvida depois de atualizar as listas.
     */
    async function refreshArtifacts(preferredArtifactId?: string): Promise<void> {
        setIsLoadingExisting(true);
        try {
            const [summaryList, toolList] = await Promise.all([
                listSummaries(studyAreaId),
                listStudyTools(studyAreaId),
            ]);
            setSummaries(summaryList);
            setStudyTools(toolList);
            setLoadError(null);
            setArtifact((current) => {
                const allArtifacts = [...summaryList, ...toolList];
                if (preferredArtifactId) {
                    const preferred = allArtifacts.find(
                        (item) => item._id === preferredArtifactId,
                    );
                    if (preferred) return preferred;
                }
                const currentStillExists = allArtifacts.find(
                    (item) => item._id === current?._id,
                );
                return currentStillExists ?? summaryList[0] ?? toolList[0] ?? null;
            });
        } catch (caught) {
            setLoadError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar artefactos.",
            );
        } finally {
            setIsLoadingExisting(false);
        }
    }

    useEffect(() => {
        void refreshArtifacts();
    }, [studyAreaId]);

    useEffect(() => {
        if (!quizJob || !["QUEUED", "PROCESSING"].includes(quizJob.status)) {
            return undefined;
        }

        const timer = window.setInterval(async () => {
            try {
                const nextJob = await getQuizGenerationJob(studyAreaId, quizJob._id);
                setQuizJob(nextJob);
                if (nextJob.status === "DONE" && nextJob.artifactId) {
                    await refreshArtifacts(nextJob.artifactId);
                }
            } catch (caught) {
                // A UI não mostra detalhes técnicos que possam revelar fontes privadas ou prompts.
                setActionError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível atualizar o estado do quiz.",
                );
            }
        }, 1500);

        return () => window.clearInterval(timer);
    }, [quizJob, studyAreaId]);

    /**
     * Gera um resumo para a área.
     *
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleSummary(): Promise<void> {
        if (isGeneratingSummary || isGeneratingTool) return;
        setActionError(null);
        setIsGeneratingSummary(true);
        try {
            const created = await generateSummary(studyAreaId);
            setArtifact(created);
            setSummaries((current) => [created, ...current]);
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Não foi possível gerar.");
        } finally {
            setIsGeneratingSummary(false);
        }
    }

    /**
     * Gera a ferramenta de estudo escolhida.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleTool(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (isGeneratingSummary || isGeneratingTool) return;
        setActionError(null);
        setIsGeneratingTool(true);
        try {
            if (type === "QUIZ") {
                const normalizedTopic = topic.trim();
                const createdJob = await createQuizGenerationJob(studyAreaId, {
                    topic: normalizedTopic || undefined,
                });
                setArtifact(null);
                setQuizJob(createdJob);
                return;
            }
            const created = await generateStudyTool(studyAreaId, { type, topic });
            setArtifact(created);
            setStudyTools((current) => [created, ...current]);
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Não foi possível gerar.");
        } finally {
            setIsGeneratingTool(false);
        }
    }

    const isQuizJobActive =
        quizJob?.status === "QUEUED" || quizJob?.status === "PROCESSING";
    const isGenerating = isGeneratingSummary || isGeneratingTool || isQuizJobActive;
    const hasArtifacts = summaries.length > 0 || studyTools.length > 0;

    return (
        <section className="space-y-6">
            <div className="sf-panel space-y-4">
                <h1 className="text-xl font-bold">IA da área</h1>
                {actionError ? <p className="sf-error" role="alert">{actionError}</p> : null}
                {isGenerating ? (
                    <p className="text-sm text-slate-600">
                        {isGeneratingSummary
                            ? "A gerar resumo..."
                            : isQuizJobActive
                              ? "A preparar quiz em background..."
                              : "A gerar ferramenta..."}
                    </p>
                ) : null}
                {quizJob ? (
                    <p className="text-sm text-slate-600" aria-live="polite">
                        {quizJob.status === "DONE"
                            ? "Quiz pronto para resolver."
                            : quizJob.status === "FAILED"
                              ? quizJob.errorMessage ?? "Não foi possível gerar o quiz."
                              : `Quiz em ${quizJob.status === "QUEUED" ? "fila" : "processamento"}.`}
                    </p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                    <button
                        className="sf-button-secondary"
                        type="button"
                        onClick={() => void handleSummary()}
                        disabled={isGenerating}
                    >
                        {isGeneratingSummary ? "A gerar..." : "Gerar resumo"}
                    </button>
                </div>
                <form className="grid gap-3 md:grid-cols-[180px_1fr_auto]" onSubmit={(event) => void handleTool(event)}>
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value as StudyToolType)}
                        disabled={isGenerating}
                    >
                        <option value="EXPLANATION">Explicação</option>
                        <option value="FLASHCARDS">Cards</option>
                        <option value="QUIZ">Quiz</option>
                    </select>
                    <input
                        value={topic}
                        onChange={(event) => setTopic(event.target.value)}
                        placeholder="Tópico opcional"
                        disabled={isGenerating}
                    />
                    <button className="sf-button-primary" type="submit" disabled={isGenerating}>
                        {isGeneratingTool ? "A gerar..." : "Gerar"}
                    </button>
                </form>
            </div>
            <AsyncStateBlock
                isLoading={isLoadingExisting}
                error={loadError ?? undefined}
                isEmpty={!hasArtifacts}
                emptyMessage="Ainda não há resumos nem ferramentas geradas."
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <ArtifactList
                        artifacts={summaries}
                        emptyText="Ainda não há resumos gerados."
                        onSelect={setArtifact}
                        selectedId={artifact?._id}
                        title="Resumos"
                    />
                    <ArtifactList
                        artifacts={studyTools}
                        emptyText="Ainda não há ferramentas geradas."
                        onSelect={setArtifact}
                        selectedId={artifact?._id}
                        title="Ferramentas"
                    />
                </div>
            </AsyncStateBlock>
            {artifact?.type === "SUMMARY" ? <SummaryPanel artifact={artifact} /> : null}
            {artifact?.type === "EXPLANATION" ? <ExplanationPanel artifact={artifact} /> : null}
            {artifact?.type === "FLASHCARDS" ? <FlashcardsPanel artifact={artifact} /> : null}
            {artifact?.type === "QUIZ" ? (
                <QuizPanel artifact={artifact} studyAreaId={studyAreaId} />
            ) : null}
        </section>
    );
}

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type ArtifactListProps = {
    artifacts: AiArtifact[];
    emptyText: string;
    onSelect: (artifact: AiArtifact) => void;
    selectedId?: string;
    title: string;
};

/**
 * Lista artefactos já persistidos da área.
 *
 * @param props Artefactos, seleção e texto vazio.
 * @returns Lista compacta de artefactos.
 */
function ArtifactList({
    artifacts,
    emptyText,
    onSelect,
    selectedId,
    title,
}: ArtifactListProps) {
    return (
        <div className="sf-panel space-y-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <AsyncStateBlock
                isLoading={false}
                isEmpty={artifacts.length === 0}
                emptyMessage={emptyText}
            >
                <ul className="space-y-2">
                    {artifacts.map((item) => {
                        // A API já filtra os artefactos pela área autenticada antes da lista renderizar.
                        return (
                            <li key={item._id}>
                                <button
                                    className={
                                        item._id === selectedId
                                            ? "sf-button-primary w-full text-left"
                                            : "sf-button-secondary w-full text-left"
                                    }
                                    onClick={() => onSelect(item)}
                                    type="button"
                                >
                                    {artifactLabel(item)}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </AsyncStateBlock>
        </div>
    );
}

/**
 * Obtém uma etiqueta curta para um artefacto.
 *
 * @param artifact Artefacto IA.
 * @returns Texto visível na lista.
 */
function artifactLabel(artifact: AiArtifact): string {
    const title = artifact.contentJson.title;
    if (typeof title === "string" && title.trim()) return title;
    if (artifact.type === "FLASHCARDS") return "Cards";
    if (artifact.type === "QUIZ") return "Quiz";
    return artifact.type === "EXPLANATION" ? "Explicação" : "Resumo";
}
```

Substitui o conteúdo final de `TeacherOfficialMaterialsPage` pelo ficheiro abaixo. A página já vinha da MF1 e continua a usar os mesmos clientes API, incluindo o painel de importação externa da MF5.

```tsx
// apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx
/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { type FormEvent, useEffect, useState } from "react";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { ExternalMaterialImportPanel } from "../../features/mf5/external-material-import-panel.js";
import {
    createOfficialMaterial,
    indexOfficialMaterial,
    listOfficialMaterials,
    type MaterialIndexJob,
    type OfficialMaterial,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherOfficialMaterialsPageProps = {
    subjectId: string;
};

/**
 * Página de materiais oficiais da disciplina.
 */
export function TeacherOfficialMaterialsPage({ subjectId }: TeacherOfficialMaterialsPageProps) {
    const [materials, setMaterials] = useState<OfficialMaterial[]>([]);
    const [type, setType] = useState<"TEXT" | "URL">("TEXT");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [actionError, setActionError] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [jobsByMaterial, setJobsByMaterial] = useState<
        Record<string, MaterialIndexJob>
    >({});

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     */
    async function refresh(): Promise<void> {
        setIsLoadingMaterials(true);
        try {
            setMaterials(await listOfficialMaterials(subjectId));
            setListError(null);
        } catch (caught) {
            setListError(caught instanceof Error ? caught.message : "Erro ao carregar materiais.");
        } finally {
            setIsLoadingMaterials(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [subjectId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setActionError(null);
        try {
            await createOfficialMaterial(subjectId, {
                title,
                type,
                textContent: type === "TEXT" ? textContent : undefined,
                sourceUrl: type === "URL" ? sourceUrl : undefined,
            });
            setTitle("");
            setTextContent("");
            setSourceUrl("");
            await refresh();
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Erro ao criar material.");
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param materialId Identificador usado para limitar a operação a material.
     */
    async function handleIndex(materialId: string): Promise<void> {
        setActionError(null);
        try {
            const job = await indexOfficialMaterial(materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Erro ao indexar material.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-6">
                <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    <h1 className="text-xl font-bold">Materiais oficiais</h1>
                    {actionError ? <p className="sf-error" role="alert">{actionError}</p> : null}
                    <select value={type} onChange={(event) => setType(event.target.value as "TEXT" | "URL")}>
                        <option value="TEXT">Texto processado</option>
                        <option value="URL">Referência URL</option>
                    </select>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                    {type === "TEXT" ? (
                        <textarea rows={8} value={textContent} onChange={(event) => setTextContent(event.target.value)} placeholder="Conteúdo textual oficial" />
                    ) : (
                        <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://..." />
                    )}
                    <button className="sf-button-primary">Guardar material</button>
                </form>
                <ExternalMaterialImportPanel
                    targetId={subjectId}
                    targetType="OFFICIAL_SUBJECT"
                    onImported={refresh}
                />
            </div>
            <div className="grid gap-3">
                <AsyncStateBlock
                    isLoading={isLoadingMaterials}
                    error={listError ?? undefined}
                    isEmpty={materials.length === 0}
                    emptyMessage="Ainda não há materiais oficiais."
                >
                    {materials.map((material) => {
                        // O backend limita materiais por disciplina e professor antes da renderização.
                        return (
                            <article className="sf-panel space-y-1" key={material._id}>
                                <h2 className="font-semibold">{material.title}</h2>
                                <p className="text-sm text-slate-600">{material.type} · {material.status}</p>
                                {material.sourceUrl ? <a className="text-sm text-studyflow-brand" href={material.sourceUrl}>{material.sourceUrl}</a> : null}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <button
                                        className="sf-button-secondary"
                                        onClick={() => void handleIndex(material._id)}
                                        type="button"
                                    >
                                        Indexar
                                    </button>
                                    {jobsByMaterial[material._id]?.status === "DONE" ? (
                                        <a
                                            className="sf-button-secondary"
                                            href={`/app/material-index-jobs/${jobsByMaterial[material._id]._id}/versoes`}
                                        >
                                            Versões
                                        </a>
                                    ) : null}
                                </div>
                            </article>
                        );
                    })}
                </AsyncStateBlock>
            </div>
        </section>
    );
}
```

5. Explicação do código.

Na página de aluno, `loadError` representa falha ao carregar listas já existentes e `actionError` representa falha ao gerar novo conteúdo ou atualizar o polling do quiz. A linha `isGeneratingSummary || isGeneratingTool || isQuizJobActive` é preservada porque veio da MF6 e impede ações concorrentes durante a geração de quiz em background. `isLoadingExisting` começa como `true` para a primeira renderização não mostrar estado vazio antes da resposta da API.

Na página de professor, `listError` fica separado de `actionError` para não misturar falhas de listagem com falhas de criação ou indexação. Esta separação evita mensagens ambíguas e prova que `AsyncStateBlock` é usado em ecrãs reais, não numa peça lateral. Os comentários perto das listas explicam que o backend continua a ser a fronteira de ownership, área, disciplina e professor.

6. Validação do passo.

Resultado esperado: `StudyToolsPage` e `TeacherOfficialMaterialsPage` importam `AsyncStateBlock`, continuam a chamar os mesmos clientes API, não deixam referências antigas a `error`/`setError` nestas duas páginas e mostram estados acessíveis para loading, erro, vazio e sucesso.

7. Cenário negativo/erro esperado.

Se a integração contornar `SessionGuard`, ownership, membership, quotas ou guardrails já existentes, a alteração deve ser revertida.

### Passo 5 - Adicionar teste frontend com negativos P0

1. Objetivo funcional do passo no contexto da app.

Provar que o componente reutilizável mostra estado vazio, erro de carregamento e erro de ação sem quebrar páginas protegidas.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/tests/e2e/mf7-async-state-block.spec.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- LOCALIZAÇÃO: rotas `/app/areas/:id/ferramentas` e `/app/professor/disciplinas/:id/materiais`.

3. Instruções do que fazer.

Cria o ficheiro Playwright abaixo. Usa credenciais E2E por variáveis de ambiente e respostas HTTP controladas por rota de teste. Não escrevas credenciais, cookies, materiais privados ou respostas completas de IA no ficheiro.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/tests/e2e/mf7-async-state-block.spec.ts
import { expect, test, type Page, type Route } from "@playwright/test";

type Credentials = {
    email: string;
    password: string;
};

/**
 * Lê credenciais E2E sem as gravar no repositório.
 *
 * @param role Role autenticado usado no nome das variáveis.
 * @returns Credenciais a usar no login pela UI.
 */
function readCredentials(role: "STUDENT" | "TEACHER"): Credentials {
    const email = process.env[`STUDYFLOW_E2E_${role}_EMAIL`];
    const password = process.env[`STUDYFLOW_E2E_${role}_PASSWORD`];

    if (!email || !password) {
        throw new Error(`Define STUDYFLOW_E2E_${role}_EMAIL e STUDYFLOW_E2E_${role}_PASSWORD.`);
    }

    return { email, password };
}

/**
 * Entra pela UI para validar uma sessão protegida real.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E.
 * @returns Promise resolvida quando a shell autenticada aparece.
 */
async function loginAs(page: Page, credentials: Credentials): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(credentials.email)).toBeVisible();
}

/**
 * Responde a uma rota HTTP com JSON para controlar a evidence do estado visual.
 *
 * @param route Rota intercetada pelo Playwright.
 * @param status Código HTTP pretendido.
 * @param body Corpo JSON enviado à página.
 * @returns Promise resolvida quando a rota fica satisfeita.
 */
async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
    await route.fulfill({
        contentType: "application/json",
        status,
        body: JSON.stringify(body),
    });
}

test("MF7 aluno mostra estado vazio quando não há artefactos", async ({ page }) => {
    await page.route("**/api/study-areas/area-mf7/summaries", (route) =>
        fulfillJson(route, 200, []),
    );
    await page.route("**/api/study-areas/area-mf7/study-tools**", (route) =>
        fulfillJson(route, 200, []),
    );

    await loginAs(page, readCredentials("STUDENT"));
    await page.goto("/app/areas/area-mf7/ferramentas");

    await expect(page.getByText("Ainda não há resumos nem ferramentas geradas.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Gerar resumo" })).toBeVisible();
});

test("MF7 aluno mostra erro de carregamento sem bloquear ações", async ({ page }) => {
    await page.route("**/api/study-areas/area-mf7/summaries", (route) =>
        fulfillJson(route, 500, { message: "Falha controlada ao carregar resumos." }),
    );
    await page.route("**/api/study-areas/area-mf7/study-tools**", (route) =>
        fulfillJson(route, 200, []),
    );

    await loginAs(page, readCredentials("STUDENT"));
    await page.goto("/app/areas/area-mf7/ferramentas");

    await expect(page.getByRole("alert")).toContainText("Falha controlada ao carregar resumos.");
    await expect(page.getByRole("button", { name: "Gerar resumo" })).toBeVisible();
});

test("MF7 aluno mostra erro de geração sem perder listas", async ({ page }) => {
    await page.route("**/api/study-areas/area-mf7/summaries", (route) => {
        if (route.request().method() === "POST") {
            return fulfillJson(route, 429, { message: "Limite de geração atingido." });
        }

        return fulfillJson(route, 200, [
            {
                _id: "summary-mf7",
                studyAreaId: "area-mf7",
                type: "SUMMARY",
                contentJson: { title: "Resumo MF7" },
                sourcesJson: [],
            },
        ]);
    });
    await page.route("**/api/study-areas/area-mf7/study-tools**", (route) =>
        fulfillJson(route, 200, []),
    );

    await loginAs(page, readCredentials("STUDENT"));
    await page.goto("/app/areas/area-mf7/ferramentas");
    await page.getByRole("button", { name: "Gerar resumo" }).click();

    await expect(page.getByRole("alert")).toContainText("Limite de geração atingido.");
    await expect(page.getByRole("button", { name: "Resumo MF7" })).toBeVisible();
});

test("MF7 professor mostra erro de listagem sem bloquear formulário", async ({ page }) => {
    await page.route("**/api/teacher/subjects/subject-mf7/materials", (route) =>
        fulfillJson(route, 403, { message: "Sem permissão para listar materiais oficiais." }),
    );

    await loginAs(page, readCredentials("TEACHER"));
    await page.goto("/app/professor/disciplinas/subject-mf7/materiais");

    await expect(page.getByRole("alert")).toContainText("Sem permissão para listar materiais oficiais.");
    await expect(page.getByRole("button", { name: "Guardar material" })).toBeVisible();
});
```

5. Explicação do código.

O teste usa as páginas reais protegidas e valida quatro estados observáveis. O caso vazio prova o caminho principal sem dados. Os três negativos P0 provam falha de listagem de aluno, falha de geração e falha de listagem docente, mantendo a interface utilizável e sem expor dados privados.

6. Validação do passo.

Comandos recomendados:
- `npm --prefix apps/web run build`
- `npm --prefix apps/web run test:e2e -- tests/e2e/mf7-async-state-block.spec.ts`

7. Cenário negativo/erro esperado.

Se o teste passar sem verificar uma mensagem de erro visível, não conta como negativo P0. Se depender de dados privados reais para afirmar sucesso, a evidence deve ser rejeitada.

### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, frontend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Matriz minima de testes por prioridade: `P0` exige unit, integração e 3 negativos; `P1` exige unit ou integração e 2 negativos; `P2` exige teste focal e 1 negativo. Evidencia de testes por camada: backend, frontend, documentação e smoke quando existir endpoint.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Resultados esperados:
- `npm --prefix apps/web run build`: sem erros TypeScript/Vite.
- `npm --prefix apps/web run test:e2e -- tests/e2e/mf7-async-state-block.spec.ts`: testes verdes quando existirem credenciais E2E e servidor local.
- `git diff --check`: sem espaços finais.
- `bash scripts/validate-planificacao.sh`: planeamento sem drift crítico.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se o Playwright falhar por ausência de servidor local ou credenciais E2E, regista o bloqueio com o comando e a mensagem observada.

### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-04` com prova técnica e instrução clara para `BK-MF7-05`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Se o BK tocar IA, inclui prova de fontes/contexto; se tocar operação, inclui prova de health, logs ou readiness.

4. Código completo, correto e integrado com a app final.

Tabela mínima de evidence para anexar ao PR ou relatório técnico:

| Caso | Expected | Observed a registar |
| --- | --- | --- |
| Vazio em `/app/areas/area-mf7/ferramentas` | Mensagem `Ainda não há resumos nem ferramentas geradas.` e botão `Gerar resumo` visível. | Screenshot ou output Playwright do teste `MF7 aluno mostra estado vazio quando não há artefactos`. |
| Negativo 1: `GET /api/study-areas/:id/summaries` falha | `role="alert"` mostra a mensagem de falha e a ação `Gerar resumo` continua visível. | Output Playwright do teste de erro de carregamento. |
| Negativo 2: `POST /api/study-areas/:id/summaries` falha | `role="alert"` mostra limite/erro de geração e a lista já carregada continua visível. | Output Playwright do teste de erro de geração. |
| Negativo 3: `GET /api/teacher/subjects/:id/materials` falha | `role="alert"` mostra erro docente e o formulário `Guardar material` continua visível. | Output Playwright do teste docente. |
| Privacidade | Evidence não contém credenciais, cookies, material privado nem respostas completas de IA. | Confirmação textual no PR. |

5. Explicação do código.

A evidence prova que `RNF26` foi aplicado em duas páginas reais e que o componente não substitui validações do backend. O próximo BK pode documentar o mapa técnico sabendo que já existe um componente reutilizável, pontos de integração e negativos P0 objetivos.

6. Validação do passo.

Resultado esperado: PR ou relatório com comandos, expected/observed, três negativos P0, confirmação de privacidade e handoff explícito para `BK-MF7-05`.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', sem output, request/response, teste ou screenshot, não cumpre o BK.

#### Critérios de aceite

- `RNF26` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os negativos mínimos respeitam a prioridade `P0`.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `npm --prefix apps/web run build`.
- Quando houver servidor local e credenciais E2E, executar `npm --prefix apps/web run test:e2e -- tests/e2e/mf7-async-state-block.spec.ts`.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-04`.
- `proof_tecnico`: comando executado, output relevante ou request/response do caminho principal.
- `proof_negativos`: três erros controlados P0 com expected/observed.
- `proof_fontes`: para IA, lista de `sourceLabel`, `locator` e excerto limitado.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF26` melhora a aplicação para alunos, professores ou operação.

#### Handoff

`BK-MF7-05` documenta o componente no mapa técnico mínimo.

O próximo BK deve reutilizar os ficheiros e decisões deste guia, sem criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-06-28`: Passo 4 corrigido para substituir o diff parcial por código final completo, preservar o estado de quiz em background da MF6, separar `loadError`/`actionError`/`listError`, iniciar carregamentos remotos em estado `true` e alinhar o mock E2E com o contrato `AiArtifact`.
- `2026-06-26`: contrato de componentização frontend documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
