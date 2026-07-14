/** Testes do chrome compacto e da coordenação de foco do launcher. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentAssistantLauncher } from "./StudentAssistantLauncher.js";
import * as api from "../../lib/apiClient.js";

vi.mock("../../lib/apiClient.js", async (importOriginal) => {
    const original = await importOriginal<typeof import("../../lib/apiClient.js")>();
    return {
        ...original,
        getStudentAssistantContext: vi.fn(),
        listStudentAssistantConversations: vi.fn(),
    };
});

vi.mock("./StudentAssistantConversationView.js", () => ({
    StudentAssistantConversationView: ({
        onBlockingOverlayChange,
    }: {
        onBlockingOverlayChange?: (open: boolean) => void;
    }) => (
        <div>
            <p>Conversa carregada</p>
            <button onClick={() => onBlockingOverlayChange?.(true)} type="button">Abrir overlay de teste</button>
            <button onClick={() => onBlockingOverlayChange?.(false)} type="button">Fechar overlay de teste</button>
        </div>
    ),
}));

const context: api.StudentAssistantContext = {
    kind: "STUDY_AREA",
    id: "area-id",
    label: "Bases de Dados",
    secondaryLabel: "Estudo pessoal",
    consentPurpose: "PRIVATE_AREA_AI",
    targetPath: "/app/areas/area-id",
    canAsk: true,
};

describe("StudentAssistantLauncher", () => {
    beforeEach(() => {
        vi.mocked(api.getStudentAssistantContext).mockReset();
        vi.mocked(api.listStudentAssistantConversations).mockReset();
        vi.mocked(api.getStudentAssistantContext).mockResolvedValue(context);
        vi.mocked(api.listStudentAssistantConversations).mockResolvedValue({
            items: [
                {
                    id: "conversation-id",
                    title: "Conversa",
                    status: "ACTIVE",
                    origin: "NATIVE",
                    context: {
                        kind: "STUDY_AREA",
                        id: "area-id",
                        label: "Bases de Dados",
                        access: "ACTIVE",
                    },
                    readOnly: false,
                    capabilities: { canInviteFork: false, canCreateArtifact: false },
                },
            ],
            nextCursor: null,
        });
    });

    it("move a página completa para o header e remove o footer antigo", async () => {
        renderLauncher();
        fireEvent.click(screen.getByRole("button", { name: "Abrir Assistente de estudo" }));
        const dialog = await screen.findByRole("dialog", { name: "Assistente de estudo" });
        const pageLink = screen.getByRole("link", { name: "Abrir página" });
        await waitFor(() =>
            expect(pageLink.getAttribute("href")).toBe("/app/assistente/conversation-id"));
        expect(dialog.textContent).not.toContain("Apoio baseado no contexto autorizado");
        expect(screen.queryByText("Abrir página completa")).toBeNull();
        expect(screen.queryByText("Novo contexto")).toBeNull();
    });

    it("mantém o launcher visível em desktop e comunica o estado ativo", async () => {
        renderLauncher();
        fireEvent.click(screen.getByRole("button", { name: "Abrir Assistente de estudo" }));
        await screen.findByRole("dialog", { name: "Assistente de estudo" });

        const activeLauncher = screen.getByRole("button", { name: "Fechar Assistente de estudo" });
        expect(activeLauncher.getAttribute("aria-expanded")).toBe("true");
        expect(activeLauncher.getAttribute("aria-controls")).toBe("student-assistant-dialog");
        expect(activeLauncher.className).toContain("sm:flex");
        expect(activeLauncher.className).toContain("bg-studyflow-card");
        expect(screen.getByText("Assistente ativo")).toBeTruthy();

        fireEvent.click(activeLauncher);
        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Assistente de estudo" })).toBeNull());
        expect(screen.getByRole("button", { name: "Abrir Assistente de estudo" }).getAttribute("aria-expanded")).toBe("false");
    });

    it("suspende a janela enquanto existe um overlay modal descendente", async () => {
        renderLauncher();
        const launcher = screen.getByRole("button", { name: "Abrir Assistente de estudo" });
        fireEvent.click(launcher);
        const dialog = await screen.findByRole("dialog", { name: "Assistente de estudo" });

        fireEvent.click(screen.getByRole("button", { name: "Abrir overlay de teste" }));
        expect(dialog.getAttribute("aria-hidden")).toBe("true");
        expect(dialog.hasAttribute("inert")).toBe(true);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(dialog.isConnected).toBe(true);

        fireEvent.click(screen.getByRole("button", { name: "Fechar overlay de teste", hidden: true }));
        expect(dialog.hasAttribute("aria-hidden")).toBe(false);
        expect(dialog.hasAttribute("inert")).toBe(false);
        fireEvent.keyDown(document, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Assistente de estudo" })).toBeNull());
        await waitFor(() => expect(document.activeElement).toBe(
            screen.getByRole("button", { name: "Abrir Assistente de estudo" }),
        ));
    });
});

function renderLauncher() {
    return render(
        <MemoryRouter initialEntries={["/app/areas/area-id"]}>
            <StudentAssistantLauncher />
        </MemoryRouter>,
    );
}
