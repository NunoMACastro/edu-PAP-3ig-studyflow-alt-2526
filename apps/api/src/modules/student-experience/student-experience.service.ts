/**
 * Constrói a experiência inicial do aluno sem transferir para o browser a
 * responsabilidade de cruzar turmas, atividades e permissões.
 */
import { ForbiddenException, Injectable, Optional } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { ClassProjectsService } from "../class-projects/class-projects.service.js";
import { ClassProject } from "../class-projects/schemas/class-project.schema.js";
import { StudentClassProjectState } from "../class-projects/schemas/student-class-project-state.schema.js";
import { GuidedStudyRoomsService } from "../guided-study-rooms/guided-study-rooms.service.js";
import { GuidedStudyRoom } from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import { OfficialTestAttempt } from "../official-tests/schemas/official-test-attempt.schema.js";
import { OfficialTest } from "../official-tests/schemas/official-test.schema.js";
import { OfficialTestsService } from "../official-tests/official-tests.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { AiContentReviewsService } from "../ai-content-reviews/ai-content-reviews.service.js";
import { MaterialIndexService, type MaterialIndexJobView } from "../material-index/material-index.service.js";
import { UnifiedSearchService } from "../unified-search/unified-search.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { StudyGroupSessionsService } from "../study-group-sessions/study-group-sessions.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import { RoutinesService } from "../study/routines.service.js";
import { formatStudyWeekdaysPt } from "../study/study-weekdays.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { TeacherStudentChatService } from "../teacher-student-chat/teacher-student-chat.service.js";
import { UpdateRecentContextDto } from "./dto/update-recent-context.dto.js";
import { StudentSearchDto } from "./dto/student-search.dto.js";
import {
    StudentRecentContext,
    StudentRecentContextDocument,
    type StudentRecentContextKind,
} from "./schemas/student-recent-context.schema.js";

export type StudentActionUrgency =
    | "OVERDUE"
    | "TODAY"
    | "UPCOMING"
    | "AVAILABLE";

export type StudentAction = {
    key: string;
    kind:
        | StudentRecentContextKind
        | "ROUTINE"
        | "GOAL"
        | "GROUP_SESSION"
        | "ROOM_SESSION"
        | "SUBJECT_CHAT";
    title: string;
    contextLabel?: string;
    dueAt?: Date;
    urgency: StudentActionUrgency;
    targetPath: string;
    contextMeta?: {
        creator: "SELF" | "OTHER_STUDENT" | "TEACHER";
        access: "PRIVATE" | "SHARED" | "CLASS";
        memberCount?: number;
    };
};

export type StudentTodayState = {
    continue: StudentAction | null;
    priorities: StudentAction[];
    recentContexts: StudentAction[];
};

type TimestampedRecord = { _id: unknown; createdAt?: Date };

/** Fachada de dashboard, continuidade e autorização de contextos recentes. */
@Injectable()
export class StudentExperienceService {
    private static readonly MAX_RECENT_CONTEXTS = 5;

    constructor(
        @InjectModel(StudentRecentContext.name)
        private readonly recentContextModel: Model<StudentRecentContextDocument>,
        @InjectModel(OfficialTest.name)
        private readonly officialTestModel: Model<OfficialTest & TimestampedRecord>,
        @InjectModel(OfficialTestAttempt.name)
        private readonly officialTestAttemptModel: Model<OfficialTestAttempt>,
        @InjectModel(ClassProject.name)
        private readonly classProjectModel: Model<ClassProject & TimestampedRecord>,
        @InjectModel(GuidedStudyRoom.name)
        private readonly guidedRoomModel: Model<GuidedStudyRoom & TimestampedRecord>,
        private readonly classesService: ClassesService,
        private readonly subjectsService: SubjectsService,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly studyGroupsService: StudyGroupsService,
        private readonly guidedStudyRoomsService: GuidedStudyRoomsService,
        private readonly classProjectsService: ClassProjectsService,
        private readonly routinesService: RoutinesService,
        private readonly groupSessionsService: StudyGroupSessionsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly officialTestsService: OfficialTestsService,
        private readonly aiContentReviewsService: AiContentReviewsService,
        private readonly materialIndexService: MaterialIndexService,
        private readonly unifiedSearchService: UnifiedSearchService,
        @Optional()
        @InjectModel(StudentClassProjectState.name)
        private readonly studentProjectStateModel?: Model<StudentClassProjectState>,
        @Optional()
        private readonly teacherStudentChatService?: TeacherStudentChatService,
    ) {}

