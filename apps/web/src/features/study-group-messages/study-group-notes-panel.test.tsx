/** Protege a separação REST das notas face ao namespace WebSocket. */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn(), list: vi.fn() }));
vi.mock("./create-study-group-message.js", () => ({
    createStudyGroupMessage: mocks.create,
    listStudyGroupMessages: mocks.list,
}));

import { StudyGroupNotesPanel } from "./StudyGroupNotesPanel.js";

beforeEach(() => {
    mocks.list.mockReset().mockResolvedValue([]);
    mocks.create.mockReset().mockResolvedValue({});
});

describe("StudyGroupNotesPanel", () => {
    it("lista e cria exclusivamente NOTE sem depender do cliente Socket.IO", async () => {
        const user = userEvent.setup();
        render(<StudyGroupNotesPanel groupId="group-id" />);
        expect(await screen.findByText("Ainda não há notas")).toBeTruthy();
        expect(mocks.list).toHaveBeenCalledWith("group-id", "NOTE");
        await user.type(screen.getByLabelText("Nova nota"), "Rever funções");
        await user.click(screen.getByRole("button", { name: "Guardar nota" }));
        expect(mocks.create).toHaveBeenCalledWith("group-id", {
            kind: "NOTE",
            text: "Rever funções",
        });
    });
});
