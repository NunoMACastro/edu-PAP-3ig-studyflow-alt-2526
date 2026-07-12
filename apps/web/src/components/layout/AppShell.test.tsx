/**
 * Testa navegação responsiva, foco e logout da shell autenticada.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../features/mf5/notification-tray.js", () => ({
    NotificationTray: () => <button type="button">Notificações</button>,
}));

import { AppShell } from "./AppShell.js";
import {
    getDefaultPathForRole,
    getNavigationForRole,
    isNavigationItemActive,
} from "./navigation.js";

beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
});

describe("AppShell", () => {
    it("inicia recolhida e permite expandir novamente sem perder a navegação", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={["/app/professor"]}>
                <AppShell
                    onLogout={vi.fn().mockResolvedValue(undefined)}
                    user={{ id: "teacher-id", email: "teacher@example.test", role: "TEACHER" }}
                >
                    <p>Dashboard</p>
                </AppShell>
            </MemoryRouter>,
        );

        const navigation = screen.getByRole("navigation", { name: "Navegação principal" });
        const sidebar = navigation.closest("aside");
        expect(sidebar?.getAttribute("data-collapsed")).toBe("true");
        expect(
            within(navigation).getByRole("link", { name: "Dashboard" }).getAttribute(
                "aria-current",
            ),
        ).toBe("page");

        await user.click(screen.getByRole("button", { name: "Expandir navegação" }));
        expect(sidebar?.getAttribute("data-collapsed")).toBe("false");
        expect(within(navigation).getByRole("link", { name: "Turmas" })).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Recolher navegação" }));
        expect(sidebar?.getAttribute("data-collapsed")).toBe("true");
    });

    it("abre e fecha o disclosure móvel por Escape e clique exterior", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={["/app/areas"]}>
                <AppShell
                    onLogout={vi.fn().mockResolvedValue(undefined)}
                    user={{ id: "student-id", email: "student@example.test", role: "STUDENT" }}
                >
                    <p>Conteúdo protegido</p>
                </AppShell>
            </MemoryRouter>,
        );

        const toggle = screen.getByRole("button", { name: "Abrir menu" });
        await user.click(toggle);
        expect(screen.getByRole("navigation", { name: "Navegação principal móvel" })).toBeTruthy();
        expect(
            within(screen.getByRole("navigation", { name: "Navegação principal móvel" }))
                .getByRole("link", { name: "Áreas" })
                .getAttribute("aria-current"),
        ).toBe("page");

        fireEvent.keyDown(document, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("navigation", { name: "Navegação principal móvel" })).toBeNull());
        expect(document.activeElement).toBe(toggle);

        await user.click(toggle);
        fireEvent.pointerDown(screen.getByRole("navigation", { name: "Navegação principal móvel" }));
        expect(screen.getByRole("navigation", { name: "Navegação principal móvel" })).toBeTruthy();
        fireEvent.pointerDown(document.body);
        await waitFor(() => expect(screen.queryByRole("navigation", { name: "Navegação principal móvel" })).toBeNull());
    });

    it("confirma logout e mostra falha sem desmontar a shell", async () => {
        const user = userEvent.setup();
        const onLogout = vi.fn().mockResolvedValue(undefined);
        const first = render(
            <MemoryRouter initialEntries={["/app/professor"]}>
                <AppShell onLogout={onLogout} user={{ id: "teacher-id", email: "teacher@example.test", role: "TEACHER" }}>
                    <p>Dashboard</p>
                </AppShell>
            </MemoryRouter>,
        );
        await user.click(screen.getAllByRole("button", { name: "Sair" })[0]);
        await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
        expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current")).toBe("page");
        first.unmount();

        const failure = vi.fn().mockRejectedValue(new Error("Logout recusado"));
        render(
            <MemoryRouter initialEntries={["/app/admin/governanca"]}>
                <AppShell onLogout={failure} user={{ id: "admin-id", email: "admin@example.test", role: "ADMIN" }}>
                    <p>Governança</p>
                </AppShell>
            </MemoryRouter>,
        );
        await user.click(screen.getAllByRole("button", { name: "Sair" })[0]);
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Logout recusado");
        expect(within(screen.getByRole("main")).getByText("Governança")).toBeTruthy();
    });
});

describe("contrato de navegação por papel", () => {
    it("resolve home, itens e estados ativos para todos os papéis", () => {
        expect(getDefaultPathForRole("STUDENT")).toBe("/app/estudo");
        expect(getDefaultPathForRole("TEACHER")).toBe("/app/professor");
        expect(getDefaultPathForRole("ADMIN")).toBe("/app/admin/governanca");
        expect(getNavigationForRole("STUDENT")).toHaveLength(9);
        expect(getNavigationForRole("TEACHER")).toHaveLength(3);
        expect(getNavigationForRole("ADMIN")).toHaveLength(1);

        const studentHome = getNavigationForRole("STUDENT")[0];
        const teacherHome = getNavigationForRole("TEACHER")[0];
        const adminHome = getNavigationForRole("ADMIN")[0];
        expect(isNavigationItemActive(studentHome, "/")).toBe(true);
        expect(isNavigationItemActive(teacherHome, "/app")).toBe(true);
        expect(isNavigationItemActive(adminHome, "/app/estudo")).toBe(true);
        expect(isNavigationItemActive(studentHome, "/app/areas")).toBe(false);
        expect(isNavigationItemActive(getNavigationForRole("STUDENT")[4], "/app/areas/area-id")).toBe(true);
    });
});
