/** Testa a inbox partilhada, lifecycle e acessibilidade do tray. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    archiveContextNotification: vi.fn(),
    getNotificationInbox: vi.fn(),
    markAllContextNotificationsRead: vi.fn(),
    markContextNotificationRead: vi.fn(),
}));

vi.mock("../mf4/mf4-client.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../mf4/mf4-client.js")>()),
    ...api,
}));

import { NotificationProvider, useNotificationInbox } from "./notification-provider.js";
import { NotificationTray } from "./notification-tray.js";

const items = [
    { id: "class-id", contextType: "CLASS" as const, contextId: "class", type: "FOLLOW_UP", title: "Aviso da turma", body: "Conteúdo", readAt: null },
    { id: "group-id", contextType: "GROUP" as const, contextId: "group", type: "GROUP", title: "Aviso do grupo", body: "Conteúdo", readAt: null },
    { id: "room-id", contextType: "STUDY_ROOM" as const, contextId: "room", type: "ROOM", title: "Aviso da sala", body: "Conteúdo", readAt: null },
];

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.getNotificationInbox.mockResolvedValue({ items, unreadCount: 3, nextCursor: null });
    api.markContextNotificationRead.mockImplementation((id: string) => Promise.resolve({ ...items.find((item) => item.id === id), readAt: "2026-07-11T12:00:00.000Z" }));
    api.archiveContextNotification.mockResolvedValue({ archivedAt: "2026-07-11T12:00:00.000Z" });
    api.markAllContextNotificationsRead.mockResolvedValue({ updatedCount: 3 });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
});

function renderTray(placement?: "below-end" | "side") {
    return render(<NotificationProvider><NotificationTray placement={placement} /></NotificationProvider>);
}

/** Superfície mínima para comandar refresh/loadMore sem eventos de foco do tray. */
function NotificationRaceProbe() {
    const inbox = useNotificationInbox();
    return (
        <div>
            <button onClick={() => void inbox.refresh()} type="button">Atualizar inbox</button>
            <button onClick={() => void inbox.loadMore()} type="button">Carregar página</button>
            {inbox.items.map((item) => <span key={item.id}>{item.title}</span>)}
            <output>{inbox.unreadCount}</output>
        </div>
    );
}

function renderRaceProbe() {
    return render(<NotificationProvider><NotificationRaceProbe /></NotificationProvider>);
}

/** Cria uma Promise controlável para provar respostas fora de ordem. */
function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, reject, resolve };
}

describe("NotificationTray", () => {
    it("carrega, etiqueta contextos e fecha por Escape/exterior", async () => {
        const user = userEvent.setup();
        renderTray();
        const button = await screen.findByRole("button", { name: "Notificações (3)" });
        await user.click(button);
        expect(screen.getByText("Turma")).toBeTruthy();
        expect(screen.getByText("Grupo")).toBeTruthy();
        expect(screen.getByText("Sala de estudo")).toBeTruthy();
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
        api.getNotificationInbox.mockResolvedValue({ items: [], unreadCount: 0, nextCursor: null });
        const empty = renderTray();
        await user.click(await screen.findByRole("button", { name: "Notificações (0)" }));
        expect(screen.getByText("Sem notificações.")).toBeTruthy();
        empty.unmount();

        api.getNotificationInbox.mockRejectedValue(new Error("offline"));
        const failure = renderTray();
        await user.click(await screen.findByRole("button", { name: "Notificações (0)" }));
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "offline");
        failure.unmount();

        api.getNotificationInbox.mockReturnValue(new Promise(() => undefined));
        renderTray();
        await user.click(screen.getByRole("button", { name: "Notificações (0)" }));
        expect(screen.getByText("A carregar notificações...")).toBeTruthy();
    });

    it("marca como lida, arquiva e atualiza o badge partilhado", async () => {
        const user = userEvent.setup();
        renderTray();
        await user.click(await screen.findByRole("button", { name: "Notificações (3)" }));
        await user.click(screen.getAllByRole("button", { name: "Marcar como lida" })[0]);
        await waitFor(() => expect(api.markContextNotificationRead).toHaveBeenCalledWith("class-id"));
        expect(screen.getByRole("button", { name: "Notificações (2)" })).toBeTruthy();
        await user.click(screen.getAllByRole("button", { name: "Arquivar" })[0]);
        await waitFor(() => expect(api.archiveContextNotification).toHaveBeenCalled());
    });

    it("abre lateralmente na sidebar", async () => {
        const user = userEvent.setup();
        renderTray("side");
        await user.click(await screen.findByRole("button", { name: "Notificações (3)" }));
        const tray = screen.getByRole("region", { name: "Notificações contextualizadas" });
        expect(tray.getAttribute("data-placement")).toBe("side");
        expect(tray.className).toContain("left-full");
        expect(screen.getByText("Notificações (3)").getAttribute("data-tooltip-side")).toBe("right");
    });

    it("usa margens fluidas no painel mobile", async () => {
        const user = userEvent.setup();
        renderTray();
        await user.click(await screen.findByRole("button", { name: "Notificações (3)" }));
        const tray = screen.getByRole("region", { name: "Notificações contextualizadas" });
        expect(tray.className).toContain("left-4");
        expect(tray.className).toContain("right-4");
        expect(tray.className).toContain("sm:w-96");
    });

    it("reutiliza o mesmo refresh enquanto o pedido está em curso", async () => {
        const pending = deferred<{
            items: typeof items;
            unreadCount: number;
            nextCursor: string | null;
        }>();
        api.getNotificationInbox.mockReset().mockReturnValue(pending.promise);

        renderRaceProbe();
        fireEvent.click(screen.getByRole("button", { name: "Atualizar inbox" }));
        fireEvent.click(screen.getByRole("button", { name: "Atualizar inbox" }));
        expect(api.getNotificationInbox).toHaveBeenCalledTimes(1);

        pending.resolve({ items, unreadCount: 3, nextCursor: null });
        expect(await screen.findByText("Aviso da turma")).toBeTruthy();
    });

    it("ignora página antiga quando um refresh mais recente termina primeiro", async () => {
        const olderPage = deferred<{
            items: typeof items;
            unreadCount: number;
            nextCursor: string | null;
        }>();
        const newerRefresh = deferred<{
            items: typeof items;
            unreadCount: number;
            nextCursor: string | null;
        }>();
        const initialItem = { ...items[0], id: "initial", title: "Estado inicial" };
        const staleItem = { ...items[0], id: "stale", title: "Página antiga" };
        const freshItem = { ...items[0], id: "fresh", title: "Estado mais recente" };
        api.getNotificationInbox
            .mockReset()
            .mockResolvedValueOnce({
                items: [initialItem],
                unreadCount: 1,
                nextCursor: "cursor-older",
            })
            .mockReturnValueOnce(olderPage.promise)
            .mockReturnValueOnce(newerRefresh.promise);

        renderRaceProbe();
        expect(await screen.findByText("Estado inicial")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Carregar página" }));
        fireEvent.click(screen.getByRole("button", { name: "Atualizar inbox" }));
        expect(api.getNotificationInbox).toHaveBeenCalledTimes(3);

        newerRefresh.resolve({ items: [freshItem], unreadCount: 1, nextCursor: null });
        expect(await screen.findByText("Estado mais recente")).toBeTruthy();
        olderPage.resolve({ items: [staleItem], unreadCount: 2, nextCursor: null });
        await waitFor(() => expect(screen.queryByText("Página antiga")).toBeNull());
        expect(screen.queryByText("Estado inicial")).toBeNull();
        expect(screen.getByText("1", { selector: "output" })).toBeTruthy();
    });
});