    /** Devolve a visão segura e orientada a ação de uma disciplina. */
    async getSubjectOverview(actor: AuthenticatedUser, subjectId: string) {
        this.assertStudent(actor);
        const [{ subject, schoolClass }, materials, materialCount, tests, approvedContent, unreadChats] =
            await Promise.all([
                this.subjectsService.findSubjectForStudentHistory(actor.id, subjectId),
                this.officialMaterialsService.listStudentSubjectMaterials(
                    actor,
                    subjectId,
                    undefined,
                    50,
                ),
                this.officialMaterialsService.countBySubjectIds([subjectId]),
                this.officialTestsService.listPublishedForStudent(actor, subjectId),
                this.aiContentReviewsService.listApprovedForStudent(actor, subjectId),
                this.teacherStudentChatService?.listStudentUnread(actor) ?? [],
            ]);
        return {
            subject: {
                id: subject._id,
                name: subject.name,
                code: subject.code,
                description: subject.description,
                classId: schoolClass._id,
                className: schoolClass.name,
            },
            readOnly:
                subject.status === "ARCHIVED" || schoolClass.status === "ARCHIVED",
            counts: {
                materials: materialCount,
                tests: tests.length,
                approvedContent: approvedContent.length,
                unreadChat: unreadChats.find((item) => item.subjectId === subjectId)?.unreadCount ?? 0,
            },
            recentMaterial: materials.items[0] ?? null,
            nextTest:
                tests.find((test) => test.status === "PUBLISHED") ?? null,
        };
    }

    /** Pesquisa sem aceitar identificadores de jobs ou rotas do cliente. */
    async search(actor: AuthenticatedUser, input: StudentSearchDto) {
        this.assertStudent(actor);
        const jobs = (await this.resolveSearchJobs(actor, input)).slice(0, 50);
        if (jobs.length === 0) {
            return { query: input.query.trim(), results: [] };
        }
        const response = await this.unifiedSearchService.search(actor, {
            query: input.query,
            jobIds: jobs.map((job) => job._id),
        });
        const jobById = new Map(jobs.map((job) => [job._id, job]));
        return {
            query: response.query,
            results: response.results.slice(0, 20).map((result) => {
                const job = jobById.get(result.jobId)!;
                return {
                    materialId: result.materialId,
                    context: job.scope === "PRIVATE_AREA" ? "Estudo pessoal" : "Disciplina",
                    sourceLabel: result.sourceLabel,
                    locator: result.locator,
                    excerpt: result.excerpt,
                    targetPath:
                        job.scope === "PRIVATE_AREA"
                            ? `/app/areas/${job.studyAreaId}/materiais`
                            : `/app/disciplinas/${job.subjectId}/materiais/${result.materialId}`,
                };
            }),
        };
    }

    private async resolveSearchJobs(
        actor: AuthenticatedUser,
        input: StudentSearchDto,
    ): Promise<MaterialIndexJobView[]> {
        if (input.scope.type === "SUBJECT") {
            return this.materialIndexService.listLatestReadableJobsForStudentSubject(
                actor,
                input.scope.id!,
            );
        }
        if (input.scope.type === "STUDY_AREA") {
            return this.materialIndexService.listLatestOwnedJobsForArea(
                actor,
                input.scope.id!,
            );
        }
        const [classes, areas] = await Promise.all([
            this.classesService.listStudentClasses(actor, "ACTIVE"),
            this.studyAreasService.listMyStudyAreas(actor.id),
        ]);
        const subjects = (
            await Promise.all(
                classes.map((schoolClass) =>
                    this.subjectsService.listStudentClassSubjects(
                        actor,
                        schoolClass._id,
                        "ACTIVE",
                    ),
                ),
            )
        ).flat();
        const collections = await Promise.all([
            ...areas.map((area) =>
                this.materialIndexService.listLatestOwnedJobsForArea(
                    actor,
                    area._id,
                ),
            ),
            ...subjects.map((subject) =>
                this.materialIndexService.listLatestReadableJobsForStudentSubject(
                    actor,
                    subject._id,
                ),
            ),
        ]);
        return collections.flat();
    }

