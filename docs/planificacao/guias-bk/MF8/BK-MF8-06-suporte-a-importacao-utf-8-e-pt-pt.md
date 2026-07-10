# BK-MF8-06 - Suporte a importação UTF-8 e PT-PT.

## Header

- `doc_id`: `GUIA-BK-MF8-06`
- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `owner`: `Kaua`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF39`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-07`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais garantir que o StudyFlow trata texto importado em UTF-8 e em português de Portugal sem perder acentos, cedilhas ou mensagens compreensíveis para o aluno.

No fim, tópicos escritos pelo aluno, texto extraído de URLs, PDF e DOCX, e jobs de indexação textual passam por uma normalização comum antes de serem guardados como fonte processável. A app também passa a falhar de forma clara quando o material não tem texto legível, em vez de marcar conteúdo vazio como pronto para IA.

Após reload, a UI hidrata `GET /api/student/study-areas/:studyAreaId/material-index-jobs?latestByMaterial=true`. O polling faz um único pedido em voo, usa `AbortSignal`, timeout recursivo e estados monotónicos.

#### Importância

`RNF39` é CANONICO: a aplicação deve suportar importação UTF-8 e PT-PT. Este requisito parece pequeno, mas protege uma parte central do StudyFlow: materiais de estudo com acentos, fórmulas escritas em português, nomes de disciplinas, títulos de trabalhos e explicações usadas pela IA.

Sem esta normalização, o aluno pode enviar um ficheiro válido e acabar com texto quebrado, vazio ou sem caracteres portugueses. Isso afeta resumos, quizzes, exportação futura em PDF/MD e qualquer fluxo de IA que dependa de fontes processáveis. Também cria risco de defesa, porque o professor pode testar palavras como "função", "equações", "interpretação" ou "coração" e observar comportamento inconsistente.

#### Scope-in

- Confirmar `BK-MF8-06`, `RNF39`, owner, apoio, sprint e handoff nos documentos canónicos.
- Criar normalização backend reutilizável em `apps/api/src/common/text/pt-text-normalization.ts`.
- Aplicar normalização em `apps/api/src/modules/materials/materials.service.ts` para tópicos e texto indexado.
- Aplicar normalização em `apps/api/src/modules/material-index/material-index.service.ts` para TOPIC, URL, PDF, DOCX e material oficial textual.
- Preservar ownership: o `userId` vem da sessão autenticada e nunca do body.
- Mostrar na UI de materiais uma mensagem PT-PT quando a indexação não encontra texto legível.
- Criar testes para acentos, cedilhas, whitespace, texto sem conteúdo útil, service de materiais e indexação.
- Recolher evidence sem expor conteúdo privado completo.

#### Scope-out

- Alterar IDs, owner, apoio, prioridade, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar OCR, embeddings, pesquisa semântica, tradução completa ou integração externa.
- Alterar a pipeline de upload, limites de ficheiro, MIME types ou validação de assinaturas binárias.
- Guardar materiais completos, prompts privados, respostas IA completas, cookies, tokens ou dados pessoais em logs/evidence.
- Mover ownership, role ou permissões para o frontend.
- Criar endpoints duplicados para submissão ou indexação de materiais.

#### Estado antes e depois

