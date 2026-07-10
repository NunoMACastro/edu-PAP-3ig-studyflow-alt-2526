# BK-MF8-07 - Exportação de resumos/quizzes em PDF/MD.

## Header

- `doc_id`: `GUIA-BK-MF8-07`
- `bk_id`: `BK-MF8-07`
- `macro`: `MF8`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-08`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar um exportador Markdown/PDF simples para resumos e quizzes sem expor materiais privados completos. O trabalho é incremental: consome os contratos fechados até MF7, mantém caminhos públicos em `apps/api` e `apps/web`, e deixa o próximo BK pronto para continuar sem decisões escondidas.

#### Importância

`RNF40` é CANONICO na planificação StudyFlow. Sem este BK, a MF8 fica incompleta porque o fecho de produto não demonstra exportação de artefactos de estudo com validação, evidence e negativos controlados.

Este BK também protege a defesa PAP: o aluno consegue mostrar comportamento observável, explicar a decisão técnica, provar falhas controladas e justificar que dados de alunos, salas, turmas, professores e IA não são misturados.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-07` em matriz, backlog e contrato de campos.
- Entregar exportação textual controlada, com formato e ownership validados.
- Entregar botões Exportar MD e Preparar PDF a partir do artefacto autorizado.
- Criar ou rever testes para ownership, formato inválido e markdown com fontes mínimas.
- Preservar autenticação, autorização, ownership, membership, privacidade e logs mínimos sempre que o fluxo toca dados privados.
- Recolher evidence objetiva para PR e defesa.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar requisitos novos fora de `RNF40`.
- Prometer RAG, embeddings, OCR, tradução completa, automação externa ou integrações não previstas nesta fase.
- Guardar tokens, cookies, prompts privados, respostas IA privadas completas, materiais privados ou dados pessoais em logs/evidence.
- Mover validações de ownership, membership, role ou permissão para o frontend.
- Duplicar endpoints, models ou services com responsabilidades já existentes.

#### Estado antes e depois

- Estado antes: BK-MF8-06 deixa contratos anteriores prontos, mas este requisito ainda surge no guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo.
- Estado depois: `BK-MF8-07` passa a ter tutorial linear, ficheiros concretos, código integrado, validação por passo, negativos, expected results e handoff explícito para BK-MF8-08.

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
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, salas, turmas, professores, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado no backend por sessão segura; o seu `userId` nunca vem do body.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais, testes e acompanhamento.
- **Fonte processável:** texto autorizado que pode sustentar uma resposta IA ou uma validação pedagógica.
- **Ownership:** regra backend que confirma que um recurso pertence ao aluno ou professor correto.
- **Membership:** regra backend que confirma pertença a sala, grupo, turma ou disciplina antes de ler dados.
- **Fallback honesto:** resposta de erro controlada quando a app não tem dados suficientes ou seguros.
- **Evidence:** prova objetiva de execução, com comando, output, screenshot ou pedido/resposta sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Domínio do BK:** exportação de artefactos de estudo. Vem de `RNF40`, entra neste BK como regra implementável e segue para BK-MF8-08 como contrato validado.
- **Controller:** recebe HTTP, usa `SessionGuard` quando há sessão e delega regras no service. Evita misturar transporte com domínio.
- **Service:** concentra validação, autorização, chamadas a models/providers e erros esperados. Evita regras duplicadas na UI.
- **DTO/validator:** define payload permitido e impede campos perigosos ou ambíguos antes de chegarem ao service.
- **Schema/model:** guarda só os dados necessários, com índices coerentes para aluno, sala, turma, disciplina ou artefacto.
- **Frontend React:** mostra estados loading, vazio, erro e sucesso, sempre chamando APIs com `credentials: "include"`.
- **Segurança e RGPD:** dados privados, fontes, prompts, respostas IA e resultados de testes não podem atravessar contextos nem aparecer em logs completos.
- **Teste negativo:** prova que a app falha com controlo quando falta acesso, faltam fontes, o input é inválido ou o provider devolve algo inseguro.

#### Arquitetura do BK

- Requisito canónico: `RNF40`.
- Endpoint/contrato principal: `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`.
- Backend: exportação controlada de artefactos `SUMMARY` e `QUIZ`, com formato, área, artefacto e ownership validados no service.
- Frontend: cliente API tipado, botões `Exportar MD` e `Preparar PDF`, estados loading/vazio/erro/sucesso e download sem tokens.
- Testes: caminho feliz, formato inválido, artefacto inacessível e fontes limitadas.
- Segurança: sessão real, validação backend, ownership/membership/role no service e ausência de dados sensíveis em logs.
- Decisão CANONICO: manter metadados da matriz/backlog/contrato.
- Decisões DERIVADO:
  - manter a exportação dentro do controller existente de study tools para não duplicar endpoints de artefactos IA.
  - usar Markdown como formato base e `format=pdf` como documento HTML de impressão, permitindo ao browser guardar como PDF sem adicionar dependência backend.
  - exportar quizzes sem respostas corretas por omissão, para não contornar a experiência de tentativa/correção.
  - não incluir fontes completas; exportar apenas título, localização curta e excerto limitado, se existir.
