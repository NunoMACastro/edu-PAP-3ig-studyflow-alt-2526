/**
 * Implementa as regras de negócio de grupos de estudo e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import { CreateStudyGroupDto } from "./dto/create-study-group.dto.js";

/**
 * Vista pública de grupos de estudo, sem detalhes internos de Mongoose.
 */
export type StudyGroupView = {
    _id: string;
    ownerStudentId: string;
    title: string;
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    createdAt?: Date;
    collaborationKind: "STUDY_GROUP";
    collaborationKindSource: "NATIVE" | "LEGACY_INFERRED";
};

/**
 * Fachada de grupos de estudo sobre `StudyRoom`.
 *
 * Mantém a membership numa única entidade, permitindo que chat, sessões e IA
 * coletiva reutilizem o contrato já validado em MF1.
 */
@Injectable()
export class StudyGroupsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param studyRoomsService Service injetado para reutilizar regras de salas de estudo sem duplicar validações.
     */
    constructor(private readonly studyRoomsService: StudyRoomsService) {}

    /**
     * Cria um grupo e adiciona automaticamente o criador como membro.
     *
     * @param actor Aluno autenticado.
     * @param input Dados do grupo.
     * @returns Grupo público.
     */
    async createGroup(
        actor: AuthenticatedUser,
        input: CreateStudyGroupDto,
    ): Promise<StudyGroupView> {
        const room = await this.studyRoomsService.createRoom(actor, {
            name: input.title,
            type: input.disciplineName ? "SUBJECT" : "FREE",
            disciplineName: input.disciplineName,
            description: input.description,
        }, "STUDY_GROUP");
        return this.toGroupView(room);
    }

    /**
     * Lista os grupos onde o aluno autenticado é membro.
     *
     * @param actor Aluno autenticado.
     * @returns Grupos acessíveis.
     */
    async listMyGroups(actor: AuthenticatedUser): Promise<StudyGroupView[]> {
        const rooms = await this.studyRoomsService.listMyRooms(actor, "STUDY_GROUP");
        return rooms.map((room) => this.toGroupView(room));
    }

    /**
     * Confirma membership no grupo.
     *
     * @param studentId Aluno autenticado.
     * @param groupId Grupo/sala.
     * @returns Grupo validado.
     */
    async ensureMember(
        studentId: string,
        groupId: string,
    ): Promise<StudyGroupView> {
        const room = await this.studyRoomsService.ensureMember(
            studentId,
            groupId,
            "STUDY_GROUP",
        );
        return this.toGroupView(room);
    }

    /**
     * Converte o contrato de sala no contrato público de grupos.
     *
     * @param room Valor de room usado pela função para executar to group view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toGroupView(room: {
        _id: string;
        ownerStudentId: string;
        name: string;
        disciplineName?: string;
        description?: string;
        memberIds: string[];
        createdAt?: Date;
        collaborationKind: "STUDY_GROUP" | "STUDY_ROOM";
        collaborationKindSource: "NATIVE" | "LEGACY_INFERRED";
    }): StudyGroupView {
        return {
            _id: room._id,
            ownerStudentId: room.ownerStudentId,
            title: room.name,
            disciplineName: room.disciplineName,
            description: room.description,
            memberIds: room.memberIds,
            createdAt: room.createdAt,
            collaborationKind: "STUDY_GROUP",
            collaborationKindSource: room.collaborationKindSource,
        };
    }
}
