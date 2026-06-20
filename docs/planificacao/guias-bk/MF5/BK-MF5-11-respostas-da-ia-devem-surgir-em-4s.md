# BK-MF5-11 - Respostas da IA devem surgir em ≤ 4s.

## Header

- `doc_id`: `GUIA-BK-MF5-11`
- `bk_id`: `BK-MF5-11`
- `macro`: `MF5`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF09`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-12`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-11-respostas-da-ia-devem-surgir-em-4s.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais implementar um budget backend de 4 segundos para respostas IA, sem contornar fontes, ownership, membership, consentimentos, políticas, quotas, validação do provider ou auditoria.

#### Importância

`RNF09` é CANONICO e define que respostas IA devem surgir em `≤ 4s`. Esta regra protege a experiência do aluno, mas também protege a honestidade pedagógica: se a IA demorar demasiado, o sistema deve falhar com uma mensagem clara em vez de inventar conteúdo, esconder o erro ou expor dados privados.

#### Scope-in

- Criar `apps/api/src/modules/ai/utils/with-ai-response-budget.ts`.
- Aplicar o budget em `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`.
- Aplicar o budget em `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`.
- Usar `GatewayTimeoutException` para preservar resposta HTTP adequada a timeout.
- Manter a ordem obrigatória: autorização/fontes antes do provider.
- Criar teste unitário para o helper de budget.
- Documentar expected results para ausência de fontes, provider lento e resposta inválida.

#### Scope-out

- Criar novo provider IA.
- Alterar prompts funcionais fora dos services alvo.
- Alterar endpoints, controllers, DTOs ou schemas de domínio.
- Criar RAG, embeddings, OCR, chunking semântico ou indexação automática nova.
- Mover ownership, membership, consentimento, políticas ou quotas para o frontend.
- Guardar prompts privados, respostas IA completas, cookies, tokens ou conteúdos de materiais em logs.

#### Estado antes e depois

- **Antes:** alguns services IA usam `policy.timeoutMs` no provider, mas não existe contrato comum do RNF09 que garanta mensagem e exceção de timeout preservadas nos services alvo.
- **Depois:** os services alvo usam um helper comum de budget, mantêm validações antes do provider, preservam `GatewayTimeoutException` e devolvem fallback honesto quando a IA excede 4 segundos.

#### Pre-requisitos

- Ler `RNF09` em `docs/RNF.md`.
- Rever a linha de `BK-MF5-11` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `BK-MF4-08`, porque auditoria IA deve ser minimizada.
- Rever `BK-MF4-09`, porque políticas de modelo já definem `timeoutMs`.
- Rever `BK-MF4-10`, porque quotas são reservadas antes do provider.
- Rever `apps/api/src/modules/ai/providers/ai-provider.ts`.
- Rever `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`.
- Rever `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`.
- Rever testes existentes em `apps/api/src/modules/**/*service.spec.ts`.

#### Glossário

- **Budget IA:** limite máximo para esperar por uma chamada externa de IA.
- **Provider IA:** integração isolada que chama o modelo externo.
- **`GatewayTimeoutException`:** exceção NestJS adequada para comunicar timeout de serviço externo.
- **Fallback honesto:** mensagem que assume a indisponibilidade ou demora sem fabricar resposta.
- **Fonte processável:** material textual autorizado que pode alimentar resposta IA.
- **Prompt:** instrução enviada ao provider, construída depois das validações de domínio.
- **Quota IA:** limite de consumo configurado na MF4 para evitar abuso ou custo descontrolado.
- **Auditoria minimizada:** registo de evento sem guardar prompt, resposta completa ou dados sensíveis.

#### Conceitos teóricos essenciais