- Estado antes: `BK-MF8-05` deixa um fecho visual verificável, e a app já tem submissão de materiais, upload multipart, indexação textual e polling de jobs. Ainda falta uma regra comum para preservar UTF-8/PT-PT nos pontos onde texto entra ou fica pronto para IA.
- Estado depois: `BK-MF8-06` entrega uma unidade de normalização, integra essa unidade nos services reais de materiais e indexação, mostra erro PT-PT na UI quando não há texto legível, cria testes automatizados e deixa `BK-MF8-07` preparado para exportar texto já normalizado.

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
- `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `apps/api/src/modules/materials/materials.service.ts`
- `apps/api/src/modules/material-index/material-index.service.ts`
- `apps/api/src/modules/material-index/material-index.controller.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/components/materials/MaterialList.tsx`
- `apps/web/src/components/materials/MaterialSubmitForm.tsx`

#### Glossário

- **UTF-8:** codificação que permite guardar texto com acentos, cedilhas e outros caracteres internacionais sem os substituir por símbolos estranhos.
- **PT-PT:** português de Portugal, incluindo mensagens, termos e acentuação naturais para os alunos.
- **Normalização Unicode:** transformação que coloca caracteres equivalentes numa forma estável; neste BK usamos `NFC` para manter acentos compostos de forma previsível.
- **Fonte processável:** texto autorizado e legível que pode ser usado por resumos, quizzes, explicações e exportações.
- **Indexação textual:** processo que lê texto de um material e cria blocos curtos para pesquisa, versões e IA baseada em fontes.
- **Ownership:** validação backend que confirma que o material pertence ao aluno autenticado.
- **Job de indexação:** registo que mostra se a extração de texto está em fila, em processamento, concluída ou falhada.
- **Fallback honesto:** erro claro quando a app não consegue extrair texto útil, sem fingir que o material está pronto.

#### Conceitos teóricos essenciais

- **Compatibilidade de texto:** garante que a app aceita texto real dos alunos, com acentos, cedilhas e quebras de linha previsíveis. Vem de `RNF39`, entra neste BK como normalização backend e segue para `BK-MF8-07` como base de exportação.
- **NFC:** forma Unicode que junta caracteres combinados numa representação estável. Serve para evitar que a mesma palavra com acento seja guardada de maneiras diferentes.
- **Backend como fonte de verdade:** o frontend pode validar campos vazios, mas a decisão final sobre texto legível fica no backend, porque é aí que existem sessão, ownership e persistência.
- **Material privado:** pertence a um aluno e só pode ser lido/indexado depois de validar a área de estudo com o `userId` da sessão.
- **Indexação de TOPIC, URL, PDF e DOCX:** cada tipo entra por uma origem diferente, mas todos devem sair com texto normalizado antes de ficarem disponíveis para IA.
- **Mensagem PT-PT de erro:** deve explicar o problema sem expor o conteúdo do ficheiro. Por exemplo, "O material não tem texto legível para estudar.".
- **Teste unitário:** confirma a regra pequena de normalização sem depender de rede, browser ou ficheiros reais.
- **Teste de service:** confirma que a regra entra no fluxo certo, depois de ownership e antes de persistência ou criação de chunks.

#### Arquitetura do BK

- Requisito canónico: `RNF39`.
- Endpoints existentes:
  - `POST /api/study-areas/:studyAreaId/materials`
  - `POST /api/study-areas/:studyAreaId/materials/file`
  - `POST /api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs`
  - `GET /api/material-index-jobs/:jobId`
- Backend:
  - `apps/api/src/common/text/pt-text-normalization.ts`
  - `apps/api/src/modules/materials/materials.service.ts`
  - `apps/api/src/modules/material-index/material-index.service.ts`
- Frontend:
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/components/materials/MaterialList.tsx`
  - `apps/web/src/components/materials/MaterialSubmitForm.tsx`
- Testes:
  - `apps/api/src/common/text/pt-text-normalization.spec.ts`
  - `apps/api/src/modules/materials/materials.service.spec.ts`
  - `apps/api/src/modules/material-index/material-index.service.spec.ts`
- Decisão CANONICO: `RNF39` exige suporte de importação UTF-8/PT-PT.
- Decisões DERIVADO:
  - usar `normalize("NFC")` para estabilizar Unicode;
  - rejeitar texto sem letras, números ou caracteres portugueses legíveis;
  - manter a normalização no backend para que TOPIC, URL, PDF e DOCX sigam a mesma regra;
  - deixar a UI mostrar a mensagem do job sem decidir permissões.
- Handoff: `BK-MF8-07` pode exportar resumos/quizzes a partir de texto normalizado.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/text/pt-text-normalization.ts`
- CRIAR: `apps/api/src/common/text/pt-text-normalization.spec.ts`
- EDITAR: `apps/api/src/modules/materials/materials.service.ts`
- EDITAR: `apps/api/src/modules/materials/materials.service.spec.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.service.spec.ts`
- EDITAR: `apps/web/src/components/materials/MaterialList.tsx`
- REVER: `apps/api/src/modules/material-index/material-index.controller.ts`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/web/src/components/materials/MaterialSubmitForm.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-06` entrega apenas `RNF39`, sem alterar a ordem da MF8 nem criar funcionalidades fora do fecho de compatibilidade.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
    - REVER: `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
    - LOCALIZAÇÃO: linhas de `BK-MF8-06`, `RNF39`, owner, apoio, sprint e handoff.

3. Instruções do que fazer.

Confirma estes dados:

- `BK-MF8-06`
- `RNF39`
- owner `Kaua`
- apoio `Natalia`
- prioridade `P0`
- esforço `M`
- sprint `S12`
- dependências `-`
- próximo BK `BK-MF8-07`

Marca como `CANONICO` o requisito e os metadados. Marca como `DERIVADO` as decisões técnicas de normalização Unicode e validação de conteúdo legível.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e impede que o aluno altere escopo ou requisitos antes de tocar em ficheiros técnicos.

5. Explicação do código.

Não há código porque a tarefa aqui é fixar fronteiras. A decisão importante é perceber que `RNF39` não pede tradução completa, OCR, embeddings nem pesquisa semântica. Pede que texto importado seja preservado e validado em português.

6. Validação do passo.

Resultado esperado: matriz, backlog, contrato de campos, anexos e guia continuam alinhados com `BK-MF8-06`, `RNF39`, `S12`, owner `Kaua` e handoff `BK-MF8-07`.

7. Cenário negativo/erro esperado.

Se encontrares metadados contraditórios, para a execução do BK e regista `BLOQUEADO_POR_CONTRATO` no relatório da MF8. Não escolhas um owner, sprint ou requisito por preferência.


### Passo 2 - Mapear contratos reais de materiais

1. Objetivo funcional do passo no contexto da app.

Identificar os pontos reais por onde texto entra, é extraído, é guardado e é mostrado ao aluno.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/materials/materials.service.ts`
    - REVER: `apps/api/src/modules/material-index/material-index.service.ts`
    - REVER: `apps/api/src/modules/material-index/material-index.controller.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/components/materials/MaterialList.tsx`
    - REVER: `apps/web/src/components/materials/MaterialSubmitForm.tsx`
    - LOCALIZAÇÃO: `submitTextMaterial`, `markIndexedText`, `indexPrivateMaterial`, `processQueuedPrivateJob`, `extractPrivateMaterial`, `extractOfficialMaterial`, `indexPrivateMaterial(...)` no cliente e componente `MaterialList`.

