/** Testes transacionais dos snapshots independentes de conversas colaborativas. */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { ForbiddenException } from "@nestjs/common";
import { createConnection, Types, type Connection, type Model } from "mongoose";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import {
    StudyGroupAiAnswer,
    StudyGroupAiAnswerSchema,
} from "../study-group-ai/schemas/study-group-ai-answer.schema.js";
import {
    RoomAiInteraction,
    RoomAiInteractionSchema,
} from "../study-rooms/schemas/room-ai-interaction.schema.js";
import { StudentAiConversationForksService } from "./student-ai-conversation-forks.service.js";
import {
    StudentAiConversationForkInvitation,
    StudentAiConversationForkInvitationSchema,
} from "./schemas/student-ai-conversation-fork-invitation.schema.js";
import {
    StudentAiConversation,
    StudentAiConversationSchema,
} from "./schemas/student-ai-conversation.schema.js";

jest.setTimeout(120_000);

const sourceId = new Types.ObjectId();
const recipientId = new Types.ObjectId();
const contextId = new Types.ObjectId();
const thirdStudentId = new Types.ObjectId();
const sourceActor = {
    id: String(sourceId),
    email: "origem@example.test",
    role: "STUDENT" as const,
};
const recipientActor = {
    id: String(recipientId),
    email: "destino@example.test",
    role: "STUDENT" as const,
};
const thirdActor = {
    id: String(thirdStudentId),
    email: "terceiro@example.test",
    role: "STUDENT" as const,
};

