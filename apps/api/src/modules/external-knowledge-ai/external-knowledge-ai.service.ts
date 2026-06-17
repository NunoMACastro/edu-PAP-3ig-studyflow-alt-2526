/**
 * Implementa as regras de negócio de IA com conhecimento externo limitado e concentra validações do domínio.
 */
import {
    ForbiddenException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AskExternalKnowledgeAiDto } from "./dto/ask-external-knowledge-ai.dto.js";
import {
    ExternalKnowledgeAiAnswer,
    ExternalKnowledgeAiAnswerDocument,
    ExternalKnowledgeInternalCitation,
} from "./schemas/external-knowledge-ai-answer.schema.js";

/**
 * Vista pública de IA com conhecimento externo limitado, sem detalhes internos de Mongoose.
 */
export type ExternalKnowledgeAiAnswerView = {
    _id: string;
    studyAreaId: string;
    question: string;
    answer: string;
    externalUsed: boolean;
    internalCitations: ExternalKnowledgeInternalCitation[];
    externalNotes: string[];
    createdAt?: Date;
};

/**
 * Serviço para conhecimento externo limitado e explicitamente marcado.
 */
@Injectable()
export class ExternalKnowledgeAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param answerModel Modelo Mongoose injetado para ler e persistir IA com conhecimento externo limitado.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     */
    constructor(
        @InjectModel(ExternalKnowledgeAiAnswer.name)
        private readonly answerModel: Model<ExternalKnowledgeAiAnswerDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    /**
     * Cria resposta com citações internas e nota externa opcional.
     *
     * @param actor Aluno autenticado.
     * @param input Área, pergunta e permissão externa.
     * @returns Resposta persistida.
     * @throws ForbiddenException quando o actor não é aluno.
     * @throws UnprocessableEntityException quando não existem fontes internas.
     * @throws ServiceUnavailableException quando o provider falha ou devolve output inválido.
     */
    async ask(
        actor: AuthenticatedUser,
        input: AskExternalKnowledgeAiDto,
    ): Promise<ExternalKnowledgeAiAnswerView> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        // Ownership da área vem antes de qualquer citação para impedir leitura cruzada entre alunos.
        const area = await this.studyAreasService.getMyStudyArea(
            actor.id,
            input.studyAreaId,
        );
        const materials = await this.materialsService.listReadyTextSources(
            actor.id,
            input.studyAreaId,
        );
        if (materials.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_INTERNAL_SOURCES",
                message:
                    "Esta área ainda não tem fontes internas processáveis para responder.",
            });
        }

        const citations = materials.slice(0, 3).map((material) => ({
            materialId: String(material._id),
            title: material.title,
            excerpt: (material.contentText ?? "").trim().slice(0, 420),
        }));
        const externalNotes = input.allowExternalKnowledge
            ? [
                  "Nota externa limitada: não foi feita navegação web nem importação automática; a resposta apenas acrescenta enquadramento pedagógico geral separado das fontes internas.",
              ]
            : [];
        // O uso externo fica explícito e separado para não se confundir com citações internas verificáveis.
        const answer = await this.generateAnswer(
            area.name,
            input.question,
            citations,
            input.allowExternalKnowledge,
        );

        const document = await this.answerModel.create({
            studentId: new Types.ObjectId(actor.id),
            studyAreaId: new Types.ObjectId(input.studyAreaId),
            question: input.question.trim(),
            answer,
            externalUsed: input.allowExternalKnowledge,
            internalCitations: citations,
            externalNotes,
        });
        const created = document.toObject() as { createdAt?: Date };
        return {
            _id: String(document._id),
            studyAreaId: input.studyAreaId,
            question: document.question,
            answer: document.answer,
            externalUsed: document.externalUsed,
            internalCitations: document.internalCitations,
            externalNotes: document.externalNotes,
            createdAt: created.createdAt,
        };
    }

    /**
     * Chama o provider IA mantendo fontes internas e nota externa separadas.
     *
     * @param areaName Nome da área privada.
     * @param question Pergunta do aluno.
     * @param citations Citações internas autorizadas.
     * @param allowExternalKnowledge Permissão explícita para contexto externo.
     * @returns Resposta validada.
     */
    private async generateAnswer(
        areaName: string,
        question: string,
        citations: ExternalKnowledgeInternalCitation[],
        allowExternalKnowledge: boolean,
    ): Promise<string> {
        const prompt = [
            "Responde em português de Portugal.",
            "Usa as fontes internas autorizadas como verdade principal.",
            allowExternalKnowledge
                ? "Podes acrescentar contexto externo curto, geral e separado das fontes internas."
                : "Não uses conhecimento externo.",
            `Área: ${areaName}`,
            "Pergunta:",
            question.trim(),
            "Fontes internas:",
            citations
                .map(
                    (citation, index) =>
                        `Fonte ${index + 1} (${citation.materialId}, ${citation.title}): ${citation.excerpt}`,
                )
                .join("\n"),
            "Devolve JSON com a chave answer.",
        ].join("\n");

        let providerResult: Record<string, unknown>;
        try {
            providerResult = await this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
            });
        } catch {
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
}