3. Instruções do que fazer.

Lê estes contratos antes de editar:

- `MaterialsService.submitTextMaterial(...)` recebe TOPIC e URL.
- `MaterialsService.submitFile(...)` recebe PDF/DOCX, mas ainda não extrai texto.
- `MaterialIndexController.indexPrivate(...)` cria job de indexação para material privado.
- `MaterialIndexService.extractPrivateMaterial(...)` extrai texto de TOPIC, URL, PDF e DOCX.
- `MaterialIndexService.extractOfficialMaterial(...)` extrai texto oficial de professor.
- `MaterialList` mostra o estado do job e já apresenta `job.errorMessage`.

Decisão `DERIVADO`: a normalização deve ficar no backend e ser chamada nos services, porque só o backend conhece ownership, jobs e persistência.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de leitura técnica e serve para não criar endpoint duplicado nem componente paralelo.

5. Explicação do código.

Não há código novo porque o objetivo é mapear os pontos de integração. O erro que este passo evita é normalizar apenas o formulário TOPIC e esquecer URL, PDF e DOCX, que são entradas reais de texto para fontes processáveis.

6. Validação do passo.

Resultado esperado: lista fechada de pontos de entrada e saída de texto, sem endpoint novo e sem duplicar `MaterialsService` ou `MaterialIndexService`.

7. Cenário negativo/erro esperado.

Se o aluno tentar criar outro endpoint para indexação, deve recuar. O endpoint real já existe: `POST /api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs`.


### Passo 3 - Criar normalização UTF-8/PT-PT

1. Objetivo funcional do passo no contexto da app.

Criar uma unidade backend pequena, testável e reutilizável para preservar acentos e rejeitar texto sem conteúdo legível.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/text/pt-text-normalization.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Ele não sabe nada sobre Mongo, sessão ou materiais; só transforma texto bruto num contrato seguro para os services.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/text/pt-text-normalization.ts
export type NormalizedPortugueseText = {
    text: string;
    hasReadableContent: boolean;
};

const READABLE_PORTUGUESE_TEXT_PATTERN = /[0-9A-Za-zÀ-ÖØ-öø-ÿ]/;
const REPLACEMENT_CHARACTER_PATTERN = /\uFFFD/;

/**
 * Normaliza texto importado sem remover acentos, cedilhas ou quebras de parágrafo úteis.
 *
 * @param value Texto extraído de formulário, URL, PDF, DOCX ou material oficial.
 * @returns Texto em NFC e indicação de conteúdo legível.
 */
