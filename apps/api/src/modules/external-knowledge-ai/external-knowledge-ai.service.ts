// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts
/**
 * Implementa as regras de negócio de IA com conhecimento externo limitado.
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
import { resolveExternalAiPolicy } from "./external-ai-policy.js";
import {
    ExternalKnowledgeAiAnswer,
    ExternalKnowledgeAiAnswerDocument,
    ExternalKnowledgeInternalCitation,
} from "./schemas/external-knowledge-ai-answer.schema.js";

/**
 * Vista pública devolvida à UI sem detalhes internos de Mongoose.
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
 * Serviço responsável por respostas com fontes internas e contexto externo limitado.
 */
@Injectable()
export class ExternalKnowledgeAiService {
    /**
     * @param answerModel Modelo Mongoose usado para persistir respostas.
     * @param studyAreasService Service que valida ownership da área.
     * @param materialsService Service que lista fontes internas processáveis.
     * @param aiProvider Provider isolado usado apenas depois das validações.
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
     * @param actor Utilizador autenticado pela sessão.
     * @param input Payload validado pelo DTO.
     * @returns Resposta persistida e pronta para apresentação.
     * @throws ForbiddenException quando o utilizador não é aluno.
     * @throws UnprocessableEntityException quando não existem fontes internas processáveis.
     * @throws ServiceUnavailableException quando o provider falha ou devolve formato inválido.
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

        // Ownership da área vem antes das fontes para impedir acesso cruzado entre alunos.
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

        const citations = materials.slice(0, 3).map((material: any) => ({
            materialId: String(material._id),
            title: material.title,
            excerpt: (material.contentText ?? "").trim().slice(0, 420),
        }));
        
        const policy = resolveExternalAiPolicy({
            allowExternalKnowledge: input.allowExternalKnowledge,
            internalSourceCount: citations.length,
        });

        // O provider recebe a decisão final da policy, não o valor bruto vindo da UI.
        const answer = await this.generateAnswer(
            area.name,
            input.question,
            citations,
            policy.externalAllowed,
        );

        const document = await this.answerModel.create({
            studentId: new Types.ObjectId(actor.id),
            studyAreaId: new Types.ObjectId(input.studyAreaId),
            question: input.question.trim(),
            answer,
            externalUsed: policy.externalAllowed,
            internalCitations: citations,
            externalNotes: policy.externalNotes,
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
     * Chama o provider IA mantendo fontes internas como verdade principal.
     *
     * @param areaName Nome da área privada do aluno.
     * @param question Pergunta validada do aluno.
     * @param citations Citações internas autorizadas.
     * @param externalAllowed Decisão final da policy.
     * @returns Texto validado devolvido pelo provider.
     */
    private async generateAnswer(
        areaName: string,
        question: string,
        citations: ExternalKnowledgeInternalCitation[],
        externalAllowed: boolean,
    ): Promise<string> {
        const prompt = [
            "Responde em português de Portugal.",
            "Usa as fontes internas autorizadas como verdade principal.",
            externalAllowed
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
            // A chamada externa fica isolada para ser substituída por fixture nos testes.
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

        const answer = providerResult?.answer;
        if (typeof answer !== "string" || answer.trim().length === 0) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_RESPONSE",
                message: "A IA devolveu uma resposta inválida.",
            });
        }

        return answer.trim();
    }
}