- **Timeout não é resposta:** se a IA excede 4 segundos, o sistema não deve inventar conteúdo. Deve devolver erro controlado e permitir nova tentativa.
- **Ordem de segurança:** primeiro valida-se sessão, role, ownership ou membership; depois fontes; depois consentimento; depois política; depois quota; só no fim se chama o provider.
- **Provider isolado:** os services de domínio usam `AI_PROVIDER`, não o SDK diretamente. Isto permite trocar provider sem reescrever regras StudyFlow.
- **`policy.timeoutMs`:** valor administrativo vindo de MF4. Este BK não o ignora; usa o menor valor entre a política e o limite `RNF09` de 4000 ms.
- **`Promise.race`:** técnica para limitar a espera local. Ela devolve timeout ao service, mas não substitui o timeout nativo do provider. Por isso o provider também recebe `timeoutMs`.
- **Fontes e alucinação:** respostas IA só são aceites depois de validar que usam fontes autorizadas. Timeout não pode saltar essa validação.
- **Auditoria e privacidade:** sucesso e falha podem ser auditados, mas sem guardar prompt privado, resposta completa, cookie, token ou texto integral de materiais.
- **Evidence técnico:** testes unitários devem provar resultado dentro do budget e erro `GatewayTimeoutException` quando a operação é lenta.

#### Arquitetura do BK

O helper `with-ai-response-budget.ts` fica em `apps/api/src/modules/ai/utils` porque é uma regra técnica comum da camada IA. `PrivateAreaAiService` usa o helper depois de validar aluno, ownership, fontes, consentimento, política e quota. `SourceGroundedAiService` usa o helper depois de validar jobs legíveis e citações. Os testes unitários ficam junto ao helper para provar o contrato do RNF09 sem depender de rede externa.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai/utils/with-ai-response-budget.ts`
- CRIAR: `apps/api/src/modules/ai/utils/with-ai-response-budget.spec.ts`
- EDITAR: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- REVER: `apps/api/src/modules/ai/providers/ai-provider.ts`
- REVER: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- REVER: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
- REVER: `apps/api/src/modules/audit-log/audit-log.service.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato IA e dependências

1. Objetivo funcional do passo no contexto da app.

Confirmar que o BK aplica `RNF09` sem quebrar contratos de IA entregues nas fases anteriores.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `docs/planificacao/guias-bk/MF4/BK-MF4-08-auditoria-completa-materiais-ia-papeis.md`
    - REVER: `docs/planificacao/guias-bk/MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md`
    - REVER: `docs/planificacao/guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md`
    - LOCALIZAÇÃO: `RNF09`, `RF35`, `RF36`, `RF38`, `RF58` e handoff MF4.

3. Instruções do que fazer.

Confirma que o limite de 4 segundos é não funcional e não altera a regra de fontes, guardrails ou quotas. Identifica os services IA que chamam provider e escolhe apenas os dois alvo deste BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha contrato e ordem de segurança antes da implementação.

5. Explicação do código.

Não há código porque a decisão mais importante é a ordem: nunca chamas o provider antes de validar acesso, fontes, consentimento, política e quota. Isto evita respostas IA fora de contexto ou consumos indevidos.

6. Validação do passo.

Confirma que `AI_PROVIDER` já aceita `options.timeoutMs` e que `OpenAiProvider` mapeia timeout externo para `GatewayTimeoutException`.

7. Cenário negativo/erro esperado.

Se o helper for aplicado antes de validar fontes ou permissões, um utilizador pode consumir IA num contexto que ainda não foi autorizado.

### Passo 2 - Criar helper de budget IA

1. Objetivo funcional do passo no contexto da app.

Criar um helper backend comum que limita a espera a 4000 ms e preserva erro HTTP de timeout.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/utils/with-ai-response-budget.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `apps/api/src/modules/ai/utils` se ainda não existir. Depois cria o ficheiro abaixo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/utils/with-ai-response-budget.ts
import { GatewayTimeoutException } from "@nestjs/common";

export const AI_RESPONSE_BUDGET_MS = 4000;

/**
 * Escolhe o budget efetivo para uma chamada IA.
 *
 * @param policyTimeoutMs Timeout configurado em política administrativa.
 * @param rnBudgetMs Limite máximo definido pelo RNF09.
 * @returns Menor timeout positivo entre política e RNF09.
 */