export function normalizePortugueseStudyText(value: string): NormalizedPortugueseText {
    const text = value
        .normalize("NFC")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    // O backend rejeita texto vazio ou partido antes de o marcar como fonte para IA.
    const hasReadableContent =
        READABLE_PORTUGUESE_TEXT_PATTERN.test(text) &&
        !REPLACEMENT_CHARACTER_PATTERN.test(text);

    return { text, hasReadableContent };
}
```

5. Explicação do código.

Este ficheiro transforma texto bruto num formato estável. `normalize("NFC")` preserva caracteres portugueses, mas evita diferenças internas entre formas Unicode equivalentes. As substituições de quebras de linha e espaços tornam o texto previsível para chunks, testes e exportação posterior.

A expressão `READABLE_PORTUGUESE_TEXT_PATTERN` aceita letras, números e caracteres acentuados. A expressão `REPLACEMENT_CHARACTER_PATTERN` bloqueia `�`, que costuma indicar texto mal descodificado. Isto cumpre `RNF39`, evita fontes processáveis falsas e prepara `BK-MF8-07` para exportar Markdown/PDF com texto consistente.

6. Validação do passo.

Resultado esperado:

- `"função"` continua `"função"`;
- `"cora\u0063\u0327a\u0303o"` fica em forma Unicode estável;
- texto só com espaços fica `hasReadableContent: false`;
- texto com `�` fica `hasReadableContent: false`.

7. Cenário negativo/erro esperado.

Input `"���"` deve devolver `hasReadableContent: false`. Este texto não pode ser guardado como fonte processável.


### Passo 4 - Integrar normalização no backend

1. Objetivo funcional do passo no contexto da app.

Aplicar a normalização nos pontos onde texto de materiais fica pronto para uso por IA, pesquisa, versões e exportação.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/materials/materials.service.ts`
    - EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`
    - LOCALIZAÇÃO: imports, `markIndexedText`, `submitTextMaterial`, `normalizeMaterialText`, `extractPrivateMaterial`, `extractOfficialMaterial` e `toReadableExtraction`.

3. Instruções do que fazer.

No `MaterialsService`, importa `normalizePortugueseStudyText(...)`, normaliza tópicos antes de os guardar e normaliza texto indexado antes de marcar material como `READY`.

No `MaterialIndexService`, normaliza o texto extraído de TOPIC, URL, PDF, DOCX e material oficial. Se a normalização indicar que não há texto legível, devolve erro controlado e mantém o job como `FAILED`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/materials/materials.service.ts
import { normalizePortugueseStudyText } from "../../common/text/pt-text-normalization.js";

// Dentro da classe MaterialsService, substitui os métodos abaixo.

/**
 * Marca um material como processado depois de indexação textual.
 *
 * @param userId Aluno autenticado.
 * @param materialId Material privado.
 * @param contentText Texto extraído.
 * @returns Nada.
 */
async markIndexedText(
    userId: string,
    materialId: string,
    contentText: string,
): Promise<void> {
    const normalized = this.normalizeMaterialText(contentText);

    await this.materialModel.updateOne(
        {
            _id: new Types.ObjectId(materialId),
            userId: new Types.ObjectId(userId),
        },
        {
            $set: {
                status: "READY",
                // Guardamos apenas texto normalizado e limitado para reduzir exposição de material privado.
                contentText: normalized.slice(0, 10000),
            },
        },
    );
}

/**
 * Submete URL ou tópico textual.
 *
 * @param userId Identificador vindo da sessão.
 * @param studyAreaId Identificador da área.
 * @param input Dados JSON do material.
 * @returns Material criado.
 */
async submitTextMaterial(
    userId: string,
    studyAreaId: string,
    input: CreateMaterialDto,
): Promise<PublicMaterialDto> {
    await this.assertOwnArea(userId, studyAreaId);
    const title = input.title?.trim();
    if (!title) {
        throw new BadRequestException({
            code: "TITLE_REQUIRED",
            message: "Indica um título.",
        });
    }

    if (input.type === "URL") {
        const url = this.parseSafeUrl(input.url);
        const material = await this.materialModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: "URL",
            title,
            url,
            status: "PENDING_PROCESSING",
        });
        await this.historyService.recordEvent(userId, "MATERIAL_SUBMITTED", "URL submetido", title);
        await this.auditLogService.record({
            actorId: userId,
            domain: "MATERIALS",
            action: "PRIVATE_MATERIAL_URL_SUBMITTED",
            resourceType: "Material",
            resourceId: String(material._id),
            result: "SUCCESS",
            metadata: { studyAreaId, type: material.type, status: material.status },
        });
        return this.toPublicMaterial(material.toObject());
    }

    if (input.type === "TOPIC") {
        const contentText = this.normalizeMaterialText(input.topicText ?? "");
        if (contentText.length < 10) {
            throw new BadRequestException({
                code: "TOPIC_TEXT_REQUIRED",
                message: "Escreve pelo menos 10 caracteres legíveis em português.",
            });
        }

        const material = await this.materialModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: "TOPIC",
            title,
            contentText,
            status: "READY",
        });
        await this.historyService.recordEvent(userId, "MATERIAL_SUBMITTED", "Tópico submetido", title);
        await this.auditLogService.record({
            actorId: userId,
            domain: "MATERIALS",
            action: "PRIVATE_MATERIAL_TOPIC_SUBMITTED",
            resourceType: "Material",
            resourceId: String(material._id),
            result: "SUCCESS",
            metadata: { studyAreaId, type: material.type, status: material.status },
        });
        return this.toPublicMaterial(material.toObject());
    }

    throw new BadRequestException({
        code: "INVALID_MATERIAL_TYPE",
        message: "Tipo de material inválido.",
    });
}

/**
 * Normaliza texto privado antes de o guardar como fonte processável.
 *
 * @param value Texto bruto recebido de formulário ou indexação.
 * @returns Texto normalizado e legível.
 */
private normalizeMaterialText(value: string): string {
    const normalized = normalizePortugueseStudyText(value);
    if (!normalized.hasReadableContent) {
        // A mensagem é pública e não inclui excertos do material privado.
        throw new BadRequestException({
            code: "MATERIAL_TEXT_NOT_READABLE",
            message: "O material não tem texto legível para estudar.",
        });
    }

    return normalized.text;
}
```

