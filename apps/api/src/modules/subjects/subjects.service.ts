/**
 * Implementa as regras de negócio de subjects e concentra validações do domínio.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Types, type ClientSession, type Connection, type Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { isMongoDuplicateKeyError } from "../../common/utils/mongo-error.util.js";
import { ClassesService, SchoolClassView } from "../classes/classes.service.js";
import { NotificationOutboxPublisher } from "../context-notifications/notification-outbox-publisher.service.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomDocument,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import {
    OfficialTest,
    OfficialTestDocument,
} from "../official-tests/schemas/official-test.schema.js";
import { CreateSubjectDto } from "./dto/create-subject.dto.js";
import { UpdateSubjectDto } from "./dto/update-subject.dto.js";
import { UpdateSubjectStatusDto } from "./dto/update-subject-status.dto.js";
import {
    Subject,
    SubjectDocument,
    SubjectStatus,
} from "./schemas/subject.schema.js";

/**
 * Vista pública de disciplinas, sem detalhes internos de Mongoose.
 */
export type SubjectView = {
    _id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description?: string;
    status: SubjectStatus;
    archivedAt?: Date | null;
    createdAt?: Date;
};

/** Contrato discente sem identificadores internos do professor. */
export type StudentSubjectSummary = Omit<SubjectView, "teacherId"> & {
    /** Verdadeiro quando a própria disciplina ou a turma pai está arquivada. */
    readOnly: boolean;
};

/**
 * Serviço de disciplinas oficiais.
 */