- Handoff: BK-MF8-08.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai/artifact-export.service.ts`
- CRIAR: `apps/api/src/modules/ai/artifact-export.service.spec.ts`
- EDITAR: `apps/api/src/modules/ai/ai.module.ts`
- EDITAR: `apps/api/src/modules/ai/study-tools.controller.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- EDITAR: `apps/web/src/pages/student/StudyToolsPage.tsx`
- REVER: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-07` entrega `RNF40` sem alterar metadados canónicos.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `BK-MF8-07` e requisitos `RNF40`.

3. Instruções do que fazer.

Regista `CANONICO`: título, owner `Kaua`, apoio `Guilherme`, prioridade `P1`, esforço `S`, sprint `S12`, dependências `-` e próximo BK `BK-MF8-08`.

Regista `DERIVADO` apenas para as decisões técnicas listadas na arquitectura. Não alteres a matriz nem o backlog neste BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental, analítico ou preparatório e fixa decisões antes de alterar ficheiros.

5. Explicação do código.

Não existe código neste passo. O valor está em impedir drift antes de editar: se os documentos canónicos divergirem, o aluno deve parar e registar o bloqueio no relatório/evidence.

6. Validação do passo.

Resultado esperado: header do guia e documentos canónicos continuam alinhados com `BK-MF8-07`, `RNF40`, `S12` e `BK-MF8-08`.

7. Cenário negativo/erro esperado.

Se matriz, backlog e contrato tiverem valores incompatíveis, não inventes a resposta; marca `BLOQUEADO_POR_CONTRATO` no relatório da MF8.


### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Identificar o que já existe em `apps/api` e `apps/web` para entregar exportação de artefactos de estudo sem duplicar responsabilidades.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/app.module.ts`
    - REVER: `apps/api/src/common/guards/session.guard.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
    - LOCALIZAÇÃO: classes, functions, components ou páginas indicados na lista de ficheiros.

3. Instruções do que fazer.

Confirma os imports públicos que este BK consome e escreve no teu rascunho de PR:

- que service valida segurança;
- que DTO protege input;
- que model persiste dados;
- que componente mostra resultado;
- que teste prova caminho feliz e falha controlada.

Se um ficheiro ainda não existir, cria-o no passo certo. Se já existir, edita-o mantendo a API pública estável.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental, analítico ou preparatório e fixa decisões antes de alterar ficheiros.

5. Explicação do código.

Sem código porque este passo é leitura técnica. A regra principal é reconhecer contratos existentes antes de criar ficheiros novos.

6. Validação do passo.

Resultado esperado: lista fechada de ficheiros a criar/editar/rever, sem endpoint duplicado e sem import para ficheiro inexistente.

7. Cenário negativo/erro esperado.

Se encontrares dois nomes para o mesmo conceito, escolhe o nome já usado em `apps/api` ou `apps/web` e regista a decisão como `DERIVADO`.


### Passo 3 - Exportador Markdown de artefactos

1. Objetivo funcional do passo no contexto da app.

Implementar a peça técnica central de exportação de artefactos de estudo, incluindo Markdown e documento imprimível para PDF.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/artifact-export.service.ts`
    - CRIAR: `apps/api/src/modules/ai/artifact-export.service.spec.ts`
    - EDITAR: `apps/api/src/modules/ai/study-tools.controller.ts`
    - LOCALIZAÇÃO: ficheiro completo indicado no comentário inicial do bloco.

3. Instruções do que fazer.

Cria o service de exportação. Ele deve confirmar a área do aluno, procurar o artefacto por `_id`, `userId`, `studyAreaId` e tipo exportável, e só depois renderizar o ficheiro. O frontend nunca envia `userId`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/artifact-export.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import {
    AiArtifact,
    AiArtifactDocument,
    AiArtifactType,
} from "./schemas/ai-artifact.schema.js";

const EXPORTABLE_ARTIFACT_TYPES = ["SUMMARY", "QUIZ"] as const;
const MAX_EXPORT_SOURCES = 5;
const MAX_SOURCE_EXCERPT_LENGTH = 180;

export type ArtifactExportFormat = "md" | "pdf";
export type ArtifactExportDisposition = "attachment" | "inline";
type ExportableArtifactType = (typeof EXPORTABLE_ARTIFACT_TYPES)[number];

export type ExportedArtifactFile = {
    fileName: string;
    contentType: string;
    disposition: ArtifactExportDisposition;
    body: string;
};

type ExportableSource = {
    title: string;
    page?: number;
    section?: string;
    excerpt?: string;
};

export type ExportableAiArtifact = {
    _id: string;
    type: ExportableArtifactType;
    contentJson: Record<string, unknown>;
    sourcesJson: ExportableSource[];
};

/**
 * Service responsável por exportar artefactos IA já autorizados.
 *
 * @remarks
 * Este service não chama providers IA. Exporta apenas dados já persistidos e
 * filtrados por sessão, área e owner.
 */
