/**
 * Implementa as regras de negócio de sessões de estudo em grupo e concentra validações do domínio.
 */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { CreateStudyGroupSessionDto } from "./dto/create-study-group-session.dto.js";
import {
    StudyGroupSession,
    StudyGroupSessionDocument,
} from "./schemas/study-group-session.schema.js";

/**
 * Vista pública de sessões de estudo em grupo, sem detalhes internos de Mongoose.
 */
export type StudyGroupSessionView = {
    _id: string;
    groupId: string;
    createdByStudentId: string;
    title: string;
    startsAt: Date;
    durationMinutes: number;
    goal?: string;
    createdAt?: Date;
};

/**
 * Serviço de sessões coletivas de estudo.
 */
@Injectable()
export class StudyGroupSessionsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param sessionModel Modelo Mongoose injetado para ler e persistir sessões de estudo em grupo.
     * @param studyGroupsService Service injetado para reutilizar regras de grupos de estudo sem duplicar validações.
     */
    constructor(
        @InjectModel(StudyGroupSession.name)
        private readonly sessionModel: Model<StudyGroupSessionDocument>,
        private readonly studyGroupsService: StudyGroupsService,
    ) {}

    /**
     * Agenda uma sessão para membros do grupo.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @param input Dados da sessão.
     * @returns Sessão criada.
     */
    async createSession(
        actor: AuthenticatedUser,
        groupId: string,
        input: CreateStudyGroupSessionDto,
    ): Promise<StudyGroupSessionView> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const startsAt = new Date(input.startsAt);
        if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
            throw new BadRequestException({
                code: "SESSION_STARTS_AT_INVALID",
                message: "Agenda a sessão para uma data futura.",
            });
        }

        const session = await this.sessionModel.create({
            groupId: new Types.ObjectId(groupId),
            createdByStudentId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            startsAt,
            durationMinutes: input.durationMinutes,
            goal: input.goal?.trim(),
        });
        return this.toSessionView(session.toObject());
    }

    /**
     * Lista sessões de um grupo validando membership.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @returns Sessões ordenadas por data.
     */
    async listGroupSessions(
        actor: AuthenticatedUser,
        groupId: string,
    ): Promise<StudyGroupSessionView[]> {
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const sessions = await this.sessionModel
            .find({ groupId: new Types.ObjectId(groupId) })
            .sort({ startsAt: 1 })
            .lean();
        return sessions.map((session) => this.toSessionView(session));
    }

    /**
     * Lista próximas sessões de todos os grupos do aluno.
     *
     * @param actor Aluno autenticado.
     * @returns Sessões futuras acessíveis ao aluno.
     */
    async listUpcomingForStudent(
        actor: AuthenticatedUser,
    ): Promise<StudyGroupSessionView[]> {
        const groups = await this.studyGroupsService.listMyGroups(actor);
        if (groups.length === 0) return [];
        const groupIds = groups.map((group) => new Types.ObjectId(group._id));
        const sessions = await this.sessionModel
            .find({ groupId: { $in: groupIds }, startsAt: { $gte: new Date() } })
            .sort({ startsAt: 1 })
            .limit(20)
            .lean();
        return sessions.map((session) => this.toSessionView(session));
    }

    /**
     * Converte documento interno em contrato público.
     *
     * @param session Documento ou objeto lean.
     * @returns Sessão pública.
     */
    private toSessionView(session: {
        _id: unknown;
        groupId: unknown;
        createdByStudentId: unknown;
        title: string;
        startsAt: Date;
        durationMinutes: number;
        goal?: string;
        createdAt?: Date;
    }): StudyGroupSessionView {
        return {
            _id: String(session._id),
            groupId: String(session.groupId),
            createdByStudentId: String(session.createdByStudentId),
            title: session.title,
            startsAt: session.startsAt,
            durationMinutes: session.durationMinutes,
            goal: session.goal,
            createdAt: session.createdAt,
        };
    }
}