    /** Agrega a próxima ação e as prioridades sem pedidos N+1 no frontend. */
    async getToday(actor: AuthenticatedUser): Promise<StudentTodayState> {
        this.assertStudent(actor);
        const [classes, plan, sessions, studyRooms, guidedPage, recentContexts, unreadChats] =
            await Promise.all([
                this.classesService.listStudentClasses(actor, "ACTIVE"),
                this.routinesService.listMine(actor.id),
                this.groupSessionsService.listUpcomingForStudent(actor, "STUDY_ROOM"),
                this.studyRoomsService.listMyRooms(actor, "STUDY_ROOM"),
                this.guidedStudyRoomsService.listAllForStudent(
                    actor,
                    "OPEN",
                    undefined,
                    20,
                ),
                this.listRecentContexts(actor),
                this.teacherStudentChatService?.listStudentUnread(actor) ?? [],
            ]);

        const classIds = classes.map((schoolClass) =>
            new Types.ObjectId(schoolClass._id),
        );
        const [tests, projects] = classIds.length
            ? await Promise.all([
                  this.officialTestModel
                      .find({ classId: { $in: classIds }, status: "PUBLISHED" })
                      .sort({ createdAt: -1 })
                      .limit(30)
                      .lean(),
                  this.classProjectModel
                      .find({ classId: { $in: classIds }, status: "PUBLISHED" })
                      .sort({ dueDate: 1, createdAt: -1 })
                      .limit(30)
                      .lean(),
              ])
            : [[], []];

        const attempts = tests.length
            ? await this.officialTestAttemptModel.aggregate<{
                  _id: Types.ObjectId;
                  count: number;
              }>([
                  {
                      $match: {
                          studentId: new Types.ObjectId(actor.id),
                          testId: { $in: tests.map((test) => test._id) },
                      },
                  },
                  { $group: { _id: "$testId", count: { $sum: 1 } } },
              ])
            : [];
        const attemptsByTest = new Map(
            attempts.map((item) => [String(item._id), item.count]),
        );
        const studyRoomById = new Map(studyRooms.map((room) => [room._id, room]));

        const completedProjectIds = projects.length > 0 && this.studentProjectStateModel
            ? new Set((await this.studentProjectStateModel.find({
                studentId: new Types.ObjectId(actor.id),
                projectId: { $in: projects.map((project) => project._id) },
                status: "COMPLETED",
            }).select("projectId").lean()).map((state) => String(state.projectId)))
            : new Set<string>();

        const priorities: StudentAction[] = [
            ...guidedPage.items
                .filter((room) => room.myParticipation?.status !== "COMPLETED")
                .map((room) =>
                    this.action({
                        key: `guided-room:${room._id}`,
                        kind: "GUIDED_ROOM",
                        title: room.title,
                        contextLabel: room.subjectName
                            ? `${room.className} · ${room.subjectName}`
                            : room.className,
                        dueAt: room.startsAt ? new Date(room.startsAt) : undefined,
                        targetPath: `/app/turmas/${room.classId}/salas-guiadas/${room._id}`,
                        contextMeta: { creator: "TEACHER", access: "CLASS" },
                    }),
                ),
            ...tests
                .filter((test) => (attemptsByTest.get(String(test._id)) ?? 0) < 3)
                .map((test) =>
                    this.action({
                        key: `official-test:${test._id}`,
                        kind: "OFFICIAL_TEST",
                        title: test.title,
                        contextLabel: "Mini-teste disponível",
                        targetPath: `/app/disciplinas/${test.subjectId}/testes`,
                    }),
                ),
            ...projects.filter((project) => !completedProjectIds.has(String(project._id))).map((project) =>
                this.action({
                    key: `class-project:${project._id}`,
                    kind: "CLASS_PROJECT",
                    title: project.title,
                    contextLabel: project.subjectNameSnapshot ?? "Projeto da turma",
                    dueAt: project.dueDate,
                    targetPath: `/app/turmas/${project.classId}/projectos`,
                }),
            ),
            ...plan.routines.map((routine) =>
                this.action({
                    key: `routine:${routine._id}`,
                    kind: "ROUTINE",
                    title: routine.title,
                    contextLabel: `${formatStudyWeekdaysPt(routine.weekdays)} · ${routine.startTime}`,
                    dueAt: this.nextRoutineOccurrence(
                        routine.weekdays,
                        routine.startTime,
                    ),
                    targetPath: "/app/plano?tab=agenda",
                }),
            ),
            ...plan.goals.filter((goal) => !goal.completed).map((goal) =>
                this.action({
                    key: `goal:${goal._id}`,
                    kind: "GOAL",
                    title: goal.title,
                    contextLabel: "Objetivo pessoal",
                    dueAt: goal.targetDate,
                    targetPath: "/app/plano?tab=objetivos",
                }),
            ),
            ...sessions.map((session) => {
                const room = studyRoomById.get(session.groupId);
                return this.action({
                    key: `group-session:${session._id}`,
                    kind: "ROOM_SESSION",
                    title: session.title,
                    contextLabel: room?.name ?? "Sessão da sala",
                    dueAt: session.startsAt,
                    targetPath: `/app/salas/${session.groupId}/sessoes`,
                    contextMeta: room ? {
                        creator: room.ownerStudentId === actor.id ? "SELF" : "OTHER_STUDENT",
                        access: "SHARED",
                        memberCount: room.memberIds.length,
                    } : { creator: "OTHER_STUDENT", access: "SHARED" },
                });
            }),
            ...unreadChats.map((chat) =>
                this.action({
                    key: `subject-chat:${chat.subjectId}`,
                    kind: "SUBJECT_CHAT",
                    title: chat.unreadCount === 1
                        ? "Nova mensagem do professor"
                        : `${chat.unreadCount} mensagens novas do professor`,
                    contextLabel: "Conversa da disciplina",
                    dueAt: chat.lastMessageAt,
                    targetPath: `/app/disciplinas/${chat.subjectId}/chat`,
                }),
            ),
        ]
            .filter((item) => item.urgency !== "UPCOMING" || this.withinSevenDays(item.dueAt))
            .sort((left, right) => this.compareActions(left, right))
            .slice(0, 6);

        return {
            continue: recentContexts[0] ?? priorities[0] ?? null,
            priorities,
            recentContexts: recentContexts.slice(0, 3),
        };
    }

