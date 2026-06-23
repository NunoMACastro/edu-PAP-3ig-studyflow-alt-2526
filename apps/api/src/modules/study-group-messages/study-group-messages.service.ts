/**
 * Implementa as regras de negócio de mensagens de grupos de estudo e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import {
    CreateStudyGroupMessageDto,
    StudyGroupMessageKind,
} from "./dto/create-study-group-message.dto.js";
import {
    StudyGroupMessage,
    StudyGroupMessageDocument,
} from "./schemas/study-group-message.schema.js";

/**
 * Vista pública de mensagens do grupo de estudo, sem detalhes internos de Mongoose.
 */
export type StudyGroupMessageView = {
    _id: string;
    groupId: string;
    authorStudentId: string;
    kind: StudyGroupMessageKind;
    text: string;
    createdAt?: Date;
};

/**
 * Serviço de chat assíncrono e notas coletivas.
 */
@Injectable()
export class StudyGroupMessagesService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param messageModel Modelo Mongoose injetado para ler e persistir mensagens do grupo de estudo.
     * @param studyGroupsService Service injetado para reutilizar regras de grupos de estudo sem duplicar validações.
     */
    constructor(
        @InjectModel(StudyGroupMessage.name)
        private readonly messageModel: Model<StudyGroupMessageDocument>,
        private readonly studyGroupsService: StudyGroupsService,
    ) {}

    /**
     * Cria uma mensagem ou nota após validar membership.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @param input Conteúdo validado.
     * @returns Mensagem pública.
     */
    async createMessage(
        actor: AuthenticatedUser,
        groupId: string,
        input: CreateStudyGroupMessageDto,
    ): Promise<StudyGroupMessageView> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const message = await this.messageModel.create({
            groupId: new Types.ObjectId(groupId),
            authorStudentId: new Types.ObjectId(actor.id),
            kind: input.kind,
            text: input.text.trim(),
        });
        return this.toMessageView(message.toObject());
    }

    /**
     * Lista histórico do grupo visível apenas a membros.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @returns Mensagens ordenadas.
     */
    async listMessages(
        actor: AuthenticatedUser,
        groupId: string,
    ): Promise<StudyGroupMessageView[]> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const messages = await this.messageModel
            .find({ groupId: new Types.ObjectId(groupId) })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        return messages.map((message) => this.toMessageView(message));
    }

    /**
     * Converte documento interno em contrato público.
     *
     * @param message Documento ou objeto lean.
     * @returns Mensagem pública.
     */
    private toMessageView(message: {
        _id: unknown;
        groupId: unknown;
        authorStudentId: unknown;
        kind: StudyGroupMessageKind;
        text: string;
        createdAt?: Date;
    }): StudyGroupMessageView {
        return {
            _id: String(message._id),
            groupId: String(message.groupId),
            authorStudentId: String(message.authorStudentId),
            kind: message.kind,
            text: message.text,
            createdAt: message.createdAt,
        };
    }
}
