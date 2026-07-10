/**
 * Implementa as regras de negócio de salas de estudo guiado e concentra validações do domínio.
 */
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { CreateGuidedStudyRoomDto } from "./dto/create-guided-study-room.dto.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomDocument,
    GuidedStudyRoomStatus,
} from "./schemas/guided-study-room.schema.js";

/**
 * Vista pública de salas de estudo guiado, sem detalhes internos de Mongoose.
 */
export type GuidedStudyRoomView = {
    _id: string;
    classId: string;
    subjectId?: string;
    teacherId: string;
    title: string;
    description: string;
    materialIds: string[];
    status: GuidedStudyRoomStatus;
    createdAt?: Date;
};

/**
 * Contagens públicas de salas guiadas por estado.
 */
export type GuidedStudyRoomStatusCounts = {
    open: number;
    closed: number;
};

/**
 * Contagens agregadas usadas por dashboards sem expor alunos ou mensagens.
 */
export type GuidedStudyRoomCountSummary = GuidedStudyRoomStatusCounts & {
    bySubjectId: Record<string, GuidedStudyRoomStatusCounts>;
};

/**
 * Serviço de salas guiadas com autorização por turma.
 */
@Injectable()
export class GuidedStudyRoomsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param roomModel Modelo Mongoose injetado para ler e persistir salas de estudo guiado.
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     * @param subjectsService Service injetado para validar disciplinas opcionais sem duplicar ownership.
     */
    constructor(
        @InjectModel(GuidedStudyRoom.name)
        private readonly roomModel: Model<GuidedStudyRoomDocument>,
        private readonly classesService: ClassesService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Cria salas de estudo guiado depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async create(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateGuidedStudyRoomDto,
    ): Promise<GuidedStudyRoomView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const subjectId = await this.resolveOptionalSubjectId(
            actor.id,
            schoolClass._id,
            input.subjectId,
        );
        const room = await this.roomModel.create({
            classId: new Types.ObjectId(schoolClass._id),
            ...(subjectId ? { subjectId: new Types.ObjectId(subjectId) } : {}),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            description: input.description.trim(),
            materialIds: input.materialIds ?? [],
            status: "OPEN",
        });
        return this.toView(room.toObject());
    }

    /**
     * Lista salas de estudo guiado já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de salas de estudo guiado visível para o contexto autorizado.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<GuidedStudyRoomView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const rooms = await this.roomModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ createdAt: -1 })
            .lean();
        return rooms.map((room) => this.toView(room));
    }

    /**
     * Lista salas de estudo guiado já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de salas de estudo guiado visível para o contexto autorizado.
     */
    async listForStudent(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<GuidedStudyRoomView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        const rooms = await this.roomModel
            .find({
                classId: new Types.ObjectId(schoolClass._id),
                status: "OPEN",
            })
            .sort({ createdAt: -1 })
            .lean();
        return rooms.map((room) => this.toView(room));
    }

    /**
     * Conta salas guiadas de uma turma já autorizada pelo chamador.
     *
     * @param classId Turma do professor, validada antes pelo chamador.
     * @param subjectIds Disciplinas da turma autorizadas pelo chamador.
     * @returns Totais por estado e por disciplina quando a sala está associada a disciplina.
     */
    async countByClassAndSubjectIds(
        classId: string,
        subjectIds: string[],
    ): Promise<GuidedStudyRoomCountSummary> {
        const classObjectId = new Types.ObjectId(classId);
        const classRows = await this.roomModel.aggregate<{
            _id: GuidedStudyRoomStatus;
            count: number;
        }>([
            { $match: { classId: classObjectId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const summary: GuidedStudyRoomCountSummary = {
            open: 0,
            closed: 0,
            bySubjectId: {},
        };
        for (const row of classRows) {
            if (row._id === "OPEN") summary.open = row.count;
            if (row._id === "CLOSED") summary.closed = row.count;
        }

        for (const subjectId of subjectIds) {
            summary.bySubjectId[subjectId] = { open: 0, closed: 0 };
        }
        if (subjectIds.length === 0) return summary;

        const subjectRows = await this.roomModel.aggregate<{
            _id: { subjectId: Types.ObjectId; status: GuidedStudyRoomStatus };
            count: number;
        }>([
            {
                $match: {
                    classId: classObjectId,
                    subjectId: {
                        $in: subjectIds.map((id) => new Types.ObjectId(id)),
                    },
                },
            },
            {
                $group: {
                    _id: { subjectId: "$subjectId", status: "$status" },
                    count: { $sum: 1 },
                },
            },
        ]);

        for (const row of subjectRows) {
            const subjectId = String(row._id.subjectId);
            const current =
                summary.bySubjectId[subjectId] ?? { open: 0, closed: 0 };
            if (row._id.status === "OPEN") current.open = row.count;
            if (row._id.status === "CLOSED") current.closed = row.count;
            summary.bySubjectId[subjectId] = current;
        }
        return summary;
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
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
     * Valida a disciplina opcional da sala e garante que pertence à mesma turma.
     *
     * @param teacherId Professor autenticado dono da turma.
     * @param classId Turma onde a sala guiada será criada.
     * @param subjectId Disciplina opcional escolhida pelo professor.
     * @returns Identificador da disciplina validada ou `undefined`.
     */
    private async resolveOptionalSubjectId(
        teacherId: string,
        classId: string,
        subjectId?: string,
    ): Promise<string | undefined> {
        if (!subjectId) return undefined;
        const subject = await this.subjectsService.findOwnedSubject(
            teacherId,
            subjectId,
        );
        if (subject.classId !== classId) {
            throw new BadRequestException({
                code: "GUIDED_ROOM_SUBJECT_CLASS_MISMATCH",
                message: "A disciplina não pertence à turma da sala guiada.",
            });
        }
        return subject._id;
    }

    /**
     * Mapeia o documento interno de salas de estudo guiado para uma forma pública estável e simples de consumir.
     *
     * @param room Valor de room usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toView(room: {
        _id: unknown;
        classId: unknown;
        subjectId?: unknown;
        teacherId: unknown;
        title: string;
        description: string;
        materialIds?: string[];
        status: GuidedStudyRoomStatus;
        createdAt?: Date;
    }): GuidedStudyRoomView {
        return {
            _id: String(room._id),
            classId: String(room.classId),
            subjectId: room.subjectId ? String(room.subjectId) : undefined,
            teacherId: String(room.teacherId),
            title: room.title,
            description: room.description,
            materialIds: room.materialIds ?? [],
            status: room.status,
            createdAt: room.createdAt,
        };
    }
}
