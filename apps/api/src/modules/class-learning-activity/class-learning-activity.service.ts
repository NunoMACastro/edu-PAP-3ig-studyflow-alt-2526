/**
 * Mantém a fonte canónica de atividade pedagógica por turma e a projeção de
 * última atividade usada no centro de acompanhamento.
 */
import { Injectable, Logger, Optional } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import {
    Types,
    type ClientSession,
    type Connection,
    type Model,
} from "mongoose";
import {
    ClassMembership,
    ClassMembershipDocument,
} from "../classes/schemas/class-membership.schema.js";
import {
    ClassLearningActivity,
    ClassLearningActivityDocument,
    ClassLearningActivityType,
} from "./schemas/class-learning-activity.schema.js";
import {
    StudentClassActivityState,
    StudentClassActivityStateDocument,
} from "./schemas/student-class-activity-state.schema.js";

/** Dados mínimos aceites para registar uma atividade de turma. */
export type RecordClassLearningActivityInput = {
    classId: string;
    studentId: string;
    subjectId?: string;
    type: ClassLearningActivityType;
    sourceEventKey: string;
    occurredAt?: Date;
};

/** Parâmetros do cálculo de inatividade, sempre delimitado a uma turma. */
export type FindInactiveClassStudentsInput = {
    classId: string;
    studentIds: string[];
    inactiveDays: number;
    now?: Date;
};

type MembershipBaseline = {
    studentId: unknown;
    joinedAt: Date;
};

type ActivityStateRecord = {
    studentId: unknown;
    lastActivityAt: Date;
};

export type StudentClassActivitySummary = {
    joinedAt: Date | null;
    firstActivityAt: Date | null;
    lastActivityAt: Date | null;
    lastActivityType: ClassLearningActivityType | null;
    activityCount: number;
    current30DaysCount: number;
    previous30DaysCount: number;
    trend: "MORE" | "STABLE" | "LESS" | "NO_BASELINE";
    byType: Partial<Record<ClassLearningActivityType, number>>;
    recent: Array<{
        id: string;
        type: ClassLearningActivityType;
        subjectId?: string;
        occurredAt: Date;
    }>;
};

/**
 * Service isolado dos fluxos de estudo privado. Apenas chamadores de contexto
 * oficial de turma devem publicar nesta fonte.
 */
@Injectable()
export class ClassLearningActivityService {
    private readonly logger = new Logger(ClassLearningActivityService.name);

    constructor(
        @InjectModel(ClassLearningActivity.name)
        private readonly activityModel: Model<ClassLearningActivityDocument>,
        @InjectModel(StudentClassActivityState.name)
        private readonly stateModel: Model<StudentClassActivityStateDocument>,
        @InjectModel(ClassMembership.name)
        private readonly membershipModel: Model<ClassMembershipDocument>,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
    ) {}

