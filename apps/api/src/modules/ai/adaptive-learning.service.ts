/**
 * Implementa as regras de negócio de ai e concentra validações do domínio.
 */
import {
    BadRequestException,
    GatewayTimeoutException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MaterialsService } from "../materials/materials.service.js";
import { HistoryService } from "../study/history.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto.js";
import { buildAdaptiveExplanationPrompt } from "./prompts/adaptive-explanation.prompt.js";
import {
    AI_PROVIDER,
    AdaptiveExplanationResult,
    AiProvider,
    AiSource,
} from "./providers/ai-provider.js";
import {
    AdaptiveExplanation,
    AdaptiveExplanationDocument,
} from "./schemas/adaptive-explanation.schema.js";
import {
    LearningLevel,
    LearningPace,
    LearningProfile,
    LearningProfileDocument,
} from "./schemas/learning-profile.schema.js";

/**
 * Vista pública de artefactos de IA, sem detalhes internos de Mongoose.
 */
type LearningProfileView = {
    _id?: string;
    studyAreaId: string;
    pace: LearningPace;
    level: LearningLevel;
    difficulties: string[];
    preferredExplanationStyle: string;
};

/**
 * Serviço do BK-MF1-01 para perfil e explicações adaptativas.
 */
@Injectable()
export class AdaptiveLearningService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param profileModel Modelo Mongoose injetado para ler e persistir artefactos de IA.
     * @param explanationModel Modelo Mongoose injetado para ler e persistir artefactos de IA.
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param areasService Service injetado para reutilizar regras de areas sem duplicar validações.
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     */
    constructor(
        @InjectModel(LearningProfile.name)
        private readonly profileModel: Model<LearningProfileDocument>,
        @InjectModel(AdaptiveExplanation.name)
        private readonly explanationModel: Model<AdaptiveExplanationDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Obtém o perfil existente ou defaults seguros.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Área validada por ownership.
     * @returns Perfil público.
     */
    async getLearningProfile(
        userId: string,
        studyAreaId: string,
    ): Promise<LearningProfileView> {
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        const profile = await this.profileModel
            .findOne({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            })
            .lean();

        if (!profile) {
            return {
                studyAreaId,
                pace: "BALANCED",
                level: "INTERMEDIATE",
                difficulties: [],
                preferredExplanationStyle: "",
            };
        }

        return this.toProfileView(profile);
    }

    /**
     * Atualiza ou cria o perfil da área do aluno.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Área validada por ownership.
     * @param input Dados editáveis.
     * @returns Perfil persistido.
     */
    async updateLearningProfile(
        userId: string,
        studyAreaId: string,
        input: UpdateLearningProfileDto,
    ): Promise<LearningProfileView> {
        await this.areasService.getMyStudyArea(userId, studyAreaId);

        const update = {
            pace: input.pace ?? "BALANCED",
            level: input.level ?? "INTERMEDIATE",
            difficulties: this.cleanDifficulties(input.difficulties),
            preferredExplanationStyle: input.preferredExplanationStyle?.trim() ?? "",
        };

        const profile = await this.profileModel
            .findOneAndUpdate(
                {
                    userId: new Types.ObjectId(userId),
                    studyAreaId: new Types.ObjectId(studyAreaId),
                },
                {
                    $set: update,
                    $setOnInsert: {
                        userId: new Types.ObjectId(userId),
                        studyAreaId: new Types.ObjectId(studyAreaId),
                    },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();

        return this.toProfileView(profile);
    }

    /**
     * Gera uma explicação adaptativa com fontes materiais autorizadas.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Área validada por ownership.
     * @param input Pergunta do aluno.
     * @returns Explicação guardada.
     */
    async askAdaptiveExplanation(
        userId: string,
        studyAreaId: string,
        input: AskAdaptiveExplanationDto,
    ) {
        const area = await this.areasService.getMyStudyArea(userId, studyAreaId);
        const profile = await this.getLearningProfile(userId, studyAreaId);
        const sources = await this.getSources(userId, studyAreaId);

        if (sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PROCESSABLE_SOURCES",
                message:
                    "Esta área ainda não tem materiais prontos para uma explicação adaptativa.",
            });
        }

        try {
            const result = await this.aiProvider.generateAdaptiveExplanation({
                prompt: buildAdaptiveExplanationPrompt({
                    areaName: area.name,
                    question: input.question.trim(),
                    pace: profile.pace,
                    level: profile.level,
                    difficulties: profile.difficulties,
                    preferredExplanationStyle: profile.preferredExplanationStyle,
                    sources,
                }),
            });
            this.validateResult(result, sources);

            const explanation = await this.explanationModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                question: input.question.trim(),
                answer: result.answer.trim(),
                suggestedNextSteps: result.suggestedNextSteps,
                sourceMaterialIds: result.sourceMaterialIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
            });

            await this.historyService.recordEvent(
                userId,
                "ADAPTIVE_EXPLANATION_GENERATED",
                "Explicação adaptativa gerada",
                area.name,
            );

            const created = explanation.toObject() as { createdAt?: Date };
            return {
                _id: String(explanation._id),
                studyAreaId,
                question: explanation.question,
                answer: explanation.answer,
                suggestedNextSteps: explanation.suggestedNextSteps,
                sourceMaterialIds: result.sourceMaterialIds,
                createdAt: created.createdAt,
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
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

    /**
     * Obtém materiais prontos no contrato do provider.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Área validada por ownership.
     * @returns Fontes autorizadas.
     */
    private async getSources(
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
     * Valida runtime da IA antes de persistir.
     *
     * @param result Resultado devolvido por uma operação externa antes da validação final.
     * @param sources Valor de sources usado pela função para executar validate result com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private validateResult(
        result: AdaptiveExplanationResult,
        sources: AiSource[],
    ): void {
        const allowedIds = new Set(sources.map((source) => source.materialId));
        if (
            typeof result.answer !== "string" ||
            result.answer.trim().length === 0 ||
            !Array.isArray(result.suggestedNextSteps) ||
            !Array.isArray(result.sourceMaterialIds) ||
            result.sourceMaterialIds.length === 0 ||
            result.sourceMaterialIds.some((sourceId) => !allowedIds.has(sourceId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_ADAPTIVE_EXPLANATION",
                message: "A IA devolveu uma explicação inválida.",
            });
        }
    }

    /**
     * Converte o documento interno no contrato público.
     *
     * @param profile Documento ou objeto lean.
     * @returns Perfil público.
     */
    private toProfileView(profile: {
        _id?: unknown;
        studyAreaId: unknown;
        pace: LearningPace;
        level: LearningLevel;
        difficulties?: string[];
        difficultyNotes?: string;
        preferredExplanationStyle?: string;
    }): LearningProfileView {
        return {
            _id: profile._id ? String(profile._id) : undefined,
            studyAreaId: String(profile.studyAreaId),
            pace: profile.pace,
            level: profile.level,
            difficulties: this.cleanDifficulties(
                profile.difficulties ?? this.legacyDifficultyNotes(profile.difficultyNotes),
            ),
            preferredExplanationStyle: profile.preferredExplanationStyle?.trim() ?? "",
        };
    }

    /**
     * Normaliza dificuldades declaradas para o contrato público do BK-MF1-01.
     *
     * @param difficulties Lista recebida do cliente ou persistida.
     * @returns Lista sem vazios, limitada ao contrato do DTO.
     */
    private cleanDifficulties(difficulties?: string[]): string[] {
        return (difficulties ?? [])
            .map((difficulty) => difficulty.trim())
            .filter((difficulty) => difficulty.length > 0)
            .slice(0, 8);
    }

    /**
     * Converte dados antigos que ainda possam existir com difficultyNotes.
     *
     * @param difficultyNotes Campo legado anterior ao contrato canónico.
     * @returns Lista compatível com difficulties.
     */
    private legacyDifficultyNotes(difficultyNotes?: string): string[] {
        return difficultyNotes
            ? difficultyNotes
                  .split(/\r?\n/)
                  .map((difficulty) => difficulty.trim())
                  .filter((difficulty) => difficulty.length > 0)
            : [];
    }
}
