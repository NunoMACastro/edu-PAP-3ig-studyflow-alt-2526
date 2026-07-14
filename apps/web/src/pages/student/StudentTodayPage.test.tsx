/** Confirma feedback compacto de privacidade e autoria no dashboard. */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getProfile = vi.hoisted(() => vi.fn());
const getStudentToday = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    getProfile,
    getStudentToday,
}));

import { StudentTodayPage } from "./StudentTodayPage.js";

beforeEach(() => {
    getProfile.mockResolvedValue({ name: "Leonor" });
    getStudentToday.mockResolvedValue({
        continue: {
            key: "area",
            kind: "STUDY_AREA",
            title: "Exames",
            contextLabel: "Estudo pessoal",
            urgency: "AVAILABLE",
            targetPath: "/app/areas/area-1",
            contextMeta: { creator: "SELF", access: "PRIVATE" },
        },
        priorities: [],
        recentContexts: [],
    });
});

describe("StudentTodayPage", () => {
    it("identifica uma área como criada pelo aluno e privada", async () => {
        render(<MemoryRouter><StudentTodayPage /></MemoryRouter>);

        expect(await screen.findByText("Exames")).toBeTruthy();
        expect(screen.getByText("Criada por ti")).toBeTruthy();
        expect(screen.getByText("Privada")).toBeTruthy();
    });
});
