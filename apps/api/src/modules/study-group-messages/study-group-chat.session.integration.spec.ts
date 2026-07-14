/**
 * Integração real do chat de grupo com Mongo replica set, store de sessão E2E
 * e dois clientes Socket.IO ligados exclusivamente em loopback.
 */
import type { INestApplication } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import type { Connection, Model } from "mongoose";
import { io, type Socket } from "socket.io-client";
import { User, type UserDocument } from "../auth/schemas/user.schema.js";
import { SESSION_COOKIE_NAME, SessionService } from "../auth/session.service.js";
import { StudentProfile, type StudentProfileDocument } from "../students/schemas/student-profile.schema.js";
import { StudyRoom, type StudyRoomDocument } from "../study-rooms/schemas/study-room.schema.js";
import { StudyGroupMessagesModule } from "./study-group-messages.module.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

jest.setTimeout(120_000);
const ALLOWED_ORIGIN = "http://127.0.0.1:5173";

type ChatAck =
    | { ok: true; groupId?: string; message?: { _id: string; text?: string; authorDisplayName?: string } }
    | { ok: false; error: { code: string; message: string } };

describe("StudyGroupChatGateway — integração real", () => {
    let replicaSet: MongoMemoryReplSet;
    let app: INestApplication;
    let connection: Connection;
    let sessionService: SessionService;
    let userModel: Model<UserDocument>;
    let roomModel: Model<StudyRoomDocument>;
    let profileModel: Model<StudentProfileDocument>;
    let messagesService: StudyGroupMessagesService;
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
            replSet: { count: 1, name: "studyflow-group-chat-rs", storageEngine: "wiredTiger" },
        });
        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(replicaSet.getUri("studyflow_group_chat")),
                StudyGroupMessagesModule,
            ],
        }).compile();
        app = moduleRef.createNestApplication();
        await app.listen(0, "127.0.0.1");
        const address = app.getHttpServer().address() as AddressInfo;
        socketBaseUrl = `http://127.0.0.1:${address.port}/study-group-chat`;
        connection = app.get<Connection>(getConnectionToken());
        sessionService = app.get(SessionService);
        userModel = connection.model(User.name) as Model<UserDocument>;
        roomModel = connection.model(StudyRoom.name) as Model<StudyRoomDocument>;
        profileModel = connection.model(StudentProfile.name) as Model<StudentProfileDocument>;
        messagesService = app.get(StudyGroupMessagesService);
        await Promise.all(Object.values(connection.models).map((model) => model.createIndexes()));
    });

    afterAll(async () => {
        for (const socket of sockets) socket.disconnect();
        await app?.close();
        await replicaSet?.stop();
        restoreEnvironment("NODE_ENV", previousEnvironment.nodeEnv);
        restoreEnvironment("STUDYFLOW_E2E_MODE", previousEnvironment.e2eMode);
        restoreEnvironment("STUDYFLOW_E2E_IN_MEMORY_REDIS", previousEnvironment.inMemoryRedis);
    });

    beforeEach(async () => {
        for (const socket of sockets) socket.disconnect();
        sockets.clear();
        await connection.dropDatabase();
        await Promise.all(Object.values(connection.models).map((model) => model.createIndexes()));
    });

    it("entrega entre dois membros, resolve nomes e não duplica retries", async () => {
        const fixture = await seedFixture();
        const ownerSocket = await connectSocket(await sessionService.createSession(fixture.owner));
        const memberSocket = await connectSocket(await sessionService.createSession(fixture.member));
        const outsiderSocket = await connectSocket(await sessionService.createSession(fixture.outsider));
        await expect(emitAck(ownerSocket, "study-group-chat:join", { groupId: fixture.groupId }))
            .resolves.toMatchObject({ ok: true, groupId: fixture.groupId });
        await expect(emitAck(memberSocket, "study-group-chat:join", { groupId: fixture.groupId }))
            .resolves.toMatchObject({ ok: true, groupId: fixture.groupId });
        await expect(emitAck(outsiderSocket, "study-group-chat:join", { groupId: fixture.groupId }))
            .resolves.toMatchObject({ ok: false });
        const otherGroup = await roomModel.create({
            ownerStudentId: fixture.outsider.id,
            name: "Outro grupo",
            type: "FREE",
            memberIds: [fixture.outsider.id],
            collaborationKind: "STUDY_GROUP",
            collaborationKindSource: "NATIVE",
        });
        await expect(emitAck(outsiderSocket, "study-group-chat:join", { groupId: otherGroup.id }))
            .resolves.toMatchObject({ ok: true, groupId: otherGroup.id });
        const crossGroupMessages: unknown[] = [];
        outsiderSocket.on("study-group-chat:message", (message) => crossGroupMessages.push(message));

        const clientMessageId = randomUUID();
        const liveMessage = waitForEvent<{ _id: string; text: string; authorDisplayName: string }>(
            memberSocket,
            "study-group-chat:message",
        );
        const firstAck = await emitAck(ownerSocket, "study-group-chat:send", {
            groupId: fixture.groupId,
            text: "Mensagem imediata",
            clientMessageId,
        });
        await expect(liveMessage).resolves.toMatchObject({
            text: "Mensagem imediata",
            authorDisplayName: "Leonor Martins",
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(crossGroupMessages).toEqual([]);
        await expect(messagesService.listStudentUnread(fixture.member)).resolves.toEqual([
            expect.objectContaining({ groupId: fixture.groupId, unreadCount: 1 }),
        ]);
        await messagesService.markStudentRead(fixture.member, fixture.groupId);
        await expect(messagesService.listStudentUnread(fixture.member)).resolves.toEqual([]);
        const retryAck = await emitAck(ownerSocket, "study-group-chat:send", {
            groupId: fixture.groupId,
            text: "Mensagem imediata",
            clientMessageId,
        });
        expect(retryAck).toMatchObject({
            ok: true,
            message: { _id: firstAck.ok ? firstAck.message?._id : undefined },
        });
        expect(await connection.collection("studygroupmessages").countDocuments()).toBe(1);
    });

    it("expulsa um membro removido antes do broadcast seguinte", async () => {
        const fixture = await seedFixture();
        const ownerSocket = await connectSocket(await sessionService.createSession(fixture.owner));
        const memberSocket = await connectSocket(await sessionService.createSession(fixture.member));
        await emitAck(ownerSocket, "study-group-chat:join", { groupId: fixture.groupId });
        await emitAck(memberSocket, "study-group-chat:join", { groupId: fixture.groupId });
        await roomModel.updateOne({ _id: fixture.groupId }, { $pull: { memberIds: fixture.member.id } });

        const passiveError = waitForEvent<{ code: string }>(memberSocket, "study-group-chat:error");
        const received: unknown[] = [];
        memberSocket.on("study-group-chat:message", (message) => received.push(message));
        await emitAck(ownerSocket, "study-group-chat:send", {
            groupId: fixture.groupId,
            text: "Apenas membros atuais",
            clientMessageId: randomUUID(),
        });
        await expect(passiveError).resolves.toMatchObject({ code: "ROOM_ACCESS_DENIED" });
        expect(received).toEqual([]);
    });

    /** Cria três alunos, dois perfis e um grupo com membership real. */
    async function seedFixture() {
        const users = await userModel.create([
            studentDocument("owner"),
            studentDocument("member"),
            studentDocument("outsider"),
        ]);
        const [owner, member, outsider] = users;
        await profileModel.create([
            { userId: owner._id, name: "Leonor Martins" },
            { userId: member._id, name: "Inês Silva" },
        ]);
        const room = await roomModel.create({
            ownerStudentId: owner._id,
            name: "Grupo Integração",
            type: "FREE",
            memberIds: [owner._id, member._id],
            collaborationKind: "STUDY_GROUP",
            collaborationKindSource: "NATIVE",
        });
        return {
            owner: publicStudent(owner),
            member: publicStudent(member),
            outsider: publicStudent(outsider),
            groupId: room.id,
        };
    }

    /** Liga uma socket real com cookie HttpOnly simulado e Origin autorizado. */
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

/** Documento de utilizador ativo adequado à sessão E2E. */
function studentDocument(label: string) {
    return {
        email: `${label}-${randomUUID()}@example.test`,
        passwordHash: "integration-only",
        role: "STUDENT",
        authProvider: "local",
        accountStatus: "ACTIVE",
        sessionVersion: 0,
        roleInvariantVersion: 0,
    } as const;
}

/** Reduz um documento real ao contrato público guardado na sessão. */
function publicStudent(user: UserDocument) {
    return { id: user.id, email: user.email, role: "STUDENT" as const };
}

/** Emite um evento com timeout e exige ack explícito. */
function emitAck(socket: Socket, event: string, payload: Record<string, unknown>): Promise<ChatAck> {
    return new Promise((resolve, reject) => {
        socket.timeout(5_000).emit(event, payload, (error: Error | null, ack: ChatAck | undefined) => {
            if (error) return reject(error);
            if (!ack) return reject(new Error(`Ack em falta para ${event}.`));
            resolve(ack);
        });
    });
}

/** Aguarda um único evento e remove listener/timer no final. */
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

/** Restaura uma variável global alterada pela suite. */
function restoreEnvironment(name: string, value: string | undefined): void {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
}