```ts
// apps/api/src/modules/material-index/material-index.service.ts
import { normalizePortugueseStudyText } from "../../common/text/pt-text-normalization.js";

// Dentro da classe MaterialIndexService, substitui ou acrescenta os métodos abaixo.

/**
 * Extrai texto de material privado e devolve erro controlado quando não há texto legível.
 *
 * @param userId Identificador do aluno autenticado.
 * @param material Material privado já validado por ownership.
 * @returns Texto normalizado ou mensagem pública de erro.
 */
private async extractPrivateMaterial(
    userId: string,
    material: IndexablePrivateMaterial,
): Promise<{ text?: string; errorMessage?: string }> {
    try {
        if (material.type === "TOPIC") {
            return this.toReadableExtraction(material.contentText);
        }
        if (material.type === "URL") {
            return this.toReadableExtraction(await this.fetchTextFromUrl(material.url));
        }
        if (!material.storageKey) {
            return { errorMessage: "O ficheiro do material não está disponível." };
        }

        const buffer = await this.materialsService.readStoredFile(material.storageKey);
        this.documentSafety.assertSafeStoredDocument({
            type: material.type,
            mimeType: material.mimeType,
            byteLength: buffer.byteLength,
            declaredSizeBytes: material.sizeBytes,
            title: material.title,
        });

        if (material.type === "PDF") {
            return this.toReadableExtraction(
                await this.documentSafety.runWithTimeout({
                    label: material.title,
                    // O timeout impede que um PDF problemático prenda a fila de indexação.
                    operation: () => this.extractPdfText(buffer),
                }),
            );
        }
        if (material.type === "DOCX") {
            return this.toReadableExtraction(
                await this.documentSafety.runWithTimeout({
                    label: material.title,
                    // DOCX usa o mesmo limite para manter comportamento previsível entre formatos.
                    operation: () => this.extractDocxText(buffer),
                }),
            );
        }

        return { errorMessage: "Tipo de material privado não suportado." };
    } catch (error) {
        return { errorMessage: this.toExtractionError(error) };
    }
}

/**
 * Extrai texto de material oficial e aplica a mesma regra PT-PT usada em materiais privados.
 *
 * @param material Material oficial já validado pelo professor dono.
 * @returns Texto normalizado ou mensagem pública de erro.
 */
private async extractOfficialMaterial(
    material: IndexableOfficialMaterial,
): Promise<{ text?: string; errorMessage?: string }> {
    try {
        if (material.type === "TEXT") {
            return this.toReadableExtraction(material.textContent);
        }
        if (material.type === "URL") {
            return this.toReadableExtraction(await this.fetchTextFromUrl(material.sourceUrl));
        }
        return { errorMessage: "Tipo de material oficial não suportado." };
    } catch (error) {
        return { errorMessage: this.toExtractionError(error) };
    }
}

/**
 * Converte texto bruto em texto processável ou falha controlada para o job.
 *
 * @param value Texto bruto extraído de TOPIC, URL, PDF, DOCX ou material oficial.
 * @returns Texto normalizado quando existe conteúdo legível.
 */
private toReadableExtraction(value: string | undefined): { text?: string; errorMessage?: string } {
    const normalized = normalizePortugueseStudyText(value ?? "");
    if (!normalized.hasReadableContent) {
        // O job falha sem gravar excertos privados em logs ou na mensagem pública.
        return { errorMessage: "O material não tem texto legível para estudar." };
    }

    return { text: normalized.text };
}
```

5. Explicação do código.

O primeiro bloco fecha a entrada direta de TOPIC e a persistência final de texto indexado. O `userId` continua a vir da sessão, porque `assertOwnArea(...)` corre antes de persistir material. A normalização entra antes de `status: "READY"` para impedir que texto vazio ou mal descodificado seja tratado como fonte processável.

O segundo bloco fecha PDF, DOCX, URL, TOPIC e material oficial textual dentro de `MaterialIndexService`. Em vez de espalhar regras por cada parser, todos os caminhos passam por `toReadableExtraction(...)`. Assim, o BK evita duplicação, preserva a separação entre material privado e oficial e mantém uma mensagem pública em PT-PT quando não há texto legível.

6. Validação do passo.

Resultado esperado:

- TOPIC `"  Função quadrática e equações  "` é guardado como texto normalizado.
- TOPIC `"���"` devolve `400` com `code: "MATERIAL_TEXT_NOT_READABLE"`.
- PDF/DOCX/URL sem texto legível cria job `FAILED` com mensagem `"O material não tem texto legível para estudar."`.
- Nenhum erro público inclui o texto completo do material.

7. Cenário negativo/erro esperado.

Submete um material cujo parser devolve apenas whitespace ou `�`. O job deve ficar `FAILED` e a UI deve mostrar a mensagem PT-PT sem expor conteúdo privado.


### Passo 5 - Mostrar erro PT-PT na UI de materiais

1. Objetivo funcional do passo no contexto da app.

