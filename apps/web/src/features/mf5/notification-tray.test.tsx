/**
 * Testa estados, acessibilidade e fecho do tray de notificações.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listContextNotifications = vi.hoisted(() => vi.fn());

vi.mock("../mf4/mf4-client.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../mf4/mf4-client.js")>()),
    listContextNotifications,
}));

import { NotificationTray } from "./notification-tray.js";

beforeEach(() => {
    listContextNotifications.mockReset().mockResolvedValue([
        { id: "class-id", contextType: "CLASS", contextId: "class", title: "Aviso da turma", body: "Conteúdo", recipientCount: 1, suppressedRecipientCount: 0 },
        { id: "group-id", contextType: "GROUP", contextId: "group", title: "Aviso do grupo", body: "Conteúdo", recipientCount: 1, suppressedRecipientCount: 0 },
        { id: "fallback-id", contextType: "OTHER", contextId: "other", title: "Aviso contextual", body: "Conteúdo", recipientCount: 1, suppressedRecipientCount: 0 },
    ]);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
});

describe("NotificationTray", () => {
    it("carrega, etiqueta contextos e fecha por Escape/exterior", async () => {
        const user = userEvent.setup();
        render(<NotificationTray />);
        const button = await screen.findByRole("button", { name: "Notificações (3)" });
        await user.click(button);
        expect(screen.getByText("Turma")).toBeTruthy();
        expect(screen.getByText("Grupo")).toBeTruthy();
        expect(screen.getByText("Contexto")).toBeTruthy();
        expect(screen.getByRole("region", { name: "Notificações contextualizadas" })).toBeTruthy();

        fireEvent.pointerDown(screen.getByText("Aviso da turma"));
        expect(screen.getByRole("region", { name: "Notificações contextualizadas" })).toBeTruthy();
        fireEvent.keyDown(document, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("region", { name: "Notificações contextualizadas" })).toBeNull());
        expect(document.activeElement).toBe(button);

        await user.click(button);
        fireEvent.pointerDown(document.body);
        await waitFor(() => expect(screen.queryByRole("region", { name: "Notificações contextualizadas" })).toBeNull());
    });

    it("distingue vazio, erro e loading", async () => {
        const user = userEvent.setup();
        listContextNotifications.mockResolvedValueOnce([]);
        const empty = render(<NotificationTray />);
        const emptyButton = await screen.findByRole("button", { name: "Notificações (0)" });
        await user.click(emptyButton);
        expect(screen.getByText("Sem notificações novas.")).toBeTruthy();
        empty.unmount();

        listContextNotifications.mockRejectedValueOnce(new Error("offline"));
        const failure = render(<NotificationTray />);
        const errorButton = await screen.findByRole("button", { name: "Notificações (0)" });
        await user.click(errorButton);
        expect(screen.getByText("Não foi possível carregar notificações.")).toBeTruthy();
        failure.unmount();

        listContextNotifications.mockReturnValueOnce(new Promise(() => undefined));
        render(<NotificationTray />);
        await user.click(screen.getByRole("button", { name: "Notificações (0)" }));
        expect(screen.getByText("A carregar notificações...")).toBeTruthy();
    });
});
