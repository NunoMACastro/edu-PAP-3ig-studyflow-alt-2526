/** Valida participação e a migração da IA para o Assistente global. */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    completeGuidedStudyRoom: vi.fn(),
    getStudentGuidedStudyRoom: vi.fn(),
    markGuidedStudyRoomViewed: vi.fn(),
    rememberStudentContext: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { StudentGuidedStudyRoomDetailPage } from "./StudentGuidedStudyRoomDetailPage.js";

const classId = "class-id";
const roomId = "room-id";

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.getStudentGuidedStudyRoom.mockResolvedValue(room());
    api.markGuidedStudyRoomViewed.mockResolvedValue(participation());
    api.rememberStudentContext.mockResolvedValue(undefined);
});

describe("StudentGuidedStudyRoomDetailPage", () => {
    it("regista VIEWED apenas depois de o detalhe carregar com sucesso", async () => {
        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        expect(await screen.findByText("Sala de energia")).toBeTruthy();
        expect(api.getStudentGuidedStudyRoom).toHaveBeenCalledWith(classId, roomId);
        await waitFor(() => expect(api.markGuidedStudyRoomViewed).toHaveBeenCalledWith(classId, roomId));
        expect(api.getStudentGuidedStudyRoom.mock.invocationCallOrder[0]).toBeLessThan(api.markGuidedStudyRoomViewed.mock.invocationCallOrder[0]);
    });

    it("remove a caixa IA inline e encaminha para o Assistente contextual", async () => {
        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        const link = await screen.findByRole("link", { name: "Perguntar ao Assistente" });
        expect(link.getAttribute("href")).toBe(`/app/assistente/novo/GUIDED_ROOM/${roomId}`);
        expect(screen.queryByLabelText("Pergunta")).toBeNull();
        expect(screen.queryByText("IA da sala")).toBeNull();
    });

    it("mantém sala fechada em consulta e não apresenta conclusão", async () => {
        api.getStudentGuidedStudyRoom.mockResolvedValueOnce(room({ status: "CLOSED" }));

        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        expect(await screen.findByText("Encerrada · consulta")).toBeTruthy();
        expect(api.markGuidedStudyRoomViewed).not.toHaveBeenCalled();
        expect(screen.queryByRole("button", { name: "Marcar como concluída" })).toBeNull();
        expect(screen.getByRole("link", { name: "Perguntar ao Assistente" })).toBeTruthy();
    });

    it("isola uma falha de VIEWED sem ocultar o detalhe", async () => {
        api.markGuidedStudyRoomViewed.mockRejectedValueOnce(new Error("VIEWED indisponível."));

        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        expect(await screen.findByRole("heading", { name: "Sala de energia" })).toBeTruthy();
        expect(await screen.findByText(/VIEWED indisponível/)).toBeTruthy();
        expect(screen.getByText("Lê os materiais e explica o conceito.")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeTruthy();
    });
});

function room(overrides: Record<string, unknown> = {}) {
    return {
        _id: roomId,
        classId,
        subjectId: "subject-id",
        title: "Sala de energia",
        description: "Lê os materiais e explica o conceito.",
        goal: "Compreender energia",
        materialIds: ["material-id"],
        materials: [{
            _id: "material-id",
            subjectId: "subject-id",
            classId,
            title: "Resumo de energia",
            type: "TEXT",
            status: "PROCESSED",
            textContent: "Energia é a capacidade de realizar trabalho.",
        }],
        invalidMaterialIds: [],
        aiEnabled: true,
        aiAvailable: true,
        myParticipation: null,
        status: "OPEN",
        ...overrides,
    };
}

function participation() {
    return {
        id: "participation-id",
        roomId,
        classId,
        studentId: "student-id",
        status: "VIEWED",
        firstViewedAt: "2026-07-11T10:00:00.000Z",
        lastViewedAt: "2026-07-11T10:00:00.000Z",
    };
}
