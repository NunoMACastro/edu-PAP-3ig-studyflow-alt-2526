/**
 * Implementa as regras de negócio de ai e concentra validações do domínio.
 */
import {
    HttpException,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HistoryService } from "../study/history.service.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AiAreaProfileService } from "./ai-area-profile.service.js";
import { toAiArtifactDto } from "./dto/ai-artifact.dto.js";
import {
    GovernedAiExecutionService,
    type GovernedAiExecutionMode,
} from "./governed-ai-execution.service.js";
import { buildSummaryPrompt } from "./prompts/summary.prompt.js";
import { AiSource } from "./providers/ai-provider.js";
import {
    AiArtifact,
    AiArtifactDocument,
} from "./schemas/ai-artifact.schema.js";
import { validateSummaryArtifact } from "./validators/ai-artifact.validator.js";
import {
    assistantArtifactMetadata,
    type AssistantArtifactGenerationSnapshot,
} from "./ai-artifact-generation.types.js";

/**
 * Serviço de geração de resumos baseados nos materiais enviados.
 */
@Injectable()
export class SummariesService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param artifactModel Modelo Mongoose injetado para ler e persistir artefactos de IA.
     * @param aiExecution Fachada obrigatória de consentimento, política, quota e provider.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param areasService Service injetado para reutilizar regras de areas sem duplicar validações.
     * @param profileService Service injetado para reutilizar regras de profile sem duplicar validações.
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     */
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly profileService: AiAreaProfileService,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Gera um resumo factual de uma área.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Artefacto persistido com conteúdo e fontes.
     */
    async generateSummary(
        userId: string,
        studyAreaId: string,
        generationKey?: string,
        assistantConversationId?: string,
        executionMode: GovernedAiExecutionMode = "INTERACTIVE",
    ) {
        const area = await this.areasService.getMyStudyArea(userId, studyAreaId);
        if (generationKey) {
            const existing = await this.artifactModel
                .findOne({
                    userId: new Types.ObjectId(userId),
                    studyAreaId: new Types.ObjectId(studyAreaId),
                    type: "SUMMARY",
                    generationKey,
                })
                .lean();
            if (existing) return toAiArtifactDto(existing);
        }
        const profile = await this.profileService.prepareProfile(
            userId,
            studyAreaId,
        );
        const sources = await this.getProcessableSources(userId, studyAreaId);

        if (profile.status !== "READY_FOR_GENERATION" || sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PROCESSABLE_SOURCES",
                message:
                    "Este material ainda não tem texto processável para gerar resumo.",
            });
        }

        try {
            const execution = await this.aiExecution.execute({
                userId,
                purpose: "SUMMARY",
                executionMode,
                quota: { scope: "USER", targetId: userId },
                sources,
                guardrailText: `Criar um resumo pedagógico de ${area.name}.`,
                pedagogicalContext: "STUDENT_PROFILE",
                buildPrompt: (limitedSources) =>
                    buildSummaryPrompt(
                        area.name,
                        [...limitedSources],
                        profile.voiceTone,
                    ),
                invoke: ({ provider, prompt, options }) =>
                    provider.generateSummary({ prompt, options }),
                validateResult: (result, limitedSources) =>
                    validateSummaryArtifact(
                        result,
                        limitedSources.map(({ materialId }) => materialId),
                    ),
            });
            const { result } = execution;
            const selectedSources = [...execution.sources];
            const sourceMaterialIds = selectedSources.map(
                ({ materialId }) => materialId,
            );
            validateSummaryArtifact(result, sourceMaterialIds);

            let artifact: AiArtifactDocument;
            try {
                artifact = await this.artifactModel.create({
                    userId: new Types.ObjectId(userId),
                    studyAreaId: new Types.ObjectId(studyAreaId),
                    targetKind: "STUDY_AREA",
                    targetId: new Types.ObjectId(studyAreaId),
                    targetLabelSnapshot: area.name,
                    visibility: "PRIVATE",
                    type: "SUMMARY",
                    contentJson: result,
                    sourcesJson: selectedSources.map(({ materialId, title }) => ({
                        materialId,
                        title,
                    })),
                    ...(generationKey ? { generationKey } : {}),
                    ...(assistantConversationId
                        ? {
                              assistantConversationId: new Types.ObjectId(
                                  assistantConversationId,
                              ),
                          }
                        : {}),
                });
            } catch (error) {
                if (!generationKey || !this.isDuplicateKey(error)) throw error;
                const existing = await this.artifactModel
                    .findOne({
                        userId: new Types.ObjectId(userId),
                        studyAreaId: new Types.ObjectId(studyAreaId),
                        type: "SUMMARY",
                        generationKey,
                    })
                    .lean();
                if (!existing) throw error;
                return toAiArtifactDto(existing);
            }

            await this.historyService.recordEvent(
                userId,
                "SUMMARY_GENERATED",
                "Resumo gerado",
                area.name,
            );

            return toAiArtifactDto(artifact);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /** Gera um resumo associado a uma conversa sem expor metadata no DTO público. */
    generateSummaryForAssistant(
        userId: string,
        studyAreaId: string,
        input: { conversationId: string; generationKey: string },
    ) {
        return this.generateSummary(
            userId,
            studyAreaId,
            input.generationKey,
            input.conversationId,
        );
    }

    /**
     * Gera um resumo a partir de um snapshot já autorizado pelo Assistente.
     * Não volta a consultar contexto, turnos ou fontes depois deste ponto.
     */
    async generateSummaryFromAssistantSnapshot(
        snapshot: AssistantArtifactGenerationSnapshot,
        generationKey: string,
        executionMode: GovernedAiExecutionMode = "INTERACTIVE",
    ) {
        const existing = await this.artifactModel
            .findOne({
                userId: new Types.ObjectId(snapshot.userId),
                generationKey,
                type: "SUMMARY",
            })
            .lean();
        if (existing) return toAiArtifactDto(existing);

        try {
            const execution = await this.aiExecution.execute({
                userId: snapshot.userId,
                purpose: "SUMMARY",
                executionMode,
                quota: { scope: "USER", targetId: snapshot.userId },
                sources: snapshot.sources,
                guardrailText: "Criar um resumo pedagógico a partir desta conversa.",
                pedagogicalContext: "STUDENT_PROFILE",
                conversationTurns: snapshot.conversationTurns,
                buildPrompt: (sources, conversationHistory) =>
                    buildSummaryPrompt(
                        snapshot.contextLabel,
                        [...sources],
                        snapshot.voiceTone,
                        conversationHistory,
                    ),
                invoke: ({ provider, prompt, options }) =>
                    provider.generateSummary({ prompt, options }),
                validateResult: (result, sources) =>
                    validateSummaryArtifact(
                        result,
                        sources.map(({ materialId }) => materialId),
                        snapshot.groundingMode === "CHAT_ONLY",
                    ),
            });
            const sourceIds = execution.sources.map(({ materialId }) => materialId);
            validateSummaryArtifact(
                execution.result,
                sourceIds,
                snapshot.groundingMode === "CHAT_ONLY",
            );

            let artifact: AiArtifactDocument;
            try {
                artifact = await this.artifactModel.create({
                    userId: new Types.ObjectId(snapshot.userId),
                    assistantConversationId: new Types.ObjectId(
                        snapshot.conversationId,
                    ),
                    generationKey,
                    type: "SUMMARY",
                    contentJson: execution.result,
                    sourcesJson: execution.sources.map(({ materialId, title }) => ({
                        materialId,
                        title,
                    })),
                    ...assistantArtifactMetadata(
                        snapshot,
                        execution.usedTurnCount,
                        execution.sources.length,
                    ),
                });
            } catch (error) {
                if (!this.isDuplicateKey(error)) throw error;
                const replay = await this.artifactModel
                    .findOne({ generationKey, userId: new Types.ObjectId(snapshot.userId) })
                    .lean();
                if (!replay) throw error;
                return toAiArtifactDto(replay);
            }

            await this.historyService.recordEvent(
                snapshot.userId,
                "SUMMARY_GENERATED",
                "Resumo gerado",
                snapshot.target.label,
            );
            return toAiArtifactDto(artifact);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /**
     * Confirma ownership, perfil e fontes antes de aceitar um job assíncrono.
     * O worker repete estas leituras ao gerar, mantendo esta validação apenas
     * como barreira de aceitação rápida e segura.
     */
    async assertGenerationReady(userId: string, studyAreaId: string): Promise<void> {
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        const profile = await this.profileService.prepareProfile(userId, studyAreaId);
        const sources = await this.getProcessableSources(userId, studyAreaId);

        if (profile.status !== "READY_FOR_GENERATION" || sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PROCESSABLE_SOURCES",
                message:
                    "Este material ainda não tem texto processável para gerar resumo.",
            });
        }
    }

    /**
     * Obtém fontes prontas para IA.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Fontes textuais processáveis.
     */
    private async getProcessableSources(
        userId: string,
        studyAreaId: string,
    ): Promise<AiSource[]> {
        const materials = await this.materialsService.listReadyTextSources(
            userId,
            studyAreaId,
        );
        return materials.map((material) => ({
            materialId: String(material._id),
            title: material.title,
            contentText: material.contentText!,
        }));
    }

    /**
     * Lista resumos persistidos da área do aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Artefactos públicos de resumo.
     */
    async listSummaries(userId: string, studyAreaId: string) {
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        const artifacts = await this.artifactModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "SUMMARY",
            })
            .sort({ createdAt: -1 })
            .lean();
        return artifacts.map((artifact) => toAiArtifactDto(artifact));
    }

    private isDuplicateKey(error: unknown): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === 11000
        );
    }
}