@Injectable()
export class ArtifactExportService {
    /**
     * Recebe dependências por injeção para manter a regra testável.
     *
     * @param artifactModel Modelo Mongoose de artefactos IA.
     * @param areasService Service que valida ownership da área de estudo.
     */
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        private readonly areasService: StudyAreasService,
    ) {}

    /**
     * Exporta um resumo ou quiz da área privada do aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área privada.
     * @param artifactId Identificador do artefacto IA.
     * @param formatInput Formato pedido pela query.
     * @returns Ficheiro textual pronto para resposta HTTP.
     */
    async exportArtifact(
        userId: string,
        studyAreaId: string,
        artifactId: string,
        formatInput: unknown,
    ): Promise<ExportedArtifactFile> {
        const format = validateArtifactExportFormat(formatInput);
        await this.areasService.getMyStudyArea(userId, studyAreaId);

        if (!Types.ObjectId.isValid(artifactId)) {
            throw this.artifactNotFound();
        }

        const artifact = await this.artifactModel.findOne({
            _id: new Types.ObjectId(artifactId),
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: { $in: [...EXPORTABLE_ARTIFACT_TYPES] },
        });

        if (!artifact) {
            throw this.artifactNotFound();
        }

        const exportableArtifact = toExportableArtifact(artifact);
        const markdown = renderAiArtifactMarkdown(exportableArtifact);
        const fileBaseName = buildExportBaseFileName(exportableArtifact);

        if (format === "md") {
            return {
                fileName: `${fileBaseName}.md`,
                contentType: "text/markdown; charset=utf-8",
                disposition: "attachment",
                body: markdown,
            };
        }

        return {
            fileName: `${fileBaseName}.html`,
            contentType: "text/html; charset=utf-8",
            disposition: "inline",
            body: renderAiArtifactPrintHtml(markdown),
        };
    }

    /**
     * Cria erro público para artefacto ausente ou inacessível.
     *
     * @returns Exceção uniforme para 404.
     */
    private artifactNotFound(): NotFoundException {
        return new NotFoundException({
            code: "AI_ARTIFACT_NOT_FOUND",
            message: "Artefacto IA não encontrado.",
        });
    }
}

/**
 * Valida a query `format`.
 *
 * @param format Valor recebido por query string.
 * @returns Formato suportado.
 */
export function validateArtifactExportFormat(
    format: unknown,
): ArtifactExportFormat {
    if (format === undefined || format === "md") return "md";
    if (format === "pdf") return "pdf";

    throw new BadRequestException({
        code: "INVALID_ARTIFACT_EXPORT_FORMAT",
        message: "Formato de exportação inválido.",
    });
}

/**
 * Constrói Markdown seguro para um artefacto de estudo autorizado.
 *
 * @param artifact Artefacto já filtrado por userId e studyAreaId.
 * @returns Documento Markdown pronto para download.
 */
export function renderAiArtifactMarkdown(artifact: ExportableAiArtifact): string {
    const title =
        artifact.type === "SUMMARY"
            ? getString(artifact.contentJson.title) ?? "Resumo StudyFlow"
            : getString(artifact.contentJson.title) ?? "Quiz StudyFlow";
    const lines = [`# ${cleanMarkdownText(title)}`, "", `Tipo: ${artifact.type}`, ""];

    if (artifact.type === "SUMMARY") {
        renderSummaryMarkdown(lines, artifact.contentJson);
    } else {
        renderQuizMarkdown(lines, artifact.contentJson);
    }

    renderSourcesMarkdown(lines, artifact.sourcesJson);
    return `${lines.join("\n")}\n`;
}

/**
 * Constrói HTML de impressão a partir do Markdown já minimizado.
 *
 * @param markdown Documento Markdown exportado.
 * @returns HTML pronto para o browser imprimir ou guardar como PDF.
 */
export function renderAiArtifactPrintHtml(markdown: string): string {
    return `<!doctype html>
<html lang="pt-PT">
<head>
    <meta charset="utf-8">
    <title>Exportação StudyFlow</title>
    <style>
        body { color: #0f172a; font-family: Inter, Arial, sans-serif; margin: 32px; }
        pre { font-family: inherit; line-height: 1.55; white-space: pre-wrap; }
        @media print { body { margin: 18mm; } }
    </style>
</head>
<body>
    <pre>${escapeHtml(markdown)}</pre>
</body>
</html>`;
}

/**
 * Constrói o header Content-Disposition sem aceitar nomes perigosos.
 *
 * @param file Ficheiro exportado.
 * @returns Valor seguro para o header HTTP.
 */
export function buildArtifactExportContentDisposition(
    file: ExportedArtifactFile,
): string {
    return `${file.disposition}; filename="${file.fileName.replace(/"/g, "")}"`;
}

/**
 * Normaliza um documento Mongoose para o contrato mínimo do exportador.
 *
 * @param artifact Documento persistido.
 * @returns Artefacto exportável.
 */
function toExportableArtifact(
    artifact: AiArtifactDocument,
): ExportableAiArtifact {
    const value = artifact.toObject();

    if (!isExportableArtifactType(value.type)) {
        throw new NotFoundException({
            code: "ARTIFACT_EXPORT_NOT_SUPPORTED",
            message: "Este artefacto não pode ser exportado neste BK.",
        });
    }

    return {
        _id: String(value._id),
        type: value.type,
        contentJson: value.contentJson,
        sourcesJson: normalizeSources(value.sourcesJson),
    };
}

/**
 * Confirma que o tipo pertence ao subconjunto exportável.
 *
 * @param type Tipo persistido no artefacto IA.
 * @returns `true` para `SUMMARY` e `QUIZ`.
 */
function isExportableArtifactType(
    type: AiArtifactType,
): type is ExportableArtifactType {
    return EXPORTABLE_ARTIFACT_TYPES.includes(type as ExportableArtifactType);
}

/**
 * Renderiza um resumo sem despejar JSON bruto.
 *
 * @param lines Acumulador Markdown.
 * @param content Conteúdo persistido do resumo.
 */
function renderSummaryMarkdown(
    lines: string[],
    content: Record<string, unknown>,
): void {
    lines.push("## Resumo", "");
    const bullets = Array.isArray(content.bullets)
        ? content.bullets.filter(isFilledString)
        : [];

    if (bullets.length === 0) {
        lines.push("- Sem pontos de resumo exportáveis.", "");
        return;
    }

    for (const bullet of bullets) {
        lines.push(`- ${cleanMarkdownText(bullet)}`);
    }
    lines.push("");
}

/**
 * Renderiza perguntas de quiz sem exportar respostas corretas por omissão.
 *
 * @param lines Acumulador Markdown.
 * @param content Conteúdo persistido do quiz.
 */
