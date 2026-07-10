/**
 * Implementa as regras de negócio de turma projects e concentra validações do domínio.
 */
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { CreateClassProjectDto } from "./dto/create-class-project.dto.js";
import {
    ClassProject,
    ClassProjectDocument,
    ClassProjectStatus,
} from "./schemas/class-project.schema.js";

/**
 * Vista pública de projetos da turma, sem detalhes internos de Mongoose.
 */
export type ClassProjectView = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    brief: string;
    subject?: string;
    dueDate?: Date;
    status: ClassProjectStatus;
    createdAt?: Date;
};

/**
 * Serviço de projectos oficiais da turma.
 */
@Injectable()
export class ClassProjectsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param projectModel Modelo Mongoose injetado para ler e persistir projetos da turma.
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     */
    constructor(
        @InjectModel(ClassProject.name)
        private readonly projectModel: Model<ClassProjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    /**
     * Cria projetos da turma depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async create(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateClassProjectDto,
    ): Promise<ClassProjectView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const project = await this.projectModel.create({
            classId: new Types.ObjectId(schoolClass._id),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            brief: input.brief.trim(),
            subject: input.subject?.trim(),
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            status: input.status ?? "DRAFT",
        });
        return this.toView(project.toObject());
    }

    /**
     * Lista projetos da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de projetos da turma visível para o contexto autorizado.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassProjectView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const projects = await this.projectModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ createdAt: -1 })
            .lean();
        return projects.map((project) => this.toView(project));
    }

    /**
     * Lista projetos da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de projetos da turma visível para o contexto autorizado.
     */
    async listPublishedForStudent(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassProjectView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        const projects = await this.projectModel
            .find({
                classId: new Types.ObjectId(schoolClass._id),
                status: "PUBLISHED",
            })
            .sort({ createdAt: -1 })
            .lean();
        return projects.map((project) => this.toView(project));
    }

    /**
     * Procura projetos da turma com filtros de ownership, membership ou estado para evitar leituras indevidas.
     *
     * @param studentId Identificador de student que delimita ownership, membership ou relação de domínio.
     * @param projectId Identificador de project que delimita ownership, membership ou relação de domínio.
     * @returns Entidade de projetos da turma já filtrada pelo contexto recebido.
     */
    async findPublishedForStudent(
        studentId: string,
        projectId: string,
    ): Promise<ClassProjectView> {
        if (!Types.ObjectId.isValid(projectId)) throw this.notFound();
        const project = await this.projectModel
            .findOne({ _id: projectId, status: "PUBLISHED" })
            .lean();
        if (!project) throw this.notFound();
        const view = this.toView(project);
        await this.classesService.ensureStudentEnrollment(studentId, view.classId);
        return view;
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
     * Constrói uma exceção de projetos da turma com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "CLASS_PROJECT_NOT_FOUND",
            message: "Projecto não encontrado.",
        });
    }

    /**
     * Mapeia o documento interno de projetos da turma para uma forma pública estável e simples de consumir.
     *
     * @param project Valor de project usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toView(project: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        brief: string;
        subject?: string;
        dueDate?: Date;
        status: ClassProjectStatus;
        createdAt?: Date;
    }): ClassProjectView {
        return {
            _id: String(project._id),
            classId: String(project.classId),
            teacherId: String(project.teacherId),
            title: project.title,
            brief: project.brief,
            subject: project.subject,
            dueDate: project.dueDate,
            status: project.status,
            createdAt: project.createdAt,
        };
    }
}
