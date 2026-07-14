/**
 * Regras de negócio das salas guiadas, incluindo ciclo de vida e participação.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Types, type ClientSession, type Connection, type Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { isMongoDuplicateKeyError } from "../../common/utils/mongo-error.util.js";
import { ClassesService } from "../classes/classes.service.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import {
    OfficialMaterialView,
    OfficialMaterialsService,
    StudentOfficialMaterialView,
} from "../official-materials/official-materials.service.js";
import {
    OfficialTestsService,
    OfficialTestView,
} from "../official-tests/official-tests.service.js";
import { HistoryService } from "../study/history.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { ChangeGuidedStudyRoomStatusDto } from "./dto/change-guided-study-room-status.dto.js";
import { CreateGuidedStudyRoomDto } from "./dto/create-guided-study-room.dto.js";
import { UpdateGuidedStudyRoomDto } from "./dto/update-guided-study-room.dto.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationDocument,
    GuidedStudyRoomParticipationStatus,
} from "./schemas/guided-study-room-participation.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomDocument,
    GuidedStudyRoomStatus,
} from "./schemas/guided-study-room.schema.js";

export type GuidedStudyRoomView = {
    _id: string;
    classId: string;
    subjectId?: string;
    teacherId: string;
    title: string;
    description: string;
    goal?: string;
    materialIds: string[];
    officialTestId?: string;
    startsAt?: Date;
    durationMinutes?: number;
    aiEnabled: boolean;
    status: GuidedStudyRoomStatus;
    closedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

export type StudentGuidedStudyRoomView = Omit<GuidedStudyRoomView, "teacherId">;

type GuidedStudyRoomDetailFields = {
    materials: Array<OfficialMaterialView | StudentOfficialMaterialView>;
    invalidMaterialIds: string[];
    officialTest?: Pick<OfficialTestView, "_id" | "subjectId" | "title" | "status">;
    aiAvailable: boolean;
    assistantAvailability: {
        canAsk: boolean;
        reason?: "ROOM_CLOSED" | "AI_DISABLED" | "NO_PROCESSABLE_SOURCES";
    };
    myParticipation?: GuidedStudyRoomParticipationView | null;
};

export type GuidedStudyRoomDetailView =
    GuidedStudyRoomView & GuidedStudyRoomDetailFields;
export type StudentGuidedStudyRoomDetailView =
    StudentGuidedStudyRoomView & GuidedStudyRoomDetailFields;

export type GuidedStudyRoomParticipationView = {
    id: string;
    roomId: string;
    classId: string;
    studentId: string;
    status: GuidedStudyRoomParticipationStatus;
    firstViewedAt: Date;
    lastViewedAt: Date;
    completedAt?: Date;
};

export type GuidedStudyRoomStudentListItem = StudentGuidedStudyRoomView & {
    className: string;
    subjectName?: string;
    myParticipation: GuidedStudyRoomParticipationView | null;
};

export type GuidedStudyRoomStatusCounts = { open: number; closed: number };
export type GuidedStudyRoomCountSummary = GuidedStudyRoomStatusCounts & {
    bySubjectId: Record<string, GuidedStudyRoomStatusCounts>;
};

export type GuidedStudyRoomProgressView = {
    totalStudents: number;
    notViewed: number;
    viewed: number;
    completed: number;
    completionPercent: number;
    students: Array<{
        studentId: string;
        email: string;
        status: "NOT_VIEWED" | GuidedStudyRoomParticipationStatus;
        firstViewedAt?: Date;
        lastViewedAt?: Date;
        completedAt?: Date;
    }>;
};

type RoomRecord = {
    _id: unknown;
    classId: unknown;
    subjectId?: unknown;
    teacherId: unknown;
    title: string;
    description: string;
    goal?: string;
    materialIds?: string[];
    officialTestId?: unknown;
    startsAt?: Date;
    durationMinutes?: number;
    aiEnabled?: boolean;
    status: GuidedStudyRoomStatus;
    closedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

type GuidedStudyRoomReferenceInput = {
    subjectId?: string | null;
    materialIds?: string[];
    officialTestId?: string | null;
    aiEnabled?: boolean;
};

@Injectable()
export class GuidedStudyRoomsService {
    constructor(
        @InjectModel(GuidedStudyRoom.name)
        private readonly roomModel: Model<GuidedStudyRoomDocument>,
        @InjectModel(GuidedStudyRoomParticipation.name)
        private readonly participationModel: Model<GuidedStudyRoomParticipationDocument>,
        private readonly classesService: ClassesService,
        private readonly subjectsService: SubjectsService,
        private readonly materialsService: OfficialMaterialsService,
        private readonly testsService: OfficialTestsService,
        private readonly historyService: HistoryService,
        private readonly notificationsService: ContextNotificationsService,
        @Optional()
        private readonly classLearningActivityService?: ClassLearningActivityService,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
    ) {}

    /** Cria uma sala aberta, validada e imediatamente visível. */
    async create(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateGuidedStudyRoomDto,
    ): Promise<GuidedStudyRoomView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedActiveClass(actor.id, classId);
        const validated = await this.validateReferences(actor.id, schoolClass._id, input);
        const roomInput = {
            classId: new Types.ObjectId(schoolClass._id),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            description: input.description.trim(),
            goal: input.goal?.trim() || undefined,
            materialIds: validated.materialIds,
            ...(validated.subjectId ? { subjectId: new Types.ObjectId(validated.subjectId) } : {}),
            ...(validated.officialTestId
                ? { officialTestId: new Types.ObjectId(validated.officialTestId) }
                : {}),
            ...(input.startsAt ? { startsAt: new Date(input.startsAt) } : {}),
            durationMinutes: input.durationMinutes,
            aiEnabled: Boolean(input.aiEnabled),
            status: "OPEN",
        };
        const createAndNotify = async (session?: ClientSession) => {
            if (validated.subjectId) {
                await this.subjectsService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    validated.subjectId,
                    session,
                );
            } else {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    schoolClass._id,
                    session,
                );
            }
            if (validated.officialTestId && session) {
                await this.testsService.reserveGuidedRoomDependency(
                    actor.id,
                    schoolClass._id,
                    validated.officialTestId,
                    session,
                );
            }
            const room = session
                ? (await this.roomModel.create([roomInput], { session }))[0]
                : await this.roomModel.create(roomInput);
            const view = this.toView(room.toObject());
            await this.notificationsService.enqueueClassEvent(actor, {
                classId: schoolClass._id,
                idempotencyKey: `guided-room:${view._id}:opened`,
                type: "GUIDED_ROOM_OPENED",
                title: `Sala guiada: ${view.title}`,
                body: view.startsAt
                    ? `Está disponível uma nova sala guiada. Início previsto: ${view.startsAt.toISOString()}.`
                    : "Está disponível uma nova sala guiada.",
                targetPath: `/app/turmas/${schoolClass._id}/salas-guiadas/${view._id}`,
            }, session);
            return view;
        };
        return this.connection
            ? this.connection.transaction((session) => createAndNotify(session))
            : createAndNotify(undefined);
    }

    /** Lista todas as salas da turma do professor. */
    async listForTeacher(actor: AuthenticatedUser, classId: string): Promise<GuidedStudyRoomView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const rooms = await this.roomModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ createdAt: -1 })
            .lean();
        return rooms.map((room) => this.toView(room));
    }

    /** Lista salas abertas ou histórico fechado de um aluno inscrito. */
    async listForStudent(
        actor: AuthenticatedUser,
        classId: string,
        status: GuidedStudyRoomStatus = "OPEN",
        cursor?: string,
        requestedLimit = 20,
    ): Promise<{
        items: GuidedStudyRoomStudentListItem[];
        nextCursor: string | null;
    }> {
        this.assertStudent(actor);
        if (status !== "OPEN" && status !== "CLOSED") throw this.invalidStatus();
        const schoolClass = status === "CLOSED"
            ? await this.classesService.ensureStudentHistoricalEnrollment(actor.id, classId)
            : await this.classesService.ensureStudentEnrollment(actor.id, classId);
        if (cursor && !Types.ObjectId.isValid(cursor)) {
            throw this.invalidCursor();
        }
        const scopedClassId = new Types.ObjectId(schoolClass._id);
        if (cursor) {
            const scopedCursorExists = await this.roomModel.exists({
                _id: new Types.ObjectId(cursor),
                classId: scopedClassId,
                status,
            });
            if (!scopedCursorExists) throw this.invalidCursor();
        }
        const limit = Math.max(1, Math.min(50, Number(requestedLimit) || 20));
        const rows = await this.roomModel
            .find({
                classId: scopedClassId,
                status,
                ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
            })
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;
        const participations = pageRows.length
            ? await this.participationModel
                  .find({
                      roomId: { $in: pageRows.map((room) => room._id) },
                      studentId: new Types.ObjectId(actor.id),
                  })
                  .lean()
            : [];
        const participationByRoom = new Map(
            participations.map((item) => [String(item.roomId), this.toParticipationView(item)]),
        );
        const subjectIds = [
            ...new Set(
                pageRows
                    .map((room) => (room.subjectId ? String(room.subjectId) : undefined))
                    .filter((id): id is string => Boolean(id)),
            ),
        ];
        const subjectEntries = await Promise.all(
            subjectIds.map(async (id) => {
                const result = await this.subjectsService
                    .findSubjectForStudentHistory(actor.id, id)
                    .catch(() => undefined);
                return result ? ([id, result.subject.name] as const) : undefined;
            }),
        );
        const subjectNameById = new Map(
            subjectEntries.filter(
                (entry): entry is readonly [string, string] => Boolean(entry),
            ),
        );
        return {
            items: pageRows.map((room) => ({
                ...this.toStudentView(room),
                className: schoolClass.name,
                subjectName: room.subjectId
                    ? subjectNameById.get(String(room.subjectId))
                    : undefined,
                myParticipation: participationByRoom.get(String(room._id)) ?? null,
            })),
            nextCursor: hasMore ? String(pageRows.at(-1)?._id) : null,
        };
    }

    /** Lista paginada de todas as salas das turmas atuais do aluno. */
    async listAllForStudent(
        actor: AuthenticatedUser,
        status: GuidedStudyRoomStatus = "OPEN",
        cursor?: string,
        requestedLimit = 20,
        classId?: string,
    ): Promise<{ items: GuidedStudyRoomStudentListItem[]; nextCursor: string | null }> {
        this.assertStudent(actor);
        if (status !== "OPEN" && status !== "CLOSED") throw this.invalidStatus();
        if (cursor && !Types.ObjectId.isValid(cursor)) {
            throw this.invalidCursor();
        }
        const activeClasses = await this.classesService.listStudentClasses(actor, "ACTIVE");
        const archivedClasses = status === "CLOSED"
            ? await this.classesService.listStudentClasses(actor, "ARCHIVED")
            : [];
        const classes = [...activeClasses, ...archivedClasses]
            .filter(
                (schoolClass, index, all) =>
                    all.findIndex((candidate) => candidate._id === schoolClass._id) === index,
            )
            .filter((schoolClass) => !classId || schoolClass._id === classId);
        if (!classes.length) return { items: [], nextCursor: null };
        const limit = Math.max(1, Math.min(50, Number(requestedLimit) || 20));
        const rows = await this.roomModel
            .find({
                classId: { $in: classes.map((schoolClass) => new Types.ObjectId(schoolClass._id)) },
                status,
                ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
            })
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;
        const participations = pageRows.length
            ? await this.participationModel
                  .find({
                      roomId: { $in: pageRows.map((room) => room._id) },
                      studentId: new Types.ObjectId(actor.id),
                  })
                  .lean()
            : [];
        const participationByRoom = new Map(
            participations.map((item) => [String(item.roomId), this.toParticipationView(item)]),
        );
        const classNameById = new Map(
            classes.map((schoolClass) => [schoolClass._id, schoolClass.name]),
        );
        const subjectIds = [
            ...new Set(
                pageRows
                    .map((room) => (room.subjectId ? String(room.subjectId) : undefined))
                    .filter((id): id is string => Boolean(id)),
            ),
        ];
        const subjectEntries = await Promise.all(
            subjectIds.map(async (id) => {
                const result = await this.subjectsService
                    .findSubjectForStudentHistory(actor.id, id)
                    .catch(() => undefined);
                return result ? ([id, result.subject.name] as const) : undefined;
            }),
        );
        const subjectNameById = new Map(
            subjectEntries.filter(
                (entry): entry is readonly [string, string] => Boolean(entry),
            ),
        );
        return {
            items: pageRows.map((room) => ({
                ...this.toStudentView(room),
                className: classNameById.get(String(room.classId)) ?? "Turma",
                subjectName: room.subjectId
                    ? subjectNameById.get(String(room.subjectId))
                    : undefined,
                myParticipation: participationByRoom.get(String(room._id)) ?? null,
            })),
            nextCursor: hasMore ? String(pageRows.at(-1)?._id) : null,
        };
    }

    /** Devolve detalhe autorizado ao professor. */
    async getForTeacher(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ): Promise<GuidedStudyRoomDetailView> {
        const room = await this.findOwnedRoom(actor, classId, roomId);
        return this.toDetail(room);
    }

    /** Devolve detalhe autorizado ao aluno, incluindo salas fechadas. */
    async getForStudent(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ): Promise<StudentGuidedStudyRoomDetailView> {
        const room = await this.ensureStudentHistoricalRoom(actor, classId, roomId);
        return this.toDetail(room, actor.id);
    }

    /** Edita apenas salas abertas e preserva invariantes depois da primeira participação. */
    async update(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
        input: UpdateGuidedStudyRoomDto,
    ): Promise<GuidedStudyRoomView> {
        const current = await this.findOwnedActiveRoom(actor, classId, roomId);
        if (current.status === "CLOSED") {
            throw new ConflictException({
                code: "GUIDED_ROOM_CLOSED_NOT_EDITABLE",
                message: "Reabre a sala antes de a editar.",
            });
        }
        const hasParticipation = Boolean(
            await this.participationModel.exists({ roomId: new Types.ObjectId(roomId) }),
        );
        const currentSubjectId = current.subjectId ? String(current.subjectId) : undefined;
        const currentTestId = current.officialTestId
            ? String(current.officialTestId)
            : undefined;
        const hasOwn = (field: keyof UpdateGuidedStudyRoomDto) =>
            Object.prototype.hasOwnProperty.call(input, field);
        const nextSubjectId = hasOwn("subjectId")
            ? input.subjectId || undefined
            : currentSubjectId;
        const nextTestId = hasOwn("officialTestId")
            ? input.officialTestId || undefined
            : currentTestId;
        const normalizedCurrentMaterials = [...new Set(current.materialIds ?? [])];
        const normalizedNextMaterials = hasOwn("materialIds")
            ? [...new Set(input.materialIds ?? [])]
            : normalizedCurrentMaterials;
        const learningContentChanged =
            nextSubjectId !== currentSubjectId ||
            nextTestId !== currentTestId ||
            (hasOwn("description") && input.description?.trim() !== current.description) ||
            (hasOwn("goal") && (input.goal?.trim() || undefined) !== current.goal) ||
            (hasOwn("aiEnabled") && Boolean(input.aiEnabled) !== Boolean(current.aiEnabled)) ||
            normalizedNextMaterials.length !== normalizedCurrentMaterials.length ||
            normalizedNextMaterials.some((id, index) => id !== normalizedCurrentMaterials[index]);
        if (hasParticipation && learningContentChanged) {
            throw new ConflictException({
                code: "GUIDED_ROOM_CONTENT_LOCKED",
                message:
                    "O conteúdo pedagógico da sala não pode ser alterado depois da primeira participação.",
            });
        }
        const validated = await this.validateReferences(
            actor.id,
            classId,
            {
                subjectId: nextSubjectId,
                materialIds: hasOwn("materialIds")
                    ? input.materialIds
                    : current.materialIds ?? [],
                officialTestId: nextTestId,
                aiEnabled: hasOwn("aiEnabled")
                    ? input.aiEnabled
                    : Boolean(current.aiEnabled),
            },
            currentTestId,
        );
        const set: Record<string, unknown> = {
            title: hasOwn("title") ? input.title!.trim() : current.title,
            description: hasOwn("description")
                ? input.description!.trim()
                : current.description,
            materialIds: validated.materialIds,
            aiEnabled: hasOwn("aiEnabled") ? input.aiEnabled : Boolean(current.aiEnabled),
        };
        const unset: Record<string, ""> = {};
        if (validated.subjectId) set.subjectId = new Types.ObjectId(validated.subjectId);
        else unset.subjectId = "";
        if (validated.officialTestId) {
            set.officialTestId = new Types.ObjectId(validated.officialTestId);
        } else {
            unset.officialTestId = "";
        }
        if (hasOwn("goal")) {
            if (input.goal?.trim()) set.goal = input.goal.trim();
            else unset.goal = "";
        } else if (current.goal) {
            set.goal = current.goal;
        }
        if (hasOwn("startsAt")) {
            if (input.startsAt) set.startsAt = new Date(input.startsAt);
            else unset.startsAt = "";
        } else if (current.startsAt) {
            set.startsAt = current.startsAt;
        }
        if (hasOwn("durationMinutes")) {
            if (input.durationMinutes !== null && input.durationMinutes !== undefined) {
                set.durationMinutes = input.durationMinutes;
            } else {
                unset.durationMinutes = "";
            }
        } else if (current.durationMinutes !== undefined) {
            set.durationMinutes = current.durationMinutes;
        }
        const officialTestChanged = validated.officialTestId !== currentTestId;
        const mutate = async (session?: ClientSession): Promise<GuidedStudyRoomView> => {
            if (validated.subjectId) {
                await this.subjectsService.reserveActiveChildMutation(
                    actor.id,
                    classId,
                    validated.subjectId,
                    session,
                );
            } else {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    classId,
                    session,
                );
            }
            // A validação anterior produz mensagens de domínio úteis; o fence
            // dentro da mesma transação é a autoridade contra o fecho
            // concorrente do teste. Ambos escrevem o documento OfficialTest,
            // pelo que só uma das transações pode confirmar.
            if (officialTestChanged && validated.officialTestId && session) {
                await this.testsService.reserveGuidedRoomDependency(
                    actor.id,
                    classId,
                    validated.officialTestId,
                    session,
                );
            }
            const updated = await this.roomModel
                .findOneAndUpdate(
                    { _id: new Types.ObjectId(roomId), status: "OPEN" },
                    {
                        $set: set,
                        ...(Object.keys(unset).length ? { $unset: unset } : {}),
                    },
                    session
                        ? { new: true, runValidators: true, session }
                        : { new: true, runValidators: true },
                )
                .lean();
            if (!updated) {
                const latest = await this.roomModel
                    .findOne(
                        {
                            _id: new Types.ObjectId(roomId),
                            classId: new Types.ObjectId(classId),
                        },
                        null,
                        session ? { session } : undefined,
                    )
                    .lean();
                if (latest?.status === "CLOSED") {
                    throw new ConflictException({
                        code: "GUIDED_ROOM_CLOSED_NOT_EDITABLE",
                        message: "A sala foi encerrada enquanto estava a ser editada.",
                    });
                }
                throw this.roomNotFound();
            }
            return this.toView(updated);
        };
        return this.connection
            ? this.connection.transaction((session) => mutate(session))
            : mutate(undefined);
    }

    /** Fecha ou reabre com uma transição idempotente. */
    async changeStatus(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
        input: ChangeGuidedStudyRoomStatusDto,
    ): Promise<GuidedStudyRoomView> {
        const current = await this.findOwnedActiveRoom(actor, classId, roomId);
        if (current.status === input.status) return this.toView(current);
        if (input.status === "OPEN" && current.officialTestId) {
            await this.testsService.findOwnedPublishedTest(
                actor.id,
                String(current.officialTestId),
            );
        }
        const expected = input.status === "CLOSED" ? "OPEN" : "CLOSED";
        const mutate = async (session?: ClientSession) => {
            if (current.subjectId) {
                await this.subjectsService.reserveActiveChildMutation(
                    actor.id,
                    classId,
                    String(current.subjectId),
                    session,
                );
            } else {
                await this.classesService.reserveActiveChildMutation(
                    actor.id,
                    classId,
                    session,
                );
            }
            if (input.status === "OPEN" && current.officialTestId && session) {
                await this.testsService.reserveGuidedRoomDependency(
                    actor.id,
                    classId,
                    String(current.officialTestId),
                    session,
                );
            }
            const changed = await this.roomModel
                .findOneAndUpdate(
                    { _id: new Types.ObjectId(roomId), status: expected },
                    input.status === "CLOSED"
                        ? {
                              $set: {
                                  status: "CLOSED",
                                  closedAt: new Date(),
                                  closedReason: "TEACHER",
                              },
                          }
                        : {
                              $set: { status: "OPEN" },
                              $unset: { closedAt: "", closedReason: "" },
                          },
                    session ? { new: true, session } : { new: true },
                )
                .lean();
            if (!changed) {
                const latest = await this.roomModel
                    .findOne(
                        {
                            _id: new Types.ObjectId(roomId),
                            classId: new Types.ObjectId(classId),
                        },
                        null,
                        session ? { session } : undefined,
                    )
                    .lean();
                if (latest?.status === input.status) return this.toView(latest);
                if (latest) {
                    throw new ConflictException({
                        code: "GUIDED_ROOM_STATUS_CONFLICT",
                        message: "O estado da sala mudou em simultâneo. Atualiza e tenta novamente.",
                    });
                }
                throw this.roomNotFound();
            }
            const view = this.toView(changed);
            await this.notificationsService.enqueueClassEvent(actor, {
                classId,
                idempotencyKey: `guided-room:${view._id}:${input.status.toLowerCase()}:${view.updatedAt?.toISOString() ?? "transition"}`,
                type:
                    input.status === "OPEN"
                        ? "GUIDED_ROOM_REOPENED"
                        : "GUIDED_ROOM_CLOSED",
                title:
                    input.status === "OPEN"
                        ? `Sala guiada reaberta: ${view.title}`
                        : `Sala guiada encerrada: ${view.title}`,
                body:
                    input.status === "OPEN"
                        ? "A sala guiada voltou a estar disponível."
                        : "A sala guiada foi encerrada e permanece disponível para consulta.",
                targetPath: `/app/turmas/${classId}/salas-guiadas/${view._id}`,
            }, session);
            return view;
        };
        return this.connection
            ? this.connection.transaction((session) => mutate(session))
            : mutate(undefined);
    }

    /** Regista uma visualização explícita e idempotente. */
    async markViewed(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ) {
        const room = await this.ensureStudentRoom(actor, classId, roomId);
        if (room.status !== "OPEN") {
            throw new ConflictException({
                code: "GUIDED_ROOM_CLOSED",
                message: "A sala está encerrada e permanece apenas para consulta.",
            });
        }
        const now = new Date();
        const existing = await this.participationModel
            .findOne({ roomId: new Types.ObjectId(roomId), studentId: new Types.ObjectId(actor.id) })
            .lean();
        if (existing) {
            const updated = await this.participationModel
                .findByIdAndUpdate(existing._id, { $set: { lastViewedAt: now } }, { new: true })
                .lean();
            await this.recordParticipationActivity(
                room,
                actor.id,
                "GUIDED_ROOM_VIEWED",
                `guided-room-view:${String(existing._id)}:${now.getTime()}`,
                now,
            );
            return this.toParticipationView(updated!);
        }
        let created;
        try {
            created = await this.participationModel.create({
                roomId: new Types.ObjectId(roomId),
                classId: new Types.ObjectId(classId),
                studentId: new Types.ObjectId(actor.id),
                status: "VIEWED",
                firstViewedAt: now,
                lastViewedAt: now,
            });
        } catch (error) {
            if (!isMongoDuplicateKeyError(error)) throw error;
            const concurrent = await this.participationModel
                .findOneAndUpdate(
                    {
                        roomId: new Types.ObjectId(roomId),
                        studentId: new Types.ObjectId(actor.id),
                    },
                    { $set: { lastViewedAt: now } },
                    { new: true },
                )
                .lean();
            if (!concurrent) throw error;
            await this.recordParticipationActivity(
                room,
                actor.id,
                "GUIDED_ROOM_VIEWED",
                `guided-room-view:${String(concurrent._id)}:${now.getTime()}`,
                now,
            );
            return this.toParticipationView(concurrent);
        }
        await this.historyService.recordEvent(
            actor.id,
            "GUIDED_ROOM_VIEWED",
            `Sala guiada consultada: ${room.title}`,
        );
        await this.recordParticipationActivity(
            room,
            actor.id,
            "GUIDED_ROOM_VIEWED",
            `guided-room-view:${String(created._id)}:first`,
            now,
        );
        return this.toParticipationView(created.toObject());
    }

    /** Marca conclusão manual, aplicando o gate do mini-teste associado. */
    async markCompleted(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ) {
        const room = await this.ensureStudentRoom(actor, classId, roomId);
        if (room.status !== "OPEN") {
            throw new ConflictException({
                code: "GUIDED_ROOM_CLOSED",
                message: "A sala está encerrada e já não aceita conclusões.",
            });
        }
        if (
            room.officialTestId &&
            !(await this.testsService.hasStudentAttempt(String(room.officialTestId), actor.id))
        ) {
            throw new ConflictException({
                code: "GUIDED_ROOM_TEST_ATTEMPT_REQUIRED",
                message: "Submete primeiro o mini-teste associado à sala.",
            });
        }
        const now = new Date();
        const existing = await this.participationModel
            .findOne({ roomId: new Types.ObjectId(roomId), studentId: new Types.ObjectId(actor.id) })
            .lean();
        if (existing?.status === "COMPLETED") {
            await this.recordParticipationActivity(
                room,
                actor.id,
                "GUIDED_ROOM_COMPLETED",
                `guided-room-completed:${String(existing._id)}`,
                existing.completedAt ?? existing.lastViewedAt,
            );
            return this.toParticipationView(existing);
        }
        const updated = await this.participationModel
            .findOneAndUpdate(
                { roomId: new Types.ObjectId(roomId), studentId: new Types.ObjectId(actor.id) },
                {
                    $set: { status: "COMPLETED", lastViewedAt: now, completedAt: now },
                    $setOnInsert: {
                        classId: new Types.ObjectId(classId),
                        firstViewedAt: now,
                    },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        await this.historyService.recordEvent(
            actor.id,
            "GUIDED_ROOM_COMPLETED",
            `Sala guiada concluída: ${room.title}`,
        );
        await this.recordParticipationActivity(
            room,
            actor.id,
            "GUIDED_ROOM_COMPLETED",
            `guided-room-completed:${String(updated!._id)}`,
            updated!.completedAt ?? now,
        );
        return this.toParticipationView(updated!);
    }

    /** Publica atividade minimizada depois de a participação ficar persistida. */
    private async recordParticipationActivity(
        room: RoomRecord,
        studentId: string,
        type: "GUIDED_ROOM_VIEWED" | "GUIDED_ROOM_COMPLETED",
        sourceEventKey: string,
        occurredAt: Date,
    ): Promise<void> {
        await this.classLearningActivityService?.recordBestEffort({
            classId: String(room.classId),
            studentId,
            ...(room.subjectId ? { subjectId: String(room.subjectId) } : {}),
            type,
            sourceEventKey,
            occurredAt,
        });
    }

    /** Resume audiência atual e participantes históricos para o professor. */
    async getProgress(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ): Promise<GuidedStudyRoomProgressView> {
        await this.findOwnedRoom(actor, classId, roomId);
        const participations = await this.participationModel
            .find({ roomId: new Types.ObjectId(roomId) })
            .sort({ completedAt: -1, lastViewedAt: -1 })
            .lean();
        const currentStudents = await this.classesService.listOwnedClassStudentsIncluding(
            actor.id,
            classId,
            participations.map((item) => String(item.studentId)),
        );
        const currentById = new Map(currentStudents.map((student) => [student.id, student]));
        const participationById = new Map(
            participations.map((item) => [String(item.studentId), item]),
        );
        const audienceIds = new Set([...currentById.keys(), ...participationById.keys()]);
        const students = [...audienceIds].map((studentId) => {
            const participation = participationById.get(studentId);
            return {
                studentId,
                email: currentById.get(studentId)?.email ?? `Aluno ${studentId.slice(-4)}`,
                status: participation?.status ?? ("NOT_VIEWED" as const),
                firstViewedAt: participation?.firstViewedAt,
                lastViewedAt: participation?.lastViewedAt,
                completedAt: participation?.completedAt,
            };
        });
        const completed = students.filter((student) => student.status === "COMPLETED").length;
        const viewed = students.filter((student) => student.status === "VIEWED").length;
        const notViewed = students.filter((student) => student.status === "NOT_VIEWED").length;
        return {
            totalStudents: students.length,
            notViewed,
            viewed,
            completed,
            completionPercent: students.length ? Math.round((completed / students.length) * 100) : 0,
            students,
        };
    }

    /** Conta salas por turma e disciplina para o dashboard docente. */
    async countByClassAndSubjectIds(
        classId: string,
        subjectIds: string[],
    ): Promise<GuidedStudyRoomCountSummary> {
        const classObjectId = new Types.ObjectId(classId);
        const rows = await this.roomModel.aggregate<{ _id: GuidedStudyRoomStatus; count: number }>([
            { $match: { classId: classObjectId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const summary: GuidedStudyRoomCountSummary = { open: 0, closed: 0, bySubjectId: {} };
        for (const row of rows) {
            if (row._id === "OPEN") summary.open = row.count;
            if (row._id === "CLOSED") summary.closed = row.count;
        }
        for (const id of subjectIds) summary.bySubjectId[id] = { open: 0, closed: 0 };
        if (!subjectIds.length) return summary;
        const subjectRows = await this.roomModel.aggregate<{
            _id: { subjectId: Types.ObjectId; status: GuidedStudyRoomStatus };
            count: number;
        }>([
            {
                $match: {
                    classId: classObjectId,
                    subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
                },
            },
            { $group: { _id: { subjectId: "$subjectId", status: "$status" }, count: { $sum: 1 } } },
        ]);
        for (const row of subjectRows) {
            const id = String(row._id.subjectId);
            const current = summary.bySubjectId[id] ?? { open: 0, closed: 0 };
            if (row._id.status === "OPEN") current.open = row.count;
            if (row._id.status === "CLOSED") current.closed = row.count;
            summary.bySubjectId[id] = current;
        }
        return summary;
    }

    /** Conta conclusões registadas apenas em salas atualmente abertas. */
    async countCompletedInOpenRooms(classId: string): Promise<number> {
        const rooms = await this.roomModel
            .find({ classId: new Types.ObjectId(classId), status: "OPEN" })
            .select({ _id: 1 })
            .lean();
        if (!rooms.length) return 0;
        return this.participationModel.countDocuments({
            roomId: { $in: rooms.map((room) => room._id) },
            status: "COMPLETED",
        });
    }

    /** Localiza uma sala pertencente ao professor e à turma indicada. */
    async findOwnedRoom(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ): Promise<RoomRecord> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        if (!Types.ObjectId.isValid(roomId)) throw this.roomNotFound();
        const room = await this.roomModel
            .findOne({ _id: new Types.ObjectId(roomId), classId: new Types.ObjectId(schoolClass._id) })
            .lean();
        if (!room) throw this.roomNotFound();
        return room;
    }

    /** Localiza uma sala apenas quando a turma continua ativa para mutações. */
    async findOwnedActiveRoom(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ): Promise<RoomRecord> {
        this.assertTeacher(actor);
        await this.classesService.findOwnedActiveClass(actor.id, classId);
        if (!Types.ObjectId.isValid(roomId)) throw this.roomNotFound();
        const room = await this.roomModel
            .findOne({
                _id: new Types.ObjectId(roomId),
                classId: new Types.ObjectId(classId),
                teacherId: new Types.ObjectId(actor.id),
            })
            .lean();
        if (!room) throw this.roomNotFound();
        return room;
    }

    /** Localiza uma sala depois de validar a inscrição atual do aluno. */
    async ensureStudentRoom(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ): Promise<RoomRecord> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        if (!Types.ObjectId.isValid(roomId)) throw this.roomNotFound();
        const room = await this.roomModel
            .findOne({ _id: new Types.ObjectId(roomId), classId: new Types.ObjectId(schoolClass._id) })
            .lean();
        if (!room) throw this.roomNotFound();
        return room;
    }

    /** Autoriza leitura histórica em turmas arquivadas sem permitir mutações. */
    async ensureStudentHistoricalRoom(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
    ): Promise<RoomRecord> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentHistoricalEnrollment(
            actor.id,
            classId,
        );
        if (!Types.ObjectId.isValid(roomId)) throw this.roomNotFound();
        const room = await this.roomModel
            .findOne({
                _id: new Types.ObjectId(roomId),
                classId: new Types.ObjectId(schoolClass._id),
            })
            .lean();
        if (!room) throw this.roomNotFound();
        return room;
    }

    /** Carrega apenas fontes selecionadas e processadas para a IA. */
    async listProcessedSelectedMaterials(room: RoomRecord): Promise<OfficialMaterialView[]> {
        const materials = await this.materialsService.listByIds(room.materialIds ?? []);
        return this.filterMaterialsForRoom(room, materials).filter(
            (material) => material.status === "PROCESSED" && Boolean(material.textContent),
        );
    }

    /** Exclui referências cruzadas mesmo quando existem em dados legados corrompidos. */
    filterMaterialsForRoom(
        room: RoomRecord,
        materials: OfficialMaterialView[],
    ): OfficialMaterialView[] {
        const classId = String(room.classId);
        const teacherId = String(room.teacherId);
        const subjectId = room.subjectId ? String(room.subjectId) : undefined;
        return materials.filter(
            (material) =>
                material.classId === classId &&
                material.teacherId === teacherId &&
                (!subjectId || material.subjectId === subjectId),
        );
    }

    private toDetail(room: RoomRecord): Promise<GuidedStudyRoomDetailView>;
    private toDetail(
        room: RoomRecord,
        studentId: string,
    ): Promise<StudentGuidedStudyRoomDetailView>;
    private async toDetail(
        room: RoomRecord,
        studentId?: string,
    ): Promise<GuidedStudyRoomDetailView | StudentGuidedStudyRoomDetailView> {
        const view = this.toView(room);
        const loadedMaterials = await this.materialsService.listByIds(view.materialIds);
        const internalMaterials = this.filterMaterialsForRoom(room, loadedMaterials);
        const materials = studentId
            ? internalMaterials.map((material) =>
                  this.materialsService.toStudentMaterialView(material),
              )
            : internalMaterials;
        const found = new Set(internalMaterials.map((material) => material._id));
        const invalidMaterialIds = view.materialIds.filter((id) => !found.has(id));
        let officialTest: GuidedStudyRoomDetailFields["officialTest"];
        if (view.officialTestId && view.subjectId) {
            const test = await this.testsService
                .findOwnedTest(String(room.teacherId), view.officialTestId)
                .catch(() => undefined);
            if (
                test &&
                test.classId === view.classId &&
                test.subjectId === view.subjectId
            ) {
                officialTest = {
                    _id: test._id,
                    subjectId: test.subjectId,
                    title: test.title,
                    status: test.status,
                };
            }
        }
        const participation = studentId
            ? await this.participationModel
                  .findOne({
                      roomId: new Types.ObjectId(view._id),
                      studentId: new Types.ObjectId(studentId),
                  })
                  .lean()
            : undefined;
        const hasProcessableSources = internalMaterials.some(
            (material) => material.status === "PROCESSED" && Boolean(material.textContent),
        );
        const assistantAvailability = view.status !== "OPEN"
            ? { canAsk: false as const, reason: "ROOM_CLOSED" as const }
            : !view.aiEnabled
                ? { canAsk: false as const, reason: "AI_DISABLED" as const }
                : !hasProcessableSources
                    ? { canAsk: false as const, reason: "NO_PROCESSABLE_SOURCES" as const }
                    : { canAsk: true as const };
        return {
            ...(studentId ? this.toStudentView(room) : view),
            materials,
            invalidMaterialIds,
            officialTest,
            aiAvailable: assistantAvailability.canAsk,
            assistantAvailability,
            ...(studentId
                ? {
                      myParticipation: participation
                          ? this.toParticipationView(participation)
                          : null,
                  }
                : {}),
        };
    }

    private async validateReferences(
        teacherId: string,
        classId: string,
        input: GuidedStudyRoomReferenceInput,
        existingOfficialTestId?: string,
    ): Promise<{ subjectId?: string; materialIds: string[]; officialTestId?: string }> {
        const subjectId = await this.resolveOptionalSubjectId(teacherId, classId, input.subjectId);
        const materialIds = [...new Set(input.materialIds ?? [])];
        const materials = await Promise.all(
            materialIds.map((id) => this.materialsService.findOwnedMaterial(teacherId, id)),
        );
        if (
            materials.some(
                (material) =>
                    material.classId !== classId ||
                    (subjectId && material.subjectId !== subjectId) ||
                    material.status !== "PROCESSED" ||
                    !material.textContent,
            )
        ) {
            throw new BadRequestException({
                code: "GUIDED_ROOM_MATERIAL_CONTEXT_MISMATCH",
                message:
                    "Seleciona apenas materiais processados pertencentes ao contexto da sala.",
            });
        }
        if (
            input.aiEnabled &&
            !materials.some(
                (material) => material.status === "PROCESSED" && Boolean(material.textContent),
            )
        ) {
            throw new UnprocessableEntityException({
                code: "GUIDED_ROOM_AI_SOURCES_REQUIRED",
                message: "Seleciona pelo menos um material processado para ativar a IA.",
            });
        }
        let officialTestId: string | undefined;
        if (input.officialTestId) {
            if (!subjectId) {
                throw new BadRequestException({
                    code: "GUIDED_ROOM_TEST_REQUIRES_SUBJECT",
                    message: "Associa uma disciplina antes de escolher o mini-teste.",
                });
            }
            const test =
                input.officialTestId === existingOfficialTestId
                    ? await this.testsService.findOwnedTest(
                          teacherId,
                          input.officialTestId,
                      )
                    : await this.testsService.findOwnedPublishedTest(
                          teacherId,
                          input.officialTestId,
                      );
            if (test.classId !== classId || test.subjectId !== subjectId) {
                throw new BadRequestException({
                    code: "GUIDED_ROOM_TEST_CONTEXT_MISMATCH",
                    message: "O mini-teste não pertence à disciplina da sala.",
                });
            }
            officialTestId = test._id;
        }
        return { subjectId, materialIds, officialTestId };
    }

    private async resolveOptionalSubjectId(
        teacherId: string,
        classId: string,
        subjectId?: string | null,
    ): Promise<string | undefined> {
        if (!subjectId) return undefined;
        const subject = await this.subjectsService.findOwnedSubject(teacherId, subjectId);
        if (subject.classId !== classId) {
            throw new BadRequestException({
                code: "GUIDED_ROOM_SUBJECT_CLASS_MISMATCH",
                message: "A disciplina não pertence à turma da sala guiada.",
            });
        }
        return subject._id;
    }

    private toView(room: RoomRecord): GuidedStudyRoomView {
        return {
            _id: String(room._id),
            classId: String(room.classId),
            subjectId: room.subjectId ? String(room.subjectId) : undefined,
            teacherId: String(room.teacherId),
            title: room.title,
            description: room.description,
            goal: room.goal,
            materialIds: room.materialIds ?? [],
            officialTestId: room.officialTestId ? String(room.officialTestId) : undefined,
            startsAt: room.startsAt,
            durationMinutes: room.durationMinutes,
            aiEnabled: Boolean(room.aiEnabled),
            status: room.status,
            closedAt: room.closedAt,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
        };
    }

    /** Remove identidade interna do professor de qualquer contrato discente. */
    private toStudentView(room: RoomRecord): StudentGuidedStudyRoomView {
        const { teacherId: _teacherId, ...safe } = this.toView(room);
        return safe;
    }

    private toParticipationView(participation: {
        _id?: unknown;
        roomId: unknown;
        classId: unknown;
        studentId: unknown;
        status: GuidedStudyRoomParticipationStatus;
        firstViewedAt: Date;
        lastViewedAt: Date;
        completedAt?: Date;
    }): GuidedStudyRoomParticipationView {
        return {
            id: String(participation._id),
            roomId: String(participation.roomId),
            classId: String(participation.classId),
            studentId: String(participation.studentId),
            status: participation.status,
            firstViewedAt: participation.firstViewedAt,
            lastViewedAt: participation.lastViewedAt,
            completedAt: participation.completedAt,
        };
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private invalidStatus(): BadRequestException {
        return new BadRequestException({
            code: "GUIDED_ROOM_STATUS_INVALID",
            message: "Estado de sala guiada inválido.",
        });
    }

    private invalidCursor(): BadRequestException {
        return new BadRequestException({
            code: "GUIDED_ROOM_CURSOR_INVALID",
            message: "Cursor de salas guiadas inválido.",
        });
    }

    private roomNotFound(): NotFoundException {
        return new NotFoundException({
            code: "GUIDED_ROOM_NOT_FOUND",
            message: "Sala guiada não encontrada.",
        });
    }
}