function renderQuizMarkdown(
    lines: string[],
    content: Record<string, unknown>,
): void {
    lines.push("## Quiz", "");
    const questions = Array.isArray(content.questions) ? content.questions : [];

    if (questions.length === 0) {
        lines.push("- Este quiz não tem perguntas exportáveis.", "");
        return;
    }

    questions.forEach((question, questionIndex) => {
        const record = isRecord(question) ? question : {};
        const statement =
            getString(record.question) ?? "Pergunta sem enunciado exportável.";
        const options = Array.isArray(record.options)
            ? record.options.filter(isFilledString).slice(0, 6)
            : [];

        lines.push(`### Pergunta ${questionIndex + 1}`, "");
        lines.push(cleanMarkdownText(statement), "");

        if (options.length > 0) {
            lines.push("Opções:");
            options.forEach((option, optionIndex) => {
                lines.push(`${optionIndex + 1}. ${cleanMarkdownText(option)}`);
            });
            lines.push("");
        }
    });
}

/**
 * Renderiza fontes autorizadas com limite de quantidade e excerto.
 *
 * @param lines Acumulador Markdown.
 * @param sources Fontes já minimizadas.
 */
function renderSourcesMarkdown(
    lines: string[],
    sources: ExportableSource[],
): void {
    lines.push("## Fontes autorizadas", "");

    if (sources.length === 0) {
        lines.push("- Sem fontes registadas no artefacto.", "");
        return;
    }

    for (const source of sources.slice(0, MAX_EXPORT_SOURCES)) {
        const location = [source.page ? `p. ${source.page}` : "", source.section]
            .filter(Boolean)
            .join(", ");
        const suffix = location ? ` (${location})` : "";
        const excerpt = source.excerpt ? ` - excerto: ${source.excerpt}` : "";
        lines.push(`- ${cleanMarkdownText(source.title)}${suffix}${excerpt}`);
    }
    lines.push("");
}

/**
 * Reduz fontes ao contrato exportável.
 *
 * @param sources Fontes persistidas no artefacto.
 * @returns Fontes sem texto privado completo.
 */
function normalizeSources(
    sources: Array<Record<string, unknown>> = [],
): ExportableSource[] {
    return sources.slice(0, MAX_EXPORT_SOURCES).map((source) => ({
        title: getString(source.title) ?? "Fonte autorizada",
        ...(typeof source.page === "number" ? { page: source.page } : {}),
        ...(getString(source.section) ? { section: getString(source.section) } : {}),
        ...(clipText(getString(source.excerpt) ?? getString(source.contentText))
            ? {
                  excerpt: clipText(
                      getString(source.excerpt) ?? getString(source.contentText),
                  ),
              }
            : {}),
    }));
}

/**
 * Cria base de nome de ficheiro previsível.
 *
 * @param artifact Artefacto exportado.
 * @returns Nome sem extensão.
 */
function buildExportBaseFileName(artifact: ExportableAiArtifact): string {
    const typeName = artifact.type === "SUMMARY" ? "resumo" : "quiz";
    const idSuffix = sanitizeFilePart(artifact._id.slice(-8));
    return `studyflow-${typeName}-${idSuffix}`;
}

/**
 * Remove caracteres problemáticos de uma parte do nome de ficheiro.
 *
 * @param value Texto a normalizar.
 * @returns Texto seguro para ficheiro.
 */
function sanitizeFilePart(value: string): string {
    const safe = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return safe || "artefacto";
}

/**
 * Lê uma string preenchida.
 *
 * @param value Valor desconhecido.
 * @returns Texto limpo ou `undefined`.
 */
function getString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Confirma string preenchida para filtros de arrays.
 *
 * @param value Valor desconhecido.
 * @returns `true` se for string preenchida.
 */
function isFilledString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Confirma objeto JSON simples.
 *
 * @param value Valor desconhecido.
 * @returns `true` quando é objeto e não array.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Limpa quebras de linha para não deformar o Markdown exportado.
 *
 * @param value Texto original.
 * @returns Texto numa linha.
 */
