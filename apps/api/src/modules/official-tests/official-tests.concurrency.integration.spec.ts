/**
 * Prova os invariantes concorrentes dos mini-testes num MongoDB replica set real.
 *
 * Estes testes não usam a base configurada no `.env` nem abrem portas HTTP. O
 * replica set em memória é necessário porque o contrato depende de transações,
 * write conflicts e índices únicos reais, que mocks unitários não conseguem
 * demonstrar.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createConnection, Types, type Connection, type Model } from "mongoose";
import { OfficialTestsService } from "./official-tests.service.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "./schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestSchema,
} from "./schemas/official-test.schema.js";

jest.setTimeout(90_000);

const student = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno.concorrencia@example.test",
    role: "STUDENT" as const,
};
const teacher = {
    id: "507f1f77bcf86cd799439013",
    email: "professor.concorrencia@example.test",
    role: "TEACHER" as const,
};
const subjectId = "507f1f77bcf86cd799439014";
const classId = "507f1f77bcf86cd799439015";

describe("OfficialTestsService — invariantes concorrentes", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;
    let testModel: Model<OfficialTest>;
    let attemptModel: Model<OfficialTestAttempt>;
    let service: OfficialTestsService;

    beforeAll(async () => {
        replicaSet = await MongoMemoryReplSet.create({
            replSet: {
                count: 1,
                name: "studyflow-official-tests-rs",
                storageEngine: "wiredTiger",
            },
        });
        connection = await createConnection(
            replicaSet.getUri("studyflow_official_tests_concurrency"),
        ).asPromise();
        testModel = connection.model(OfficialTest.name, OfficialTestSchema);
        attemptModel = connection.model(
            OfficialTestAttempt.name,
            OfficialTestAttemptSchema,
        );
        await Promise.all([testModel.createIndexes(), attemptModel.createIndexes()]);

        const subjectsService = {
            findOwnedSubject: jest.fn().mockResolvedValue({
                _id: subjectId,
                classId,
            }),
            findSubjectForStudent: jest.fn().mockResolvedValue({
                subject: { _id: subjectId, classId },
                schoolClass: { _id: classId },
            }),
        };
        service = new OfficialTestsService(
            testModel as never,
            attemptModel as never,
            subjectsService as never,
            connection,
        );
    });

    afterAll(async () => {
        await connection?.close();
        await replicaSet?.stop();
    });

    beforeEach(async () => {
        await Promise.all([testModel.deleteMany({}), attemptModel.deleteMany({})]);
    });

    it("lineariza CLOSED contra uma submissão e só aceita o lado que venceu", async () => {
        const test = await createPublishedTest();
        const attemptKey = "10000000-0000-4000-8000-000000000001";

        const [submission, closing] = await Promise.allSettled([
            service.submitAttempt(student, subjectId, String(test._id), {
                attemptKey,
                selectedOptionIndexes: [1],
            }),
            service.changeStatus(teacher, subjectId, String(test._id), {
                status: "CLOSED",
            }),
        ]);

        expect(closing.status).toBe("fulfilled");
        await expect(testModel.findById(test._id).lean()).resolves.toMatchObject({
            status: "CLOSED",
        });

        const persistedAttempts = await attemptModel
            .find({ testId: test._id, studentId: new Types.ObjectId(student.id) })
            .lean();
        expect(persistedAttempts).toHaveLength(
            submission.status === "fulfilled" ? 1 : 0,
        );

        if (submission.status === "fulfilled") {
            // O commit da tentativa venceu; um retry posterior a CLOSED recupera
            // exatamente o mesmo resultado e observa agora a solução desbloqueada.
            await expect(
                service.submitAttempt(student, subjectId, String(test._id), {
                    attemptKey,
                    selectedOptionIndexes: [0],
                }),
            ).resolves.toMatchObject({
                _id: submission.value._id,
                attemptNumber: 1,
                selectedOptionIndexes: [1],
                solutionUnlocked: true,
            });
        } else {
            // CLOSED venceu: a transação não pode deixar uma tentativa órfã.
            expect(submission.reason).toMatchObject({
                response: expect.objectContaining({
                    code: "OFFICIAL_TEST_NOT_FOUND",
                }),
            });
        }
    });

    it("aceita exatamente três de quatro submissões concorrentes", async () => {
        const test = await createPublishedTest();
        const attemptKeys = [
            "20000000-0000-4000-8000-000000000001",
            "20000000-0000-4000-8000-000000000002",
            "20000000-0000-4000-8000-000000000003",
            "20000000-0000-4000-8000-000000000004",
        ];
        const outcomes = await Promise.allSettled(
            attemptKeys.map((attemptKey) =>
                service.submitAttempt(student, subjectId, String(test._id), {
                    attemptKey,
                    selectedOptionIndexes: [1],
                }),
            ),
        );

        const fulfilled = outcomes.filter(
            (outcome): outcome is PromiseFulfilledResult<
                Awaited<ReturnType<OfficialTestsService["submitAttempt"]>>
            > => outcome.status === "fulfilled",
        );
        const rejected = outcomes.filter(
            (outcome): outcome is PromiseRejectedResult =>
                outcome.status === "rejected",
        );
        expect(fulfilled).toHaveLength(3);
        expect(rejected).toHaveLength(1);
        expect(rejected[0]?.reason).toMatchObject({
            response: expect.objectContaining({
                code: "OFFICIAL_TEST_ATTEMPT_LIMIT_REACHED",
            }),
        });

        const persisted = await attemptModel
            .find({ testId: test._id, studentId: new Types.ObjectId(student.id) })
            .sort({ attemptNumber: 1 })
            .lean();
        expect(persisted.map((attempt) => attempt.attemptNumber)).toEqual([1, 2, 3]);
        expect(new Set(persisted.map((attempt) => attempt.attemptKey)).size).toBe(3);

        // Depois de o total chegar a três, até o retry da primeira tentativa
        // deve usar o total atual, não apenas o seu attemptNumber histórico.
        const firstPersisted = persisted[0];
        expect(firstPersisted).toBeDefined();
        await expect(
            service.submitAttempt(student, subjectId, String(test._id), {
                attemptKey: firstPersisted!.attemptKey,
                selectedOptionIndexes: [0],
            }),
        ).resolves.toMatchObject({
            _id: String(firstPersisted!._id),
            attemptNumber: 1,
            selectedOptionIndexes: [1],
            solutionUnlocked: true,
        });
        await expect(attemptModel.countDocuments({ testId: test._id })).resolves.toBe(3);

        const attemptsView = await service.listMyAttempts(
            student,
            subjectId,
            String(test._id),
        );
        expect(attemptsView).toHaveLength(3);
        expect(attemptsView.every((attempt) => attempt.solutionUnlocked)).toBe(true);
    });

    /** Cria o estado publicado comum aos cenários sem depender de endpoints HTTP. */
    async function createPublishedTest() {
        return testModel.create({
            subjectId: new Types.ObjectId(subjectId),
            classId: new Types.ObjectId(classId),
            teacherId: new Types.ObjectId(teacher.id),
            title: "Mini-teste concorrente",
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
    }
});
