/**
 * Implementa as regras de negócio de salas de estudo e concentra validações do domínio.
 */
import {
    BadRequestException,
    HttpException,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { RoomAiResult } from "../ai/providers/ai-provider.js";
import { StudentProfileService } from "../students/student-profile.service.js";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto.js";
import { buildRoomAiPrompt } from "./prompts/room-ai.prompt.js";
import { resolveRoomAiPedagogicalContext } from "./room-ai-pedagogy.js";
import { RoomAiHistoryItem, toPrivateRoomAiHistory } from "./room-ai-history.js";
import {
    RoomAiInteraction,
    RoomAiInteractionDocument,
} from "./schemas/room-ai-interaction.schema.js";
import { RoomSharesService, RoomShareSource } from "./room-shares.service.js";
import { StudyRoomsService } from "./study-rooms.service.js";

/**
 * Serviço da IA partilhada da sala.
 */
@Injectable()
export class RoomAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param interactionModel Modelo Mongoose injetado para ler e persistir salas de estudo.
     * @param aiExecution Fachada obrigatória de consentimento, política, quota e provider.
     * @param studyRoomsService Service injetado para reutilizar regras de salas de estudo sem duplicar validações.
     * @param roomSharesService Service injetado para reutilizar regras de sala shares sem duplicar validações.
     * @param studentProfileService Service injetado para adaptar a resposta ao ano escolar do aluno autenticado.
     */
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly roomSharesService: RoomSharesService,
        private readonly studentProfileService: StudentProfileService,
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
                // O aluno da sessão é a única origem autorizada do dono do histórico.
                roomId: new Types.ObjectId(roomId),
                studentId: new Types.ObjectId(actor.id),
            })
            .sort({ createdAt: -1 })
            // Limita a resposta para manter a página previsível e evitar payloads excessivos.
            .limit(30)
            .exec();

        return toPrivateRoomAiHistory(actor, roomId, rows);
    }

    /**
     * Orquestra uma pergunta de IA em salas de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param roomId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Resultado da operação no formato esperado pelo chamador.
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

        const askerProfile = await this.studentProfileService.getMyProfile(actor.id);
        const askerPedagogicalContext = resolveRoomAiPedagogicalContext(
            askerProfile?.year,
        );

        try {
            const execution = await this.aiExecution.execute({
                userId: actor.id,
                purpose: "ROOM_AI",
                quota: { scope: "GROUP", targetId: roomId },
                sources,
                guardrailText: input.question,
                buildPrompt: (limitedSources) =>
                    buildRoomAiPrompt({
                        question: input.question.trim(),
                        sources: [...limitedSources],
                        askerPedagogicalContext,
                    }),
                invoke: ({ provider, prompt, options }) =>
                    provider.generateRoomAnswer({ prompt, options }),
                validateResult: (result, selectedSources) =>
                    this.validateResult(result, [...selectedSources]),
            });
            const { result } = execution;
            const selectedSources = [...execution.sources];
            this.validateResult(result, selectedSources);

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
                sources: selectedSources.filter((source) =>
                    result.sourceShareIds.includes(source.shareId),
                ),
                createdAt: created.createdAt,
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /**
     * Confirma que os dados de salas de estudo cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result Resultado devolvido por uma operação externa antes da validação final.
     * @param sources Valor de sources usado pela função para executar validate result com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
