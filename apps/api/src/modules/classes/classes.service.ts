/**
 * Implementa as regras de negócio de classes e concentra validações do domínio.
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
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { NotificationOutboxPublisher } from "../context-notifications/notification-outbox-publisher.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomDocument,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    OfficialTest,
    OfficialTestDocument,
} from "../official-tests/schemas/official-test.schema.js";
import { AddClassStudentDto } from "./dto/add-class-student.dto.js";
import { CreateClassDto } from "./dto/create-class.dto.js";
import { UpdateClassDto } from "./dto/update-class.dto.js";
import { UpdateClassStatusDto } from "./dto/update-class-status.dto.js";
import {
    ClassMembership,
    ClassMembershipDocument,
} from "./schemas/class-membership.schema.js";
import {
    SchoolClass,
    SchoolClassDocument,
    SchoolClassStatus,
} from "./schemas/school-class.schema.js";

/**
 * Vista pública de turmas, sem detalhes internos de Mongoose.
 */
export type SchoolClassStudentView = {
    id: string;
    email: string;
};

type SchoolClassRecord = {
    _id: unknown;
    teacherId: unknown;
    name: string;
    code: string;
    schoolYear: string;
    studentIds: unknown[];
    status?: SchoolClassStatus;
    archivedAt?: Date | null;
    createdAt?: Date;
};

type ClassMembershipRecord = {
    classId: unknown;
    studentId: unknown;
    status: "ACTIVE" | "REMOVED";
};

/**
 * Vista pública de turmas, sem detalhes internos de Mongoose.
 */
export type SchoolClassView = {
    _id: string;
    teacherId: string;
    name: string;
    code: string;
    schoolYear: string;
    studentIds: string[];
    students?: SchoolClassStudentView[];
    status?: SchoolClassStatus;
    archivedAt?: Date | null;
    createdAt?: Date;
};

/** Contrato mínimo enviado ao aluno, sem professor nem colegas. */
export type StudentClassSummary = {
    _id: string;
    name: string;
    code: string;
    schoolYear: string;
    status: SchoolClassStatus;
    archivedAt?: Date | null;
    joinedAt?: Date;
    createdAt?: Date;
};

/**
 * Serviço de turmas oficiais.
 */
