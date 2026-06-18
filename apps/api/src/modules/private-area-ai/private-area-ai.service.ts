/**
 * Implementa as regras de negócio de private área ai e concentra validações do domínio.
 */
import {
    ForbiddenException,
    GatewayTimeoutException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider, PrivateAreaAiResult } from "../ai/providers/ai-provider.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AskPrivateAreaAiDto } from "./dto/ask-private-area-ai.dto.js";
import { buildPrivateAreaAiPrompt } from "./prompts/private-area-ai.prompt.js";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import { AiConsentPurpose } from "../ai-consents/dto/upsert-ai-consent.dto.js";
import {
    PrivateAreaAiAnswer,
    PrivateAreaAiAnswerDocument,
} from "./schemas/private-area-ai-answer.schema.js";

private async assertPrivateAreaAiConsent(actor: AuthenticatedUser): Promise<void> {
    await this.aiConsentsService.assertGranted(actor.id, AiConsentPurpose.PRIVATE_AREA_AI);
}

/**
 * Serviço de IA privada por área de estudo.
 */
@Injectable()
export class PrivateAreaAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param answerModel Modelo Mongoose injetado para ler e persistir IA privada da área de estudo.
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     */
    constructor(
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly answerModel: Model<PrivateAreaAiAnswerDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
    ) {}

    /**
     * Orquestra uma pergunta de IA em IA privada da área de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
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

        // A área é carregada pelo service do aluno para garantir ownership antes de obter fontes privadas.
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

        try {
            // O provider só recebe fontes já filtradas para o dono da área de estudo.
            const result = await this.aiProvider.generatePrivateAreaAnswer({
                prompt: buildPrivateAreaAiPrompt({
                    areaName: area.name,
                    question: input.question.trim(),
                    sources,
                }),
            });
            // Uma resposta sem fontes válidas é rejeitada para não criar confiança falsa no resultado.
            this.validateResult(result, sources.map((source) => source.materialId));

            const answer = await this.answerModel.create({
                studyAreaId: new Types.ObjectId(studyAreaId),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: result.answer.trim(),
                sourceMaterialIds: result.sourceMaterialIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
            });

            return {
                _id: String(answer._id),
                studyAreaId,
                question: answer.question,
                answer: answer.answer,
                sources: sources.filter((source) =>
                    result.sourceMaterialIds.includes(source.materialId),
                ),
                createdAt: (answer.toObject() as { createdAt?: Date }).createdAt,
            };
        } catch (error) {
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

    /**
     * Confirma que os dados de IA privada da área de estudo cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result result necessário para executar validate result sem depender de estado global.
     * @param allowedIds Lista de identificadores de allowed usados para filtrar o âmbito da operação.
     */
    private validateResult(result: PrivateAreaAiResult, allowedIds: string[]): void {
        const allowed = new Set(allowedIds);
        if (
            typeof result.answer !== "string" ||
            !result.answer.trim() ||
            !Array.isArray(result.sourceMaterialIds) ||
            result.sourceMaterialIds.length === 0 ||
            result.sourceMaterialIds.some((sourceId) => !allowed.has(sourceId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_PRIVATE_ANSWER",
                message: "A IA devolveu uma resposta inválida para a área.",
            });
        }
    }
}
