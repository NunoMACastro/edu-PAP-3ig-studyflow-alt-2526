/**
 * Testa o contrato acessível e modal do painel lateral reutilizável.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidePanel } from "./SidePanel.js";

beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

function PanelHarness({ closeDisabled = false }: { closeDisabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <>
            <button onClick={() => setOpen(true)} type="button">Abrir criação</button>
            <SidePanel
                closeDisabled={closeDisabled}
                description="Descrição do painel"
                initialFocusRef={inputRef}
                onClose={() => setOpen(false)}
                open={open}
                title="Criar turma"
            >
                <input aria-label="Nome" ref={inputRef} />
                <button type="button">Guardar</button>
            </SidePanel>
        </>
    );
}

describe("SidePanel", () => {
    it("gere foco, Tab, backdrop, scroll e reposição no opener", async () => {
        const user = userEvent.setup();
        render(<PanelHarness />);
        const opener = screen.getByRole("button", { name: "Abrir criação" });

        await user.click(opener);
        expect(screen.getByRole("dialog", { name: "Criar turma" })).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByLabelText("Nome"));
        expect(document.body.style.overflow).toBe("hidden");

        const save = screen.getByRole("button", { name: "Guardar" });
        save.focus();
        fireEvent.keyDown(document, { key: "Tab" });
        expect(document.activeElement).toBe(
            screen.getByRole("button", { name: "Fechar painel lateral" }),
        );
        fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
        expect(document.activeElement).toBe(save);

        fireEvent.pointerDown(screen.getByTestId("side-panel-backdrop"));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(document.body.style.overflow).toBe("");
        expect(document.activeElement).toBe(opener);
    });

    it("bloqueia Escape, backdrop e botão de fecho durante submissão", async () => {
        const user = userEvent.setup();
        render(<PanelHarness closeDisabled />);
        await user.click(screen.getByRole("button", { name: "Abrir criação" }));

        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.getByRole("dialog", { name: "Criar turma" })).toBeTruthy();
        fireEvent.pointerDown(screen.getByTestId("side-panel-backdrop"));
        expect(screen.getByRole("dialog", { name: "Criar turma" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Fechar painel lateral" })).toHaveProperty(
            "disabled",
            true,
        );
    });

    it("usa o viewport integral e compensa a scrollbar ao bloquear o scroll", async () => {
        const user = userEvent.setup();
        const innerWidthSpy = vi.spyOn(window, "innerWidth", "get").mockReturnValue(1200);
        const clientWidthSpy = vi
            .spyOn(document.documentElement, "clientWidth", "get")
            .mockReturnValue(1180);
        document.body.style.paddingRight = "4px";
        render(<PanelHarness />);

        await user.click(screen.getByRole("button", { name: "Abrir criação" }));

        const backdrop = screen.getByTestId("side-panel-backdrop");
        expect(backdrop.parentElement).toBe(document.body);
        expect(backdrop.className).toContain("h-dvh");
        expect(screen.getByRole("dialog").className).toContain("h-dvh");
        expect(document.body.style.paddingRight).toBe("24px");

        await user.click(screen.getByRole("button", { name: "Fechar painel lateral" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(document.body.style.paddingRight).toBe("4px");

        document.body.style.paddingRight = "";
        innerWidthSpy.mockRestore();
        clientWidthSpy.mockRestore();
    });
});
