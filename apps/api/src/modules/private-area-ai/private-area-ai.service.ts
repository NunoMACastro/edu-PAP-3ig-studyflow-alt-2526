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