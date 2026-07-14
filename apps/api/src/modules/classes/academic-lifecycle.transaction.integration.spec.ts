/**
 * Prova a cascata de arquivo num MongoDB replica set real.
 *
 * A integração existe porque mocks não detetam operações paralelas inválidas na
 * mesma sessão nem demonstram rollback multi-documento. Turma/disciplina,
 * salas, testes e outbox têm de confirmar ou abortar como uma única unidade.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
    createConnection,
    Types,
    type ClientSession,
    type Connection,
    type Model,
} from "mongoose";
import { NotificationOutboxPublisher } from "../context-notifications/notification-outbox-publisher.service.js";
import {
    NotificationOutboxEvent,
    NotificationOutboxEventSchema,
} from "../context-notifications/schemas/notification-outbox-event.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationSchema,
} from "../guided-study-rooms/schemas/guided-study-room-participation.schema.js";
import { GuidedStudyRoomsService } from "../guided-study-rooms/guided-study-rooms.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "../official-materials/schemas/official-material.schema.js";
import { OfficialTestsService } from "../official-tests/official-tests.service.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "../official-tests/schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestSchema,
} from "../official-tests/schemas/official-test.schema.js";
import { Subject, SubjectSchema } from "../subjects/schemas/subject.schema.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { ClassesService } from "./classes.service.js";
import {
    ClassMembership,
    ClassMembershipSchema,
} from "./schemas/class-membership.schema.js";
import { SchoolClass, SchoolClassSchema } from "./schemas/school-class.schema.js";

jest.setTimeout(90_000);

const teacher = {
    id: "507f1f77bcf86cd799439013",
    email: "professor.lifecycle@example.test",
    role: "TEACHER" as const,
};

describe("Academic lifecycle — transações reais", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;
    let classModel: Model<SchoolClass>;
    let membershipModel: Model<ClassMembership>;
    let subjectModel: Model<Subject>;
    let guidedRoomModel: Model<GuidedStudyRoom>;
    let guidedParticipationModel: Model<GuidedStudyRoomParticipation>;
    let officialTestModel: Model<OfficialTest>;
    let officialTestAttemptModel: Model<OfficialTestAttempt>;
    let officialMaterialModel: Model<OfficialMaterial>;
    let outboxModel: Model<NotificationOutboxEvent>;
    let classesService: ClassesService;
    let subjectsService: SubjectsService;
    let guidedRoomsService: GuidedStudyRoomsService;
    let officialTestsService: OfficialTestsService;
    let officialMaterialsService: OfficialMaterialsService;

    beforeAll(async () => {
        replicaSet = await MongoMemoryReplSet.create({
            replSet: {
                count: 1,
                name: "studyflow-academic-lifecycle-rs",
                storageEngine: "wiredTiger",
            },
        });
        connection = await createConnection(
            replicaSet.getUri("studyflow_academic_lifecycle"),
        ).asPromise();
        classModel = connection.model(SchoolClass.name, SchoolClassSchema);
        membershipModel = connection.model(
            ClassMembership.name,
            ClassMembershipSchema,
        );
        subjectModel = connection.model(Subject.name, SubjectSchema);
        guidedRoomModel = connection.model(
            GuidedStudyRoom.name,
            GuidedStudyRoomSchema,
        );
        guidedParticipationModel = connection.model(
            GuidedStudyRoomParticipation.name,
            GuidedStudyRoomParticipationSchema,
        );
        officialTestModel = connection.model(OfficialTest.name, OfficialTestSchema);
        officialTestAttemptModel = connection.model(
            OfficialTestAttempt.name,
            OfficialTestAttemptSchema,
        );
        officialMaterialModel = connection.model(
            OfficialMaterial.name,
            OfficialMaterialSchema,
        );
        outboxModel = connection.model(
            NotificationOutboxEvent.name,
            NotificationOutboxEventSchema,
        );
        await Promise.all([
            classModel.createIndexes(),
            membershipModel.createIndexes(),
            subjectModel.createIndexes(),
            guidedRoomModel.createIndexes(),
            guidedParticipationModel.createIndexes(),
            officialTestModel.createIndexes(),
            officialTestAttemptModel.createIndexes(),
            officialMaterialModel.createIndexes(),
            outboxModel.createIndexes(),
        ]);

        const outboxPublisher = new NotificationOutboxPublisher(outboxModel as never);
        classesService = new ClassesService(
            classModel as never,
            {} as never,
            membershipModel as never,
            outboxPublisher,
            guidedRoomModel as never,
            officialTestModel as never,
            connection,
        );
        subjectsService = new SubjectsService(
            subjectModel as never,
            classesService,
            outboxPublisher,
            guidedRoomModel as never,
            officialTestModel as never,
            connection,
        );
        const notificationsService = {
            enqueueClassEvent: jest.fn().mockResolvedValue({ state: "PENDING" }),
        };
        officialTestsService = new OfficialTestsService(
            officialTestModel as never,
            officialTestAttemptModel as never,
            guidedRoomModel as never,
            subjectsService,
            notificationsService as never,
            connection,
        );
        officialMaterialsService = new OfficialMaterialsService(
            officialMaterialModel as never,
            subjectsService,
            { record: jest.fn().mockResolvedValue(undefined) } as never,
            notificationsService as never,
            connection,
        );
        guidedRoomsService = new GuidedStudyRoomsService(
            guidedRoomModel as never,
            guidedParticipationModel as never,
            classesService,
            subjectsService,
            officialMaterialsService,
            officialTestsService,
            {} as never,
            notificationsService as never,
            undefined,
            connection,
        );
    });

    afterAll(async () => {
        await connection?.close();
        await replicaSet?.stop();
    });

    beforeEach(async () => {
        await Promise.all([
            classModel.deleteMany({}),
            membershipModel.deleteMany({}),
            subjectModel.deleteMany({}),
            guidedRoomModel.deleteMany({}),
            guidedParticipationModel.deleteMany({}),
            officialTestModel.deleteMany({}),
            officialTestAttemptModel.deleteMany({}),
            officialMaterialModel.deleteMany({}),
            outboxModel.deleteMany({}),
        ]);
    });

    it("arquiva turma, dependências e outbox na mesma transação", async () => {
        const fixture = await createAcademicFixture();

        await expect(
            classesService.updateClassStatus(teacher, String(fixture.schoolClass._id), {
                status: "ARCHIVED",
            }),
        ).resolves.toMatchObject({ status: "ARCHIVED" });

        const [schoolClass, room, test, outbox] = await Promise.all([
            classModel.findById(fixture.schoolClass._id).lean(),
            guidedRoomModel.findById(fixture.room._id).lean(),
            officialTestModel.findById(fixture.test._id).lean(),
            outboxModel.findOne({ contextId: fixture.schoolClass._id }).lean(),
        ]);
        expect(schoolClass).toMatchObject({ status: "ARCHIVED" });
        expect(room).toMatchObject({
            status: "CLOSED",
            closedReason: "CLASS_ARCHIVED",
        });
        expect(test).toMatchObject({
            status: "CLOSED",
            closedReason: "CLASS_ARCHIVED",
        });
        expect(outbox).toMatchObject({
            type: "CLASS_ARCHIVED",
            status: "PENDING",
        });
    });

    it("arquiva disciplina e dependências sequencialmente na mesma transação", async () => {
        const fixture = await createAcademicFixture();

        await expect(
            subjectsService.updateSubjectStatus(
                teacher,
                String(fixture.schoolClass._id),
                String(fixture.subject._id),
                { status: "ARCHIVED" },
            ),
        ).resolves.toMatchObject({ status: "ARCHIVED" });

        const [subject, room, test, outbox] = await Promise.all([
            subjectModel.findById(fixture.subject._id).lean(),
            guidedRoomModel.findById(fixture.room._id).lean(),
            officialTestModel.findById(fixture.test._id).lean(),
            outboxModel.findOne({ contextId: fixture.schoolClass._id }).lean(),
        ]);
        expect(subject).toMatchObject({ status: "ARCHIVED" });
        expect(room).toMatchObject({
            status: "CLOSED",
            closedReason: "SUBJECT_ARCHIVED",
        });
        expect(test).toMatchObject({
            status: "CLOSED",
            closedReason: "SUBJECT_ARCHIVED",
        });
        expect(outbox).toMatchObject({
            type: "SUBJECT_ARCHIVED",
            status: "PENDING",
        });
    });

    it("faz rollback de toda a cascata quando a publicação na outbox falha", async () => {
        const fixture = await createAcademicFixture();
        const failingSubjectsService = new SubjectsService(
            subjectModel as never,
            classesService,
            {
                publishClassEvent: jest
                    .fn()
                    .mockRejectedValue(new Error("OUTBOX_WRITE_FAILED")),
            } as never,
            guidedRoomModel as never,
            officialTestModel as never,
            connection,
        );

        await expect(
            failingSubjectsService.updateSubjectStatus(
                teacher,
                String(fixture.schoolClass._id),
                String(fixture.subject._id),
                { status: "ARCHIVED" },
            ),
        ).rejects.toThrow("OUTBOX_WRITE_FAILED");

        const [subject, room, test] = await Promise.all([
            subjectModel.findById(fixture.subject._id).lean(),
            guidedRoomModel.findById(fixture.room._id).lean(),
            officialTestModel.findById(fixture.test._id).lean(),
        ]);
        expect(subject?.status).toBe("ACTIVE");
        expect(room?.status).toBe("OPEN");
        expect(test?.status).toBe("PUBLISHED");
        await expect(outboxModel.countDocuments({})).resolves.toBe(0);
    });

    it("faz rollback da nova disciplina e da outbox quando falha depois do enqueue", async () => {
        const schoolClass = await classModel.create({
            teacherId: new Types.ObjectId(teacher.id),
            name: "12.º B",
            code: "12B",
            schoolYear: "2025/2026",
            studentIds: [new Types.ObjectId("507f1f77bcf86cd799439012")],
            status: "ACTIVE",
        });
        const durablePublisher = new NotificationOutboxPublisher(
            outboxModel as never,
        );
        const publishClassEvent = jest.fn(
            async (
                input: Parameters<
                    NotificationOutboxPublisher["publishClassEvent"]
                >[0],
                session?: ClientSession,
            ) => {
                if (!session) throw new Error("SUBJECT_CREATE_SESSION_MISSING");
                await durablePublisher.publishClassEvent(input, session);
                throw new Error("SUBJECT_CREATE_FAILED_AFTER_OUTBOX_WRITE");
            },
        );
        const failingSubjectsService = new SubjectsService(
            subjectModel as never,
            classesService,
            { publishClassEvent } as never,
            guidedRoomModel as never,
            officialTestModel as never,
            connection,
        );

        await expect(
            failingSubjectsService.createSubject(
                teacher,
                String(schoolClass._id),
                {
                    name: "Física",
                    code: "FIS",
                },
            ),
        ).rejects.toThrow("SUBJECT_CREATE_FAILED_AFTER_OUTBOX_WRITE");

        expect(publishClassEvent).toHaveBeenCalledTimes(1);
        await expect(
            subjectModel.countDocuments({ classId: schoolClass._id }),
        ).resolves.toBe(0);
        await expect(
            outboxModel.countDocuments({ contextId: schoolClass._id }),
        ).resolves.toBe(0);
    });

    it("faz rollback da remoção de membership quando a outbox não confirma", async () => {
        const studentId = new Types.ObjectId("507f1f77bcf86cd799439012");
        const schoolClass = await classModel.create({
            teacherId: new Types.ObjectId(teacher.id),
            name: "12.º C",
            code: "12C",
            schoolYear: "2025/2026",
            studentIds: [studentId],
            status: "ACTIVE",
        });
        await membershipModel.create({
            classId: schoolClass._id,
            studentId,
            status: "ACTIVE",
            joinedAt: new Date("2026-07-01T10:00:00.000Z"),
            joinedBy: new Types.ObjectId(teacher.id),
            joinedAtEstimated: false,
        });
        const durablePublisher = new NotificationOutboxPublisher(
            outboxModel as never,
        );
        const publishClassEvent = jest.fn(
            async (
                input: Parameters<
                    NotificationOutboxPublisher["publishClassEvent"]
                >[0],
                session?: ClientSession,
            ) => {
                if (!session) throw new Error("MEMBERSHIP_REMOVE_SESSION_MISSING");
                await durablePublisher.publishClassEvent(input, session);
                throw new Error("MEMBERSHIP_REMOVE_FAILED_AFTER_OUTBOX_WRITE");
            },
        );
        const failingClassesService = new ClassesService(
            classModel as never,
            {} as never,
            membershipModel as never,
            { publishClassEvent } as never,
            guidedRoomModel as never,
            officialTestModel as never,
            connection,
        );

        await expect(
            failingClassesService.removeStudent(
                teacher,
                String(schoolClass._id),
                String(studentId),
            ),
        ).rejects.toThrow("MEMBERSHIP_REMOVE_FAILED_AFTER_OUTBOX_WRITE");

        const [persistedClass, persistedMembership] = await Promise.all([
            classModel.findById(schoolClass._id).lean(),
            membershipModel.findOne({ classId: schoolClass._id, studentId }).lean(),
        ]);
        expect(publishClassEvent).toHaveBeenCalledTimes(1);
        expect(persistedClass?.studentIds.map(String)).toContain(String(studentId));
        expect(persistedMembership?.status).toBe("ACTIVE");
        await expect(
            outboxModel.countDocuments({ contextId: schoolClass._id }),
        ).resolves.toBe(0);
    });

    it("não confirma uma sala criada depois de o archive concorrente da turma vencer", async () => {
        const { schoolClass } = await createActiveParents();
        let releasePrecheck!: () => void;
        let signalPrecheck!: () => void;
        const precheckReached = new Promise<void>((resolve) => {
            signalPrecheck = resolve;
        });
        const precheckReleased = new Promise<void>((resolve) => {
            releasePrecheck = resolve;
        });
        const originalFind = classesService.findOwnedActiveClass.bind(classesService);
        const precheck = jest
            .spyOn(classesService, "findOwnedActiveClass")
            .mockImplementationOnce(async (teacherId, classId) => {
                const value = await originalFind(teacherId, classId);
                signalPrecheck();
                await precheckReleased;
                return value;
            });

        try {
            const creation = guidedRoomsService.create(
                teacher,
                String(schoolClass._id),
                {
                    title: "Sala em corrida",
                    description: "Não pode sobreviver ao arquivo da turma.",
                    materialIds: [],
                    aiEnabled: false,
                },
            );
            await precheckReached;
            await classesService.updateClassStatus(
                teacher,
                String(schoolClass._id),
                { status: "ARCHIVED" },
            );
            releasePrecheck();

            await expect(creation).rejects.toMatchObject({
                response: expect.objectContaining({ code: "CLASS_NOT_ACTIVE" }),
            });
            await expect(
                guidedRoomModel.countDocuments({ classId: schoolClass._id }),
            ).resolves.toBe(0);
        } finally {
            releasePrecheck();
            precheck.mockRestore();
        }
    });

    it("não publica um teste depois de o archive concorrente da disciplina vencer", async () => {
        const { schoolClass, subject } = await createActiveParents();
        const test = await officialTestModel.create({
            subjectId: subject._id,
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(teacher.id),
            title: "Teste em corrida",
            status: "DRAFT",
            questions: [
                {
                    statement: "Quanto é 2 + 2?",
                    options: ["2", "3", "4", "5"],
                    correctOptionIndex: 2,
                },
            ],
        });
        const gate = pauseNextActiveSubjectPrecheck();
        try {
            const publication = officialTestsService.changeStatus(
                teacher,
                String(subject._id),
                String(test._id),
                { status: "PUBLISHED" },
            );
            await gate.reached;
            await subjectsService.updateSubjectStatus(
                teacher,
                String(schoolClass._id),
                String(subject._id),
                { status: "ARCHIVED" },
            );
            gate.release();

            await expect(publication).rejects.toMatchObject({
                response: expect.objectContaining({ code: "SUBJECT_NOT_ACTIVE" }),
            });
            await expect(officialTestModel.findById(test._id).lean()).resolves
                .toMatchObject({ status: "DRAFT" });
        } finally {
            gate.release();
            gate.spy.mockRestore();
        }
    });

    it("não cria material oficial depois de o archive concorrente da disciplina vencer", async () => {
        const { schoolClass, subject } = await createActiveParents();
        const gate = pauseNextActiveSubjectPrecheck();
        try {
            const creation = officialMaterialsService.createOfficialMaterial(
                teacher,
                String(subject._id),
                {
                    title: "Material em corrida",
                    type: "TEXT",
                    textContent: "Conteúdo oficial que não deve ser confirmado.",
                },
            );
            await gate.reached;
            await subjectsService.updateSubjectStatus(
                teacher,
                String(schoolClass._id),
                String(subject._id),
                { status: "ARCHIVED" },
            );
            gate.release();

            await expect(creation).rejects.toMatchObject({
                response: expect.objectContaining({ code: "SUBJECT_NOT_ACTIVE" }),
            });
            await expect(
                officialMaterialModel.countDocuments({ subjectId: subject._id }),
            ).resolves.toBe(0);
        } finally {
            gate.release();
            gate.spy.mockRestore();
        }
    });

    /** Pausa a validação otimista para deixar o archive confirmar primeiro. */
    function pauseNextActiveSubjectPrecheck() {
        let release!: () => void;
        let signal!: () => void;
        const reached = new Promise<void>((resolve) => {
            signal = resolve;
        });
        const released = new Promise<void>((resolve) => {
            release = resolve;
        });
        const original = subjectsService.findOwnedSubject.bind(subjectsService);
        const spy = jest
            .spyOn(subjectsService, "findOwnedSubject")
            .mockImplementationOnce(async (teacherId, subjectId) => {
                const value = await original(teacherId, subjectId);
                signal();
                await released;
                return value;
            });
        return { reached, release, spy };
    }

    /** Cria apenas os pais ativos usados nas corridas de lifecycle. */
    async function createActiveParents() {
        const schoolClass = await classModel.create({
            teacherId: new Types.ObjectId(teacher.id),
            name: "12.º corrida",
            code: `RACE-${new Types.ObjectId().toHexString().slice(-6)}`,
            schoolYear: "2025/2026",
            studentIds: [],
            status: "ACTIVE",
        });
        const subject = await subjectModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(teacher.id),
            name: "Disciplina concorrente",
            code: `SUB-${new Types.ObjectId().toHexString().slice(-6)}`,
            status: "ACTIVE",
        });
        return { schoolClass, subject };
    }

    /** Cria uma turma ativa com disciplina, sala e teste dependentes. */
    async function createAcademicFixture() {
        const schoolClass = await classModel.create({
            teacherId: new Types.ObjectId(teacher.id),
            name: "12.º A",
            code: `12A-${new Types.ObjectId().toHexString().slice(-6)}`,
            schoolYear: "2025/2026",
            studentIds: [],
            status: "ACTIVE",
        });
        const subject = await subjectModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(teacher.id),
            name: "Matemática",
            code: "MAT",
            status: "ACTIVE",
        });
        const test = await officialTestModel.create({
            subjectId: subject._id,
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(teacher.id),
            title: "Mini-teste publicado",
            status: "PUBLISHED",
            questions: [
                {
                    statement: "Quanto é 1 + 1?",
                    options: ["1", "2", "3", "4"],
                    correctOptionIndex: 1,
                },
            ],
            submissionFenceVersion: 0,
        });
        const room = await guidedRoomModel.create({
            classId: schoolClass._id,
            subjectId: subject._id,
            teacherId: new Types.ObjectId(teacher.id),
            title: "Sala guiada ativa",
            description: "Preparação para o mini-teste publicado.",
            materialIds: [],
            officialTestId: test._id,
            aiEnabled: false,
            status: "OPEN",
        });
        return { schoolClass, subject, room, test };
    }
});