export function resolveAiBudgetMs(
    policyTimeoutMs?: number,
    rnBudgetMs = AI_RESPONSE_BUDGET_MS,
): number {
    if (
        typeof policyTimeoutMs !== "number" ||
        !Number.isFinite(policyTimeoutMs) ||
        policyTimeoutMs <= 0
    ) {
        return rnBudgetMs;
    }

    return Math.min(policyTimeoutMs, rnBudgetMs);
}

/**
 * Executa uma chamada IA dentro do budget público do StudyFlow.
 *
 * @param operation Promessa devolvida pelo provider depois das validações de domínio.
 * @param budgetMs Tempo máximo de espera em milissegundos.
 * @returns Resultado da operação quando termina dentro do limite.
 * @throws GatewayTimeoutException quando a operação excede o budget.
 */
export async function withAiResponseBudget<T>(
    operation: Promise<T>,
    budgetMs = AI_RESPONSE_BUDGET_MS,
): Promise<T> {
    let timeoutRef: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
        timeoutRef = setTimeout(() => {
            // O timeout devolve erro honesto em vez de fabricar uma resposta IA.
            reject(new GatewayTimeoutException({
                code: "AI_RESPONSE_TIMEOUT",
                message: "A IA demorou demasiado a responder. Tenta novamente com uma pergunta mais focada.",
            }));
        }, budgetMs);
    });

    try {
        return await Promise.race([operation, timeout]);
    } finally {
        if (timeoutRef) {
            clearTimeout(timeoutRef);
        }
    }
}
```

5. Explicação do código.

`AI_RESPONSE_BUDGET_MS` fixa o contrato de `RNF09`: 4000 ms. `resolveAiBudgetMs` respeita a política administrativa de MF4 e escolhe o menor valor positivo; assim, uma política mais restritiva continua a mandar. `withAiResponseBudget` usa `Promise.race` para devolver `GatewayTimeoutException` se a operação demorar demais. O helper não cria resposta, não lê fontes e não decide permissões. Ele só limita a espera depois de o service ter feito as validações de domínio.

6. Validação do passo.

Chama `resolveAiBudgetMs(6000)` e confirma `4000`; chama `resolveAiBudgetMs(1500)` e confirma `1500`.

7. Cenário negativo/erro esperado.

Se o helper lançar `RequestTimeoutException`, os services atuais podem converter o erro em resposta genérica. Usa `GatewayTimeoutException`, porque os services IA já preservam esse tipo.

### Passo 3 - Aplicar budget na IA privada da área

1. Objetivo funcional do passo no contexto da app.

Limitar a chamada ao provider na IA privada sem alterar ownership, fontes, consentimento, política, quota ou auditoria.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
    - REVER: `apps/api/src/modules/ai/providers/ai-provider.ts`
    - REVER: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
    - REVER: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
    - LOCALIZAÇÃO: imports e método `ask`.

3. Instruções do que fazer.

Adiciona o import do helper e substitui a chamada direta ao provider por `withAiResponseBudget`. Mantém todo o código anterior de validação e auditoria.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/private-area-ai/private-area-ai.service.ts
import {
    resolveAiBudgetMs,
    withAiResponseBudget,
} from "../ai/utils/with-ai-response-budget.js";

// Substitui o método ask completo por esta versão dentro da classe PrivateAreaAiService.
async ask(
    actor: AuthenticatedUser,
    studyAreaId: string,
    input: AskPrivateAreaAiDto,
) {
    if (actor.role !== "STUDENT") {
        throw new ForbiddenException({
            code: "STUDENT_ROLE_REQUIRED",
            message: "Esta funcionalidade é exclusiva de alunos.",
        });
    }

    // Ownership é validado antes de qualquer fonte privada ou chamada IA.
    const area = await this.studyAreasService.getMyStudyArea(
        actor.id,
        studyAreaId,
    );
    const materials = await this.materialsService.listReadyTextSources(
        actor.id,
        studyAreaId,
    );
    const sources = materials.map((material) => ({
        materialId: String(material._id),
        title: material.title,
        contentText: material.contentText ?? "",
    }));

    if (sources.length === 0) {
        throw new UnprocessableEntityException({
            code: "NO_PRIVATE_AI_SOURCES",
            message: "Esta área ainda não tem materiais processáveis para IA.",
        });
    }

    await this.aiConsentsService.assertGranted(actor.id, "PRIVATE_AREA_AI");
    const policy = await this.aiModelPoliciesService.resolveForUse("PRIVATE_AREA_AI");
    const limitedSources = sources.slice(0, policy.maxSourceCount);
    const prompt = buildPrivateAreaAiPrompt({
        areaName: area.name,
        question: input.question.trim(),
        sources: limitedSources,
    });

    assertPromptWithinLimit(prompt, policy);
    await this.aiQuotasService.reserveUsage({
        scope: "USER",
        targetId: actor.id,
        purpose: "PRIVATE_AREA_AI",
        units: this.estimateUsageUnits(prompt),
    });

    const budgetMs = resolveAiBudgetMs(policy.timeoutMs);

    try {
        const result = await withAiResponseBudget(
            this.aiProvider.generatePrivateAreaAnswer({
                prompt,
                // O provider também recebe o timeout para cortar a chamada externa no SDK.
                options: { model: policy.model, timeoutMs: budgetMs },
            }),
            budgetMs,
        );

        this.validateResult(result, limitedSources.map((source) => source.materialId));

        const answer = await this.answerModel.create({
            studyAreaId: new Types.ObjectId(studyAreaId),
            studentId: new Types.ObjectId(actor.id),
            question: input.question.trim(),
            answer: result.answer.trim(),
            sourceMaterialIds: result.sourceMaterialIds.map(
                (sourceId) => new Types.ObjectId(sourceId),
            ),
        });

        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "PRIVATE_AREA_AI_REQUESTED",
            resourceType: "StudyArea",
            resourceId: studyAreaId,
            result: "SUCCESS",
            metadata: {
                purpose: "PRIVATE_AREA_AI",
                model: policy.model,
                sourceCount: limitedSources.length,
                budgetMs,
            },
        });

        return {
            _id: String(answer._id),
            studyAreaId,
            question: answer.question,
            answer: answer.answer,
            sources: limitedSources.filter((source) =>
                result.sourceMaterialIds.includes(source.materialId),
            ),
            createdAt: (answer.toObject() as { createdAt?: Date }).createdAt,
        };
    } catch (error) {
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "PRIVATE_AREA_AI_REQUESTED",
            resourceType: "StudyArea",
            resourceId: studyAreaId,
            result: "FAILED",
            metadata: {
                purpose: "PRIVATE_AREA_AI",
                model: policy.model,
                sourceCount: limitedSources.length,
                budgetMs,
            },
        });

        if (
            error instanceof GatewayTimeoutException ||
            error instanceof ServiceUnavailableException ||
            error instanceof UnprocessableEntityException
        ) {
            throw error;
        }

        throw new ServiceUnavailableException({
            code: "AI_PROVIDER_UNAVAILABLE",
            message: "A IA está temporariamente indisponível.",
        });
    }
}
```