@Injectable()
export class SubjectsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param subjectModel Modelo Mongoose injetado para ler e persistir disciplinas.
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     */
    constructor(
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
        private readonly classesService: ClassesService,
        @Optional()
        private readonly outboxPublisher?: NotificationOutboxPublisher,
        @Optional()
        @InjectModel(GuidedStudyRoom.name)
        private readonly guidedRoomModel?: Model<GuidedStudyRoomDocument>,
        @Optional()
        @InjectModel(OfficialTest.name)
        private readonly officialTestModel?: Model<OfficialTestDocument>,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
    ) {}

    /**
     * Cria disciplinas depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createSubject(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateSubjectDto,
    ): Promise<SubjectView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedActiveClass(
            actor.id,
            classId,
        );
        const normalizedName = input.name.trim();
        const existing = await this.subjectModel
            .findOne({
                classId: new Types.ObjectId(schoolClass._id),
                name: normalizedName,
            })
            .lean();
        if (existing) throw this.duplicatedName();

        try {
            const subjectInput = {
                classId: new Types.ObjectId(schoolClass._id),
                teacherId: new Types.ObjectId(actor.id),
                name: normalizedName,
                code: input.code.trim().toUpperCase(),
                description: input.description?.trim(),
                status: "ACTIVE",
            } as const;
            return await this.runInTransaction(async (session) => {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    session,
                );
                const subject = session
                    ? (await this.subjectModel.create([subjectInput], { session }))[0]
                    : await this.subjectModel.create(subjectInput);
                const view = this.toSubjectView(subject.toObject());
                await this.outboxPublisher?.publishClassEvent(
                    {
                        actorId: actor.id,
                        classId: schoolClass._id,
                        recipientIds: schoolClass.studentIds,
                        idempotencyKey: `subject:${view._id}:available`,
                        type: "SUBJECT_AVAILABLE",
                        title: `Disciplina disponível: ${view.name}`,
                        body: "Está disponível uma nova disciplina oficial na tua turma.",
                        targetPath: `/app/turmas/${schoolClass._id}/disciplinas`,
                        preferenceContext: NotificationContext.CLASS_UPDATES,
                    },
                    session,
                );
                return view;
            });
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.duplicatedName();
            }
            throw error;
        }
    }

    /**
     * Lista disciplinas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de disciplinas visível para o contexto autorizado.
     */
    async listTeacherClassSubjects(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<SubjectView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const subjects = await this.subjectModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ name: 1 })
            .lean();
        return subjects.map((subject) => this.toSubjectView(subject));
    }

    /** Atualiza uma disciplina ativa, preservando referências históricas. */
    async updateSubject(
        actor: AuthenticatedUser,
        classId: string,
        subjectId: string,
        input: UpdateSubjectDto,
    ): Promise<SubjectView> {
        this.assertTeacher(actor);
        await this.classesService.findOwnedActiveClass(actor.id, classId);
        const current = await this.findOwnedActiveSubject(actor.id, subjectId);
        if (current.classId !== classId) throw this.subjectNotFound();
        const update = this.normalizedSubjectUpdate(input);
        if (Object.keys(update).length === 0) throw this.emptyUpdate();
        if (update.name) {
            const duplicate = await this.subjectModel
                .findOne({
                    _id: { $ne: new Types.ObjectId(subjectId) },
                    classId: new Types.ObjectId(classId),
                    name: update.name,
                })
                .lean();
            if (duplicate) throw this.duplicatedName();
        }
        try {
            const updated = await this.runInTransaction(async (session) => {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    classId,
                    session,
                );
                return this.subjectModel
                    .findOneAndUpdate(
                        {
                            _id: subjectId,
                            classId: new Types.ObjectId(classId),
                            teacherId: new Types.ObjectId(actor.id),
                            ...this.activeStatusFilter(),
                        },
                        {
                            $set: update,
                            $inc: { lifecycleFenceVersion: 1 },
                        },
                        { new: true, runValidators: true, session },
                    )
                    .lean();
            });
            if (!updated) throw this.subjectNotFound();
            return this.toSubjectView(updated);
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) throw this.duplicatedName();
            throw error;
        }
    }

    /** Arquiva ou restaura uma disciplina pertencente à turma indicada. */
    async updateSubjectStatus(
        actor: AuthenticatedUser,
        classId: string,
        subjectId: string,
        input: UpdateSubjectStatusDto,
    ): Promise<SubjectView> {
        this.assertTeacher(actor);
        const schoolClass = input.status === "ACTIVE"
            ? await this.classesService.findOwnedActiveClass(actor.id, classId)
            : await this.classesService.findOwnedClass(actor.id, classId);
        const subject = await this.findOwnedSubjectForHistory(actor.id, subjectId);
        if (subject.classId !== schoolClass._id) throw this.subjectNotFound();
        if (subject.status === input.status) return subject;
        const now = new Date();
        const lifecycleUpdate = input.status === "ARCHIVED"
            ? {
                $set: {
                    status: "ARCHIVED" as const,
                    archivedAt: now,
                    archivedBy: new Types.ObjectId(actor.id),
                    statusChangedAt: now,
                },
                $inc: { lifecycleFenceVersion: 1 },
            }
            : {
                $set: { status: "ACTIVE" as const, statusChangedAt: now },
                $unset: { archivedAt: "", archivedBy: "" },
                $inc: { lifecycleFenceVersion: 1 },
            };
        const updated = await this.runInTransaction(async (session) => {
            if (input.status === "ACTIVE") {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    classId,
                    session,
                );
            }
            const changed = await this.subjectModel
                .findOneAndUpdate(
                    {
                        _id: subjectId,
                        classId: new Types.ObjectId(classId),
                        teacherId: new Types.ObjectId(actor.id),
                        status: subject.status,
                    },
                    lifecycleUpdate,
                    { new: true, runValidators: true, session },
                )
                .lean();
            if (!changed) return null;

            if (input.status === "ARCHIVED") {
                // Nunca executar operações em paralelo sobre a mesma sessão
                // transacional: o driver MongoDB não suporta esse padrão.
                await this.guidedRoomModel?.updateMany(
                    { subjectId: new Types.ObjectId(subjectId), status: "OPEN" },
                    {
                        $set: {
                            status: "CLOSED",
                            closedAt: now,
                            closedReason: "SUBJECT_ARCHIVED",
                        },
                    },
                    { session },
                );
                await this.officialTestModel?.updateMany(
                    { subjectId: new Types.ObjectId(subjectId), status: "PUBLISHED" },
                    {
                        $set: {
                            status: "CLOSED",
                            closedAt: now,
                            closedReason: "SUBJECT_ARCHIVED",
                        },
                    },
                    { session },
                );
            }

            await this.outboxPublisher?.publishClassEvent(
                {
                    actorId: actor.id,
                    classId,
                    recipientIds: schoolClass.studentIds,
                    idempotencyKey: `subject:${subjectId}:${input.status.toLowerCase()}:${now.toISOString()}`,
                    type: input.status === "ARCHIVED" ? "SUBJECT_ARCHIVED" : "SUBJECT_RESTORED",
                    title:
                        input.status === "ARCHIVED"
                            ? `Disciplina arquivada: ${subject.name}`
                            : `Disciplina restaurada: ${subject.name}`,
                    body:
                        input.status === "ARCHIVED"
                            ? "A disciplina passou para o histórico. As salas guiadas e os mini-testes ativos foram encerrados."
                            : "A disciplina voltou a estar ativa. Os recursos anteriormente encerrados permanecem no histórico.",
                    targetPath: `/app/turmas/${classId}/disciplinas`,
                    preferenceContext: NotificationContext.CLASS_UPDATES,
                },
                session,
            );
            return changed;
        });
        if (!updated) throw this.subjectNotFound();
        return this.toSubjectView(updated);
    }

    /**
     * Lista disciplinas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de disciplinas visível para o contexto autorizado.
     */
    async listStudentClassSubjects(
        actor: AuthenticatedUser,
        classId: string,
        status: SubjectStatus = "ACTIVE",
    ): Promise<StudentSubjectSummary[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentHistoricalEnrollment(
            actor.id,
            classId,
        );
        const subjects = await this.subjectModel
            .find({
                classId: new Types.ObjectId(schoolClass._id),
                ...this.statusFilter(status),
            })
            .sort({ name: 1 })
            .lean();
        return subjects.map((subject) =>
            this.toStudentSubjectSummary(
                subject,
                schoolClass.status === "ARCHIVED",
            ),
        );
    }

    /**
     * Procura disciplinas com filtros de ownership, membership ou estado para evitar leituras indevidas.
     *
     * @param teacherId Identificador de teacher que delimita ownership, membership ou relação de domínio.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de disciplinas já filtrada pelo contexto recebido.
     */
    async findOwnedSubject(
        teacherId: string,
        subjectId: string,
    ): Promise<SubjectView> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel
            .findOne({
                _id: subjectId,
                teacherId: new Types.ObjectId(teacherId),
                ...this.activeStatusFilter(),
            })
            .lean();
        if (!subject) throw this.subjectNotFound();
        const view = this.toSubjectView(subject);
        await this.classesService.findOwnedActiveClass(teacherId, view.classId);
        return view;
    }

    /** Alias explícito para chamadas de mutação em disciplina ativa. */
    async findOwnedActiveSubject(
        teacherId: string,
        subjectId: string,
    ): Promise<SubjectView> {
        return this.findOwnedSubject(teacherId, subjectId);
    }

    /**
     * Reserva uma mutação descendente na disciplina e na turma pai.
     *
     * As duas escritas usam a sessão da operação filha. O fence da disciplina
     * serializa com o seu archive; o fence da turma serializa com o archive da
     * turma mesmo quando a disciplina permanece `ACTIVE` para fins históricos.
     */
    async reserveActiveChildMutation(
        teacherId: string,
        classId: string,
        subjectId: string,
        session?: ClientSession,
    ): Promise<void> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        // Ordem global de locks: turma -> disciplina. Restore e todas as
        // mutações filhas seguem a mesma ordem para evitar ciclos de espera.
        await this.classesService.reserveActiveChildMutation(
            teacherId,
            classId,
            session,
        );
        const result = await this.subjectModel.updateOne(
            {
                _id: new Types.ObjectId(subjectId),
                classId: new Types.ObjectId(classId),
                teacherId: new Types.ObjectId(teacherId),
                ...this.activeStatusFilter(),
            },
            { $inc: { lifecycleFenceVersion: 1 } },
            session ? { session } : undefined,
        );
        if (result.matchedCount !== 1) throw this.subjectNotActive();
    }

    /** Obtém uma disciplina própria para leitura histórica, mesmo arquivada. */
    async findOwnedSubjectForHistory(
        teacherId: string,
        subjectId: string,
    ): Promise<SubjectView> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel
            .findOne({
                _id: subjectId,
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!subject) throw this.subjectNotFound();
        return this.toSubjectView(subject);
    }

    /**
     * Obtém uma disciplina se o aluno estiver inscrito na turma respetiva.
     *
     * @param studentId Aluno autenticado.
     * @param subjectId Disciplina pedida.
     * @returns Disciplina e turma associada.
     */
    async findSubjectForStudent(
        studentId: string,
        subjectId: string,
    ): Promise<{ subject: SubjectView; schoolClass: SchoolClassView }> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel.findById(subjectId).lean();
        if (!subject) throw this.subjectNotFound();
        const subjectView = this.toSubjectView(subject);
        if (subjectView.status === "ARCHIVED") throw this.subjectNotActive();
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            studentId,
            subjectView.classId,
        );
        return { subject: subjectView, schoolClass };
    }

    /**
     * Obtém uma disciplina para consulta histórica, incluindo disciplina ou
     * turma arquivada, sem reabrir mutações e exigindo membership atual.
     */
    async findSubjectForStudentHistory(
        studentId: string,
        subjectId: string,
    ): Promise<{ subject: SubjectView; schoolClass: SchoolClassView }> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel.findById(subjectId).lean();
        if (!subject) throw this.subjectNotFound();
        const subjectView = this.toSubjectView(subject);
        const schoolClass =
            await this.classesService.ensureStudentHistoricalEnrollment(
                studentId,
                subjectView.classId,
            );
        return { subject: subjectView, schoolClass };
    }

    /**
     * Executa a operação disciplina not found no domínio de disciplinas com contrato explícito.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private subjectNotFound(): NotFoundException {
        return new NotFoundException({
            code: "SUBJECT_NOT_FOUND",
            message: "Disciplina não encontrada.",
        });
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

    /** Executa mutações de lifecycle e outbox na mesma transação quando disponível. */
    private async runInTransaction<T>(
        operation: (session?: ClientSession) => Promise<T>,
    ): Promise<T> {
        if (!this.connection) return operation(undefined);
        return this.connection.transaction((session) => operation(session));
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
     * Constrói uma exceção de disciplinas com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private duplicatedName(): ConflictException {
        return new ConflictException({
            code: "SUBJECT_NAME_DUPLICATED",
            message: "Já existe uma disciplina com esse nome nesta turma.",
        });
    }

    private subjectNotActive(): ConflictException {
        return new ConflictException({
            code: "SUBJECT_NOT_ACTIVE",
            message: "A disciplina está arquivada e é apenas de leitura.",
        });
    }

    private emptyUpdate(): BadRequestException {
        return new BadRequestException({
            code: "SUBJECT_UPDATE_EMPTY",
            message: "Indica pelo menos um campo para atualizar.",
        });
    }

    /**
     * Mapeia o documento interno de disciplinas para uma forma pública estável e simples de consumir.
     *
     * @param subject Valor de subject usado pela função para executar to subject view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toSubjectView(subject: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        name: string;
        code: string;
        description?: string;
        status?: SubjectStatus;
        archivedAt?: Date | null;
        createdAt?: Date;
    }): SubjectView {
        return {
            _id: String(subject._id),
            classId: String(subject.classId),
            teacherId: String(subject.teacherId),
            name: subject.name,
            code: subject.code,
            description: subject.description,
            status: subject.status ?? "ACTIVE",
            archivedAt: subject.archivedAt,
            createdAt: subject.createdAt,
        };
    }

    private toStudentSubjectSummary(subject: {
        _id: unknown;
        classId: unknown;
        name: string;
        code: string;
        description?: string;
        status?: SubjectStatus;
        archivedAt?: Date | null;
        createdAt?: Date;
    }, parentArchived = false): StudentSubjectSummary {
        const view = this.toSubjectView({
            ...subject,
            teacherId: "",
        });
        const { teacherId: _teacherId, ...summary } = view;
        return {
            ...summary,
            readOnly: parentArchived || summary.status === "ARCHIVED",
        };
    }

    private activeStatusFilter(): Record<string, unknown> {
        return { status: { $ne: "ARCHIVED" } };
    }

    private statusFilter(status: SubjectStatus): Record<string, unknown> {
        return status === "ARCHIVED"
            ? { status: "ARCHIVED" }
            : this.activeStatusFilter();
    }

    private normalizedSubjectUpdate(input: UpdateSubjectDto): Record<string, string> {
        const update: Record<string, string> = {};
        if (input.name !== undefined) update.name = input.name.trim();
        if (input.code !== undefined) update.code = input.code.trim().toUpperCase();
        if (input.description !== undefined) {
            update.description = input.description.trim();
        }
        return update;
    }
}