Garantir que o aluno percebe que a indexação falhou por falta de texto legível, mantendo o frontend como consumidor do contrato backend.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/apiClient.ts`
    - EDITAR: `apps/web/src/components/materials/MaterialList.tsx`
    - REVER: `apps/web/src/components/materials/MaterialSubmitForm.tsx`
    - LOCALIZAÇÃO: funções `indexPrivateMaterial`, `getMaterialIndexJob` e componente completo `MaterialList`.

3. Instruções do que fazer.

Mantém os clientes API existentes, porque já usam sessão por cookies através de `requestJson(...)` e `credentials: "include"`. Atualiza a lista de materiais para mostrar estados de job de forma clara e acessível. A UI não decide ownership nem tenta ler conteúdo do ficheiro.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/apiClient.ts
/**
 * Inicia indexação textual de material privado do aluno.
 *
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @param materialId Identificador do material; o backend valida ownership antes de agir.
 * @returns Job de indexação privado com estado e chunks quando disponíveis.
 */
export function indexPrivateMaterial(
    studyAreaId: string,
    materialId: string,
): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(
        `/api/student/study-areas/${studyAreaId}/materials/${materialId}/index-jobs`,
        { method: "POST" },
    );
}

/**
 * Consulta o estado de um job de indexação autorizado.
 *
 * @param jobId Job devolvido pelo pedido inicial; o backend valida ownership.
 * @returns Job com estado atualizado para a UI.
 */
export function getMaterialIndexJob(jobId: string): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(`/api/material-index-jobs/${jobId}`);
}
```

```tsx
// apps/web/src/components/materials/MaterialList.tsx
import { useEffect, useState } from "react";
import {
    listLatestMaterialIndexJobs,
    indexPrivateMaterial,
    MaterialIndexJob,
    StudyMaterial,
} from "../../lib/apiClient.js";

type MaterialListProps = {
    materials: StudyMaterial[];
    studyAreaId: string;
};

/**
 * Lista materiais submetidos numa área de estudo privada.
 *
 * @param props Materiais carregados da API e área autenticada do aluno.
 * @returns Lista visual com estado de processamento e erros PT-PT.
 */
export function MaterialList({ materials, studyAreaId }: MaterialListProps) {
    const [jobsByMaterial, setJobsByMaterial] = useState<Record<string, MaterialIndexJob>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();
        let timer: number | undefined;
        let disposed = false;
        const order = { QUEUED: 0, PROCESSING: 1, DONE: 2, FAILED: 2 } as const;

        const pollLatest = async () => {
            try {
                const latest = await listLatestMaterialIndexJobs(
                    studyAreaId,
                    abortController.signal,
                );
                if (disposed) return;
                setJobsByMaterial((current) => {
                    const next = { ...current };
                    for (const job of latest) {
                        const previous = next[job.materialId];
                        if (!previous || order[job.status] >= order[previous.status]) {
                            next[job.materialId] = job;
                        }
                    }
                    return next;
                });
                if (latest.some((job) => ["QUEUED", "PROCESSING"].includes(job.status))) {
                    timer = window.setTimeout(() => {
                        pollLatest().catch(() => undefined);
                    }, 1500);
                }
            } catch {
                if (!abortController.signal.aborted) {
                    setError("Não foi possível atualizar o estado da indexação.");
                }
            }
        };

        pollLatest().catch(() => undefined);
        return () => {
            disposed = true;
            abortController.abort();
            if (timer !== undefined) window.clearTimeout(timer);
        };
    }, [studyAreaId]);

    /**
     * Inicia indexação e guarda o job devolvido pela API.
     *
     * @param materialId Material privado que o backend volta a validar por ownership.
     * @returns Promise resolvida após atualizar estado local.
     */
    async function handleIndex(materialId: string): Promise<void> {
        setError(null);
        try {
            const job = await indexPrivateMaterial(studyAreaId, materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível indexar o material.",
            );
        }
    }

    if (materials.length === 0) {
        return <p className="text-sm text-slate-600">Ainda não há materiais.</p>;
    }

    return (
        <div className="space-y-3">
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <ul className="space-y-3">
                {materials.map((material) => {
                    const job = jobsByMaterial[material._id];
                    const isIndexing =
                        job?.status === "QUEUED" || job?.status === "PROCESSING";

                    return (
                        <li className="rounded-md border border-slate-200 bg-white p-4" key={material._id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{material.title}</p>
                                    <p className="text-sm text-slate-600">{material.type}</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                    {material.status}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    className="sf-button-secondary"
                                    disabled={isIndexing}
                                    onClick={() => void handleIndex(material._id)}
                                    type="button"
                                >
                                    {isIndexing ? "A indexar..." : "Indexar"}
                                </button>
                                {isIndexing ? (
                                    <p className="text-sm text-slate-600" aria-live="polite">
                                        Indexação em {job.status === "QUEUED" ? "fila" : "processamento"}.
                                    </p>
                                ) : null}
                                {job?.status === "DONE" ? (
                                    <a className="sf-button-secondary" href={`/app/material-index-jobs/${job._id}/versoes`}>
                                        Versões
                                    </a>
                                ) : null}
                                {job?.status === "FAILED" ? (
                                    <p className="text-sm text-red-700" role="alert">
                                        {job.errorMessage ?? "O material não tem texto legível para estudar."}
                                    </p>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
```

5. Explicação do código.

O primeiro bloco confirma que o cliente já chama endpoints reais e não envia tokens manualmente. `requestJson(...)` usa cookies HttpOnly com `credentials: "include"`, por isso o frontend não precisa de decidir identidade.