5. Explicação do código.

O método mantém a ordem de segurança: role, ownership da área, fontes processáveis, consentimento, política, limite de prompt e quota acontecem antes do provider. `resolveAiBudgetMs(policy.timeoutMs)` garante que a política administrativa não é ignorada. `withAiResponseBudget` envolve apenas a chamada externa, e `options.timeoutMs` passa o mesmo limite ao provider. A auditoria regista `budgetMs`, `sourceCount` e modelo, mas não guarda prompt nem resposta completa. O `catch` preserva `GatewayTimeoutException`, evitando transformar o timeout em erro genérico.

6. Validação do passo.

Testa uma chamada IA privada com provider lento. Expected result: HTTP `504` com código `AI_RESPONSE_TIMEOUT` e mensagem segura.

7. Cenário negativo/erro esperado.

Se a área não tiver fontes, o service deve devolver `422 NO_PRIVATE_AI_SOURCES` antes de chamar o provider e antes de consumir quota.

### Passo 4 - Aplicar budget na IA com fontes obrigatórias

1. Objetivo funcional do passo no contexto da app.

Limitar a chamada IA que responde com citações, preservando bloqueio sem fontes e validação de resposta.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
    - REVER: `apps/api/src/modules/material-index/material-index.service.ts`
    - REVER: `apps/api/src/modules/ai/providers/ai-provider.ts`
    - LOCALIZAÇÃO: imports e método privado `generateAnswer`.

