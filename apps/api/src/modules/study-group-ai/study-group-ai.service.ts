/**
 * Implementa as regras de negócio de IA coletiva do grupo e concentra validações do domínio.
 */
import {
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider.js";
import {
    RoomSharesService,
    RoomShareSource,
} from "../study-rooms/room-shares.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import { AiConsentPurpose } from "../ai-consents/dto/upsert-ai-consent.dto.js";
import { AskStudyGroupAiDto } from "./dto/ask-study-group-ai.dto.js";
import {
    StudyGroupAiAnswer,
    StudyGroupAiAnswerDocument,
    StudyGroupAiSource,
} from "./schemas/study-group-ai-answer.schema.js";

/**
 * Vista pública de IA coletiva do grupo, sem detalhes internos de Mongoose.
 */
export type StudyGroupAiAnswerView = {
    _id: string;
    groupId: string;
    question: string;
    answer: string;
    sources: StudyGroupAiSource[];
    createdAt?: Date;
};

/**
 * Serviço da IA coletiva baseada em fontes partilhadas.
 */
@Injectable()
export class StudyGroupAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param answerModel Modelo Mongoose injetado para ler e persistir IA coletiva do grupo.
     * @param studyGroupsService Service injetado para reutilizar regras de grupos de estudo sem duplicar validações.
     * @param roomSharesService Service injetado para reutilizar regras de sala shares sem duplicar validações.
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     */
    constructor(
        @InjectModel(StudyGroupAiAnswer.name)
        private readonly answerModel: Model<StudyGroupAiAnswerDocument>,
        private readonly studyGroupsService: StudyGroupsService,
        private readonly roomSharesService: RoomSharesService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
        private readonly aiConsentsService: AiConsentsService,
    ) {}

    /**
     * Valida consentimento antes de usar fontes partilhadas do grupo com IA.
     */
    private async assertStudyGroupAiConsent(actor: AuthenticatedUser): Promise<void> {
        await this.aiConsentsService.assertGranted(
            actor.id,
            AiConsentPurpose.STUDY_GROUP_AI,
        );
    }

    /**
     * Responde a uma pergunta coletiva usando apenas partilhas processáveis.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @param input Pergunta e fontes opcionais.
     * @returns Resposta guardada com fontes.
     * @throws UnprocessableEntityException quando não há fontes partilhadas.
     * @throws ServiceUnavailableException quando o provider falha ou devolve output inválido.
     */
    async ask(
        actor: AuthenticatedUser,
        groupId: string,
        input: AskStudyGroupAiDto,
    ): Promise<StudyGroupAiAnswerView> {
        // A membership é validada antes de ler partilhas para evitar fuga de notas de outros grupos.
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        await this.assertStudyGroupAiConsent(actor);
        const sources = await this.roomSharesService.findUsableSharesForRoom(
            actor.id,
            groupId,
            input.sourceShareIds,
        );

        if (sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_GROUP_AI_SOURCES",
                message: "Este grupo ainda não tem fontes partilhadas processáveis.",
            });
        }

        const selected = sources.slice(0, 3);
        // Limitar fontes mantém o prompt curto e torna mais fácil auditar de onde veio a resposta.
        const answer = await this.generateAnswer(input.question, selected);
        const document = await this.answerModel.create({
            groupId: new Types.ObjectId(groupId),
            studentId: new Types.ObjectId(actor.id),
            question: input.question.trim(),
            answer,
            sources: selected.map((source) => ({
                shareId: source.shareId,
                title: source.title,
            })),
        });
        const created = document.toObject() as { createdAt?: Date };
        return {
            _id: String(document._id),
            groupId,
            question: document.question,
            answer: document.answer,
            sources: document.sources,
            createdAt: created.createdAt,
        };
    }

    /**
     * Chama o provider IA com fontes de grupo já autorizadas.
     *
     * @param question Pergunta coletiva.
     * @param sources Partilhas autorizadas.
     * @returns Resposta validada.
     */
    private async generateAnswer(
        question: string,
        sources: RoomShareSource[],
    ): Promise<string> {
        const prompt = [
            "Responde em português de Portugal.",
            "Age como IA coletiva de grupo e usa apenas fontes partilhadas autorizadas.",
            `Pergunta do grupo: ${question.trim()}`,
            "Fontes partilhadas:",
            sources
                .map(
                    (source, index) =>
                        `Fonte ${index + 1} (${source.shareId}, ${source.title}): ${source.contentText.trim().slice(0, 420)}`,
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
