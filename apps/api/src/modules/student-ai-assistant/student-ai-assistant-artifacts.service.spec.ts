/** Testes de autorização, idempotência e minimização da fachada de artefactos. */
import { ConflictException } from "@nestjs/common";
import { Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudentAiAssistantArtifactsService } from "./student-ai-assistant-artifacts.service.js";

const studentId = "507f1f77bcf86cd799439014";
const conversationId = "507f1f77bcf86cd799439015";
const areaId = "507f1f77bcf86cd799439016";
const artifactId = "507f1f77bcf86cd799439017";
const requestKey = "550e8400-e29b-41d4-a716-446655440000";
const actor: AuthenticatedUser = {
    id: studentId,
    role: "STUDENT",
    email: "aluno@example.test",
};

describe("StudentAiAssistantArtifactsService", () => {
    it("aceita uma disciplina e deriva o destino no servidor", async () => {
        const setup = makeService({
            contextKind: "SUBJECT",
            artifactFindOne: [null, artifact("SUBJECT")],
        });
        await expect(
            setup.service.generate(
                actor,
                conversationId,
                { type: "SUMMARY" },
                requestKey,
            ),
        ).resolves.toMatchObject({
            status: "DONE",
            artifact: {
                id: artifactId,
                target: { kind: "SUBJECT", id: areaId },
            },
        });
        expect(
            setup.summariesService.generateSummaryFromAssistantSnapshot,
        ).toHaveBeenCalledWith(
            expect.objectContaining({ target: { kind: "SUBJECT", id: areaId, label: "Bases de Dados" } }),
            expect.any(String),
        );
    });

    it("rejeita topic em SUMMARY sem o ignorar", async () => {
        const setup = makeService();
        await expect(
            setup.service.generate(
                actor,
                conversationId,
                { type: "SUMMARY", topic: "SQL" },
                requestKey,
            ),
        ).rejects.toMatchObject({
            response: { code: "ASSISTANT_ARTIFACT_TOPIC_NOT_ALLOWED" },
        });
    });

    it("reutiliza um artefacto idempotente antes de adquirir lease ou quota", async () => {
        const existing = artifact();
        const setup = makeService({ artifactFindOne: [existing] });
        await expect(
            setup.service.generate(
                actor,
                conversationId,
                { type: "EXPLANATION", topic: "SQL" },
                requestKey,
            ),
        ).resolves.toMatchObject({
            status: "DONE",
            artifact: { id: artifactId, type: "EXPLANATION" },
        });
        expect(setup.conversationModel.findOneAndUpdate).not.toHaveBeenCalled();
        expect(
            setup.studyToolsService.generateStudyToolFromAssistantSnapshot,
        ).not.toHaveBeenCalled();
    });

    it("delega a explicação no serviço existente e promove o draft só após persistir", async () => {
        const created = artifact();
        const setup = makeService({ artifactFindOne: [null, created] });
        await expect(
            setup.service.generate(
                actor,
                conversationId,
                { type: "EXPLANATION", topic: "normalização" },
                requestKey,
            ),
        ).resolves.toMatchObject({
            status: "DONE",
            artifact: {
                id: artifactId,
                targetPath: `/app/estudar/materiais/${artifactId}`,
            },
        });
        expect(
            setup.studyToolsService.generateStudyToolFromAssistantSnapshot,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: studentId,
                conversationId,
                target: { kind: "STUDY_AREA", id: areaId, label: "Bases de Dados" },
            }),
            { type: "EXPLANATION", topic: "normalização" },
            expect.any(String),
        );
        expect(setup.conversationModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({ _id: new Types.ObjectId(conversationId) }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "ACTIVE" }),
                $unset: { draftExpiresAt: 1 },
            }),
        );
        expect(JSON.stringify(setup.auditLogService.record.mock.calls)).not.toContain(
            "normalização",
        );
    });

    it("mantém o arquivo acessível mas remove o link para o contexto terminado", async () => {
        const setup = makeService({ artifacts: [artifact()], hasAccess: false });
        const result = await setup.service.list(actor, conversationId, {});
        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toMatchObject({ id: artifactId });
        expect(result.items[0]).toMatchObject({
            targetPath: `/app/estudar/materiais/${artifactId}`,
            target: { state: "READ_ONLY_ARCHIVED" },
        });
        expect(result.items[0].target).not.toHaveProperty("contextPath");
    });

    it("devolve erro controlado quando outra geração detém a lease", async () => {
        const setup = makeService({ artifactFindOne: [null], lease: null });
        await expect(
            setup.service.generate(
                actor,
                conversationId,
                { type: "FLASHCARDS" },
                requestKey,
            ),
        ).rejects.toBeInstanceOf(ConflictException);
    });
});