O componente mostra loading durante `QUEUED`/`PROCESSING`, sucesso quando o job fica `DONE` e erro quando fica `FAILED`. A mensagem vem do backend, mas existe fallback PT-PT caso o erro não traga texto. Isto preserva segurança, porque a UI mostra apenas estado e mensagem pública, não o conteúdo extraído do material.

6. Validação do passo.

Resultado esperado: ao indexar material sem texto legível, a lista mostra `"O material não tem texto legível para estudar."` com `role="alert"`.

7. Cenário negativo/erro esperado.

Se a sessão expirar, o pedido ao job deve falhar com erro público da API. A UI não deve tentar construir acesso localmente nem esconder a falha.


### Passo 6 - Criar testes automatizados

1. Objetivo funcional do passo no contexto da app.

Provar a regra de normalização, a rejeição de texto sem conteúdo útil e a integração com materials/indexação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/text/pt-text-normalization.spec.ts`
    - EDITAR: `apps/api/src/modules/materials/materials.service.spec.ts`
    - EDITAR: `apps/api/src/modules/material-index/material-index.service.spec.ts`
    - LOCALIZAÇÃO: suites Jest de backend.

3. Instruções do que fazer.

Cria a suite da unidade de normalização e acrescenta testes focados às suites existentes. Usa dados artificiais sem emails reais, nomes reais ou materiais privados completos.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/text/pt-text-normalization.spec.ts
import { normalizePortugueseStudyText } from "./pt-text-normalization.js";

describe("normalizePortugueseStudyText", () => {
    it("preserva acentos e cedilhas em NFC", () => {
        const result = normalizePortugueseStudyText("  func\u0327a\u0303o quadrática  ");

        expect(result).toEqual({
            text: "função quadrática",
            hasReadableContent: true,
        });
    });

    it("normaliza espaços e quebras de linha sem apagar parágrafos", () => {
        const result = normalizePortugueseStudyText("Linha  1\r\n\r\n\r\nLinha\t2");

        // Duas quebras mantêm parágrafos úteis para chunks e exportação futura.
        expect(result.text).toBe("Linha 1\n\nLinha 2");
        expect(result.hasReadableContent).toBe(true);
    });

    it("rejeita texto vazio ou com caracteres de substituição", () => {
        expect(normalizePortugueseStudyText("   ").hasReadableContent).toBe(false);
        expect(normalizePortugueseStudyText("���").hasReadableContent).toBe(false);
    });
});
```

```ts
// apps/api/src/modules/materials/materials.service.spec.ts
it("normaliza tópico PT-PT antes de persistir material privado", async () => {
    const materialModel = {
        create: jest.fn().mockResolvedValue({
            toObject: () => ({
                _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                userId,
                studyAreaId,
                title: "Funções",
                type: "TOPIC",
                status: "READY",
                contentText: "função quadrática",
            }),
        }),
    };
    const { service } = makeService(materialModel);

    await service.submitTextMaterial(userId, studyAreaId, {
        type: "TOPIC",
        title: "Funções",
        topicText: "  func\u0327a\u0303o quadrática  ",
    });

    // O service guarda texto já normalizado; o frontend nunca decide ownership.
    expect(materialModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
            contentText: "função quadrática",
            status: "READY",
        }),
    );
});

it("rejeita tópico sem texto legível", async () => {
    const materialModel = { create: jest.fn() };
    const { service } = makeService(materialModel);

    await expect(
        service.submitTextMaterial(userId, studyAreaId, {
            type: "TOPIC",
            title: "Ficheiro vazio",
            topicText: "���",
        }),
    ).rejects.toMatchObject({
        response: {
            code: "MATERIAL_TEXT_NOT_READABLE",
            message: "O material não tem texto legível para estudar.",
        },
    });
    expect(materialModel.create).not.toHaveBeenCalled();
});
```

```ts
// apps/api/src/modules/material-index/material-index.service.spec.ts
it("falha job quando PDF não tem texto legível", async () => {
    const { documentSafety, jobModel, materialsService, service } = makeService({
        title: "PDF vazio",
        type: "PDF",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        storageKey: "private/pdf-vazio.pdf",
    });
    materialsService.readStoredFile.mockResolvedValueOnce(Buffer.from("%PDF-conteudo"));
    documentSafety.runWithTimeout.mockResolvedValueOnce("   ");

    await expect(
        service.indexPrivateMaterial(student, studyAreaId, materialId),
    ).resolves.toMatchObject({
        status: "FAILED",
        errorMessage: "O material não tem texto legível para estudar.",
    });

    // Texto vazio não pode ser marcado como READY nem alimentar fluxos de IA.
    expect(materialsService.markIndexedText).not.toHaveBeenCalled();
    expect(jobModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
            status: "FAILED",
            errorMessage: "O material não tem texto legível para estudar.",
        }),
    );
});

it("normaliza texto extraído antes de criar chunks", async () => {
    const { jobModel, materialsService, service } = makeService({
        title: "Tópico",
        type: "TOPIC",
        contentText: "  func\u0327a\u0303o quadrática  ",
    });

    await expect(
        service.indexPrivateMaterial(student, studyAreaId, materialId),
    ).resolves.toMatchObject({
        status: "DONE",
        extractedTextChunks: [{ order: 1, text: "função quadrática" }],
    });

    expect(materialsService.markIndexedText).toHaveBeenCalledWith(
        student.id,
        materialId,
        "função quadrática",
    );
    expect(jobModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
            status: "DONE",
            extractedTextChunks: expect.arrayContaining([
                expect.objectContaining({ text: "função quadrática" }),
            ]),
        }),
    );
});
```

