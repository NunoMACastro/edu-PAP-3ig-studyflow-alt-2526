/**
 * Integração de revogação de sessão com MongoDB, store Redis E2E e sockets
 * Socket.IO reais. O servidor escuta exclusivamente em loopback.
 */
import type { INestApplication } from "@nestjs/common";
import { MongooseModule, getConnectionToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import type { Connection, Model } from "mongoose";
import { io, type Socket } from "socket.io-client";
import { SessionService, SESSION_COOKIE_NAME } from "../auth/session.service.js";
import { User, type UserDocument } from "../auth/schemas/user.schema.js";
import {
    SchoolClass,
    type SchoolClassDocument,
} from "../classes/schemas/school-class.schema.js";
import { Subject, type SubjectDocument } from "../subjects/schemas/subject.schema.js";
import { TeacherStudentChatModule } from "./teacher-student-chat.module.js";

jest.setTimeout(120_000);

const ALLOWED_ORIGIN = "http://127.0.0.1:5173";

type ChatAck =
    | { ok: true; subjectId?: string; message?: { text?: string } }
    | { ok: false; error: { code: string; message: string } };

describe("TeacherStudentChatGateway — sessão real revogável", () => {
    let replicaSet: MongoMemoryReplSet;
    let app: INestApplication;
    let connection: Connection;
    let sessionService: SessionService;
    let userModel: Model<UserDocument>;
    let classModel: Model<SchoolClassDocument>;
    let subjectModel: Model<SubjectDocument>;
    let socketBaseUrl: string;
    const sockets = new Set<Socket>();
    const previousEnvironment = {
        nodeEnv: process.env.NODE_ENV,
        e2eMode: process.env.STUDYFLOW_E2E_MODE,
        inMemoryRedis: process.env.STUDYFLOW_E2E_IN_MEMORY_REDIS,
    };

    beforeAll(async () => {
        process.env.NODE_ENV = "test";
        process.env.STUDYFLOW_E2E_MODE = "true";
        process.env.STUDYFLOW_E2E_IN_MEMORY_REDIS = "true";
        replicaSet = await MongoMemoryReplSet.create({
            replSet: {
                count: 1,
                name: "studyflow-session-socket-rs",
                storageEngine: "wiredTiger",
            },
        });
        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(
                    replicaSet.getUri("studyflow_session_socket"),
                ),
                TeacherStudentChatModule,
            ],
        }).compile();
        app = moduleRef.createNestApplication();
        await app.listen(0, "127.0.0.1");
        const address = app.getHttpServer().address() as AddressInfo;
        socketBaseUrl = `http://127.0.0.1:${address.port}/subject-chat`;
        connection = app.get<Connection>(getConnectionToken());
        sessionService = app.get(SessionService);
        userModel = connection.model(User.name) as Model<UserDocument>;
        classModel = connection.model(
            SchoolClass.name,
        ) as Model<SchoolClassDocument>;
        subjectModel = connection.model(Subject.name) as Model<SubjectDocument>;
        await Promise.all(
            Object.values(connection.models).map((model) => model.createIndexes()),
        );
    });

    afterAll(async () => {
        for (const socket of sockets) socket.disconnect();
        await app?.close();
        await replicaSet?.stop();
        restoreEnvironment("NODE_ENV", previousEnvironment.nodeEnv);
        restoreEnvironment("STUDYFLOW_E2E_MODE", previousEnvironment.e2eMode);
        restoreEnvironment(
            "STUDYFLOW_E2E_IN_MEMORY_REDIS",
            previousEnvironment.inMemoryRedis,
        );
    });

    beforeEach(async () => {
        for (const socket of sockets) socket.disconnect();
        sockets.clear();
        await connection.dropDatabase();
        await Promise.all(
            Object.values(connection.models).map((model) => model.createIndexes()),
        );
    });

    it("revoga duas sessões e recusa novos eventos em ambas", async () => {
        const fixture = await seedChatFixture();
        const firstSession = await sessionService.createSession(fixture.student);
        const secondSession = await sessionService.createSession(fixture.student);
        const firstSocket = await connectSocket(firstSession);
        const secondSocket = await connectSocket(secondSession);

        await expect(
            emitAck(firstSocket, "subject-chat:join", {
                subjectId: fixture.subjectId,
            }),
        ).resolves.toMatchObject({ ok: true, subjectId: fixture.subjectId });
        await expect(
            emitAck(secondSocket, "subject-chat:join", {
                subjectId: fixture.subjectId,
            }),
        ).resolves.toMatchObject({ ok: true, subjectId: fixture.subjectId });

        await userModel.updateOne(
            { _id: fixture.student.id },
            { $inc: { sessionVersion: 1 } },
        );

        const firstError = waitForEvent<{ code: string }>(
            firstSocket,
            "subject-chat:error",
        );
        firstSocket.emit("subject-chat:send", {
            subjectId: fixture.subjectId,
            text: "Mensagem que não pode ser persistida.",
            clientMessageId: randomUUID(),
        });
        await expect(firstError).resolves.toMatchObject({
            code: "SESSION_REVOKED",
        });

        const secondError = waitForEvent<{ code: string }>(
            secondSocket,
            "subject-chat:error",
        );
        secondSocket.emit("subject-chat:join", {
            subjectId: fixture.subjectId,
        });
        await expect(secondError).resolves.toMatchObject({
            code: "SESSION_REVOKED",
        });
        await expect(sessionService.requireSession(secondSession)).rejects.toMatchObject(
            // O evento anterior detetou a divergência, devolveu
            // SESSION_REVOKED e eliminou imediatamente a chave opaca.
            { response: { code: "UNAUTHENTICATED" } },
        );

        expect(
            await connection
                .collection("teacher_student_chat_messages")
                .countDocuments(),
        ).toBe(0);
    });

    it("remove uma socket passiva revogada antes do broadcast válido", async () => {
        const fixture = await seedChatFixture();
        const studentSession = await sessionService.createSession(fixture.student);
        const teacherSession = await sessionService.createSession(fixture.teacher);
        const studentSocket = await connectSocket(studentSession);
        const teacherSocket = await connectSocket(teacherSession);

        await emitAck(studentSocket, "subject-chat:join", {
            subjectId: fixture.subjectId,
        });
        await emitAck(teacherSocket, "subject-chat:join", {
            subjectId: fixture.subjectId,
        });
        await userModel.updateOne(
            { _id: fixture.student.id },
            { $set: { accountStatus: "DELETED" }, $inc: { sessionVersion: 1 } },
        );

        const passiveError = waitForEvent<{ code: string }>(
            studentSocket,
            "subject-chat:error",
        );
        const receivedMessages: unknown[] = [];
        studentSocket.on("subject-chat:message", (message) => {
            receivedMessages.push(message);
        });
        const teacherAck = await emitAck(teacherSocket, "subject-chat:send", {
            subjectId: fixture.subjectId,
            text: "Mensagem válida do professor.",
            clientMessageId: randomUUID(),
        });

        expect(teacherAck).toMatchObject({
            ok: true,
            message: { text: "Mensagem válida do professor." },
        });
        await expect(passiveError).resolves.toMatchObject({
            code: "SESSION_REVOKED",
        });
        expect(receivedMessages).toEqual([]);
        expect(
            await connection
                .collection("teacher_student_chat_messages")
                .countDocuments(),
        ).toBe(1);
    });

    /** Cria professor, aluno, turma e disciplina com relações reais. */
    async function seedChatFixture() {
        const [teacher, student] = await userModel.create([
            {
                email: `teacher-${randomUUID()}@example.test`,
                passwordHash: "integration-only",
                role: "TEACHER",
                authProvider: "local",
                accountStatus: "ACTIVE",
                sessionVersion: 0,
                roleInvariantVersion: 0,
            },
            {
                email: `student-${randomUUID()}@example.test`,
                passwordHash: "integration-only",
                role: "STUDENT",
                authProvider: "local",
                accountStatus: "ACTIVE",
                sessionVersion: 0,
                roleInvariantVersion: 0,
            },
        ]);
        const schoolClass = await classModel.create({
            teacherId: teacher._id,
            name: "Turma Integração",
            code: `INT-${randomUUID().slice(0, 8)}`,
            schoolYear: "2025/2026",
            studentIds: [student._id],
        });
        const subject = await subjectModel.create({
            classId: schoolClass._id,
            teacherId: teacher._id,
            name: "Sistemas Seguros",
            code: `SEG-${randomUUID().slice(0, 8)}`,
        });
        return {
            teacher: {
                id: teacher.id,
                email: teacher.email,
                role: "TEACHER" as const,
            },
            student: {
                id: student.id,
                email: student.email,
                role: "STUDENT" as const,
            },
            subjectId: subject.id,
        };
    }

    /** Liga um cliente Node real ao namespace protegido por cookie/origin. */
    async function connectSocket(sessionId: string): Promise<Socket> {
        const socket = io(socketBaseUrl, {
            autoConnect: false,
            forceNew: true,
            reconnection: false,
            transports: ["websocket"],
            extraHeaders: {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionId}`,
                Origin: ALLOWED_ORIGIN,
            },
        });
        sockets.add(socket);
        const connected = waitForEvent(socket, "connect");
        socket.connect();
        await connected;
        return socket;
    }
});

/** Emite um evento com timeout e devolve o ack do gateway. */
function emitAck(
    socket: Socket,
    event: string,
    payload: Record<string, unknown>,
): Promise<ChatAck> {
    return new Promise((resolve, reject) => {
        socket.timeout(5_000).emit(
            event,
            payload,
            (error: Error | null, ack: ChatAck | undefined) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!ack) {
                    reject(new Error(`Ack em falta para ${event}.`));
                    return;
                }
                resolve(ack);
            },
        );
    });
}

/** Aguarda um único evento sem deixar listeners ou timers pendurados. */
function waitForEvent<T = void>(socket: Socket, event: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off(event, onEvent);
            reject(new Error(`Timeout à espera de ${event}.`));
        }, 5_000);
        timer.unref();
        const onEvent = (payload: T) => {
            clearTimeout(timer);
            resolve(payload);
        };
        socket.once(event, onEvent);
    });
}

/** Restaura uma variável global alterada apenas pela fixture. */
function restoreEnvironment(name: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
}
