import { Types } from "mongoose";
import { StudentAiAssistantService } from "./student-ai-assistant.service.js";

const student = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT" as const,
};
const conversationId = new Types.ObjectId();
const contextId = new Types.ObjectId();

describe("StudentAiAssistantService", () => {
    it("não confirma a existência de uma conversa de outro aluno", async () => {
        const fixture = makeFixture(null);
        await expect(fixture.service.get(student, String(conversationId))).rejects.toMatchObject({
            response: { code: "ASSISTANT_CONVERSATION_NOT_FOUND" },
        });
        expect(fixture.audit.record).toHaveBeenCalledWith(expect.objectContaining({
            action: "STUDENT_AI_CONVERSATION_ACCESS_DENIED",
            result: "DENIED",
        }));
    });

    it("torna o histórico read-only e remove links quando o acesso terminou", async () => {
        const fixture = makeFixture(conversation());
        fixture.contextResolver.resolve.mockRejectedValue(new Error("membership revoked"));

        await expect(fixture.service.get(student, String(conversationId))).resolves.toMatchObject({
            readOnly: true,
            readOnlyReason: "ACCESS_REVOKED",
            context: {
                access: "REVOKED",
                label: "Bases de Dados",
            },
        });
        const result = await fixture.service.get(student, String(conversationId));
        expect(result.context).not.toHaveProperty("targetPath");
    });

    it("atualiza apenas título e estado sem aceitar mudança de contexto", async () => {
        const fixture = makeFixture(conversation());
        const updated = document({ ...conversation(), title: "Novo título" });
        fixture.conversationModel.findOneAndUpdate.mockResolvedValue(updated);

        await fixture.service.update(student, String(conversationId), {
            title: " Novo título ",
            contextId: String(new Types.ObjectId()),
        } as never);

        expect(fixture.conversationModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.anything(),
            { $set: { title: "Novo título" } },
            expect.anything(),
        );
    });

    it("rejeita duas respostas concorrentes na mesma conversa", async () => {
        const fixture = makeFixture(conversation());
        fixture.contextResolver.resolve.mockResolvedValue({
            kind: "SUBJECT",
            id: String(contextId),
            label: "Bases de Dados",
            consentPurpose: "CLASS_AI",
            targetPath: `/app/disciplinas/${contextId}`,
            canAsk: true,
        });
        fixture.conversationModel.findOneAndUpdate.mockResolvedValue(null);

        await expect(
            fixture.service.ask(student, String(conversationId), { question: "Explica normalização." }),
        ).rejects.toMatchObject({
            response: { code: "ASSISTANT_REPLY_IN_PROGRESS" },
        });
    });
});

function makeFixture(row: ReturnType<typeof conversation> | null) {
    const conversationModel = {
        findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(row) }),
        findOneAndUpdate: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        create: jest.fn(),
        find: jest.fn(),
    };
    const emptyModel = {
        find: jest.fn(),
        findOne: jest.fn(),
        deleteMany: jest.fn(),
        countDocuments: jest.fn(),
        distinct: jest.fn(),
    };
    const contextResolver = {
        hasCurrentAccess: jest.fn().mockResolvedValue(true),
        resolve: jest.fn().mockResolvedValue({
            kind: "SUBJECT",
            id: String(contextId),
            label: "Bases de Dados",
            consentPurpose: "CLASS_AI",
            targetPath: `/app/disciplinas/${contextId}`,
            canAsk: true,
        }),
        listCurrentContextMap: jest.fn(),
        contextKey: jest.fn((kind: string, id: string) => `${kind}:${id}`),
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new StudentAiAssistantService(
        conversationModel as never,
        emptyModel as never,
        emptyModel as never,
        emptyModel as never,
        emptyModel as never,
        emptyModel as never,
        contextResolver as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        audit as never,
    );
    return { service, conversationModel, contextResolver, audit };
}

function conversation() {
    return {
        _id: conversationId,
        studentId: new Types.ObjectId(student.id),
        contextKind: "SUBJECT" as const,
        contextId,
        contextLabelSnapshot: "Bases de Dados",
        contextSecondaryLabelSnapshot: "12.º GPSI",
        title: "Normalização",
        status: "ACTIVE" as const,
        origin: "NATIVE" as const,
        readOnly: false,
        lastMessageAt: new Date("2026-07-12T10:00:00.000Z"),
        createdAt: new Date("2026-07-12T09:00:00.000Z"),
    };
}

function document(value: ReturnType<typeof conversation>) {
    return { ...value, toObject: () => value };
}
