/** Testes das fronteiras de destino, memória e fontes do snapshot de materiais. */
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudentAiArtifactContextService } from "./student-ai-artifact-context.service.js";

const studentId = "507f1f77bcf86cd799439014";
const conversationId = "507f1f77bcf86cd799439015";
const roomId = "507f1f77bcf86cd799439016";
const areaId = "507f1f77bcf86cd799439017";
const actor: AuthenticatedUser = {
    id: studentId,
    role: "STUDENT",
    email: "aluno@example.test",
};

describe("StudentAiArtifactContextService", () => {
    it("congela os últimos seis turnos e prioriza fontes citadas", async () => {
        const setup = makeService();
        const snapshot = await setup.service.prepareSnapshot(
            actor,
            conversation("STUDY_ROOM"),
            "QUIZ",
            { kind: "STUDY_AREA", id: areaId },
        );

        expect(snapshot.conversationTurns).toHaveLength(6);
        expect(snapshot.conversationTurns[0]).toMatchObject({ question: "Pergunta 2" });
        expect(snapshot.conversationTurns[5]).toMatchObject({ question: "Pergunta 7" });
        expect(snapshot.sources).toEqual([
            expect.objectContaining({ materialId: "source-cited" }),
        ]);
        expect(snapshot).toMatchObject({
            target: { kind: "STUDY_AREA", id: areaId, label: "Programação" },
            candidateSourceCount: 2,
            snapshotTurnCount: 6,
            groundingMode: "CHAT_AND_SOURCES",
        });
    });

    it("obriga salas e grupos a escolher um destino", async () => {
        const setup = makeService();
        await expect(
            setup.service.prepareSnapshot(
                actor,
                conversation("STUDY_GROUP"),
                "SUMMARY",
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("deriva uma disciplina no servidor e rejeita um destino enviado pelo browser", async () => {
        const setup = makeService();
        await expect(
            setup.service.prepareSnapshot(
                actor,
                conversation("SUBJECT"),
                "SUMMARY",
                { kind: "CLASS", id: areaId },
            ),
        ).rejects.toMatchObject({
            response: { code: "ASSISTANT_ARTIFACT_TARGET_FIXED" },
        });
    });
});

function makeService() {
    const turns = Array.from({ length: 7 }, (_, index) => ({
        question: `Pergunta ${index + 1}`,
        answer: `Resposta ${index + 1}`,
        sourceShareIds: index === 6 ? ["source-cited"] : [],
    }));
    const emptyModel = { find: jest.fn().mockReturnValue(turnQuery([])) };
    const roomTurnModel = { find: jest.fn().mockReturnValue(turnQuery(turns)) };
    const contextResolver = { resolve: jest.fn().mockResolvedValue({}) };
    const classesService = {
        listStudentClasses: jest.fn().mockResolvedValue([]),
        ensureStudentEnrollment: jest.fn().mockResolvedValue({
            _id: areaId,
            name: "10.º A",
        }),
    };
    const subjectsService = {
        listStudentClassSubjects: jest.fn().mockResolvedValue([]),
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: { _id: roomId, name: "Bases de Dados" },
            schoolClass: { _id: areaId, name: "10.º A" },
        }),
    };
    const studyAreasService = {
        listMyStudyAreas: jest.fn().mockResolvedValue([]),
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: areaId,
            name: "Programação",
        }),
    };
    const roomSharesService = {
        findUsableSharesForRoom: jest.fn().mockResolvedValue([
            {
                shareId: "source-other",
                title: "Outro",
                contentText: "Conteúdo secundário",
            },
            {
                shareId: "source-cited",
                title: "Citada",
                contentText: "Conteúdo citado",
            },
        ]),
    };
    const service = new StudentAiArtifactContextService(
        emptyModel as never,
        emptyModel as never,
        emptyModel as never,
        roomTurnModel as never,
        emptyModel as never,
        { findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) } as never,
        contextResolver as never,
        classesService as never,
        subjectsService as never,
        studyAreasService as never,
        { listReadyTextSources: jest.fn().mockResolvedValue([]) } as never,
        { listProcessedForSubject: jest.fn().mockResolvedValue([]) } as never,
        roomSharesService as never,
        {} as never,
        {
            resolveForUse: jest.fn().mockResolvedValue({
                maxSourceCount: 1,
                maxPromptChars: 20_000,
            }),
        } as never,
    );
    return { service };
}

function conversation(
    contextKind: "SUBJECT" | "STUDY_GROUP" | "STUDY_ROOM",
) {
    return {
        _id: new Types.ObjectId(conversationId),
        studentId: new Types.ObjectId(studentId),
        contextKind,
        contextId: new Types.ObjectId(roomId),
        contextLabelSnapshot: "Sala de estudo",
        status: "ACTIVE",
        readOnly: false,
        lastMessageAt: new Date("2026-07-13T09:00:00.000Z"),
    };
}

function turnQuery<T>(rows: T[]) {
    let limit = rows.length;
    const chain: {
        sort: jest.Mock;
        limit: jest.Mock;
        lean: jest.Mock;
    } = {
        sort: jest.fn(),
        limit: jest.fn(),
        lean: jest.fn(() => Promise.resolve([...rows].reverse().slice(0, limit))),
    };
    chain.sort.mockReturnValue(chain);
    chain.limit.mockImplementation((next: number) => {
        limit = next;
        return chain;
    });
    return chain;
}
