/**
 * Implementa as regras de negócio de salas de estudo e concentra validações do domínio.
 */
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { AddRoomMemberDto } from "./dto/add-room-member.dto.js";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto.js";
import {
    CollaborationKind,
    CollaborationKindSource,
    StudyRoom,
    StudyRoomDocument,
} from "./schemas/study-room.schema.js";

/**
 * Vista pública de salas de estudo, sem detalhes internos de Mongoose.
 */
export type StudyRoomView = {
    _id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    collaborationKind: CollaborationKind;
    collaborationKindSource: CollaborationKindSource;
    createdAt?: Date;
};

/** Política interna usada para reutilizar membership sem a expor ao cliente. */
export type AddRoomMemberPolicy = {
    collaborationKind?: CollaborationKind;
    ownerOnly?: boolean;
};

/**
 * Serviço de salas de estudo.
 */
@Injectable()
export class StudyRoomsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param roomModel Modelo Mongoose injetado para ler e persistir salas de estudo.
     * @param userModel Modelo Mongoose injetado para ler e persistir salas de estudo.
     */
    constructor(
        @InjectModel(StudyRoom.name)
        private readonly roomModel: Model<StudyRoomDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    /**
     * Cria salas de estudo depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createRoom(
        actor: AuthenticatedUser,
        input: CreateStudyRoomDto,
        collaborationKind: CollaborationKind = "STUDY_ROOM",
    ): Promise<StudyRoomView> {
        this.assertStudent(actor);
        const name = input.name.trim();
        const disciplineName = input.disciplineName?.trim();

        if (input.type === "SUBJECT" && !disciplineName) {
            throw new BadRequestException({
                code: "DISCIPLINE_NAME_REQUIRED",
                message: "Indica a disciplina da sala.",
            });
        }

        const room = await this.roomModel.create({
            ownerStudentId: new Types.ObjectId(actor.id),
            name,
            type: input.type,
            disciplineName: input.type === "SUBJECT" ? disciplineName : undefined,
            description: input.description?.trim(),
            memberIds: [new Types.ObjectId(actor.id)],
            collaborationKind,
            collaborationKindSource: "NATIVE",
        });

        return this.toRoomView(room.toObject());
    }

    /**
     * Lista salas de estudo já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @returns Coleção de salas de estudo visível para o contexto autorizado.
     */
    async listMyRooms(
        actor: AuthenticatedUser,
        collaborationKind: CollaborationKind = "STUDY_ROOM",
    ): Promise<StudyRoomView[]> {
        this.assertStudent(actor);
        const rooms = await this.roomModel
            .find({
                memberIds: new Types.ObjectId(actor.id),
                $or: [
                    { collaborationKind },
                    {
                        collaborationKind: { $exists: false },
                        ...(collaborationKind === "STUDY_GROUP"
                            ? { disciplineName: { $exists: true, $nin: [null, ""] } }
                            : { $or: [
                                { disciplineName: { $exists: false } },
                                { disciplineName: null },
                                { disciplineName: "" },
                            ] }),
                    },
                ],
            })
            .sort({ createdAt: -1 })
            .lean();
        return rooms.map((room) => this.toRoomView(room));
    }

    /** Devolve uma sala concreta apenas depois de confirmar membership e kind. */
    async getRoom(
        actor: AuthenticatedUser,
        roomId: string,
    ): Promise<StudyRoomView> {
        this.assertStudent(actor);
        return this.ensureMember(actor.id, roomId, "STUDY_ROOM");
    }

    /**
     * Executa a operação add member no domínio de salas de estudo com contrato explícito.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param roomId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async addMember(
        actor: AuthenticatedUser,
        roomId: string,
        input: AddRoomMemberDto,
        policy: AddRoomMemberPolicy = {},
    ): Promise<StudyRoomView> {
        this.assertStudent(actor);
        const collaborationKind = policy.collaborationKind ?? "STUDY_ROOM";
        const room = await this.ensureMember(actor.id, roomId, collaborationKind);
        if (policy.ownerOnly && room.ownerStudentId !== actor.id) {
            throw new ForbiddenException({
                code: "GROUP_OWNER_REQUIRED",
                message: "Apenas o proprietário pode adicionar membros ao grupo.",
            });
        }

        const member = await this.userModel
            .findOne({ email: input.email.trim().toLowerCase(), role: "STUDENT" })
            .lean();
        if (!member) {
            throw new NotFoundException({
                code: "ROOM_MEMBER_NOT_FOUND",
                message: "Aluno não encontrado.",
            });
        }

        const updated = await this.roomModel
            .findByIdAndUpdate(
                roomId,
                { $addToSet: { memberIds: member._id } },
                { new: true, runValidators: true },
            )
            .lean();
        if (!updated) throw this.roomNotFound();
        return this.toRoomView(updated);
    }

    /**
     * Confirma que um aluno pertence à sala.
     *
     * @param studentId Identificador vindo da sessão.
     * @param roomId Identificador da sala.
     * @returns Sala encontrada.
     */
    async ensureMember(
        studentId: string,
        roomId: string,
        collaborationKind: CollaborationKind = "STUDY_ROOM",
    ): Promise<StudyRoomView> {
        if (!Types.ObjectId.isValid(roomId)) {
            throw this.roomNotFound();
        }

        const room = await this.roomModel
            .findOne({
                _id: roomId,
                memberIds: new Types.ObjectId(studentId),
            })
            .lean();

        if (!room) {
            // O 403 indica falta de acesso sem confirmar se a sala existe para outro aluno.
            throw new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso a esta sala.",
            });
        }

        if (this.resolveCollaborationKind(room) !== collaborationKind) {
            throw this.roomNotFound();
        }

        return this.toRoomView(room);
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    /**
     * Constrói uma exceção de salas de estudo com código previsível para API, UI e testes.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private roomNotFound(): NotFoundException {
        return new NotFoundException({
            code: "STUDY_ROOM_NOT_FOUND",
            message: "Sala de estudo não encontrada.",
        });
    }

    /**
     * Mapeia o documento interno de salas de estudo para uma forma pública estável e simples de consumir.
     *
     * @param room Valor de room usado pela função para executar to room view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toRoomView(room: {
        _id: unknown;
        ownerStudentId: unknown;
        name: string;
        type: "FREE" | "SUBJECT";
        disciplineName?: string;
        description?: string;
        memberIds: unknown[];
        collaborationKind?: CollaborationKind;
        collaborationKindSource?: CollaborationKindSource;
        createdAt?: Date;
    }): StudyRoomView {
        return {
            _id: String(room._id),
            ownerStudentId: String(room.ownerStudentId),
            name: room.name,
            type: room.type,
            disciplineName: room.disciplineName,
            description: room.description,
            memberIds: room.memberIds.map((memberId) => String(memberId)),
            collaborationKind: this.resolveCollaborationKind(room),
            collaborationKindSource: room.collaborationKindSource ?? "LEGACY_INFERRED",
            createdAt: room.createdAt,
        };
    }

    /** Mantém leitura compatível antes da migração sem voltar a usar heurísticas na UI. */
    private resolveCollaborationKind(room: {
        collaborationKind?: CollaborationKind;
        disciplineName?: string;
    }): CollaborationKind {
        return room.collaborationKind
            ?? (room.disciplineName?.trim() ? "STUDY_GROUP" : "STUDY_ROOM");
    }
}
