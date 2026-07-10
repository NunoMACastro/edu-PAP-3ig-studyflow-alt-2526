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
import { GovernedAiExecutionService } from "./governed-ai-execution.service.js";
import { buildSummaryPrompt } from "./prompts/summary.prompt.js";
import { AiSource } from "./providers/ai-provider.js";
import {
    AiArtifact,
    AiArtifactDocument,
} from "./schemas/ai-artifact.schema.js";
import { validateSummaryArtifact } from "./validators/ai-artifact.validator.js";

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
    async generateSummary(userId: string, studyAreaId: string) {
        const area = await this.areasService.getMyStudyArea(userId, studyAreaId);
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
                quota: { scope: "USER", targetId: userId },
                sources,
                guardrailText: `Criar um resumo pedagógico de ${area.name}.`,
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

            const artifact = await this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "SUMMARY",
                contentJson: result,
                sourcesJson: selectedSources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });

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
}