function cleanMarkdownText(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

/**
 * Limita excertos para evidence e exportação.
 *
 * @param value Texto original.
 * @returns Excerto limitado ou `undefined`.
 */
function clipText(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const cleaned = cleanMarkdownText(value);
    if (cleaned.length <= MAX_SOURCE_EXCERPT_LENGTH) return cleaned;
    return `${cleaned.slice(0, MAX_SOURCE_EXCERPT_LENGTH - 1)}…`;
}

/**
 * Escapa texto antes de escrever HTML de impressão.
 *
 * @param value Texto Markdown.
 * @returns Texto seguro para HTML.
 */
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

5. Explicação do código.

O service transforma `RNF40` numa regra concreta: só exporta artefactos que pertencem à área privada do aluno autenticado e só aceita `SUMMARY` ou `QUIZ`. O Markdown é o formato base; o PDF é preparado por HTML de impressão, decisão `DERIVADO` que evita adicionar dependências. As fontes são minimizadas para não exportar materiais privados completos.

6. Validação do passo.

Resultado esperado: o ficheiro compila, exporta `ArtifactExportService`, `renderAiArtifactMarkdown`, `renderAiArtifactPrintHtml`, `validateArtifactExportFormat` e `buildArtifactExportContentDisposition`, e não chama provider IA.

7. Cenário negativo/erro esperado.

Pede `format=docx` ou um `artifactId` inexistente. O resultado esperado é erro controlado, sem chamada a provider, sem leitura de dados de outro utilizador e sem log sensível.


### Passo 4 - Integrar backend e contrato HTTP

1. Objetivo funcional do passo no contexto da app.

Ligar a peça central ao contrato backend `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/artifact-export.service.ts`
    - CRIAR: `apps/api/src/modules/ai/artifact-export.service.spec.ts`
    - EDITAR: `apps/api/src/modules/ai/study-tools.controller.ts`
    - REVER: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
    - EDITAR: `apps/api/src/modules/ai/ai.module.ts`
    - LOCALIZAÇÃO: controller, service, DTO e module do domínio deste BK.

3. Instruções do que fazer.

No controller, mantém a função fina: sessão, parâmetros e query entram, o service decide. Regista o novo service no módulo de IA para que a injeção funcione.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/study-tools.controller.ts
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import {
    ArtifactExportService,
    buildArtifactExportContentDisposition,
} from "./artifact-export.service.js";
import { CreateQuizAttemptDto } from "./dto/create-quiz-attempt.dto.js";
import { CreateQuizJobDto } from "./dto/create-quiz-job.dto.js";
import { CreateStudyToolDto } from "./dto/create-study-tool.dto.js";
import { QuizGenerationJobsService } from "./quiz-generation-jobs.service.js";
import { StudyToolsService } from "./study-tools.service.js";

/**
 * Controller de ferramentas de estudo geradas por IA.
 */
@Controller("api/study-areas/:id/study-tools")
@UseGuards(SessionGuard)
export class StudyToolsController {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param studyToolsService Service principal de study tools.
     * @param quizJobsService Service de jobs persistidos.
     * @param artifactExportService Service de exportação segura.
     */
    constructor(
        private readonly studyToolsService: StudyToolsService,
        private readonly quizJobsService: QuizGenerationJobsService,
        private readonly artifactExportService: ArtifactExportService,
    ) {}

    /**
     * Lista ferramentas já geradas para a área.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param type Tipo opcional para filtrar.
     * @returns Artefactos IA da área.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Query("type") type?: string,
    ) {
        return this.studyToolsService.listTools(request.user!.id, id, type);
    }

    /**
     * Gera uma explicação, flashcards ou quiz.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param body Pedido de geração.
     * @returns Artefacto criado.
     */
    @Post()
    generate(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateStudyToolDto,
    ) {
        return this.studyToolsService.generateStudyTool(
            request.user!.id,
            id,
            body,
        );
    }

    /**
     * Inicia geração de quiz em background para uma área privada do aluno.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param body Pedido opcional com tópico.
     * @returns Job inicial em estado QUEUED.
     */
    @Post("quiz-jobs")
    createQuizJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateQuizJobDto,
    ) {
        return this.quizJobsService.createQuizJob(request.user!.id, id, body);
    }

    /**
     * Consulta o estado de um job de quiz da área privada.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param jobId Job a consultar.
     * @returns Estado público do job.
     */
    @Get("quiz-jobs/:jobId")
    getQuizJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("jobId") jobId: string,
    ) {
        return this.quizJobsService.findQuizJob(request.user!.id, id, jobId);
    }

    /**
     * Exporta resumo ou quiz autorizado em Markdown ou HTML de impressão.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param artifactId Artefacto IA a exportar.
     * @param format Formato pedido pela query.
     * @param response Resposta HTTP usada para headers de ficheiro.
     * @returns Corpo textual do ficheiro.
     */
    @Get(":artifactId/export")
    async exportArtifact(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("artifactId") artifactId: string,
        @Query("format") format: string | undefined,
        @Res({ passthrough: true }) response: Response,
    ): Promise<string> {
        const file = await this.artifactExportService.exportArtifact(
            request.user!.id,
            id,
            artifactId,
            format,
        );
        response.setHeader("Content-Type", file.contentType);
        response.setHeader(
            "Content-Disposition",
            buildArtifactExportContentDisposition(file),
        );
        return file.body;
    }

    /**
     * Regista uma tentativa mínima de quiz para handoff MF1.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param artifactId Identificador do artefacto `QUIZ`.
     * @param body Respostas escolhidas pelo aluno.
     * @returns Resultado calculado da tentativa.
     */
    @Post(":artifactId/quiz-attempts")
    submitQuizAttempt(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("artifactId") artifactId: string,
        @Body() body: CreateQuizAttemptDto,
    ) {
        return this.studyToolsService.submitQuizAttempt(
            request.user!.id,
            id,
            artifactId,
            body,
        );
    }
}
```

```ts
// apps/api/src/modules/ai/ai.module.ts
import { ArtifactExportService } from "./artifact-export.service.js";

// Dentro de @Module({ providers: [...] }), acrescenta o provider:
providers: [
    AiAreaProfileService,
    SummariesService,
    StudyToolsService,
    ArtifactExportService,
    QuizGenerationJobsService,
    AdaptiveLearningService,
    GovernedAiExecutionService,
    // Token interno: só GovernedAiExecutionService o injeta; nunca é exportado.
    { provide: AI_PROVIDER, useFactory: createAiProvider },
],
```

5. Explicação do código.

O controller continua fino: não valida ownership diretamente, apenas passa sessão, parâmetros e query para o service. Os headers ficam no controller porque pertencem ao transporte HTTP. O módulo regista `ArtifactExportService` para o NestJS conseguir injetá-lo.

6. Validação do passo.

Resultado esperado: `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md` devolve Markdown para download e `format=pdf` devolve HTML de impressão. Artefacto inexistente, de outro aluno ou de outra área devolve `AI_ARTIFACT_NOT_FOUND`.

7. Cenário negativo/erro esperado.

Se o controller fizer ownership, membership ou cálculo de segurança diretamente, move essa regra para o service. O controller não deve ser a fonte de verdade do domínio.


### Passo 5 - Integrar frontend e estados da UI

1. Objetivo funcional do passo no contexto da app.

Tornar botões Exportar MD e Preparar PDF a partir do artefacto autorizado visível ao aluno, professor ou equipa de defesa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/student/StudyToolsPage.tsx`
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: cliente API, página ou componente React indicado nos ficheiros do BK.

