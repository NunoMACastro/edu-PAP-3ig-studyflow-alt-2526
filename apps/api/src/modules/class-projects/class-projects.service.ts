/**
 * Implementa as regras de negócio de turma projects e concentra validações do domínio.
 */
import { ConflictException, ForbiddenException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Types, type ClientSession, type Connection, type Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { CreateClassProjectDto, UpdateClassProjectDto } from "./dto/create-class-project.dto.js";
import {
    ClassProject,
    ClassProjectDocument,
    ClassProjectStatus,
} from "./schemas/class-project.schema.js";
import {
    StudentClassProjectProgress,
    StudentClassProjectState,
    StudentClassProjectStateDocument,
} from "./schemas/student-class-project-state.schema.js";

/**
 * Vista pública de projetos da turma, sem detalhes internos de Mongoose.
 */
export type ClassProjectView = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    brief: string;
    subjectId?: string;
    subjectName?: string;
    /** Alias legacy mantido durante a migração do frontend. */
    subject?: string;
    dueDate?: Date;
    status: ClassProjectStatus;
    publishedAt?: Date;
    createdAt?: Date;
};

/** Contrato do aluno sem identidade interna do professor. */
export type StudentClassProjectView = Omit<ClassProjectView, "teacherId"> & {
    readOnly: boolean;
    myProgress: StudentClassProjectProgress;
    completedAt?: Date;
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
        private readonly subjectsService: SubjectsService,
        private readonly notificationsService: ContextNotificationsService,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
        @Optional()
        @InjectModel(StudentClassProjectState.name)
        private readonly studentStateModel?: Model<StudentClassProjectStateDocument>,
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
        const schoolClass = await this.classesService.findOwnedActiveClass(
            actor.id,
            classId,
        );
        const subject = input.subjectId
            ? await this.subjectsService.findOwnedSubject(actor.id, input.subjectId)
            : undefined;
        if (subject && subject.classId !== schoolClass._id) {
            throw new ConflictException({
                code: "CLASS_PROJECT_SUBJECT_CLASS_MISMATCH",
                message: "A disciplina não pertence à turma do projeto.",
            });
        }
        const project = await this.runInTransaction(async (session) => {
            if (subject) {
                await this.subjectsService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    subject._id,
                    session,
                );
            } else {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    session,
                );
            }
            const document = {
                classId: new Types.ObjectId(schoolClass._id),
                teacherId: new Types.ObjectId(actor.id),
                title: input.title.trim(),
                brief: input.brief.trim(),
                ...(subject
                    ? {
                          subjectId: new Types.ObjectId(subject._id),
                          subjectNameSnapshot: subject.name,
                      }
                    : {}),
                dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
                status: "DRAFT",
            } as const;
            return session
                ? (await this.projectModel.create([document], { session }))[0]
                : this.projectModel.create(document);
        });
        return this.toView(project.toObject());
    }

    /** Edita o enunciado enquanto o projeto permanece em rascunho. */
    async updateDraft(
        actor: AuthenticatedUser,
        classId: string,
        projectId: string,
        input: UpdateClassProjectDto,
    ): Promise<ClassProjectView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedActiveClass(actor.id, classId);
        if (!Types.ObjectId.isValid(projectId)) throw this.notFound();
        const set: Record<string, unknown> = {};
        if (input.title !== undefined) set.title = input.title.trim();
        if (input.brief !== undefined) set.brief = input.brief.trim();
        const unset: Record<string, ""> = {};
        if (input.dueDate === null) unset.dueDate = "";
        else if (input.dueDate !== undefined) set.dueDate = new Date(input.dueDate);
        if (input.subjectId === null) {
            unset.subjectId = "";
            unset.subjectNameSnapshot = "";
            unset.subject = "";
        } else if (input.subjectId !== undefined) {
            const subject = await this.subjectsService.findOwnedSubject(actor.id, input.subjectId);
            if (subject.classId !== schoolClass._id) {
                throw new ConflictException({
                    code: "CLASS_PROJECT_SUBJECT_CLASS_MISMATCH",
                    message: "A disciplina não pertence à turma do projeto.",
                });
            }
            set.subjectId = new Types.ObjectId(subject._id);
            set.subjectNameSnapshot = subject.name;
        }
        return this.runInTransaction(async (session) => {
            const existing = await this.projectModel
                .findOne(
                    {
                        _id: new Types.ObjectId(projectId),
                        classId: new Types.ObjectId(schoolClass._id),
                        teacherId: new Types.ObjectId(actor.id),
                    },
                    null,
                    session ? { session } : undefined,
                )
                .lean();
            if (!existing) throw this.notFound();
            if (existing.status !== "DRAFT") {
                throw new ConflictException({
                    code: "CLASS_PROJECT_NOT_EDITABLE",
                    message: "Um projeto publicado já não pode ser alterado.",
                });
            }
            const effectiveSubjectId = input.subjectId === null
                ? undefined
                : input.subjectId !== undefined
                  ? input.subjectId
                  : existing.subjectId
                    ? String(existing.subjectId)
                    : undefined;
            if (effectiveSubjectId) {
                await this.subjectsService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    effectiveSubjectId,
                    session,
                );
            } else {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    session,
                );
            }
            const updated = await this.projectModel
                .findOneAndUpdate(
                    {
                        _id: new Types.ObjectId(projectId),
                        classId: new Types.ObjectId(schoolClass._id),
                        teacherId: new Types.ObjectId(actor.id),
                        status: "DRAFT",
                    },
                    {
                        ...(Object.keys(set).length ? { $set: set } : {}),
                        ...(Object.keys(unset).length ? { $unset: unset } : {}),
                    },
                    session
                        ? { new: true, runValidators: true, session }
                        : { new: true, runValidators: true },
                )
                .lean();
            if (updated) return this.toView(updated);
            throw new ConflictException({
                code: "CLASS_PROJECT_NOT_EDITABLE",
                message: "Um projeto publicado já não pode ser alterado.",
            });
        });
    }

    /** Publica um rascunho de forma unidirecional e idempotente. */
    async publish(
        actor: AuthenticatedUser,
        classId: string,
        projectId: string,
    ): Promise<ClassProjectView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedActiveClass(actor.id, classId);
        if (!Types.ObjectId.isValid(projectId)) throw this.notFound();
        return this.runInTransaction(async (session) => {
            const existing = await this.projectModel
                .findOne(
                    {
                        _id: new Types.ObjectId(projectId),
                        classId: new Types.ObjectId(schoolClass._id),
                        teacherId: new Types.ObjectId(actor.id),
                    },
                    null,
                    session ? { session } : undefined,
                )
                .lean();
            if (!existing) throw this.notFound();
            if (existing.subjectId) {
                await this.subjectsService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    String(existing.subjectId),
                    session,
                );
            } else {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    session,
                );
            }
            const publishedAt = new Date();
            const changed = await this.projectModel
                .findOneAndUpdate(
                    {
                        _id: new Types.ObjectId(projectId),
                        classId: new Types.ObjectId(schoolClass._id),
                        teacherId: new Types.ObjectId(actor.id),
                        status: "DRAFT",
                    },
                    { $set: { status: "PUBLISHED", publishedAt } },
                    session
                        ? { new: true, runValidators: true, session }
                        : { new: true, runValidators: true },
                )
                .lean();
            if (changed) {
                const view = this.toView(changed);
                await this.notifyPublished(actor, view, session);
                return view;
            }
            if (existing.status === "PUBLISHED") {
                const view = this.toView(existing);
                // Repara projetos legacy publicados antes de existir a outbox.
                await this.notifyPublished(actor, view, session);
                return view;
            }
            throw new ConflictException({
                code: "CLASS_PROJECT_INVALID_STATUS_TRANSITION",
                message: "O projeto não pode ser publicado no estado atual.",
            });
        });
    }

    private async notifyPublished(
        actor: AuthenticatedUser,
        project: ClassProjectView,
        session?: ClientSession,
    ): Promise<void> {
        const notification = {
            classId: project.classId,
            idempotencyKey: `class-project:${project._id}:published`,
            type: "CLASS_PROJECT_PUBLISHED",
            title: `Projeto publicado: ${project.title}`,
            body: "Está disponível um novo projeto oficial da turma.",
            targetPath: `/app/turmas/${project.classId}/projectos`,
        } as const;
        if (session) {
            await this.notificationsService.enqueueClassEvent(
                actor,
                notification,
                session,
            );
        } else {
            await this.notificationsService.enqueueClassEvent(
                actor,
                notification,
            );
        }
    }

    /** Mantém a transição de publicação e a outbox na mesma unidade de commit. */
    private async runInTransaction<T>(
        operation: (session?: ClientSession) => Promise<T>,
    ): Promise<T> {
        if (!this.connection) return operation(undefined);
        return this.connection.transaction((session) => operation(session));
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
    ): Promise<StudentClassProjectView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentHistoricalEnrollment(
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
        const states = this.studentStateModel && projects.length > 0
            ? await this.studentStateModel.find({
                studentId: new Types.ObjectId(actor.id),
                projectId: { $in: projects.map((project) => project._id) },
            }).lean()
            : [];
        const stateByProject = new Map(
            states.map((state) => [String(state.projectId), state]),
        );
        return projects.map((project) => {
            const { teacherId: _teacherId, ...safe } = this.toView(project);
            const state = stateByProject.get(String(project._id));
            return {
                ...safe,
                readOnly: schoolClass.status === "ARCHIVED",
                myProgress: state?.status ?? "NOT_STARTED",
                completedAt: state?.completedAt,
            };
        });
    }

    /** Devolve o detalhe seguro do projeto, incluindo o progresso privado. */
    async getPublishedForStudent(
        actor: AuthenticatedUser,
        projectId: string,
    ): Promise<StudentClassProjectView> {
        this.assertStudent(actor);
        const project = await this.findPublishedForStudentHistory(actor.id, projectId);
        const schoolClass = await this.classesService.ensureStudentHistoricalEnrollment(
            actor.id,
            project.classId,
        );
        const state = this.studentStateModel
            ? await this.studentStateModel.findOne({
                studentId: new Types.ObjectId(actor.id),
                projectId: new Types.ObjectId(projectId),
            }).lean()
            : null;
        const { teacherId: _teacherId, ...safe } = project;
        return {
            ...safe,
            readOnly: schoolClass.status === "ARCHIVED",
            myProgress: state?.status ?? "NOT_STARTED",
            completedAt: state?.completedAt,
        };
    }

    /** Atualiza apenas o progresso pessoal, nunca uma entrega ou avaliação. */
    async updateStudentProgress(
        actor: AuthenticatedUser,
        projectId: string,
        status: StudentClassProjectProgress,
    ): Promise<StudentClassProjectView> {
        this.assertStudent(actor);
        const project = await this.findPublishedForStudent(actor.id, projectId);
        if (!this.studentStateModel) {
            throw new ConflictException({
                code: "PROJECT_PROGRESS_UNAVAILABLE",
                message: "Não foi possível atualizar o progresso.",
            });
        }
        await this.studentStateModel.findOneAndUpdate(
            {
                studentId: new Types.ObjectId(actor.id),
                projectId: new Types.ObjectId(projectId),
            },
            {
                $set: {
                    classId: new Types.ObjectId(project.classId),
                    status,
                    completedAt: status === "COMPLETED" ? new Date() : undefined,
                },
                ...(status !== "COMPLETED" ? { $unset: { completedAt: 1 } } : {}),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        return this.getPublishedForStudent(actor, projectId);
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

    /** Autoriza o histórico de um projeto publicado numa turma arquivada. */
    async findPublishedForStudentHistory(
        studentId: string,
        projectId: string,
    ): Promise<ClassProjectView> {
        if (!Types.ObjectId.isValid(projectId)) throw this.notFound();
        const project = await this.projectModel
            .findOne({ _id: projectId, status: "PUBLISHED" })
            .lean();
        if (!project) throw this.notFound();
        const view = this.toView(project);
        await this.classesService.ensureStudentHistoricalEnrollment(
            studentId,
            view.classId,
        );
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
        subjectId?: unknown;
        subjectNameSnapshot?: string;
        subject?: string;
        dueDate?: Date;
        status: ClassProjectStatus;
        publishedAt?: Date;
        createdAt?: Date;
    }): ClassProjectView {
        return {
            _id: String(project._id),
            classId: String(project.classId),
            teacherId: String(project.teacherId),
            title: project.title,
            brief: project.brief,
            subjectId: project.subjectId ? String(project.subjectId) : undefined,
            subjectName: project.subjectNameSnapshot ?? project.subject,
            subject: project.subjectNameSnapshot ?? project.subject,
            dueDate: project.dueDate,
            status: project.status,
            publishedAt: project.publishedAt,
            createdAt: project.createdAt,
        };
    }
}
