// apps/api/src/modules/study-rooms/room-ai-sharing.service.ts
/**
 * Implementa partilha read-only e fork privado de respostas IA da sala.
 */
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    parseRoomAiShareMode,
    RoomAiShareMode,
    ShareRoomAiAnswerDto,
} from "./dto/share-room-ai-answer.dto.js";
import {
    RoomAiInteraction,
    RoomAiInteractionDocument,
    RoomAiVisibility,
} from "./schemas/room-ai-interaction.schema.js";
import { StudyRoomsService } from "./study-rooms.service.js";

type RoomAiPersisted = {
    _id: Types.ObjectId;
    roomId: Types.ObjectId;
    studentId: Types.ObjectId;
    question: string;
    answer: string;
    sourceShareIds: Types.ObjectId[];
    visibility: RoomAiVisibility;
    sharedAt?: Date;
    forkedFromInteractionId?: Types.ObjectId;
    createdAt?: Date;
};

export type RoomAiAnswerReuseView = {
    _id: string;
    roomId: string;
    studentId: string;
    question: string;
    answer: string;
    sourceShareIds: string[];
    visibility: RoomAiVisibility;
    sharedAt?: Date;
    forkedFromInteractionId?: string;
    createdAt?: Date;
};

export type RoomAiShareResult = {
    mode: RoomAiShareMode;
    answer: RoomAiAnswerReuseView;
    createdPrivateCopy: boolean;
};

/**
 * Serviço dedicado às operações de reutilização segura de respostas IA da sala.
 */
@Injectable()
export class RoomAiSharingService {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param interactionModel Modelo Mongoose das interações IA da sala.
     * @param studyRoomsService Service que valida membership da sala.
     */
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    /**
     * Lista respostas marcadas como partilhadas na sala.
     *
     * @param actor Aluno autenticado vindo da sessão segura.
     * @param roomId Identificador da sala.
     * @returns Respostas partilhadas em modo read-only.
     */
    async listSharedAnswers(
        actor: AuthenticatedUser,
        roomId: string,
    ): Promise<RoomAiAnswerReuseView[]> {
        const roomObjectId = this.toObjectId(
            roomId,
            "INVALID_ROOM_ID",
            "A sala indicada não é válida.",
        );

        await this.studyRoomsService.ensureMember(actor.id, roomId);

        const rows = await this.interactionModel
            .find({ roomId: roomObjectId, visibility: "SHARED" })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean<RoomAiPersisted[]>()
            .exec();

        return rows.map((row) => this.toAnswerView(row));
    }

    /**
     * Executa partilha read-only ou fork privado para uma resposta IA da sala.
     *
     * @param actor Aluno autenticado vindo da sessão segura.
     * @param roomId Identificador da sala.
     * @param answerId Identificador da resposta IA.
     * @param input Modo da operação.
     * @returns Resultado público da operação, sem campos internos de Mongoose.
     */
    async shareOrForkAnswer(
        actor: AuthenticatedUser,
        roomId: string,
        answerId: string,
        input: ShareRoomAiAnswerDto,
    ): Promise<RoomAiShareResult> {
        const mode = this.parseMode(input.mode);
        const roomObjectId = this.toObjectId(
            roomId,
            "INVALID_ROOM_ID",
            "A sala indicada não é válida.",
        );
        const answerObjectId = this.toObjectId(
            answerId,
            "INVALID_ROOM_AI_ANSWER_ID",
            "A resposta IA indicada não é válida.",
        );
        const actorObjectId = this.toObjectId(
            actor.id,
            "INVALID_ACTOR_ID",
            "A sessão atual não é válida.",
        );

        await this.studyRoomsService.ensureMember(actor.id, roomId);

        if (mode === "READ_ONLY") {
            return this.shareOwnAnswer(roomObjectId, answerObjectId, actorObjectId);
        }

        return this.createPrivateFork(roomObjectId, answerObjectId, actorObjectId);
    }