function makeService(options: {
    contextKind?: "SUBJECT" | "STUDY_AREA";
    artifactFindOne?: Array<Record<string, unknown> | null>;
    artifacts?: Array<Record<string, unknown>>;
    hasAccess?: boolean;
    lease?: Record<string, unknown> | null;
} = {}) {
    const conversation = {
        _id: new Types.ObjectId(conversationId),
        studentId: new Types.ObjectId(studentId),
        contextKind: options.contextKind ?? "STUDY_AREA",
        contextId: new Types.ObjectId(areaId),
        contextLabelSnapshot: "Bases de Dados",
        title: "Nova conversa",
        status: "DRAFT",
        origin: "NATIVE",
        readOnly: false,
        createdAt: new Date("2026-07-12T12:00:00.000Z"),
    };
    const artifactFindOne = [...(options.artifactFindOne ?? [])];
    const conversationModel = {
        findOne: jest.fn().mockReturnValue(query(conversation)),
        findOneAndUpdate: jest.fn().mockResolvedValue(
            options.lease === undefined ? conversation : options.lease,
        ),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        exists: jest.fn().mockResolvedValue(null),
    };
    const artifactModel = {
        findOne: jest.fn().mockImplementation(() =>
            query(artifactFindOne.length ? artifactFindOne.shift() : null),
        ),
        find: jest.fn().mockReturnValue(listQuery(options.artifacts ?? [])),
        countDocuments: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    };
    const contextResolver = {
        resolve: jest.fn().mockResolvedValue({
            kind: "STUDY_AREA",
            id: areaId,
            label: "Bases de Dados",
            canAsk: true,
            targetPath: `/app/areas/${areaId}`,
        }),
        hasCurrentAccess: jest.fn().mockResolvedValue(options.hasAccess ?? true),
    };
    const targetKind = options.contextKind === "SUBJECT" ? "SUBJECT" : "STUDY_AREA";
    const artifactContext = {
        setup: jest.fn(),
        listTargets: jest.fn(),
        prepareSnapshot: jest.fn().mockResolvedValue({
            userId: studentId,
            conversationId,
            sourceContextKind: options.contextKind ?? "STUDY_AREA",
            sourceContextId: areaId,
            contextLabel: "Bases de Dados",
            target: { kind: targetKind, id: areaId, label: "Bases de Dados" },
            sources: [],
            candidateSourceCount: 0,
            conversationTurns: [],
            snapshotAt: new Date("2026-07-12T12:15:00.000Z"),
            snapshotTurnCount: 0,
            groundingMode: "CHAT_ONLY",
            snapshotDigest: "digest",
        }),
        resolveTargetAccess: jest.fn().mockResolvedValue({
            active: options.hasAccess ?? true,
            label: "Bases de Dados",
            ...(options.hasAccess === false
                ? {}
                : { targetPath: `/app/areas/${areaId}` }),
        }),
    };
    const summariesService = {
        generateSummaryFromAssistantSnapshot: jest
            .fn()
            .mockResolvedValue({ _id: artifactId }),
    };
    const studyToolsService = {
        generateStudyToolFromAssistantSnapshot: jest
            .fn()
            .mockResolvedValue({ _id: artifactId }),
    };
    const quizJobsService = {
        findAssistantQuizJobByRequestKey: jest.fn().mockResolvedValue(null),
        listAssistantQuizJobs: jest.fn().mockResolvedValue([]),
        createQuizJobForAssistantSnapshot: jest.fn(),
        findAssistantQuizJob: jest.fn(),
        detachAssistantConversation: jest.fn(),
    };
    const auditLogService = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new StudentAiAssistantArtifactsService(
        conversationModel as never,
        artifactModel as never,
        contextResolver as never,
        artifactContext as never,
        summariesService as never,
        studyToolsService as never,
        quizJobsService as never,
        auditLogService as never,
    );
    return {
        service,
        conversationModel,
        artifactModel,
        summariesService,
        studyToolsService,
        quizJobsService,
        auditLogService,
    };
}

function artifact(targetKind: "STUDY_AREA" | "SUBJECT" = "STUDY_AREA") {
    return {
        _id: new Types.ObjectId(artifactId),
        userId: new Types.ObjectId(studentId),
        studyAreaId: new Types.ObjectId(areaId),
        targetKind,
        targetId: new Types.ObjectId(areaId),
        targetLabelSnapshot: "Bases de Dados",
        assistantConversationId: new Types.ObjectId(conversationId),
        type: "EXPLANATION" as const,
        contentJson: { title: "Normalização de dados" },
        sourcesJson: [{ materialId: "private", title: "Guia" }],
        createdAt: new Date("2026-07-12T12:30:00.000Z"),
    };
}

function query<T>(value: T) {
    return { lean: jest.fn().mockResolvedValue(value) };
}

function listQuery<T>(value: T[]) {
    const chain = {
        sort: jest.fn(),
        limit: jest.fn(),
        lean: jest.fn().mockResolvedValue(value),
    };
    chain.sort.mockReturnValue(chain);
    chain.limit.mockReturnValue(chain);
    return chain;
}