5. Explicação do código.

A primeira suite prova a regra pequena: Unicode em NFC, espaços previsíveis e rejeição de texto partido. As suites de service provam que a regra entra no caminho real da app. O teste de materials garante que TOPIC não persiste texto quebrado. O teste de indexação garante que PDF/TOPIC sem texto útil não cria fonte processável nem chunks falsos.

Os testes usam valores artificiais e `jest.fn()` apenas como duplos de teste. Isso é correto porque a validação pretendida é a regra do service, não MongoDB real, rede externa ou parser real.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run test -- pt-text-normalization materials.service material-index.service
```

Resultado esperado: as três suites passam e mostram pelo menos um caminho feliz e um negativo de texto não legível.

7. Cenário negativo/erro esperado.

Se o teste de PDF vazio marcar job `DONE`, a integração está errada. Corrige `toReadableExtraction(...)` antes de avançar para `BK-MF8-07`.


### Passo 7 - Validar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-06` com provas objetivas e preparar `BK-MF8-07` para exportar texto normalizado.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções `Validação final`, `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista no PR ou documento de evidence:

- comandos executados;
- expected result;
- observed result;
- caso com acentos e cedilhas;
- caso sem texto legível;
- ficheiros alterados;
- confirmação de que não há dados privados em logs/evidence;
- impacto no `BK-MF8-07`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e fecha a rastreabilidade da entrega.

5. Explicação do código.

Não há código novo. A entrega é a prova: o aluno deve conseguir mostrar que a regra protege materiais privados, fontes processáveis e exportação futura sem inventar comportamento fora de `RNF39`.

6. Validação do passo.

Resultado esperado: relatório/evidence com comandos, output, negativo de texto não legível e confirmação de ausência de dados sensíveis.

7. Cenário negativo/erro esperado.

Se algum comando falhar, regista o erro observado e não marques o BK como concluído até corrigir a causa.


#### Critérios de aceite

- Header e metadados iguais à matriz, backlog, contrato de campos e anexos.
- `RNF39` entregue sem alterar requisitos fora do escopo.
- `apps/api/src/common/text/pt-text-normalization.ts` criado com `normalizePortugueseStudyText(...)`.
- TOPIC, URL, PDF, DOCX e material oficial textual passam por normalização backend antes de ficarem processáveis.
- Texto com acentos e cedilhas é preservado.
- Texto vazio, whitespace ou `�` não fica marcado como fonte processável.
- Backend valida ownership antes de ler ou indexar material privado.
- UI mostra erro PT-PT para job `FAILED`.
- Testes cobrem caminho feliz e negativos críticos.
- Evidence não contém material completo, prompts privados, respostas IA completas, cookies, tokens ou dados pessoais reais.
- `BK-MF8-07` pode consumir texto normalizado para exportação PDF/MD.

#### Validação final

Executa:

```bash
npm --prefix apps/api run test -- pt-text-normalization materials.service material-index.service
git diff --check
bash scripts/validate-planificacao.sh
```

Expected results:

- testes focados passam;
- pesquisas obrigatórias de termos internos e caminhos privados não devolvem ocorrências nos BKs MF8;
- `git diff --check` não devolve output;
- validador da planificação fica em `overall_pass: true`.

#### Evidence para PR/defesa

- `pr`: `BK-MF8-06` entrega `RNF39` com normalização UTF-8/PT-PT.
- `proof`: teste com `"função quadrática"` preservado.
- `neg`: teste com `"���"` ou whitespace a falhar com mensagem PT-PT.
- `privacy`: logs/evidence sem conteúdo completo de materiais privados.
- `backend`: `MaterialsService` e `MaterialIndexService` validam texto no backend.
- `frontend`: `MaterialList` mostra job `FAILED` em português de Portugal.
- `handoff`: `BK-MF8-07` recebe texto normalizado para exportação.

#### Handoff

O próximo BK é `BK-MF8-07`. Ele pode assumir que materiais privados e oficiais processáveis têm texto normalizado em NFC, preservam acentos/cedilhas e falham com mensagem PT-PT quando não existe texto legível.

`BK-MF8-07` não precisa de repetir normalização Unicode. Deve focar exportação Markdown/PDF, ownership do artefacto e minimização de fontes exportadas.

#### Changelog

- `2026-07-01`: guia corrigido para fechar integração backend, fluxo de indexação, UI de erro PT-PT, testes executáveis e handoff para exportação.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com estrutura completa, caminhos públicos, decisões CANONICO/DERIVADO, código integrado, validação por passo, negativos e handoff.