    /**
     * Marca uma resposta própria como partilhada em read-only.
     *
     * @param roomObjectId Sala já validada.
     * @param answerObjectId Resposta já validada.
     * @param actorObjectId Aluno autenticado já validado.
     * @returns Resultado público da partilha.
     */
    private async shareOwnAnswer(
        roomObjectId: Types.ObjectId,
        answerObjectId: Types.ObjectId,
        actorObjectId: Types.ObjectId,
    ): Promise<RoomAiShareResult> {
        const answer = await this.interactionModel
            .findOne({
                _id: answerObjectId,
                roomId: roomObjectId,
                studentId: actorObjectId,
            })
            .exec();

        if (!answer) {
            throw this.answerNotFound();
        }

        answer.visibility = "SHARED";
        answer.sharedAt = answer.sharedAt ?? new Date();
        await answer.save();

        return {
            mode: "READ_ONLY",
            answer: this.toAnswerView(answer.toObject() as RoomAiPersisted),
            createdPrivateCopy: false,
        };
    }

    /**
     * Cria uma cópia privada a partir de uma resposta já partilhada.
     *
     * @param roomObjectId Sala já validada.
     * @param answerObjectId Resposta já validada.
     * @param actorObjectId Aluno autenticado já validado.
     * @returns Resultado público do fork privado.
     */
    private async createPrivateFork(
        roomObjectId: Types.ObjectId,
        answerObjectId: Types.ObjectId,
        actorObjectId: Types.ObjectId,
    ): Promise<RoomAiShareResult> {
        const original = await this.interactionModel
            .findOne({
                _id: answerObjectId,
                roomId: roomObjectId,
                visibility: "SHARED",
            })
            .lean<RoomAiPersisted>()
            .exec();

        if (!original) {
            throw this.answerNotFound();
        }

        const fork = await this.interactionModel.create({
            roomId: roomObjectId,
            studentId: actorObjectId,
            question: original.question,
            answer: original.answer,
            sourceShareIds: original.sourceShareIds,
            visibility: "PRIVATE",
            forkedFromInteractionId: original._id,
        });

        return {
            mode: "PRIVATE_FORK",
            answer: this.toAnswerView(fork.toObject() as RoomAiPersisted),
            createdPrivateCopy: true,
        };
    }

    /**
     * Converte string para ObjectId com erro HTTP explícito.
     *
     * @param value Valor recebido do pedido ou da sessão.
     * @param code Código estável para a UI e testes.
     * @param message Mensagem pública em PT-PT.
     * @returns ObjectId validado.
     */
    private toObjectId(value: string, code: string, message: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException({ code, message });
        }

        return new Types.ObjectId(value);
    }

    /**
     * Converte o modo textual para o union type usado no domínio.
     *
     * @param mode Modo recebido no body.
     * @returns Modo seguro para a operação.
     */
    private parseMode(mode: string): RoomAiShareMode {
        try {
            return parseRoomAiShareMode(mode);
        } catch {
            throw new BadRequestException({
                code: "INVALID_ROOM_AI_SHARE_MODE",
                message: "Escolhe READ_ONLY ou PRIVATE_FORK.",
            });
        }
    }

    /**
     * Mapeia o documento persistido para resposta pública.
     *
     * @param answer Interação persistida já autorizada pelo service.
     * @returns Vista pública da resposta IA.
     */
    private toAnswerView(answer: RoomAiPersisted): RoomAiAnswerReuseView {
        return {
            _id: String(answer._id),
            roomId: String(answer.roomId),
            studentId: String(answer.studentId),
            question: answer.question,
            answer: answer.answer,
            sourceShareIds: answer.sourceShareIds.map((sourceId) => String(sourceId)),
            visibility: answer.visibility,
            sharedAt: answer.sharedAt,
            forkedFromInteractionId: answer.forkedFromInteractionId
                ? String(answer.forkedFromInteractionId)
                : undefined,
            createdAt: answer.createdAt,
        };
    }

    /**
     * Evita revelar se a resposta existe fora da sala ou pertence a outro aluno.
     *
     * @returns Exceção pública e estável.
     */
    private answerNotFound(): NotFoundException {
        return new NotFoundException({
            code: "ROOM_AI_ANSWER_NOT_FOUND",
            message: "Resposta IA não encontrada nesta sala.",
        });
    }
}