    /** Autoriza e guarda apenas a referência canónica do contexto. */
    async updateRecentContext(
        actor: AuthenticatedUser,
        input: UpdateRecentContextDto,
    ): Promise<StudentAction> {
        this.assertStudent(actor);
        const action = await this.resolveContext(actor, input.kind, input.contextId);
        await this.recentContextModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(actor.id),
                kind: input.kind,
                contextId: new Types.ObjectId(input.contextId),
            },
            { $set: { lastOpenedAt: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        const keep = await this.recentContextModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ lastOpenedAt: -1 })
            .limit(StudentExperienceService.MAX_RECENT_CONTEXTS)
            .select("_id")
            .lean();
        await this.recentContextModel.deleteMany({
            userId: new Types.ObjectId(actor.id),
            _id: { $nin: keep.map((item) => item._id) },
        });
        return action;
    }

    private async listRecentContexts(
        actor: AuthenticatedUser,
    ): Promise<StudentAction[]> {
        const rows = await this.recentContextModel
            .find({
                userId: new Types.ObjectId(actor.id),
                kind: { $ne: "STUDY_GROUP" },
            })
            .sort({ lastOpenedAt: -1 })
            .limit(StudentExperienceService.MAX_RECENT_CONTEXTS)
            .lean();
        const resolved = await Promise.all(
            rows.map(async (row) => {
                try {
                    return await this.resolveContext(
                        actor,
                        row.kind,
                        String(row.contextId),
                    );
                } catch {
                    await this.recentContextModel.deleteOne({ _id: row._id });
                    return null;
                }
            }),
        );
        return resolved.filter((item): item is StudentAction => item !== null);
    }

    private async resolveContext(
        actor: AuthenticatedUser,
        kind: StudentRecentContextKind,
        contextId: string,
    ): Promise<StudentAction> {
        if (kind === "SUBJECT") {
            const { subject, schoolClass } =
                await this.subjectsService.findSubjectForStudentHistory(
                    actor.id,
                    contextId,
                );
            return this.availableContext(kind, contextId, subject.name, schoolClass.name, `/app/disciplinas/${contextId}`);
        }
        if (kind === "STUDY_AREA") {
            const area = await this.studyAreasService.getMyStudyArea(actor.id, contextId);
            return this.availableContext(kind, contextId, area.name, "Estudo pessoal", `/app/areas/${contextId}`, {
                creator: "SELF",
                access: "PRIVATE",
            });
        }
        if (kind === "STUDY_ROOM" || kind === "STUDY_GROUP") {
            const room = kind === "STUDY_GROUP"
                ? await this.studyGroupsService.ensureMember(actor.id, contextId)
                : await this.studyRoomsService.ensureMember(actor.id, contextId);
            const title = "title" in room ? room.title : room.name;
            return this.availableContext(
                kind,
                contextId,
                title,
                kind === "STUDY_GROUP" ? "Grupo" : "Sala partilhada",
                kind === "STUDY_GROUP" ? `/app/grupos/${contextId}` : `/app/salas/${contextId}`,
                kind === "STUDY_ROOM" ? {
                    creator: room.ownerStudentId === actor.id ? "SELF" : "OTHER_STUDENT",
                    access: "SHARED",
                    memberCount: room.memberIds.length,
                } : undefined,
            );
        }
        if (kind === "GUIDED_ROOM") {
            const row = await this.guidedRoomModel.findById(contextId).lean();
            if (!row) throw new Error("GUIDED_ROOM_NOT_FOUND");
            const room = await this.guidedStudyRoomsService.getForStudent(
                actor,
                String(row.classId),
                contextId,
            );
            return this.availableContext(kind, contextId, room.title, "Com o professor", `/app/turmas/${room.classId}/salas-guiadas/${contextId}`, {
                creator: "TEACHER",
                access: "CLASS",
            });
        }
        if (kind === "CLASS_PROJECT") {
            const project = await this.classProjectsService.findPublishedForStudentHistory(actor.id, contextId);
            return this.availableContext(kind, contextId, project.title, "Projeto", `/app/projectos/${contextId}/plano-ia`);
        }
        const test = await this.officialTestModel.findOne({ _id: contextId, status: { $in: ["PUBLISHED", "CLOSED"] } }).lean();
        if (!test) throw new Error("OFFICIAL_TEST_NOT_FOUND");
        await this.classesService.ensureStudentHistoricalEnrollment(actor.id, String(test.classId));
        return this.availableContext(kind, contextId, test.title, "Mini-teste", `/app/disciplinas/${test.subjectId}/testes`);
    }

    private availableContext(
        kind: StudentRecentContextKind,
        contextId: string,
        title: string,
        contextLabel: string,
        targetPath: string,
        contextMeta?: StudentAction["contextMeta"],
    ): StudentAction {
        return {
            key: `recent:${kind}:${contextId}`,
            kind,
            title,
            contextLabel,
            urgency: "AVAILABLE",
            targetPath,
            contextMeta,
        };
    }

    private action(input: Omit<StudentAction, "urgency">): StudentAction {
        return { ...input, urgency: this.resolveUrgency(input.dueAt) };
    }

    private resolveUrgency(dueAt?: Date): StudentActionUrgency {
        if (!dueAt) return "AVAILABLE";
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        if (dueAt < start) return "OVERDUE";
        if (dueAt < end) return "TODAY";
        return "UPCOMING";
    }

    private withinSevenDays(dueAt?: Date): boolean {
        if (!dueAt) return true;
        return dueAt.getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000;
    }

    /** Calcula a próxima ocorrência local de uma rotina recorrente. */
    private nextRoutineOccurrence(
        weekdays: string[],
        startTime: string,
    ): Date | undefined {
        const weekdayIndexes: Record<string, number> = {
            domingo: 0,
            sunday: 0,
            segunda: 1,
            monday: 1,
            terca: 2,
            "terça": 2,
            tuesday: 2,
            quarta: 3,
            wednesday: 3,
            quinta: 4,
            thursday: 4,
            sexta: 5,
            friday: 5,
            sabado: 6,
            "sábado": 6,
            saturday: 6,
        };
        const selected = new Set(
            weekdays
                .map((weekday) => weekdayIndexes[weekday.toLowerCase()])
                .filter((value): value is number => value !== undefined),
        );
        const [hours, minutes] = startTime.split(":").map(Number);
        if (!selected.size || !Number.isInteger(hours) || !Number.isInteger(minutes)) {
            return undefined;
        }
        const now = new Date();
        for (let offset = 0; offset <= 7; offset += 1) {
            const candidate = new Date(now);
            candidate.setDate(now.getDate() + offset);
            candidate.setHours(hours, minutes, 0, 0);
            if (selected.has(candidate.getDay()) && candidate >= now) return candidate;
        }
        return undefined;
    }

    private compareActions(left: StudentAction, right: StudentAction): number {
        const weights: Record<StudentActionUrgency, number> = {
            OVERDUE: 0,
            TODAY: 1,
            UPCOMING: 2,
            AVAILABLE: 3,
        };
        const urgency = weights[left.urgency] - weights[right.urgency];
        if (urgency !== 0) return urgency;
        return (left.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) -
            (right.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }
}
