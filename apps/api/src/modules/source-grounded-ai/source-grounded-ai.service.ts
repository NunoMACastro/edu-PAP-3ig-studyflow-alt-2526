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