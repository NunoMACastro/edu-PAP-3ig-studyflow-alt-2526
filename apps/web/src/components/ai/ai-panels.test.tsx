/**
 * Testa a validação defensiva e os estados interativos dos artefactos IA.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AiArtifact } from "../../lib/apiClient.js";

const apiMocks = vi.hoisted(() => ({
    prepareAiProfile: vi.fn(),
    submitQuizAttempt: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...apiMocks,
}));

import { AiAreaProfilePanel } from "./AiAreaProfilePanel.js";
import { ArtifactSources } from "./ArtifactSources.js";
import { ExplanationPanel } from "./ExplanationPanel.js";
import { FlashcardsPanel } from "./FlashcardsPanel.js";
import { QuizPanel } from "./QuizPanel.js";
import { SummaryPanel } from "./SummaryPanel.js";

const artifact = (
    type: AiArtifact["type"],
    contentJson: Record<string, unknown>,
): AiArtifact => ({
    _id: `${type.toLowerCase()}-id`,
    studyAreaId: "study-area-id",
    type,
    contentJson,
    sourcesJson: [
        { materialId: "material-1", title: "Manual autorizado" },
        { materialId: "material-2" },
        {},
    ],
});

beforeEach(() => {
    apiMocks.prepareAiProfile.mockReset().mockResolvedValue({ status: "READY" });
    apiMocks.submitQuizAttempt.mockReset().mockResolvedValue({
        correctCount: 1,
        totalQuestions: 1,
        scorePercent: 100,
        results: [
            {
                questionIndex: 0,
                selectedOptionIndex: 1,
                correctOptionIndex: 1,
                isCorrect: true,
                sourceMaterialIds: ["material-1"],
            },
        ],
    });
});

describe("fontes, resumo e explicação", () => {
    it("filtra fontes autorizadas e aplica os fallbacks visuais", () => {
        const { rerender } = render(
            <ArtifactSources
                sourceMaterialIds={["material-1"]}
                sources={artifact("SUMMARY", {}).sourcesJson}
            />,
        );
        expect(screen.getByText("Manual autorizado")).toBeTruthy();
        expect(screen.queryByText("material-2")).toBeNull();

        rerender(<ArtifactSources sources={artifact("SUMMARY", {}).sourcesJson} />);
        expect(screen.getByText("material-2")).toBeTruthy();
        expect(screen.getByText("Fonte")).toBeTruthy();

        rerender(<ArtifactSources sourceMaterialIds={["missing"]} sources={artifact("SUMMARY", {}).sourcesJson} />);
        expect(screen.queryByText("Fontes")).toBeNull();
    });

    it("representa conteúdo parcial sem confiar em campos opcionais", () => {
        const { rerender } = render(
            <SummaryPanel
                artifact={artifact("SUMMARY", {
                    bullets: ["Primeiro ponto"],
                    sourceMaterialIds: ["material-1"],
                })}
            />,
        );
        expect(screen.getByRole("heading", { name: "Resumo" })).toBeTruthy();
        expect(screen.getByText("Primeiro ponto")).toBeTruthy();

        rerender(
            <ExplanationPanel
                artifact={artifact("EXPLANATION", {
                    title: "Explicação guiada",
                    sections: [
                        { heading: "Passo 1", body: "Começa pela definição", sourceMaterialIds: ["material-1"] },
                    ],
                })}
            />,
        );
        expect(screen.getByText("Começa pela definição")).toBeTruthy();
        rerender(<ExplanationPanel artifact={null} />);
        expect(screen.queryByText("Explicação guiada")).toBeNull();
        rerender(<SummaryPanel artifact={null} />);
        expect(screen.queryByText("Resumo")).toBeNull();
    });
});

describe("FlashcardsPanel", () => {
    it("ignora cartões inválidos e completa/reinicia uma sessão", async () => {
        const user = userEvent.setup();
        const flashcards = artifact("FLASHCARDS", {
            cards: [
                null,
                { front: "", back: "Inválido" },
                { front: "Pergunta 1", back: "Resposta 1", sourceMaterialIds: ["material-1"] },
                { front: "Pergunta 2", back: "Resposta 2" },
            ],
        });
        const { rerender } = render(<FlashcardsPanel artifact={flashcards} />);

        expect(screen.getByText("1 de 2")).toBeTruthy();
        expect(screen.getByText(/Resposta escondida/)).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Mostrar resposta" }));
        expect(screen.getByText("Resposta 1")).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Seguinte" }));
        expect(screen.getByText("Pergunta 2")).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Modo revisão" }));
        expect(screen.getByText("Resposta 2")).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Concluir" }));
        expect(screen.getByRole("status").textContent).toContain("Sessão concluída");
        await user.click(screen.getByRole("button", { name: "Recomeçar" }));
        expect(screen.getByText("Pergunta 1")).toBeTruthy();

        rerender(<FlashcardsPanel artifact={artifact("FLASHCARDS", { cards: "inválido" })} />);
        expect(screen.getByText(/não tem cartões válidos/)).toBeTruthy();
        rerender(<FlashcardsPanel artifact={null} />);
        expect(screen.queryByRole("region", { name: "Flashcards" })).toBeNull();
    });
});

describe("QuizPanel", () => {
    const quiz = artifact("QUIZ", {
        questions: [
            {
                question: "Quanto é 1 + 1?",
                options: ["1", "2", "3", "4"],
                correctOptionIndex: 1,
                explanation: "Somar uma unidade.",
                sourceMaterialIds: ["material-1"],
            },
        ],
    });

    it("exige todas as respostas e apresenta o resultado do backend", async () => {
        const user = userEvent.setup();
        render(<QuizPanel artifact={quiz} studyAreaId="study-area-id" />);
        await user.click(screen.getByRole("button", { name: "Submeter respostas" }));
        expect(screen.getByText(/Responde a todas/)).toBeTruthy();

        await user.click(screen.getByRole("radio", { name: "2" }));
        await user.click(screen.getByRole("button", { name: "Submeter respostas" }));
        expect(await screen.findByText(/Resultado: 1\/1/)).toBeTruthy();
        expect(screen.getByText(/Correta: 2/)).toBeTruthy();
        expect(apiMocks.submitQuizAttempt).toHaveBeenCalledWith("study-area-id", "quiz-id", [1]);
    });

    it("mostra falha segura e bloqueia quizzes vazios", async () => {
        const user = userEvent.setup();
        apiMocks.submitQuizAttempt.mockRejectedValueOnce(new Error("Tentativa recusada"));
        const { rerender } = render(<QuizPanel artifact={quiz} studyAreaId="study-area-id" />);
        await user.click(screen.getByRole("radio", { name: "2" }));
        await user.click(screen.getByRole("button", { name: "Submeter respostas" }));
        expect(await screen.findByText("Tentativa recusada")).toBeTruthy();

        rerender(<QuizPanel artifact={artifact("QUIZ", {})} studyAreaId="study-area-id" />);
        expect((screen.getByRole("button", { name: "Submeter respostas" }) as HTMLButtonElement).disabled).toBe(true);
        rerender(<QuizPanel artifact={null} studyAreaId="study-area-id" />);
        expect(screen.queryByRole("button", { name: "Submeter respostas" })).toBeNull();
    });
});

describe("AiAreaProfilePanel", () => {
    it("mostra sucesso e erro do serviço", async () => {
        const user = userEvent.setup();
        const { rerender } = render(<AiAreaProfilePanel studyAreaId="area-1" />);
        await user.click(screen.getByRole("button", { name: "Preparar perfil" }));
        expect(await screen.findByText("Estado: READY")).toBeTruthy();

        apiMocks.prepareAiProfile.mockRejectedValueOnce(new Error("Perfil indisponível"));
        rerender(<AiAreaProfilePanel studyAreaId="area-2" />);
        await user.click(screen.getByRole("button", { name: "Preparar perfil" }));
        await waitFor(() => expect(screen.getByText("Perfil indisponível")).toBeTruthy());
    });
});