3. Instruções do que fazer.

Cria cliente API tipado, chama o backend com `credentials: "include"` através dos helpers existentes e cobre quatro estados: loading, vazio, erro e sucesso. Mensagens visíveis ficam em português de Portugal e não mostram tokens, cookies, prompts privados ou conteúdo completo de materiais.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/apiClient.ts
export type ArtifactExportFormat = "md" | "pdf";

export type ArtifactExportFile = {
    fileName: string;
    contentType: string;
    body: string;
    format: ArtifactExportFormat;
};

/**
 * Exporta resumo ou quiz de uma área privada.
 *
 * @param studyAreaId Área privada do aluno autenticado.
 * @param artifactId Artefacto IA selecionado.
 * @param format Formato pedido pela UI.
 * @returns Ficheiro textual devolvido pelo backend.
 */
export async function exportStudyToolArtifact(
    studyAreaId: string,
    artifactId: string,
    format: ArtifactExportFormat,
): Promise<ArtifactExportFile> {
    const query = new URLSearchParams({ format });
    const response = await fetch(
        `/api/study-areas/${encodeURIComponent(
            studyAreaId,
        )}/study-tools/${encodeURIComponent(artifactId)}/export?${query}`,
        {
            credentials: "include",
            headers: { "x-studyflow-csrf": "1" },
            method: "GET",
        },
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Não foi possível exportar o artefacto.",
        }));
        throw new Error(
            typeof error.message === "string"
                ? error.message
                : "Não foi possível exportar o artefacto.",
        );
    }

    return {
        fileName:
            readFileNameFromDisposition(
                response.headers.get("content-disposition"),
            ) ?? fallbackArtifactExportFileName(format),
        contentType: response.headers.get("content-type") ?? "text/plain",
        body: await response.text(),
        format,
    };
}

/**
 * Lê filename do header Content-Disposition.
 *
 * @param disposition Header recebido da API.
 * @returns Nome de ficheiro ou `undefined`.
 */
function readFileNameFromDisposition(
    disposition: string | null,
): string | undefined {
    if (!disposition) return undefined;
    const match = disposition.match(/filename="([^"]+)"/);
    return match?.[1];
}

/**
 * Define fallback de nome caso o proxy remova headers.
 *
 * @param format Formato pedido.
 * @returns Nome de ficheiro local.
 */
function fallbackArtifactExportFileName(format: ArtifactExportFormat): string {
    return format === "md"
        ? "studyflow-export.md"
        : "studyflow-export.html";
}
```

```tsx
// apps/web/src/pages/student/StudyToolsPage.tsx
import {
    AiArtifact,
    ArtifactExportFile,
    ArtifactExportFormat,
    createQuizGenerationJob,
    exportStudyToolArtifact,
    generateStudyTool,
    generateSummary,
    getQuizGenerationJob,
    listStudyTools,
    listSummaries,
    QuizGenerationJob,
    StudyToolType,
} from "../../lib/apiClient.js";

// Dentro do return de StudyToolsPage, depois das listas e antes dos painéis:
<ArtifactExportPanel artifact={artifact} studyAreaId={studyAreaId} />

type ArtifactExportPanelProps = {
    artifact: AiArtifact | null;
    studyAreaId: string;
};

/**
 * Mostra ações de exportação para resumos e quizzes autorizados.
 *
 * @param props Artefacto selecionado e área privada.
 * @returns Painel com ações e estados de exportação.
 */
function ArtifactExportPanel({
    artifact,
    studyAreaId,
}: ArtifactExportPanelProps) {
    const [exportError, setExportError] = useState<string | null>(null);
    const [exportMessage, setExportMessage] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const isExportable =
        artifact?.type === "SUMMARY" || artifact?.type === "QUIZ";

    /**
     * Executa exportação segura através do backend.
     *
     * @param format Formato pedido pelo aluno.
     * @returns Promise resolvida depois da ação local.
     */
    async function handleExport(format: ArtifactExportFormat): Promise<void> {
        if (!artifact || !isExportable || isExporting) return;
        setExportError(null);
        setExportMessage(null);
        setIsExporting(true);

        try {
            const file = await exportStudyToolArtifact(
                studyAreaId,
                artifact._id,
                format,
            );
            if (format === "pdf") {
                openPrintableArtifact(file);
                setExportMessage("Documento preparado para guardar como PDF.");
            } else {
                downloadArtifactFile(file);
                setExportMessage("Markdown exportado com sucesso.");
            }
        } catch (caught) {
            setExportError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível exportar o artefacto.",
            );
        } finally {
            setIsExporting(false);
        }
    }

    if (!artifact) {
        return (
            <div className="sf-panel space-y-2">
                <h2 className="text-lg font-bold">Exportação</h2>
                <p className="text-sm text-slate-600">
                    Escolhe ou gera um resumo ou quiz para ativar a exportação.
                </p>
            </div>
        );
    }

    return (
        <div className="sf-panel space-y-3">
            <h2 className="text-lg font-bold">Exportação</h2>
            {!isExportable ? (
                <p className="text-sm text-slate-600">
                    Este tipo de artefacto não é exportado neste BK.
                </p>
            ) : (
                <div className="flex flex-wrap gap-3">
                    <button
                        className="sf-button-secondary"
                        disabled={isExporting}
                        onClick={() => void handleExport("md")}
                        type="button"
                    >
                        {isExporting ? "A exportar..." : "Exportar MD"}
                    </button>
                    <button
                        className="sf-button-secondary"
                        disabled={isExporting}
                        onClick={() => void handleExport("pdf")}
                        type="button"
                    >
                        {isExporting ? "A preparar..." : "Preparar PDF"}
                    </button>
                </div>
            )}
            {exportMessage ? (
                <p className="text-sm text-studyflow-brand" aria-live="polite">
                    {exportMessage}
                </p>
            ) : null}
            {exportError ? <p className="sf-error">{exportError}</p> : null}
        </div>
    );
}

