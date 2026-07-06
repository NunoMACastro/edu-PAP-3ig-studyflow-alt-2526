/**
 * Implementa as regras de negócio de salas de estudo e concentra validações do domínio.
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
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider, RoomAiResult } from "../ai/providers/ai-provider.js";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto.js";
import { buildRoomAiPrompt } from "./prompts/room-ai.prompt.js";
import { RoomAiHistoryItem, toPrivateRoomAiHistory } from "./room-ai-history.js";
import { RoomSharesService, RoomShareSource } from "./room-shares.service.js";
import { RoomAiInteraction, RoomAiInteractionDocument } from "./schemas/room-ai-interaction.schema.js";
import { StudyRoomsService } from "./study-rooms.service.js";

/**
 * Serviço da IA partilhada da sala.
 */
@Injectable()
export class RoomAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param interactionModel Modelo Mongoose injetado para ler e persistir interações IA da sala.
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     * @param studyRoomsService Service injetado para reutilizar regras de membership da sala.
     * @param roomSharesService Service injetado para reutilizar regras de partilhas da sala.
     */
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly roomSharesService: RoomSharesService,
    ) {}

    /**
     * Lista apenas as interações IA da sala criadas pelo aluno autenticado.
     *
     * @param actor Utilizador autenticado vindo da sessão; define o dono do histórico.
     * @param roomId Identificador da sala; exige membership antes de qualquer leitura.
     * @returns Histórico privado ordenado da interação mais recente para a mais antiga.
     */
    async listMyRoomAiHistory(
        actor: AuthenticatedUser,
        roomId: string,
    ): Promise<RoomAiHistoryItem[]> {
        if (!Types.ObjectId.isValid(roomId)) {
            throw new BadRequestException({
                code: "INVALID_ROOM_ID",
                message: "A sala indicada não é válida.",
            });
        }

        await this.studyRoomsService.ensureMember(actor.id, roomId);

        const rows = await this.interactionModel
            .find({
                // O filtro usa o aluno da sessão e impede que a UI escolha outro histórico.
                roomId: new Types.ObjectId(roomId),
                studentId: new Types.ObjectId(actor.id),
            })
            .sort({ createdAt: -1 })
            // O limite protege a API contra respostas demasiado grandes numa página de sala.
            .limit(30)
            .exec();

        return toPrivateRoomAiHistory(actor, roomId, rows);
    }

    /**
     * Orquestra uma pergunta de IA em salas de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    async askRoomAi(actor: AuthenticatedUser, roomId: string, input: AskRoomAiDto) {
        await this.studyRoomsService.ensureMember(actor.id, roomId);
        const sources = await this.roomSharesService.findUsableSharesForRoom(
            actor.id,
            roomId,
            input.sourceIds,
        );

        if (sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_ROOM_AI_SOURCES",
                message: "Esta sala ainda não tem fontes processáveis para IA.",
            });
        }

        try {
            const result = await this.aiProvider.generateRoomAnswer({
                prompt: buildRoomAiPrompt({
                    question: input.question.trim(),
                    sources,
                }),
            });
            this.validateResult(result, sources);

            const interaction = await this.interactionModel.create({
                roomId: new Types.ObjectId(roomId),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: result.answer.trim(),
                sourceShareIds: result.sourceShareIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
            });

            const created = interaction.toObject() as { createdAt?: Date };
            return {
                _id: String(interaction._id),
                roomId,
                question: interaction.question,
                answer: interaction.answer,
                sources: sources.filter((source) =>
                    result.sourceShareIds.includes(source.shareId),
                ),
                createdAt: created.createdAt,
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
     * Confirma que os dados de salas de estudo cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result Resultado devolvido pelo provider de IA.
     * @param sources Fontes já autorizadas que limitam a resposta e evitam acesso a dados fora do contexto.
     */
    private validateResult(result: RoomAiResult, sources: RoomShareSource[]): void {
        const allowedIds = new Set(sources.map((source) => source.shareId));
        if (
            typeof result.answer !== "string" ||
            result.answer.trim().length === 0 ||
            !Array.isArray(result.sourceShareIds) ||
            result.sourceShareIds.length === 0 ||
            result.sourceShareIds.some((sourceId) => !allowedIds.has(sourceId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_ROOM_ANSWER",
                message: "A IA devolveu uma resposta inválida para a sala.",
            });
        }
    }
}