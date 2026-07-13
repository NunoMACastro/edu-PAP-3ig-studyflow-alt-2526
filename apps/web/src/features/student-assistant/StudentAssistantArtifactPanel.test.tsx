/** Testes do painel explícito de criação de materiais no Assistente. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentAssistantArtifactPanel } from "./StudentAssistantArtifactPanel.js";
import * as api from "../../lib/apiClient.js";

vi.mock("../../components/ai/AiConsentGate.js", () => ({
    AiConsentGate: ({ children, purpose }: { children: ReactNode; purpose: string }) => (
        <div data-purpose={purpose}>{children}</div>
    ),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => {
    const original = await importOriginal<typeof import("../../lib/apiClient.js")>();
    return {
        ...original,
        generateStudentAssistantArtifact: vi.fn(),
        getStudentAssistantArtifactSetup: vi.fn(),
        listStudentAssistantArtifactTargets: vi.fn(),
    };
});

describe("StudentAssistantArtifactPanel", () => {
    beforeEach(() => {
        vi.mocked(api.generateStudentAssistantArtifact).mockReset();
        vi.mocked(api.getStudentAssistantArtifactSetup).mockResolvedValue({
            canCreate: true,
            targetMode: "FIXED",
            fixedTarget: {
                kind: "STUDY_AREA",
                id: "area-id",
                label: "Bases de Dados",
            },
            preview: {
                turnCount: 2,
                candidateSourceCount: 1,
                groundingMode: "CHAT_AND_SOURCES",
                sourceLimits: { SUMMARY: 5, STUDY_TOOL: 5 },
            },
        });
        vi.mocked(api.listStudentAssistantArtifactTargets).mockResolvedValue({
            items: [],
            nextCursor: null,
        });
    });

    it("gera resumo sem enviar topic e usa consentimento SUMMARY", async () => {
        vi.mocked(api.generateStudentAssistantArtifact).mockResolvedValue({
            status: "DONE",
            artifact: {
                id: "artifact-id",
                type: "SUMMARY",
                title: "Resumo",
                createdAt: "2026-07-12T12:00:00.000Z",
                targetPath: "/app/estudar/materiais/artifact-id",
                target: {
                    kind: "STUDY_AREA",
                    id: "area-id",
                    label: "Bases de Dados",
                    state: "ACTIVE",
                },
                provenance: {
                    snapshotAt: "2026-07-12T12:00:00.000Z",
                    snapshotTurnCount: 2,
                    usedTurnCount: 2,
                    candidateSourceCount: 1,
                    usedSourceCount: 1,
                    groundingMode: "CHAT_AND_SOURCES",
                },
                capabilities: {
                    canExport: true,
                    canAttempt: false,
                    canRegenerate: true,
                    canDelete: true,
                },
            },
        });
        const onGenerated = vi.fn();
        render(
            <StudentAssistantArtifactPanel
                conversationId="conversation-id"
                onClose={vi.fn()}
                onGenerated={onGenerated}
                open
            />,
        );

        await screen.findByText("Bases de Dados");
        expect(screen.queryByLabelText("Tópico opcional")).toBeNull();
        expect(
            screen.getByText("Criar material").closest("[data-purpose]")
                ?.getAttribute("data-purpose"),
        ).toBe("SUMMARY");
        fireEvent.click(screen.getByRole("button", { name: "Criar material" }));

        await waitFor(() =>
            expect(api.generateStudentAssistantArtifact).toHaveBeenCalledWith(
                "conversation-id",
                { type: "SUMMARY" },
                expect.stringMatching(/^[0-9a-f-]{36}$/i),
            ),
        );
        expect(onGenerated).toHaveBeenCalledWith(
            expect.objectContaining({ status: "DONE" }),
        );
    });

    it("mostra tópico e muda para STUDY_TOOL nos flashcards", async () => {
        render(
            <StudentAssistantArtifactPanel
                conversationId="conversation-id"
                onClose={vi.fn()}
                onGenerated={vi.fn()}
                open
            />,
        );
        await screen.findByText("Bases de Dados");
        fireEvent.change(screen.getByLabelText("Tipo de material"), {
            target: { value: "FLASHCARDS" },
        });
        expect(screen.getByLabelText("Tópico opcional")).not.toBeNull();
        expect(
            screen.getByText("Criar material").closest("[data-purpose]")
                ?.getAttribute("data-purpose"),
        ).toBe("STUDY_TOOL");
    });

    it("preserva o painel e o tópico quando a API falha", async () => {
        vi.mocked(api.generateStudentAssistantArtifact).mockRejectedValue(
            new Error("Provider temporariamente indisponível"),
        );
        render(
            <StudentAssistantArtifactPanel
                conversationId="conversation-id"
                onClose={vi.fn()}
                onGenerated={vi.fn()}
                open
            />,
        );
        await screen.findByText("Bases de Dados");
        fireEvent.change(screen.getByLabelText("Tipo de material"), {
            target: { value: "QUIZ" },
        });
        fireEvent.change(screen.getByLabelText("Tópico opcional"), {
            target: { value: "SQL" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Criar material" }));
        expect(
            await screen.findByText("Provider temporariamente indisponível"),
        ).not.toBeNull();
        expect(
            (screen.getByLabelText("Tópico opcional") as HTMLInputElement).value,
        ).toBe("SQL");
    });

    it("obriga a escolher um destino privado numa sala colaborativa", async () => {
        vi.mocked(api.getStudentAssistantArtifactSetup).mockResolvedValue({
            canCreate: true,
            targetMode: "SELECTION_REQUIRED",
            preview: {
                turnCount: 6,
                candidateSourceCount: 0,
                groundingMode: "CHAT_ONLY",
                sourceLimits: { SUMMARY: 5, STUDY_TOOL: 5 },
            },
        });
        vi.mocked(api.listStudentAssistantArtifactTargets).mockResolvedValue({
            items: [{
                kind: "SUBJECT",
                id: "subject-id",
                label: "Bases de Dados",
                secondaryLabel: "10.º A",
            }],
            nextCursor: null,
        });
        vi.mocked(api.generateStudentAssistantArtifact).mockResolvedValue({
            status: "DONE",
            artifact: generatedArtifact(),
        });
        render(
            <StudentAssistantArtifactPanel
                conversationId="conversation-id"
                onClose={vi.fn()}
                onGenerated={vi.fn()}
                open
            />,
        );

        expect(await screen.findByText(/não tem fontes processáveis atuais/i)).toBeTruthy();
        const submit = screen.getByRole("button", { name: "Criar material" }) as HTMLButtonElement;
        expect(submit.disabled).toBe(true);
        fireEvent.click(
            await screen.findByRole("radio", { name: /Bases de Dados/i }),
        );
        expect(submit.disabled).toBe(false);
        fireEvent.click(submit);
        await waitFor(() =>
            expect(api.generateStudentAssistantArtifact).toHaveBeenCalledWith(
                "conversation-id",
                {
                    type: "SUMMARY",
                    target: { kind: "SUBJECT", id: "subject-id" },
                },
                expect.any(String),
            ),
        );
    });

    it("não anuncia uma lista vazia enquanto a pesquisa de destinos está pendente", async () => {
        vi.mocked(api.getStudentAssistantArtifactSetup).mockResolvedValue({
            canCreate: true,
            targetMode: "SELECTION_REQUIRED",
            preview: {
                turnCount: 1,
                candidateSourceCount: 1,
                groundingMode: "CHAT_AND_SOURCES",
                sourceLimits: { SUMMARY: 5, STUDY_TOOL: 5 },
            },
        });
        let resolveTargets!: (page: {
            items: api.StudentStudyMaterialTarget[];
            nextCursor: null;
        }) => void;
        vi.mocked(api.listStudentAssistantArtifactTargets).mockReturnValue(
            new Promise((resolve) => {
                resolveTargets = resolve;
            }),
        );
        render(
            <StudentAssistantArtifactPanel
                conversationId="conversation-id"
                onClose={vi.fn()}
                onGenerated={vi.fn()}
                open
            />,
        );

        expect(await screen.findByText("A pesquisar…")).toBeTruthy();
        expect(
            screen.queryByText("Não existem destinos ativos para esta pesquisa."),
        ).toBeNull();
        resolveTargets({
            items: [{
                kind: "CLASS",
                id: "class-id",
                label: "10.º A",
                secondaryLabel: "10A · 2026/2027",
            }],
            nextCursor: null,
        });
        expect(await screen.findByRole("radio", { name: /10.º A/i })).toBeTruthy();
    });
});

function generatedArtifact(): api.StudentAssistantArtifact {
    return {
        id: "artifact-id",
        type: "SUMMARY",
        title: "Resumo",
        createdAt: "2026-07-12T12:00:00.000Z",
        targetPath: "/app/estudar/materiais/artifact-id",
        target: {
            kind: "SUBJECT",
            id: "subject-id",
            label: "Bases de Dados",
            state: "ACTIVE",
        },
        provenance: {
            snapshotAt: "2026-07-12T12:00:00.000Z",
            snapshotTurnCount: 6,
            usedTurnCount: 6,
            candidateSourceCount: 0,
            usedSourceCount: 0,
            groundingMode: "CHAT_ONLY",
        },
        capabilities: {
            canExport: true,
            canAttempt: false,
            canRegenerate: true,
            canDelete: true,
        },
    };
}