3. Instruções do que fazer.

Adiciona `GatewayTimeoutException` ao import existente de `@nestjs/common`, importa o helper e substitui o método privado `generateAnswer` pela versão abaixo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts
import { GatewayTimeoutException } from "@nestjs/common";
import {
    AI_RESPONSE_BUDGET_MS,
    withAiResponseBudget,
} from "../ai/utils/with-ai-response-budget.js";

// Substitui o método generateAnswer completo por esta versão dentro de SourceGroundedAiService.
private async generateAnswer(
    question: string,
    citations: SourceGroundedCitation[],
): Promise<string> {
    const prompt = [
        "Responde em português de Portugal e só usa factos suportados pelas fontes.",
        "Não acrescentes conhecimento externo nem conteúdo não citado.",
        "Pergunta:",
        question.trim(),
        "Fontes autorizadas:",
        citations
            .map(
                (citation, index) =>
                    `Fonte ${index + 1} (${citation.sourceJobId}, ${citation.locator}): ${citation.excerpt}`,
            )
            .join("\n"),
        "Devolve JSON com a chave answer.",
    ].join("\n");

    let providerResult: Record<string, unknown>;

    try {
        providerResult = await withAiResponseBudget(
            this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
                // O timeout também chega ao provider para alinhar RNF09 e SDK externo.
                options: { timeoutMs: AI_RESPONSE_BUDGET_MS },
            }),
            AI_RESPONSE_BUDGET_MS,
        );
    } catch (error) {
        if (error instanceof GatewayTimeoutException) {
            throw error;
        }

        throw new ServiceUnavailableException({
            code: "AI_PROVIDER_UNAVAILABLE",
            message: "A IA está temporariamente indisponível.",
        });
    }

    const answer = providerResult.answer;
    if (typeof answer !== "string" || answer.trim().length === 0) {
        throw new ServiceUnavailableException({
            code: "AI_PROVIDER_INVALID_RESPONSE",
            message: "A IA devolveu uma resposta inválida.",
        });
    }

    return answer.trim();
}
```

5. Explicação do código.

`SourceGroundedAiService.ask()` já valida jobs legíveis e bloqueia quando não há citações. O método `generateAnswer` só é chamado depois dessa validação, por isso o helper não contorna fontes. O provider recebe `timeoutMs: 4000` e a chamada também fica envolvida por `withAiResponseBudget`. Se o provider for lento, `GatewayTimeoutException` é preservada. Se o provider falhar por outro motivo, o service devolve indisponibilidade genérica. Se devolver JSON inválido ou sem `answer`, o service mantém `AI_PROVIDER_INVALID_RESPONSE`.

6. Validação do passo.

Testa provider lento e confirma `504 AI_RESPONSE_TIMEOUT`. Testa pergunta sem fontes citáveis e confirma que o erro continua `422 NO_INDEXED_SOURCES`.

7. Cenário negativo/erro esperado.

Se o timeout for aplicado antes de `findReadableDoneJob`, o service pode esconder uma falha de autorização ou mistura de fontes.

### Passo 5 - Criar teste unitário do helper

1. Objetivo funcional do passo no contexto da app.

Provar que o helper devolve resultado dentro do limite e lança timeout acima do limite.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/utils/with-ai-response-budget.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria um teste unitário simples, sem rede externa, para validar `resolveAiBudgetMs` e `withAiResponseBudget`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/utils/with-ai-response-budget.spec.ts
import { GatewayTimeoutException } from "@nestjs/common";
import {
    AI_RESPONSE_BUDGET_MS,
    resolveAiBudgetMs,
    withAiResponseBudget,
} from "./with-ai-response-budget.js";

describe("withAiResponseBudget", () => {
    it("usa 4000 ms como limite RNF09 quando a política é maior", () => {
        expect(resolveAiBudgetMs(6000)).toBe(AI_RESPONSE_BUDGET_MS);
    });

    it("respeita política mais restritiva do que RNF09", () => {
        expect(resolveAiBudgetMs(1500)).toBe(1500);
    });

    it("devolve resultado quando a operação termina dentro do budget", async () => {
        await expect(withAiResponseBudget(Promise.resolve("ok"), 50)).resolves.toBe("ok");
    });

    it("lança GatewayTimeoutException quando a operação excede o budget", async () => {
        const slowOperation = new Promise<string>((resolve) => {
            setTimeout(() => resolve("tarde"), 30);
        });

        // O teste prova o fallback honesto: uma resposta tardia não é apresentada como sucesso.
        await expect(withAiResponseBudget(slowOperation, 5)).rejects.toBeInstanceOf(
            GatewayTimeoutException,
        );
    });
});
```

