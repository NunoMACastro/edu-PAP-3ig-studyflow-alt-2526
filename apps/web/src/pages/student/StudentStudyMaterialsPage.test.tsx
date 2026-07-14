/** Testes do arquivo privado e do estado arquivado dos materiais. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    StudentStudyMaterialDetailPage,
    StudentStudyMaterialsPage,
} from "./StudentStudyMaterialsPage.js";
import * as api from "../../lib/apiClient.js";

vi.mock("../../lib/apiClient.js", async (importOriginal) => {
    const original = await importOriginal<typeof import("../../lib/apiClient.js")>();
    return {
        ...original,
        listStudentStudyMaterials: vi.fn(),
        getStudentStudyMaterial: vi.fn(),
        deleteStudentStudyMaterial: vi.fn(),
        exportStudentStudyMaterial: vi.fn(),
        submitStudentStudyMaterialQuizAttempt: vi.fn(),
    };
});

describe("StudentStudyMaterialsPage", () => {
    beforeEach(() => {
        vi.mocked(api.listStudentStudyMaterials).mockReset();
        vi.mocked(api.getStudentStudyMaterial).mockReset();
    });

    it("lista cópias privadas e identifica contextos arquivados", async () => {
        vi.mocked(api.listStudentStudyMaterials).mockResolvedValue({
            items: [material("READ_ONLY_ARCHIVED")],
            nextCursor: null,
        });
        render(
            <MemoryRouter>
                <StudentStudyMaterialsPage />
            </MemoryRouter>,
        );
        expect(await screen.findByRole("heading", { name: "Resumo de SQL" })).toBeTruthy();
        expect(screen.getByText("Em arquivo")).toBeTruthy();
        expect(screen.getByText(/Estes materiais são privados/)).toBeTruthy();
        expect(
            screen.getByRole("link", { name: "Abrir material" }).getAttribute("href"),
        ).toBe("/app/estudar/materiais/artifact-id");
        expect(
            screen.getByRole("heading", { level: 1, name: "Materiais de estudo" }),
        ).toBeTruthy();
        expect(
            screen.queryByRole("heading", { level: 1, name: "Materiais — Bases de Dados" }),
        ).toBeNull();
    });

    it("usa o label do contexto apenas numa vista explicitamente filtrada", async () => {
        vi.mocked(api.listStudentStudyMaterials).mockResolvedValue({
            items: [material("ACTIVE")],
            nextCursor: null,
        });
        render(
            <MemoryRouter>
                <StudentStudyMaterialsPage targetId="subject-id" targetKind="SUBJECT" />
            </MemoryRouter>,
        );
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: "Materiais — Bases de Dados",
            }),
        ).toBeTruthy();
    });

    it("mantém um quiz arquivado legível sem permitir nova tentativa", async () => {
        vi.mocked(api.getStudentStudyMaterial).mockResolvedValue({
            ...material("READ_ONLY_ARCHIVED"),
            type: "QUIZ",
            title: "Quiz SQL",
            capabilities: {
                canExport: true,
                canAttempt: false,
                canRegenerate: false,
                canDelete: true,
            },
            content: {
                questions: [{
                    question: "O que é SQL?",
                    options: ["A", "B", "C", "D"],
                    correctOptionIndex: 0,
                    explanation: "Explicação",
                }],
            },
            sources: [],
        });
        render(
            <MemoryRouter>
                <StudentStudyMaterialDetailPage artifactId="artifact-id" />
            </MemoryRouter>,
        );
        expect(await screen.findByRole("heading", { name: "Quiz SQL" })).toBeTruthy();
        expect(screen.getByText(/já não permite novas tentativas/i)).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Submeter respostas" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Apagar" }));
        await waitFor(() =>
            expect(screen.getByText(/Apagar definitivamente este material privado/)).toBeTruthy(),
        );
    });
});

function material(
    state: "ACTIVE" | "READ_ONLY_ARCHIVED",
): api.StudentAssistantArtifact {
    return {
        id: "artifact-id",
        type: "SUMMARY",
        title: "Resumo de SQL",
        createdAt: "2026-07-13T08:00:00.000Z",
        targetPath: "/app/estudar/materiais/artifact-id",
        target: {
            kind: "SUBJECT",
            id: "subject-id",
            label: "Bases de Dados",
            state,
        },
        provenance: {
            snapshotAt: "2026-07-13T08:00:00.000Z",
            snapshotTurnCount: 6,
            usedTurnCount: 6,
            candidateSourceCount: 2,
            usedSourceCount: 2,
            groundingMode: "CHAT_AND_SOURCES",
        },
        capabilities: {
            canExport: true,
            canAttempt: false,
            canRegenerate: false,
            canDelete: true,
        },
    };
}