describe("StudentAiConversationForksService — transação", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;
    let conversationModel: Model<StudentAiConversation>;
    let invitationModel: Model<StudentAiConversationForkInvitation>;
    let groupModel: Model<StudyGroupAiAnswer>;
    let roomModel: Model<RoomAiInteraction>;
    let userModel: Model<User>;
    let service: StudentAiConversationForksService;
    let removedMemberId: string | null;

    beforeAll(async () => {
        replicaSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        connection = await createConnection(replicaSet.getUri("assistant_forks")).asPromise();
        conversationModel = connection.model(
            StudentAiConversation.name,
            StudentAiConversationSchema,
        );
        invitationModel = connection.model(
            StudentAiConversationForkInvitation.name,
            StudentAiConversationForkInvitationSchema,
        );
        groupModel = connection.model(StudyGroupAiAnswer.name, StudyGroupAiAnswerSchema);
        roomModel = connection.model(RoomAiInteraction.name, RoomAiInteractionSchema);
        userModel = connection.model(User.name, UserSchema);
        await Promise.all([
            conversationModel.createIndexes(),
            invitationModel.createIndexes(),
            groupModel.createIndexes(),
            roomModel.createIndexes(),
            userModel.createIndexes(),
        ]);
        await userModel.create([
            activeStudent(sourceId, sourceActor.email),
            activeStudent(recipientId, recipientActor.email),
            activeStudent(thirdStudentId, "terceiro@example.test"),
        ]);
        const ensureMember = jest.fn(async (studentId: string) => {
            if (removedMemberId === studentId) {
                throw new ForbiddenException({ code: "MEMBERSHIP_REQUIRED" });
            }
            return {
                memberIds: [String(sourceId), String(recipientId), String(thirdStudentId)],
            };
        });
        const groupsService = { ensureMember };
        const roomsService = { ensureMember };
        const audit = { record: jest.fn().mockResolvedValue({}) };
        service = new StudentAiConversationForksService(
            connection,
            conversationModel as never,
            invitationModel as never,
            groupModel as never,
            roomModel as never,
            userModel as never,
            groupsService as never,
            roomsService as never,
            audit as never,
        );
    });

    afterAll(async () => {
        await connection.close();
        await replicaSet.stop();
    });

    beforeEach(async () => {
        removedMemberId = null;
        await Promise.all([
            conversationModel.deleteMany({}),
            invitationModel.deleteMany({}),
            groupModel.deleteMany({}),
            roomModel.deleteMany({}),
        ]);
    });

    it("copia apenas o snapshot do grupo e torna o retry idempotente", async () => {
        const source = await createConversation(conversationModel, "STUDY_GROUP");
        const originalTurns = await groupModel.create([
            groupTurn(source._id, "Pergunta 1", "Resposta 1"),
            groupTurn(source._id, "Pergunta 2", "Resposta 2"),
        ]);
        const invitation = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        await groupModel.create(groupTurn(source._id, "Pergunta posterior", "Fora do snapshot"));

        const [firstId, retryId] = await Promise.all([
            service.accept(recipientActor, invitation.id),
            service.accept(recipientActor, invitation.id),
        ]);

        expect(retryId).toBe(firstId);
        const fork = await conversationModel.findById(firstId).lean();
        expect(fork).toMatchObject({
            studentId: recipientId,
            origin: "FORK",
            forkDepth: 1,
            inheritedTurnCount: 2,
        });
        const inherited = await groupModel
            .find({ conversationId: fork!._id, studentId: recipientId })
            .sort({ _id: 1 })
            .lean();
        expect(inherited.map((turn) => turn.question)).toEqual(["Pergunta 1", "Pergunta 2"]);
        expect(inherited.every((turn) => turn.inheritedFromFork)).toBe(true);
        expect(inherited.map((turn) =>
            (turn as unknown as { createdAt?: Date }).createdAt?.getTime())).toEqual(
            originalTurns.map((turn) =>
                (turn as unknown as { createdAt?: Date }).createdAt?.getTime()),
        );
        expect(await groupModel.countDocuments({ conversationId: source._id })).toBe(3);
    });

    it("cria cópia privada de sala sem ativar a retenção legacy por resposta", async () => {
        const source = await createConversation(conversationModel, "STUDY_ROOM");
        await roomModel.create([
            roomTurn(source._id, "Questão A", "Resposta A"),
            roomTurn(source._id, "Questão B", "Resposta B"),
        ]);
        const invitation = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        const forkId = await service.accept(recipientActor, invitation.id);

        const inherited = await roomModel
            .find({ studentId: recipientId })
            .lean();
        expect(inherited).toHaveLength(2);
        expect(inherited.every((turn) => String(turn.conversationId) === forkId)).toBe(true);
        expect(inherited.every((turn) => turn.visibility === "PRIVATE")).toBe(true);
        expect(inherited.every((turn) => turn.inheritedFromFork)).toBe(true);
        expect(inherited.every((turn) => turn.forkedFromInteractionId === undefined)).toBe(true);
    });

    it("faz rollback integral quando a cópia de turnos falha", async () => {
        const source = await createConversation(conversationModel, "STUDY_GROUP");
        await groupModel.create(groupTurn(source._id, "Pergunta", "Resposta"));
        const invitation = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        const insert = jest
            .spyOn(groupModel, "insertMany")
            .mockRejectedValueOnce(new Error("falha injetada"));

        await expect(service.accept(recipientActor, invitation.id)).rejects.toMatchObject({
            response: { code: "ASSISTANT_FORK_TRANSACTION_FAILED" },
        });
        insert.mockRestore();
        expect(await conversationModel.countDocuments({ origin: "FORK" })).toBe(0);
        const pending = await invitationModel.findById(invitation.id).lean();
        expect(pending).toMatchObject({ status: "PENDING" });
        expect(pending).not.toHaveProperty("acceptedConversationId");
    });

    it("lista apenas destinatários ativos do contexto e pagina a pesquisa", async () => {
        const source = await createConversation(conversationModel, "STUDY_GROUP");
        await groupModel.create(groupTurn(source._id, "Pergunta", "Resposta"));

        const first = await service.listRecipients(sourceActor, String(source._id), {
            query: "example.test",
            limit: 1,
        });
        expect(first.items).toHaveLength(1);
        expect(first.items[0].id).not.toBe(String(sourceId));
        expect(first.nextCursor).toBeTruthy();
        const second = await service.listRecipients(sourceActor, String(source._id), {
            query: "example.test",
            limit: 1,
            cursor: first.nextCursor!,
        });
        expect(second.items).toHaveLength(1);
        expect(second.items[0].id).not.toBe(first.items[0].id);

        await userModel.updateOne(
            { _id: thirdStudentId },
            { $set: { accountStatus: "SUSPENDED" } },
        );
        const active = await service.listRecipients(sourceActor, String(source._id), {
            limit: 50,
        });
        expect(active.items.map((item) => item.id)).toEqual([String(recipientId)]);
        await userModel.updateOne(
            { _id: thirdStudentId },
            { $set: { accountStatus: "ACTIVE" } },
        );
    });

    it("materializa expiração e conserva o estado terminal para idempotência", async () => {
        const source = await createConversation(conversationModel, "STUDY_GROUP");
        await groupModel.create(groupTurn(source._id, "Pergunta", "Resposta"));
        const invitation = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        await invitationModel.updateOne(
            { _id: invitation.id },
            { $set: { expiresAt: new Date(Date.now() - 1_000) } },
        );

        await expect(service.accept(recipientActor, invitation.id)).rejects.toMatchObject({
            response: { code: "ASSISTANT_FORK_INVITATION_EXPIRED" },
        });
        const expired = await invitationModel.findById(invitation.id).lean();
        expect(expired).toMatchObject({ status: "EXPIRED" });
        expect(expired?.purgeAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("torna recusa e cancelamento idempotentes durante a retenção terminal", async () => {
        const source = await createConversation(conversationModel, "STUDY_GROUP");
        await groupModel.create(groupTurn(source._id, "Pergunta", "Resposta"));
        const declined = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        await expect(service.decline(recipientActor, declined.id)).resolves.toMatchObject({
            status: "DECLINED",
        });
        await expect(service.decline(recipientActor, declined.id)).resolves.toMatchObject({
            id: declined.id,
            status: "DECLINED",
        });

        const cancelled = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: thirdActor.id,
        });
        await expect(service.cancel(sourceActor, cancelled.id)).resolves.toMatchObject({
            status: "CANCELLED",
        });
        await expect(service.cancel(sourceActor, cancelled.id)).resolves.toMatchObject({
            id: cancelled.id,
            status: "CANCELLED",
        });
    });

    it("não deixa um pendente expirado bloquear um novo convite ao mesmo aluno", async () => {
        const source = await createConversation(conversationModel, "STUDY_ROOM");
        await roomModel.create(roomTurn(source._id, "Pergunta", "Resposta"));
        const expired = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        await invitationModel.updateOne(
            { _id: expired.id },
            { $set: { expiresAt: new Date(Date.now() - 1_000) } },
        );

        const replacement = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        expect(replacement.id).not.toBe(expired.id);
        expect(await invitationModel.findById(expired.id).lean()).toMatchObject({
            status: "EXPIRED",
        });
    });

    it("bloqueia a aceitação se o destinatário deixou o contexto e reverte o claim", async () => {
        const source = await createConversation(conversationModel, "STUDY_ROOM");
        await roomModel.create(roomTurn(source._id, "Pergunta", "Resposta"));
        const invitation = await service.createInvitation(sourceActor, String(source._id), {
            recipientId: String(recipientId),
        });
        removedMemberId = String(recipientId);

        await expect(service.accept(recipientActor, invitation.id)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        expect(await conversationModel.countDocuments({ origin: "FORK" })).toBe(0);
        expect(await invitationModel.findById(invitation.id).lean()).toMatchObject({
            status: "PENDING",
        });
    });

    it("mantém índices únicos pendentes e TTL no gate de integridade", async () => {
        const indexes = await invitationModel.collection.indexes();
        expect(indexes).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: "uniq_pending_conversation_recipient",
                unique: true,
            }),
            expect.objectContaining({
                name: "ttl_terminal_fork_invitations",
                expireAfterSeconds: 0,
            }),
        ]));
    });
});