5. Explicação do código.

Os dois primeiros testes provam a regra entre política administrativa e `RNF09`. O terceiro teste confirma que o helper não atrapalha chamadas rápidas. O quarto teste cria uma operação lenta e espera `GatewayTimeoutException`. O teste não chama provider externo, não usa dados reais e não guarda prompt ou resposta IA.

6. Validação do passo.

Executa `cd apps/api && npm run test -- with-ai-response-budget.spec.ts`. Expected result: todos os testes verdes.

7. Cenário negativo/erro esperado.

Se o teste esperar `ServiceUnavailableException`, ele deixa de provar o contrato de timeout. O esperado é `GatewayTimeoutException`.

### Passo 6 - Validar que fontes e quotas continuam antes do provider

1. Objetivo funcional do passo no contexto da app.

Garantir que a nova regra de 4 segundos não muda segurança, fontes ou consumo.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
    - REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
    - REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.spec.ts`, se existir
    - REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
    - LOCALIZAÇÃO: ordem dos awaits antes de `withAiResponseBudget`.

3. Instruções do que fazer.

Confirma, por leitura e teste, que `withAiResponseBudget` aparece apenas depois das validações de fontes e permissões.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é uma revisão obrigatória da ordem de execução e dos testes já existentes para ausência de fontes.

5. Explicação do código.

Em `PrivateAreaAiService`, `getMyStudyArea`, `listReadyTextSources`, `assertGranted`, `resolveForUse`, `assertPromptWithinLimit` e `reserveUsage` ficam antes do provider. Em `SourceGroundedAiService`, `findReadableDoneJob` e a construção de `citations` ficam antes de `generateAnswer`. Isto preserva ownership, fontes, consentimento, políticas e quotas.

6. Validação do passo.

Executa testes existentes de IA privada e IA com fontes obrigatórias. Expected results: ausência de fontes continua a devolver `422` e provider lento devolve `504`.

7. Cenário negativo/erro esperado.

Se uma chamada sem fontes chegar ao provider, a ordem de segurança foi quebrada e o BK não pode ser considerado concluído.

### Passo 7 - Validar build, testes e evidence

1. Objetivo funcional do passo no contexto da app.

Confirmar que TypeScript/NestJS e Jest aceitam a alteração.

2. Ficheiros envolvidos:
    - REVER: `apps/api/package.json`
    - REVER: `apps/api/jest.config.cjs`
    - LOCALIZAÇÃO: terminal.

3. Instruções do que fazer.

Executa build e teste unitário. Se faltar ambiente local, regista o erro real.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/api
npm run build
npm run test -- with-ai-response-budget.spec.ts
```

5. Explicação do código.