/**
 * Descarrega ficheiro textual devolvido pelo backend.
 *
 * @param file Ficheiro exportado.
 */
function downloadArtifactFile(file: ArtifactExportFile): void {
    const blob = new Blob([file.body], { type: file.contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

/**
 * Abre documento de impressão preparado pela API.
 *
 * @param file HTML já escapado no backend.
 */
function openPrintableArtifact(file: ArtifactExportFile): void {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
        downloadArtifactFile(file);
        return;
    }

    printWindow.document.open();
    printWindow.document.write(file.body);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 350);
}
```

5. Explicação do código.

O cliente usa `credentials: "include"` e o mesmo marcador CSRF das chamadas JSON, mas lê texto porque exportação não devolve JSON. A página só decide interação visual; permissões continuam no backend. Para `format=pdf`, a UI abre o HTML seguro e chama impressão do browser.

6. Validação do passo.

Resultado esperado: com um resumo ou quiz selecionado, a UI mostra `Exportar MD` e `Preparar PDF`; sem artefacto mostra estado vazio; em erro mostra mensagem PT-PT sem tokens, cookies, prompts privados ou materiais completos.

7. Cenário negativo/erro esperado.

Simula sessão expirada ou recurso proibido. A UI deve mostrar erro compreensível e não deve tentar decidir acesso localmente.


### Passo 6 - Criar testes e negativos

1. Objetivo funcional do passo no contexto da app.

Provar ownership, formato inválido e markdown com fontes mínimas com testes automatizados ou smoke controlado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/artifact-export.service.spec.ts`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - LOCALIZAÇÃO: ficheiros `.spec.ts`, `.spec.tsx` ou script indicado na lista de ficheiros.

3. Instruções do que fazer.

Cria testes focados no service de exportação. Não uses rede real nem provider IA: este BK exporta artefactos persistidos.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/artifact-export.service.spec.ts
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
    ArtifactExportService,
    ExportableAiArtifact,
    renderAiArtifactMarkdown,
    validateArtifactExportFormat,
} from "./artifact-export.service.js";

const userId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439011";
const artifactId = "507f1f77bcf86cd799439016";

describe("ArtifactExportService", () => {
    /**
     * Confirma que resumos são exportados com fontes mínimas.
     */
    it("exporta resumo autorizado em Markdown", async () => {
        const { artifactModel, areasService, service } = makeService();
        artifactModel.findOne.mockResolvedValue(makeSummaryDocument());

        await expect(
            service.exportArtifact(userId, studyAreaId, artifactId, "md"),
        ).resolves.toMatchObject({
            fileName: "studyflow-resumo-99439016.md",
            contentType: "text/markdown; charset=utf-8",
            disposition: "attachment",
        });

        const file = await service.exportArtifact(
            userId,
            studyAreaId,
            artifactId,
            "md",
        );
        expect(file.body).toContain("# Frações");
        expect(file.body).toContain("- Fração representa parte de um todo.");
        expect(file.body).toContain("Fonte autorizada");
        expect(file.body).not.toContain("Texto completo privado");
        expect(areasService.getMyStudyArea).toHaveBeenCalledWith(
            userId,
            studyAreaId,
        );
    });

    /**
     * Confirma que o formato PDF devolve documento imprimível.
     */
    it("prepara HTML de impressão para PDF", async () => {
        const { artifactModel, service } = makeService();
        artifactModel.findOne.mockResolvedValue(makeSummaryDocument());

        const file = await service.exportArtifact(
            userId,
            studyAreaId,
            artifactId,
            "pdf",
        );

        expect(file).toMatchObject({
            fileName: "studyflow-resumo-99439016.html",
            contentType: "text/html; charset=utf-8",
            disposition: "inline",
        });
        expect(file.body).toContain("<!doctype html>");
        expect(file.body).toContain("Frações");
    });

    /**
     * Confirma que formato inválido falha antes da query.
     */
    it("rejeita formato inválido", () => {
        expect(() => validateArtifactExportFormat("docx")).toThrow(
            BadRequestException,
        );
    });

    /**
     * Confirma que artefactos de outro aluno ou área não são exportados.
     */
    it("rejeita artefacto inacessível", async () => {
        const { artifactModel, service } = makeService();
        artifactModel.findOne.mockResolvedValue(null);

        await expect(
            service.exportArtifact(userId, studyAreaId, artifactId, "md"),
        ).rejects.toBeInstanceOf(NotFoundException);

        const query = artifactModel.findOne.mock.calls[0]?.[0] as Record<
            string,
            unknown
        >;
        expect(String(query.userId)).toBe(userId);
        expect(String(query.studyAreaId)).toBe(studyAreaId);
    });

    /**
     * Confirma que quizzes exportados não revelam respostas corretas.
     */
    it("renderiza quiz sem resposta correta", () => {
        const markdown = renderAiArtifactMarkdown(makeQuizArtifact());

        expect(markdown).toContain("## Quiz");
        expect(markdown).toContain("### Pergunta 1");
        expect(markdown).toContain("1. Numerador");
        expect(markdown).not.toContain("correctOptionIndex");
        expect(markdown).not.toContain("Resposta correta");
    });
});

