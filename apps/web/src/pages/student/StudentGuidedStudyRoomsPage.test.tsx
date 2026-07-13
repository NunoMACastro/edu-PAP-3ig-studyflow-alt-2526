/** Valida paginação server-side das salas guiadas por turma oficial. */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listAllStudentGuidedStudyRooms = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    listAllStudentGuidedStudyRooms,
}));

import { StudentGuidedStudyRoomsPage } from "./StudentGuidedStudyRoomsPage.js";

beforeEach(() => {
    listAllStudentGuidedStudyRooms.mockReset()
        .mockResolvedValueOnce({
            items: [room("room-1", "Primeira sala")],
            nextCursor: "room-1",
        })
        .mockResolvedValueOnce({
            items: [room("room-2", "Segunda sala")],
            nextCursor: null,
        });
});

describe("StudentGuidedStudyRoomsPage", () => {
    it("envia classId em todas as páginas em vez de filtrar depois do cursor", async () => {
        const user = userEvent.setup();
        render(<StudentGuidedStudyRoomsPage classId="class-id" />);

        expect(await screen.findByText("Primeira sala")).toBeTruthy();
        expect(listAllStudentGuidedStudyRooms).toHaveBeenNthCalledWith(1, {
            status: "OPEN",
            limit: 24,
            classId: "class-id",
        });
        await user.click(screen.getByRole("button", { name: "Carregar mais" }));
        expect(await screen.findByText("Segunda sala")).toBeTruthy();
        await waitFor(() => expect(listAllStudentGuidedStudyRooms).toHaveBeenNthCalledWith(2, {
            status: "OPEN",
            cursor: "room-1",
            limit: 24,
            classId: "class-id",
        }));
    });
});

/** Cria uma sala mínima do contrato discente seguro. */
function room(_id: string, title: string) {
    return {
        _id,
        classId: "class-id",
        className: "12.º A",
        title,
        description: "Preparação orientada.",
        materialIds: [],
        aiEnabled: false,
        status: "OPEN" as const,
        myParticipation: null,
    };
}