`npm run build` valida imports e tipos NestJS. O teste unitário valida o helper do RNF09. Estes comandos não provam qualidade do provider externo em produção, mas provam que a integração ensinada compila e que o contrato de timeout é testável.

6. Validação do passo.

Expected result: build sem erros e teste verde. Se Mongo, Redis ou outro serviço local faltarem, estes comandos não deveriam depender deles; se dependerem, regista o bloqueio.

7. Cenário negativo/erro esperado.

Se o build falhar por import de `with-ai-response-budget.js`, confirma que o ficheiro está em `apps/api/src/modules/ai/utils`.

### Passo 8 - Preparar handoff para concorrência

1. Objetivo funcional do passo no contexto da app.

Deixar `BK-MF5-12` com um contrato claro: frontend medido no BK anterior e timeout IA protegido neste BK.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
    - REVER: `apps/api/src/modules/ai/utils/with-ai-response-budget.ts`
    - LOCALIZAÇÃO: secção Handoff e evidence.

3. Instruções do que fazer.

Regista que o próximo BK deve testar concorrência sem reabrir a regra do timeout IA.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo documenta fronteiras para o BK seguinte.

5. Explicação do código.

`BK-MF5-12` pode simular concorrência sabendo que páginas medidas e chamadas IA já têm limites locais. Isto impede que o teste de 200 utilizadores misture três problemas ao mesmo tempo: UI lenta, provider IA sem timeout e concorrência.

6. Validação do passo.

Confirma que `BK-MF5-12` não cria outro helper de timeout IA.

7. Cenário negativo/erro esperado.

Se o próximo BK criar novo timeout paralelo, a equipa passa a ter dois contratos diferentes para a mesma regra.

#### Critérios de aceite

- `with-ai-response-budget.ts` existe e exporta `AI_RESPONSE_BUDGET_MS`, `resolveAiBudgetMs` e `withAiResponseBudget`.
- O helper lança `GatewayTimeoutException` quando a operação excede o budget.
- `PrivateAreaAiService` chama provider só depois de ownership, fontes, consentimento, política, prompt limit e quota.
- `SourceGroundedAiService` chama provider só depois de jobs legíveis e citações.
- O provider recebe `timeoutMs` alinhado com `RNF09`.
- Erros sem fontes continuam `422`.
- Provider lento devolve `504 AI_RESPONSE_TIMEOUT`.
- Resposta inválida do provider continua a falhar com erro controlado.
- Auditoria não guarda prompt privado, resposta completa, cookies, tokens ou texto integral de materiais.

#### Validação final

- Executar `cd apps/api && npm run build`.
- Executar `cd apps/api && npm run test -- with-ai-response-budget.spec.ts`.
- Executar testes existentes de `private-area-ai` e `source-grounded-ai` quando o ambiente permitir.
- Confirmar cenário negativo: sem fontes não chama provider; provider lento devolve `GatewayTimeoutException`; provider inválido continua `ServiceUnavailableException`.
- Erros comuns a evitar: aplicar timeout antes de validar fontes, usar `RequestTimeoutException`, ignorar `policy.timeoutMs`, guardar prompt em auditoria e esconder timeout como erro genérico.

#### Evidence para PR/defesa

- Output de `npm run build`.
- Output de `npm run test -- with-ai-response-budget.spec.ts`.
- Resultado esperado `504 AI_RESPONSE_TIMEOUT` para provider lento.
- Nota a explicar que `RNF09` limita espera, mas não autoriza resposta sem fontes nem contorna quotas.

#### Handoff

`BK-MF5-12` recebe IA com timeout controlado e páginas já medidas pelo `BK-MF5-10`. O contrato entregue aqui é `with-ai-response-budget.ts`, integração em `PrivateAreaAiService`, integração em `SourceGroundedAiService` e teste `with-ai-response-budget.spec.ts`.

#### Changelog

- 2026-06-20: Guia corrigido com helper backend de budget IA, preservação de `GatewayTimeoutException`, integrações nos services alvo, teste unitário e fronteira clara para `BK-MF5-12`.