function activeStudent(id: Types.ObjectId, email: string) {
    return {
        _id: id,
        email,
        passwordHash: "hash",
        role: "STUDENT",
        authProvider: "local",
        accountStatus: "ACTIVE",
        sessionVersion: 0,
        roleInvariantVersion: 0,
    };
}

async function createConversation(
    model: Model<StudentAiConversation>,
    contextKind: "STUDY_GROUP" | "STUDY_ROOM",
) {
    return model.create({
        studentId: sourceId,
        contextKind,
        contextId,
        contextLabelSnapshot: contextKind === "STUDY_GROUP" ? "Grupo" : "Sala",
        title: "Conversa partilhável",
        status: "ACTIVE",
        origin: "NATIVE",
        readOnly: false,
        lastMessageAt: new Date(),
    });
}

function groupTurn(conversationId: Types.ObjectId, question: string, answer: string) {
    return {
        groupId: contextId,
        studentId: sourceId,
        question,
        answer,
        sources: [{ shareId: String(new Types.ObjectId()), title: "Fonte" }],
        conversationId,
        citationSnapshots: [{ label: "Fonte", kind: "GROUP_RESOURCE" }],
    };
}

function roomTurn(conversationId: Types.ObjectId, question: string, answer: string) {
    return {
        roomId: contextId,
        studentId: sourceId,
        question,
        answer,
        sourceShareIds: [new Types.ObjectId()],
        visibility: "PRIVATE",
        conversationId,
        citationSnapshots: [{ label: "Fonte", kind: "ROOM_SHARE" }],
    };
}