@Injectable()
export class ClassesService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param classModel Modelo Mongoose injetado para ler e persistir turmas.
     * @param userModel Modelo Mongoose injetado para ler e persistir turmas.
     * @param membershipModel Fonte de verdade das inscrições oficiais.
     */
    constructor(
        @InjectModel(SchoolClass.name)
        private readonly classModel: Model<SchoolClassDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(ClassMembership.name)
        private readonly membershipModel: Model<ClassMembershipDocument>,
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
     * Cria turmas depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createClass(
        actor: AuthenticatedUser,
        input: CreateClassDto,
    ): Promise<SchoolClassView> {
        this.assertTeacher(actor);
        try {
            const schoolClass = await this.classModel.create({
                teacherId: new Types.ObjectId(actor.id),
                name: input.name.trim(),
                code: input.code.trim().toUpperCase(),
                schoolYear: input.schoolYear.trim(),
                studentIds: [],
                status: "ACTIVE",
            });
            return this.toClassView(schoolClass.toObject());
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.duplicatedCode();
            }
            throw error;
        }
    }

    /**
     * Lista turmas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @returns Coleção de turmas visível para o contexto autorizado.
     */
    async listTeacherClasses(actor: AuthenticatedUser): Promise<SchoolClassView[]> {
        this.assertTeacher(actor);
        const classes = await this.classModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return this.toTeacherClassViews(classes);
    }

    /** Atualiza os dados identificativos de uma turma ativa. */
    async updateClass(
        actor: AuthenticatedUser,
        classId: string,
        input: UpdateClassDto,
    ): Promise<SchoolClassView> {
        this.assertTeacher(actor);
        await this.findOwnedActiveClass(actor.id, classId);
        const update = this.normalizedClassUpdate(input);
        if (Object.keys(update).length === 0) throw this.emptyUpdate();

        try {
            const updated = await this.classModel
                .findOneAndUpdate(
                    {
                        _id: classId,
                        teacherId: new Types.ObjectId(actor.id),
                        ...this.activeStatusFilter(),
                    },
                    { $set: update },
                    { new: true, runValidators: true },
                )
                .lean();
            if (!updated) throw this.classNotFound();
            const [view] = await this.toTeacherClassViews([updated]);
            return view;
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) throw this.duplicatedCode();
            throw error;
        }
    }

    /** Arquiva ou restaura uma turma sem eliminar o respetivo histórico. */
    async updateClassStatus(
        actor: AuthenticatedUser,
        classId: string,
        input: UpdateClassStatusDto,
    ): Promise<SchoolClassView> {
        this.assertTeacher(actor);
        const current = await this.findOwnedClass(actor.id, classId);
        const currentStatus = current.status ?? "ACTIVE";
        if (currentStatus === input.status) return current;
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
            const changed = await this.classModel
                .findOneAndUpdate(
                    {
                        _id: classId,
                        teacherId: new Types.ObjectId(actor.id),
                        ...(currentStatus === "ARCHIVED"
                            ? { status: "ARCHIVED" }
                            : this.activeStatusFilter()),
                    },
                    lifecycleUpdate,
                    { new: true, runValidators: true, session },
                )
                .lean();
            if (!changed) return null;

            if (input.status === "ARCHIVED") {
                // O driver MongoDB não suporta operações paralelas na mesma
                // sessão transacional. A ordem também torna explícito que a
                // turma só é confirmada como arquivada depois de fechar todas
                // as dependências pedagógicas.
                await this.guidedRoomModel?.updateMany(
                    { classId: new Types.ObjectId(classId), status: "OPEN" },
                    {
                        $set: {
                            status: "CLOSED",
                            closedAt: now,
                            closedReason: "CLASS_ARCHIVED",
                        },
                    },
                    { session },
                );
                await this.officialTestModel?.updateMany(
                    { classId: new Types.ObjectId(classId), status: "PUBLISHED" },
                    {
                        $set: {
                            status: "CLOSED",
                            closedAt: now,
                            closedReason: "CLASS_ARCHIVED",
                        },
                    },
                    { session },
                );
            }

            await this.outboxPublisher?.publishClassEvent(
                {
                    actorId: actor.id,
                    classId,
                    recipientIds: current.studentIds,
                    idempotencyKey: `class:${classId}:${input.status.toLowerCase()}:${now.toISOString()}`,
                    type: input.status === "ARCHIVED" ? "CLASS_ARCHIVED" : "CLASS_RESTORED",
                    title:
                        input.status === "ARCHIVED"
                            ? `Turma arquivada: ${current.name}`
                            : `Turma restaurada: ${current.name}`,
                    body:
                        input.status === "ARCHIVED"
                            ? "A turma passou para o histórico. As salas guiadas e os mini-testes ativos foram encerrados."
                            : "A turma voltou a estar ativa. Os recursos anteriormente encerrados permanecem no histórico.",
                    targetPath: input.status === "ARCHIVED"
                        ? "/app/estudar?vista=escola&estado=arquivo"
                        : `/app/turmas/${classId}/disciplinas`,
                    preferenceContext: NotificationContext.CLASS_UPDATES,
                },
                session,
            );
            return changed;
        });
        if (!updated) throw this.classNotFound();
        const [view] = await this.toTeacherClassViews([updated]);
        return view;
    }

    /**
     * Executa a operação add student no domínio de turmas com contrato explícito.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async addStudent(
        actor: AuthenticatedUser,
        classId: string,
        input: AddClassStudentDto,
    ): Promise<SchoolClassView> {
        this.assertTeacher(actor);
        const schoolClass = await this.findOwnedActiveClass(actor.id, classId);

        const student = await this.userModel
            .findOne({ email: input.email.trim().toLowerCase(), role: "STUDENT" })
            .lean();
        if (!student) {
            throw new NotFoundException({
                code: "CLASS_STUDENT_NOT_FOUND",
                message: "Aluno não encontrado.",
            });
        }

        const membershipFilter = {
            classId: new Types.ObjectId(classId),
            studentId: student._id,
        };
        const joinedAt = new Date();
        const updated = await this.runInTransaction(async (session) => {
            const membershipQuery = this.membershipModel.findOne(membershipFilter);
            if (session) membershipQuery.session(session);
            const existingMembership = await membershipQuery.lean();
            const membershipChanged = existingMembership?.status !== "ACTIVE";
            if (membershipChanged) {
                await this.membershipModel.findOneAndUpdate(
                    membershipFilter,
                    {
                        $set: {
                            status: "ACTIVE",
                            joinedAt,
                            joinedBy: new Types.ObjectId(actor.id),
                            joinedAtEstimated: false,
                        },
                        $unset: { removedAt: "", removedBy: "" },
                    },
                    { upsert: true, new: true, runValidators: true, session },
                );
            }

            const changedClass = await this.classModel
                .findOneAndUpdate(
                    {
                        _id: classId,
                        teacherId: new Types.ObjectId(actor.id),
                        ...this.activeStatusFilter(),
                    },
                    { $addToSet: { studentIds: student._id } },
                    { new: true, runValidators: true, session },
                )
                .lean();
            if (!changedClass) return null;
            if (membershipChanged) {
                await this.outboxPublisher?.publishClassEvent(
                    {
                        actorId: actor.id,
                        classId,
                        recipientIds: [String(student._id)],
                        idempotencyKey: `class-membership:${classId}:${String(student._id)}:${joinedAt.toISOString()}`,
                        type: "CLASS_MEMBERSHIP_ADDED",
                        title: `Inscrição na turma ${schoolClass.name}`,
                        body: "Foste inscrito numa turma oficial. Já podes consultar as disciplinas e os conteúdos disponíveis.",
                        targetPath: "/app/turmas",
                        preferenceContext: NotificationContext.CLASS_UPDATES,
                    },
                    session,
                );
            }
            return changedClass;
        });

        if (!updated) throw this.classNotFound();
        const [updatedView] = await this.toTeacherClassViews([updated]);
        return updatedView;
    }

    /**
     * Desassocia um aluno de uma turma pertencente ao professor autenticado.
     *
     * @param actor Utilizador autenticado usado para validar role e ownership da turma.
     * @param classId Turma onde a associação deve existir.
     * @param studentId Aluno a remover da lista de inscritos.
     * @returns Turma atualizada, mantendo o contrato público de listagem docente.
     */
    async removeStudent(
        actor: AuthenticatedUser,
        classId: string,
        studentId: string,
    ): Promise<SchoolClassView> {
        this.assertTeacher(actor);
        const schoolClass = await this.findOwnedActiveClass(actor.id, classId);

        if (!Types.ObjectId.isValid(studentId)) {
            throw this.studentNotFound();
        }

        const membership = await this.membershipModel
            .findOne({
                classId: new Types.ObjectId(classId),
                studentId: new Types.ObjectId(studentId),
            })
            .lean();
        const isActiveMember = membership
            ? membership.status === "ACTIVE"
            : schoolClass.studentIds.includes(studentId);
        if (!isActiveMember) throw this.studentNotFound();

        const removedAt = new Date();
        const updated = await this.runInTransaction(async (session) => {
            await this.membershipModel.findOneAndUpdate(
                {
                    classId: new Types.ObjectId(classId),
                    studentId: new Types.ObjectId(studentId),
                },
                {
                    $set: {
                        status: "REMOVED",
                        removedAt,
                        removedBy: new Types.ObjectId(actor.id),
                    },
                    $setOnInsert: {
                        joinedAt: removedAt,
                        joinedBy: new Types.ObjectId(actor.id),
                        joinedAtEstimated: true,
                    },
                },
                { upsert: true, new: true, runValidators: true, session },
            );

            const changedClass = await this.classModel
                .findOneAndUpdate(
                    {
                        _id: classId,
                        teacherId: new Types.ObjectId(actor.id),
                        ...this.activeStatusFilter(),
                    },
                    { $pull: { studentIds: new Types.ObjectId(studentId) } },
                    { new: true, runValidators: true, session },
                )
                .lean();
            if (!changedClass) return null;

            await this.outboxPublisher?.publishClassEvent(
                {
                    actorId: actor.id,
                    classId,
                    recipientIds: [studentId],
                    idempotencyKey: `class-membership:${classId}:${studentId}:removed:${removedAt.toISOString()}`,
                    type: "CLASS_MEMBERSHIP_REMOVED",
                    title: `Inscrição terminada: ${schoolClass.name}`,
                    body: "A tua inscrição nesta turma terminou. O acesso aos respetivos recursos oficiais foi removido.",
                    targetPath: "/app/turmas",
                    preferenceContext: NotificationContext.CLASS_UPDATES,
                },
                session,
            );
            return changedClass;
        });

        if (!updated) throw this.studentNotFound();
        const [updatedView] = await this.toTeacherClassViews([updated]);
        return updatedView;
    }

    /**
     * Lista turmas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @returns Coleção de turmas visível para o contexto autorizado.
     */
    async listStudentClasses(
        actor: AuthenticatedUser,
        status: SchoolClassStatus = "ACTIVE",
    ): Promise<StudentClassSummary[]> {
        this.assertStudent(actor);
        return this.listStudentClassesById(actor.id, status);
    }

    /**
     * Lista as turmas oficiais de um aluno já autenticado por outro service.
     * Evita fabricar identidades de sessão dentro de integrações internas.
     */
    async listStudentClassesById(
        studentId: string,
        status: SchoolClassStatus = "ACTIVE",
    ): Promise<StudentClassSummary[]> {
        const memberships = await this.membershipModel
            .find({ studentId: new Types.ObjectId(studentId) })
            .lean();
        const activeMemberships = memberships.filter(
            (membership) => membership.status === "ACTIVE",
        );
        const membershipClassIds = memberships.map((membership) => membership.classId);
        const activeClassIds = activeMemberships.map(
            (membership) => membership.classId,
        );
        const classes = await this.classModel
            .find({
                ...this.statusFilter(status),
                $or: [
                    { _id: { $in: activeClassIds } },
                    {
                        _id: { $nin: membershipClassIds },
                        studentIds: new Types.ObjectId(studentId),
                    },
                ],
            })
            .sort({ createdAt: -1 })
            .lean();
        const joinedAtByClassId = new Map(
            activeMemberships.map((membership) => [
                String(membership.classId),
                membership.joinedAt,
            ]),
        );
        return classes.map((schoolClass) => {
            const record = schoolClass as unknown as SchoolClassRecord;
            return {
                _id: String(record._id),
                name: record.name,
                code: record.code,
                schoolYear: record.schoolYear,
                status: record.status ?? "ACTIVE",
                archivedAt: record.archivedAt,
                joinedAt: joinedAtByClassId.get(String(record._id)),
                createdAt: record.createdAt,
            };
        });
    }

    /**
     * Obtém turma pertencente ao professor.
     *
     * @param teacherId Professor autenticado.
     * @param classId Turma a validar.
     * @returns Turma pública.
     */
    async findOwnedClass(
        teacherId: string,
        classId: string,
    ): Promise<SchoolClassView> {
        if (!Types.ObjectId.isValid(classId)) throw this.classNotFound();
        const schoolClass = await this.classModel
            .findOne({
                _id: classId,
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!schoolClass) throw this.classNotFound();
        return this.toClassView(
            schoolClass,
            [],
            await this.resolveEffectiveStudentIds(schoolClass),
        );
    }

    /** Obtém uma turma própria apenas enquanto aceitar mutações. */
    async findOwnedActiveClass(
        teacherId: string,
        classId: string,
    ): Promise<SchoolClassView> {
        const schoolClass = await this.findOwnedClass(teacherId, classId);
        if (schoolClass.status === "ARCHIVED") {
            throw new ConflictException({
                code: "CLASS_NOT_ACTIVE",
                message: "A turma está arquivada e é apenas de leitura.",
            });
        }
        return schoolClass;
    }

    /**
     * Reserva uma mutação descendente apenas enquanto a turma continua ativa.
     *
     * A atualização do contador tem de usar a mesma sessão da escrita do
     * recurso filho. Assim, um archive concorrente escreve o mesmo documento:
     * o MongoDB força retry/abort e a nova tentativa já observa `ARCHIVED`.
     * Os chamadores fazem primeiro a validação de ownership para preservar o
     * contrato `NOT_FOUND`; uma ausência neste ponto representa uma mudança de
     * lifecycle concorrente e é devolvida como conflito estável.
     */
    async reserveActiveChildMutation(
        teacherId: string,
        classId: string,
        session?: ClientSession,
    ): Promise<void> {
        if (!Types.ObjectId.isValid(classId)) throw this.classNotFound();
        const result = await this.classModel.updateOne(
            {
                _id: new Types.ObjectId(classId),
                teacherId: new Types.ObjectId(teacherId),
                ...this.activeStatusFilter(),
            },
            { $inc: { lifecycleFenceVersion: 1 } },
            session ? { session } : undefined,
        );
        if (result.matchedCount !== 1) throw this.classNotActive();
    }

    /**
     * Confirma que um aluno pertence a uma turma do professor sem expor recursos externos.
     *
     * @param teacherId Professor autenticado.
     * @param classId Turma que deve pertencer ao professor.
     * @param studentId Aluno que deve estar inscrito na turma.
     * @returns Turma autorizada que contém o aluno.
     */
    async ensureOwnedClassStudent(
        teacherId: string,
        classId: string,
        studentId: string,
    ): Promise<SchoolClassView> {
        const schoolClass = await this.findOwnedClass(teacherId, classId);
        if (!Types.ObjectId.isValid(studentId)) {
            throw this.studentNotFound();
        }
        const membership = await this.membershipModel
            .findOne({
                classId: new Types.ObjectId(classId),
                studentId: new Types.ObjectId(studentId),
            })
            .lean();
        const isEnrolled = membership
            ? membership.status === "ACTIVE"
            : schoolClass.studentIds.includes(studentId);
        if (!isEnrolled) throw this.studentNotFound();
        return schoolClass;
    }

    /**
     * Lista a identidade pública mínima dos alunos de uma turma do professor.
     *
     * @param teacherId Professor autenticado e proprietário da turma.
     * @param classId Turma cujo público deve ser apresentado.
     * @returns Alunos atuais limitados a identificador e email.
     */
    async listOwnedClassStudents(
        teacherId: string,
        classId: string,
    ): Promise<SchoolClassStudentView[]> {
        return this.listOwnedClassStudentsIncluding(teacherId, classId, []);
    }

    /**
     * Resolve identidades atuais e históricas explicitamente relacionadas com
     * um recurso da turma, depois de validar ownership docente.
     */
    async listOwnedClassStudentsIncluding(
        teacherId: string,
        classId: string,
        historicalStudentIds: string[],
    ): Promise<SchoolClassStudentView[]> {
        const schoolClass = await this.findOwnedClass(teacherId, classId);
        const memberships = await this.membershipModel
            .find({ classId: new Types.ObjectId(classId) })
            .lean();
        const membershipStudentIds = memberships
            .filter((membership) => membership.status === "ACTIVE")
            .map((membership) => String(membership.studentId));
        const studentsWithMembership = new Set(
            memberships.map((membership) => String(membership.studentId)),
        );
        const currentStudentIds = [
            ...membershipStudentIds,
            ...schoolClass.studentIds.filter(
                (studentId) => !studentsWithMembership.has(String(studentId)),
            ),
        ];
        const studentIds = [
            ...new Set([
                ...currentStudentIds,
                ...historicalStudentIds.filter((id) => Types.ObjectId.isValid(id)),
            ]),
        ];
        if (studentIds.length === 0) return [];
        const students = await this.userModel
            .find({
                _id: {
                    $in: studentIds.map((id) => new Types.ObjectId(id)),
                },
                role: "STUDENT",
            })
            .select({ email: 1 })
            .lean();
        return students.map((student) => ({
            id: String(student._id),
            email: student.email,
        }));
    }

    /**
     * Confirma inscrição do aluno numa turma.
     *
     * @param studentId Aluno autenticado.
     * @param classId Turma a validar.
     * @returns Turma pública.
     */
    async ensureStudentEnrollment(
        studentId: string,
        classId: string,
        options: { allowArchived?: boolean } = {},
    ): Promise<SchoolClassView> {
        if (!Types.ObjectId.isValid(classId)) throw this.classNotFound();
        const membership = await this.membershipModel
            .findOne({
                classId: new Types.ObjectId(classId),
                studentId: new Types.ObjectId(studentId),
            })
            .lean();
        if (membership?.status === "REMOVED") throw this.enrollmentRequired();
        const schoolClass = await this.classModel
            .findOne({
                _id: classId,
                ...(!options.allowArchived ? this.activeStatusFilter() : {}),
                ...(membership?.status === "ACTIVE"
                    ? {}
                    : { studentIds: new Types.ObjectId(studentId) }),
            })
            .lean();
        if (!schoolClass) throw this.enrollmentRequired();
        return this.toClassView(schoolClass);
    }

    /** Confirma membership para consultar histórico, incluindo turma arquivada. */
    async ensureStudentHistoricalEnrollment(
        studentId: string,
        classId: string,
    ): Promise<SchoolClassView> {
        return this.ensureStudentEnrollment(studentId, classId, {
            allowArchived: true,
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

    /** Executa uma mutação multi-documento com transação quando a ligação está injetada. */
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
     * Executa a operação turma not found no domínio de turmas com contrato explícito.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private classNotFound(): NotFoundException {
        return new NotFoundException({
            code: "CLASS_NOT_FOUND",
            message: "Turma não encontrada.",
        });
    }

    /**
     * Constrói a exceção usada quando a turma não contém o aluno pedido.
     *
     * @returns Exceção estável para a API e para mensagens da UI.
     */
    private studentNotFound(): NotFoundException {
        return new NotFoundException({
            code: "CLASS_STUDENT_NOT_FOUND",
            message: "Aluno não encontrado nesta turma.",
        });
    }

    /**
     * Constrói uma exceção de turmas com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private duplicatedCode(): ConflictException {
        return new ConflictException({
            code: "CLASS_CODE_DUPLICATED",
            message: "Já tens uma turma com esse código.",
        });
    }

    private enrollmentRequired(): ForbiddenException {
        return new ForbiddenException({
            code: "CLASS_ENROLLMENT_REQUIRED",
            message: "Não estás inscrito nesta turma.",
        });
    }

    private classNotActive(): ConflictException {
        return new ConflictException({
            code: "CLASS_NOT_ACTIVE",
            message: "A turma está arquivada e é apenas de leitura.",
        });
    }

    private emptyUpdate(): BadRequestException {
        return new BadRequestException({
            code: "CLASS_UPDATE_EMPTY",
            message: "Indica pelo menos um campo para atualizar.",
        });
    }

    /**
     * Enriquece turmas do professor com resumos públicos dos alunos inscritos.
     *
     * @param classes Turmas já filtradas por ownership docente.
     * @returns Turmas com `studentIds` preservado e `students` limitado a id/email.
     */
    private async toTeacherClassViews(
        classes: SchoolClassRecord[],
    ): Promise<SchoolClassView[]> {
        const classIds = classes.map((schoolClass) => schoolClass._id);
        const memberships = classIds.length > 0
            ? await this.membershipModel
                .find({ classId: { $in: classIds } })
                .lean()
            : [];
        const membershipsByClass = new Map<string, ClassMembershipRecord[]>();
        for (const membership of memberships) {
            const key = String(membership.classId);
            const current = membershipsByClass.get(key) ?? [];
            current.push(membership as ClassMembershipRecord);
            membershipsByClass.set(key, current);
        }
        const effectiveStudentIdsByClass = new Map<string, string[]>();
        for (const schoolClass of classes) {
            const classMemberships = membershipsByClass.get(String(schoolClass._id));
            const studentsWithMembership = new Set(
                (classMemberships ?? []).map((membership) =>
                    String(membership.studentId),
                ),
            );
            effectiveStudentIdsByClass.set(
                String(schoolClass._id),
                classMemberships
                    ? [
                        ...classMemberships
                        .filter((membership) => membership.status === "ACTIVE")
                        .map((membership) => String(membership.studentId)),
                        ...schoolClass.studentIds
                            .map((studentId) => String(studentId))
                            .filter(
                                (studentId) =>
                                    !studentsWithMembership.has(studentId),
                            ),
                    ]
                    : schoolClass.studentIds.map((studentId) => String(studentId)),
            );
        }
        const studentIds = [
            ...new Set(
                classes.flatMap((schoolClass) =>
                    effectiveStudentIdsByClass.get(String(schoolClass._id)) ?? [],
                ),
            ),
        ];

        if (studentIds.length === 0) {
            return classes.map((schoolClass) =>
                this.toClassView(schoolClass, [], []),
            );
        }

        const students = await this.userModel
            .find({
                _id: { $in: studentIds.map((studentId) => new Types.ObjectId(studentId)) },
                role: "STUDENT",
            })
            .select({ email: 1 })
            .lean();

        const studentsById = new Map(
            students.map((student) => [
                String(student._id),
                { id: String(student._id), email: student.email },
            ]),
        );

        return classes.map((schoolClass) => {
            const effectiveStudentIds =
                effectiveStudentIdsByClass.get(String(schoolClass._id)) ?? [];
            const publicStudents = effectiveStudentIds
                .map((studentId) => studentsById.get(String(studentId)))
                .filter((student): student is SchoolClassStudentView => Boolean(student));

            return this.toClassView(schoolClass, publicStudents, effectiveStudentIds);
        });
    }

    /**
     * Mapeia o documento interno de turmas para uma forma pública estável e simples de consumir.
     *
     * @param schoolClass Valor de schoolClass usado pela função para executar to class view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toClassView(
        schoolClass: SchoolClassRecord,
        students: SchoolClassStudentView[] = [],
        effectiveStudentIds?: string[],
    ): SchoolClassView {
        return {
            _id: String(schoolClass._id),
            teacherId: String(schoolClass.teacherId),
            name: schoolClass.name,
            code: schoolClass.code,
            schoolYear: schoolClass.schoolYear,
            studentIds: effectiveStudentIds ??
                schoolClass.studentIds.map((studentId) => String(studentId)),
            students,
            status: schoolClass.status ?? "ACTIVE",
            archivedAt: schoolClass.archivedAt,
            createdAt: schoolClass.createdAt,
        };
    }

    private activeStatusFilter(): Record<string, unknown> {
        return { status: { $ne: "ARCHIVED" } };
    }

    private statusFilter(status: SchoolClassStatus): Record<string, unknown> {
        return status === "ARCHIVED"
            ? { status: "ARCHIVED" }
            : this.activeStatusFilter();
    }

    private normalizedClassUpdate(input: UpdateClassDto): Record<string, string> {
        const update: Record<string, string> = {};
        if (input.name !== undefined) update.name = input.name.trim();
        if (input.code !== undefined) update.code = input.code.trim().toUpperCase();
        if (input.schoolYear !== undefined) {
            update.schoolYear = input.schoolYear.trim();
        }
        return update;
    }

    /**
     * Resolve uma turma parcialmente migrada: uma membership explícita ganha
     * sempre ao array legacy, enquanto alunos ainda sem registo continuam
     * acessíveis até o backfill terminar.
     */
    private async resolveEffectiveStudentIds(
        schoolClass: SchoolClassRecord,
    ): Promise<string[]> {
        const memberships = await this.membershipModel
            .find({ classId: schoolClass._id })
            .lean();
        const studentsWithMembership = new Set(
            memberships.map((membership) => String(membership.studentId)),
        );
        return [
            ...memberships
                .filter((membership) => membership.status === "ACTIVE")
                .map((membership) => String(membership.studentId)),
            ...schoolClass.studentIds
                .map((studentId) => String(studentId))
                .filter((studentId) => !studentsWithMembership.has(studentId)),
        ];
    }
}