    /**
     * Persiste um evento idempotente e atualiza a projeção. Não recebe conteúdo
     * pedagógico, respostas ou mensagens para respeitar minimização de dados.
     */
    async record(input: RecordClassLearningActivityInput): Promise<boolean> {
        this.assertInput(input);
        const occurredAt = input.occurredAt ?? new Date();
        const classId = new Types.ObjectId(input.classId);
        const studentId = new Types.ObjectId(input.studentId);
        const subjectId = input.subjectId
            ? new Types.ObjectId(input.subjectId)
            : undefined;
        const sourceEventKey = input.sourceEventKey.trim();

        return this.runInTransaction(async (session) => {
            const eventWrite = await this.activityModel.updateOne(
                { sourceEventKey },
                {
                    $setOnInsert: {
                        classId,
                        studentId,
                        ...(subjectId ? { subjectId } : {}),
                        type: input.type,
                        occurredAt,
                        sourceEventKey,
                    },
                },
                { upsert: true, runValidators: true, session },
            );
            const wasInserted = eventWrite.upsertedCount === 1;

            // Evento e projeção partilham a mesma transação. Assim, uma falha
            // intermédia nunca deixa o Centro com um evento persistido sem a
            // projeção correspondente. A pipeline continua idempotente em retries.
            await this.stateModel.updateOne(
                { classId, studentId },
                [
                    {
                        $set: {
                            classId,
                            studentId,
                            firstActivityAt: {
                                $min: [
                                    { $ifNull: ["$firstActivityAt", occurredAt] },
                                    occurredAt,
                                ],
                            },
                            lastActivityType: {
                                $cond: [
                                    {
                                        $lte: [
                                            { $ifNull: ["$lastActivityAt", occurredAt] },
                                            occurredAt,
                                        ],
                                    },
                                    input.type,
                                    "$lastActivityType",
                                ],
                            },
                            lastActivityAt: {
                                $max: [
                                    { $ifNull: ["$lastActivityAt", occurredAt] },
                                    occurredAt,
                                ],
                            },
                            activityCount: {
                                $max: [
                                    1,
                                    {
                                        $add: [
                                            { $ifNull: ["$activityCount", 0] },
                                            wasInserted ? 1 : 0,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                ],
                { upsert: true, session },
            );
            return wasInserted;
        });
    }

    /**
     * Variante usada por efeitos secundários de domínio já concluídos. Uma
     * falha da projeção não invalida a tentativa, mensagem ou resposta de IA.
     */
    async recordBestEffort(
        input: RecordClassLearningActivityInput,
    ): Promise<boolean> {
        try {
            return await this.record(input);
        } catch (error) {
            this.logger.warn(
                `CLASS_LEARNING_ACTIVITY_WRITE_FAILED type=${input.type} error=${this.errorName(error)}`,
            );
            return false;
        }
    }

    /**
     * Calcula inatividade exclusivamente no par turma/aluno. A adesão oficial
     * (`joinedAt`) é o baseline: um aluno recém-inscrito não é apresentado como
     * inativo antes de decorrer o período configurado.
     */
    async findInactiveStudentIds(
        input: FindInactiveClassStudentsInput,
    ): Promise<string[]> {
        if (input.studentIds.length === 0) return [];
        if (!Types.ObjectId.isValid(input.classId)) return [];
        const validStudentIds = [...new Set(input.studentIds)].filter((id) =>
            Types.ObjectId.isValid(id),
        );
        if (validStudentIds.length === 0) return [];

        const classId = new Types.ObjectId(input.classId);
        const studentObjectIds = validStudentIds.map((id) => new Types.ObjectId(id));
        const [memberships, states] = await Promise.all([
            this.membershipModel
                .find({
                    classId,
                    studentId: { $in: studentObjectIds },
                    status: "ACTIVE",
                })
                .select("studentId joinedAt")
                .lean<MembershipBaseline[]>(),
            this.stateModel
                .find({ classId, studentId: { $in: studentObjectIds } })
                .select("studentId lastActivityAt")
                .lean<ActivityStateRecord[]>(),
        ]);
        const joinedAtByStudent = new Map(
            memberships.map((membership) => [
                String(membership.studentId),
                new Date(membership.joinedAt),
            ]),
        );
        const lastActivityByStudent = new Map(
            states.map((state) => [
                String(state.studentId),
                new Date(state.lastActivityAt),
            ]),
        );
        const now = input.now ?? new Date();
        const threshold = new Date(
            now.getTime() - input.inactiveDays * 24 * 60 * 60 * 1000,
        );

        return validStudentIds.filter((studentId) => {
            const joinedAt = joinedAtByStudent.get(studentId);
            // Evita falsos positivos durante a migração de arrays legacy. A
            // membership canónica deve existir antes de uma decisão docente.
            if (!joinedAt || Number.isNaN(joinedAt.getTime())) return false;
            const lastActivityAt = lastActivityByStudent.get(studentId);
            const baseline = lastActivityAt && lastActivityAt > joinedAt
                ? lastActivityAt
                : joinedAt;
            return baseline < threshold;
        });
    }

    /**
     * Devolve sinais factuais para um único aluno e turma, sem conteúdo das
     * respostas e sem produzir classificações de risco.
     */
    async getStudentSummary(
        classIdValue: string,
        studentIdValue: string,
        now = new Date(),
    ): Promise<StudentClassActivitySummary> {
        if (
            !Types.ObjectId.isValid(classIdValue) ||
            !Types.ObjectId.isValid(studentIdValue)
        ) {
            throw new TypeError("Class activity summary identifiers are invalid.");
        }
        const classId = new Types.ObjectId(classIdValue);
        const studentId = new Types.ObjectId(studentIdValue);
        const currentSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const previousSince = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const filter = { classId, studentId };
        const [membership, state, grouped, currentCount, previousCount, recent] =
            await Promise.all([
                this.membershipModel
                    .findOne({ ...filter, status: "ACTIVE" })
                    .select("joinedAt")
                    .lean<{ joinedAt?: Date }>(),
                this.stateModel.findOne(filter).lean<{
                    firstActivityAt: Date;
                    lastActivityAt: Date;
                    lastActivityType: ClassLearningActivityType;
                    activityCount: number;
                }>(),
                this.activityModel.aggregate<{
                    _id: ClassLearningActivityType;
                    count: number;
                }>([
                    { $match: filter },
                    { $group: { _id: "$type", count: { $sum: 1 } } },
                ]),
                this.activityModel.countDocuments({
                    ...filter,
                    occurredAt: { $gte: currentSince, $lte: now },
                }),
                this.activityModel.countDocuments({
                    ...filter,
                    occurredAt: { $gte: previousSince, $lt: currentSince },
                }),
                this.activityModel
                    .find(filter)
                    .select("type subjectId occurredAt")
                    .sort({ occurredAt: -1, _id: -1 })
                    .limit(20)
                    .lean(),
            ]);
        const byType = grouped.reduce<StudentClassActivitySummary["byType"]>(
            (counts, item) => {
                counts[item._id] = item.count;
                return counts;
            },
            {},
        );
        const trend: StudentClassActivitySummary["trend"] =
            currentCount === 0 && previousCount === 0
                ? "NO_BASELINE"
                : currentCount > previousCount
                  ? "MORE"
                  : currentCount < previousCount
                    ? "LESS"
                    : "STABLE";
        return {
            joinedAt: membership?.joinedAt ?? null,
            firstActivityAt: state?.firstActivityAt ?? null,
            lastActivityAt: state?.lastActivityAt ?? null,
            lastActivityType: state?.lastActivityType ?? null,
            activityCount: state?.activityCount ?? 0,
            current30DaysCount: currentCount,
            previous30DaysCount: previousCount,
            trend,
            byType,
            recent: recent.map((activity) => ({
                id: String(activity._id),
                type: activity.type,
                ...(activity.subjectId
                    ? { subjectId: String(activity.subjectId) }
                    : {}),
                occurredAt: activity.occurredAt,
            })),
        };
    }

    /** Valida apenas identificadores e a chave técnica; nunca conteúdo. */
    private assertInput(input: RecordClassLearningActivityInput): void {
        if (
            !Types.ObjectId.isValid(input.classId) ||
            !Types.ObjectId.isValid(input.studentId) ||
            (input.subjectId !== undefined &&
                !Types.ObjectId.isValid(input.subjectId))
        ) {
            throw new TypeError("Class learning activity identifiers are invalid.");
        }
        const sourceEventKey = input.sourceEventKey.trim();
        if (!sourceEventKey || sourceEventKey.length > 240) {
            throw new TypeError("Class learning activity source key is invalid.");
        }
    }

    /** Mantém o evento canónico e a sua projeção na mesma unidade de commit. */
    private async runInTransaction<T>(
        operation: (session?: ClientSession) => Promise<T>,
    ): Promise<T> {
        if (!this.connection) return operation(undefined);
        return this.connection.transaction((session) => operation(session));
    }

    /** Extrai apenas o nome do erro para não escrever dados do domínio em logs. */
    private errorName(error: unknown): string {
        return error instanceof Error ? error.name : "UnknownError";
    }
}