/**
 * Cria service com mocks isolados.
 *
 * @returns Service e dependências mockadas.
 */
function makeService() {
    const artifactModel = {
        findOne: jest.fn(),
    };
    const areasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };

    return {
        artifactModel,
        areasService,
        service: new ArtifactExportService(
            artifactModel as never,
            areasService as never,
        ),
    };
}

/**
 * Cria documento Mongoose simulado para resumo.
 *
 * @returns Documento com `toObject`.
 */
function makeSummaryDocument() {
    return {
        toObject: () => ({
            _id: artifactId,
            type: "SUMMARY",
            contentJson: {
                title: "Frações",
                bullets: ["Fração representa parte de um todo."],
                sourceMaterialIds: ["507f1f77bcf86cd799439010"],
            },
            sourcesJson: [
                {
                    materialId: "507f1f77bcf86cd799439010",
                    title: "Fonte autorizada",
                    contentText: "Texto completo privado que não pode sair inteiro.",
                },
            ],
        }),
    };
}

/**
 * Cria quiz persistido simulado.
 *
 * @returns Artefacto exportável.
 */
function makeQuizArtifact(): ExportableAiArtifact {
    return {
        _id: artifactId,
        type: "QUIZ",
        contentJson: {
            title: "Quiz de frações",
            questions: [
                {
                    question: "Como se chama o número de cima?",
                    options: ["Numerador", "Denominador", "Quociente", "Resto"],
                    correctOptionIndex: 0,
                },
            ],
        },
        sourcesJson: [{ title: "Fonte autorizada" }],
    };
}
```

5. Explicação do código.

Estes testes validam comportamento observável: ficheiro gerado, formato, limitação de fontes, bloqueio de artefacto inacessível e omissão de respostas corretas no quiz exportado. O service é testado sem rede e sem provider IA.

6. Validação do passo.

Resultado esperado: `artifact-export.service.spec.ts` cobre sucesso, formato inválido, inacessível e quiz sem resposta correta; nenhum teste usa dados sensíveis reais.

7. Cenário negativo/erro esperado.

Se o teste passar sem validar output observável, acrescenta assert de `code`, header, nome de ficheiro, mensagem UI ou ausência de conteúdo sensível.


### Passo 7 - Recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-07` com prova objetiva e handoff para BK-MF8-08.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções de evidence, validação final e handoff.

3. Instruções do que fazer.

Regista no PR ou documento de evidence:

- comando executado;
- expected result;
- observed result;
- negativo testado;
- risco residual;
- ficheiros alterados;
- impacto no próximo BK.

Não incluas prompts privados, respostas IA completas, cookies, tokens, dados pessoais ou materiais integrais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental, analítico ou preparatório e fixa decisões antes de alterar ficheiros.

5. Explicação do código.

Sem código neste passo. A entrega aqui é a rastreabilidade: o professor consegue ver o que foi validado e o próximo aluno sabe exatamente que contrato pode consumir.

6. Validação do passo.

Resultado esperado: evidence suficiente para defender `BK-MF8-07` e handoff claro para BK-MF8-08.

7. Cenário negativo/erro esperado.

Se a validação falhar por ambiente, regista `BLOQUEADO` com erro observado e não marques o BK como concluído.


#### Critérios de aceite

- Header e metadados iguais à matriz, backlog, contrato de campos e anexos.
- O BK entrega `RNF40` sem alterar requisitos fora do escopo.
- Todos os passos têm objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e cenário negativo.
- Código com JSDoc nos elementos principais e comentário didático nas invariantes relevantes.
- Backend aplica validação, autenticação, autorização, ownership, membership ou role no service quando o fluxo toca dados privados.
- Frontend usa cliente tipado, `credentials: "include"`, estados loading/vazio/erro/sucesso e mensagens PT-PT.
- Testes ou smoke cobrem caminho feliz e negativos críticos.
- Evidence evita dados sensíveis, prompts privados e materiais completos.

#### Validação final

- Executar ou preparar execução de testes focados para ownership, formato inválido e markdown com fontes mínimas.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`.
- Confirmar que não há caminhos privados em texto destinado aos alunos.

#### Evidence para PR/defesa

- `pr`: resumo do requisito `RNF40`, ficheiros alterados e decisão CANONICO/DERIVADO.
- `proof`: comando, output, screenshot ou request/response do caminho feliz.
- `neg`: prova de pelo menos um cenário negativo com erro controlado.
- `privacy`: confirmação de que logs/evidence não expõem dados sensíveis.
- `handoff`: nota curta para BK-MF8-08.

#### Handoff

O próximo BK é `BK-MF8-08`. Ele pode assumir que `BK-MF8-07` deixou um exportador Markdown/PDF simples, integrado no controller de study tools, com ownership backend, cliente web tipado e testes focados.

#### Changelog

- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com estrutura completa, caminhos públicos, decisões CANONICO/DERIVADO, código integrado, validação por passo, negativos e handoff.
- `2026-07-02`: correção focada de `BK-MF8-07` para fechar endpoint/service, decisão PDF implementável, cliente/UI e testes reais de exportação.
