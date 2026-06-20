/**
 * Implementa as regras de negócio de salas de estudo guiado e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
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
    teacherId: string;
    title: string;
    description: string;
    materialIds: string[];
    status: GuidedStudyRoomStatus;
    createdAt?: Date;
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
     */
    constructor(
        @InjectModel(GuidedStudyRoom.name)
        private readonly roomModel: Model<GuidedStudyRoomDocument>,
        private readonly classesService: ClassesService,
    ) {}

    /**
     * Cria salas de estudo guiado depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de salas de estudo guiado criado no formato público esperado pela UI ou pelo teste.
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
        const room = await this.roomModel.create({
            classId: new Types.ObjectId(schoolClass._id),
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
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado que executa a operação.
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
     * @param actor Utilizador autenticado que executa a operação.
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
     * Mapeia o documento interno de salas de estudo guiado para uma forma pública estável e simples de consumir.
     *
     * @param sala sala necessário para executar to view sem depender de estado global.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toView(room: {
        _id: unknown;
        classId: unknown;
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
            teacherId: String(room.teacherId),
            title: room.title,
            description: room.description,
            materialIds: room.materialIds ?? [],
            status: room.status,
            createdAt: room.createdAt,
        };
    }
}
