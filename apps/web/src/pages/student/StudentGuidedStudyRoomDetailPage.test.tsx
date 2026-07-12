/**
 * Valida visualização explícita, renovação CLASS_AI e bloqueios do workspace.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    askGuidedStudyRoomAi: vi.fn(),
    completeGuidedStudyRoom: vi.fn(),
    getStudentGuidedStudyRoom: vi.fn(),
    listStudentGuidedStudyRoomAi: vi.fn(),
    markGuidedStudyRoomViewed: vi.fn(),
}));
const privacy = vi.hoisted(() => ({
    grantAiConsent: vi.fn(),
    listAiConsentCapabilities: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));
vi.mock("../../features/mf4/mf4-client.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../features/mf4/mf4-client.js")>()),
    ...privacy,
}));

import { StudentGuidedStudyRoomDetailPage } from "./StudentGuidedStudyRoomDetailPage.js";

const classId = "class-id";
const roomId = "room-id";

beforeEach(() => {
    for (const mock of [...Object.values(api), ...Object.values(privacy)]) {
        mock.mockReset();
    }
    api.getStudentGuidedStudyRoom.mockResolvedValue(room());
    api.markGuidedStudyRoomViewed.mockResolvedValue(participation());
    api.listStudentGuidedStudyRoomAi.mockResolvedValue({ items: [], nextCursor: null });
    privacy.listAiConsentCapabilities.mockResolvedValue([
        { purpose: "CLASS_AI", requiredVersion: "current", state: "CURRENT", canUse: true },
    ]);
});

describe("StudentGuidedStudyRoomDetailPage", () => {
    it("regista VIEWED apenas depois de o detalhe carregar com sucesso", async () => {
        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        expect(await screen.findByText("Sala de energia")).toBeTruthy();
        expect(api.getStudentGuidedStudyRoom).toHaveBeenCalledWith(classId, roomId);
        await waitFor(() =>
            expect(api.markGuidedStudyRoomViewed).toHaveBeenCalledWith(classId, roomId),
        );
        expect(
            api.getStudentGuidedStudyRoom.mock.invocationCallOrder[0],
        ).toBeLessThan(api.markGuidedStudyRoomViewed.mock.invocationCallOrder[0]);
    });

    it("renova apenas CLASS_AI antes de expor a caixa de pergunta", async () => {
        const user = userEvent.setup();
        privacy.listAiConsentCapabilities
            .mockResolvedValueOnce([
                { purpose: "CLASS_AI", requiredVersion: "current", state: "OUTDATED", canUse: false },
            ])
            .mockResolvedValueOnce([
                { purpose: "CLASS_AI", requiredVersion: "current", state: "CURRENT", canUse: true },
            ]);
        privacy.grantAiConsent.mockResolvedValue({
            id: "consent-new",
            purpose: "CLASS_AI",
            status: "GRANTED",
            policyVersion: "2026-07-11",
        });

        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        const grant = await screen.findByRole("button", { name: "Rever e renovar consentimento" });
        expect(screen.queryByLabelText("Pergunta")).toBeNull();
        await user.click(grant);

        await waitFor(() =>
            expect(privacy.grantAiConsent).toHaveBeenCalledWith("CLASS_AI"),
        );
        expect(await screen.findByLabelText("Pergunta")).toBeTruthy();
    });

    it("mantém sala fechada em consulta e não apresenta conclusão nem nova pergunta", async () => {
        api.getStudentGuidedStudyRoom.mockResolvedValueOnce(room({ status: "CLOSED" }));
        privacy.listAiConsentCapabilities.mockResolvedValueOnce([
            { purpose: "CLASS_AI", requiredVersion: "current", state: "CURRENT", canUse: true },
        ]);

        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        expect(await screen.findByText("Encerrada · consulta")).toBeTruthy();
        expect(api.markGuidedStudyRoomViewed).not.toHaveBeenCalled();
        expect(screen.queryByRole("button", { name: "Marcar como concluída" })).toBeNull();
        expect(screen.queryByLabelText("Pergunta")).toBeNull();
        expect(screen.getByText(/histórico permanece disponível/i)).toBeTruthy();
    });

    it("renderiza o detalhe antes de VIEWED e histórico terminarem", async () => {
        const viewed = deferred<ReturnType<typeof participation>>();
        const history = deferred<{ items: []; nextCursor: null }>();
        api.markGuidedStudyRoomViewed.mockReturnValueOnce(viewed.promise);
        api.listStudentGuidedStudyRoomAi.mockReturnValueOnce(history.promise);

        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        expect(await screen.findByRole("heading", { name: "Sala de energia" })).toBeTruthy();
        expect(screen.getByText("Lê os materiais e explica o conceito.")).toBeTruthy();
        expect(screen.getByText("A carregar histórico...")).toBeTruthy();
        expect(screen.queryByText("Visualizada")).toBeNull();

        viewed.resolve(participation());
        history.resolve({ items: [], nextCursor: null });
        expect(await screen.findByText("Visualizada")).toBeTruthy();
        expect(await screen.findByText("Ainda não tens conversas nesta sala")).toBeTruthy();
    });

    it("isola falhas de VIEWED e histórico sem ocultar a sala", async () => {
        api.markGuidedStudyRoomViewed.mockRejectedValueOnce(
            new Error("VIEWED indisponível."),
        );
        api.listStudentGuidedStudyRoomAi.mockRejectedValueOnce(
            new Error("Histórico indisponível."),
        );

        render(<StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />);

        expect(await screen.findByRole("heading", { name: "Sala de energia" })).toBeTruthy();
        expect(await screen.findByText(/VIEWED indisponível/)).toBeTruthy();
        expect(await screen.findByText("Histórico indisponível.")).toBeTruthy();
        expect(screen.getByText("Lê os materiais e explica o conceito.")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Tentar carregar histórico" })).toBeTruthy();
    });
});

/** Cria uma Promise controlável para validar fases independentes do detalhe. */
function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, reject, resolve };
}

function room(overrides: Record<string, unknown> = {}) {
    return {
        _id: roomId,
        classId,
        subjectId: "subject-id",
        title: "Sala de energia",
        description: "Lê os materiais e explica o conceito.",
        goal: "Compreender energia",
        materialIds: ["material-id"],
        materials: [
            {
                _id: "material-id",
                subjectId: "subject-id",
                classId,
                title: "Resumo de energia",
                type: "TEXT",
                status: "PROCESSED",
                textContent: "Energia é a capacidade de realizar trabalho.",
            },
        ],
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
