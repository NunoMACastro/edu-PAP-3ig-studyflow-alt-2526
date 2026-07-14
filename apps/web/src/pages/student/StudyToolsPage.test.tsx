/**
 * Testa seleção, geração e exportação dos artefactos IA da área privada.
 */
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AiArtifact } from "../../lib/apiClient.js";

const api = vi.hoisted(() => ({
    createQuizGenerationJob: vi.fn(),
    exportStudyToolArtifact: vi.fn(),
    generateStudyTool: vi.fn(),
    generateSummary: vi.fn(),
    getQuizGenerationJob: vi.fn(),
    listStudyTools: vi.fn(),
    listSummaries: vi.fn(),
    submitQuizAttempt: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { StudyToolsPage } from "./StudyToolsPage.js";

const makeArtifact = (
    id: string,
    type: AiArtifact["type"],
    contentJson: Record<string, unknown>,
): AiArtifact => ({
    _id: id,
    studyAreaId: "area-id",
    type,
    contentJson,
    sourcesJson: [],
});

const summary = makeArtifact("summary-id", "SUMMARY", { title: "Resumo inicial", bullets: ["Ponto"] });
const explanation = makeArtifact("explanation-id", "EXPLANATION", {
    sections: [{ heading: "Conceito", body: "Explicação" }],
});
const cards = makeArtifact("cards-id", "FLASHCARDS", {
    cards: [{ front: "Frente", back: "Verso" }],
});
const quiz = makeArtifact("quiz-id", "QUIZ", {
    questions: [{ question: "Q?", options: ["A", "B"], correctOptionIndex: 0, explanation: "E" }],
});

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listSummaries.mockResolvedValue([summary]);
    api.listStudyTools.mockResolvedValue([explanation, cards, quiz]);
    api.generateSummary.mockResolvedValue(makeArtifact("new-summary", "SUMMARY", { title: "Resumo novo", bullets: [] }));
    api.generateStudyTool.mockResolvedValue(makeArtifact("generated-tool", "FLASHCARDS", { cards: [{ front: "Nova", back: "Resposta" }] }));
    api.createQuizGenerationJob.mockResolvedValue({
        _id: "quiz-job-id",
        studyAreaId: "area-id",
        status: "QUEUED",
    });
    api.getQuizGenerationJob.mockResolvedValue({ _id: "quiz-job-id", studyAreaId: "area-id", status: "DONE", artifactId: "quiz-id" });
    api.exportStudyToolArtifact.mockImplementation((_area: string, _id: string, format: "md" | "pdf") => Promise.resolve({
        fileName: format === "md" ? "resumo.md" : "resumo.html",
        contentType: "text/plain",
        body: format === "md" ? "# Resumo" : "<h1>Resumo</h1>",
        format,
    }));
    api.submitQuizAttempt.mockResolvedValue({
        correctCount: 1,
        totalQuestions: 1,
        scorePercent: 100,
        results: [{ questionIndex: 0, selectedOptionIndex: 0, correctOptionIndex: 0, isCorrect: true }],
    });

    vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn().mockReturnValue("blob:artifact"),
        revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    vi.spyOn(window, "open").mockReturnValue(null);
});

describe("StudyToolsPage", () => {
    it("seleciona todos os tipos, gera artefactos e inicia quiz background", async () => {
        const user = userEvent.setup();
        render(<StudyToolsPage studyAreaId="area-id" />);

        expect(await screen.findAllByText("Resumo inicial")).toHaveLength(2);
        expect(screen.getByText("Ponto")).toBeTruthy();

        const tools = screen.getByRole("heading", { name: "Ferramentas" }).closest("section")!;
        await user.click(within(tools).getByRole("button", { name: "Explicação" }));
        expect(screen.getByText("Conceito")).toBeTruthy();
        expect(screen.getByText(/não é exportado/)).toBeTruthy();

        await user.click(within(tools).getByRole("button", { name: "Cards" }));
        expect(screen.getByText("Frente")).toBeTruthy();
        await user.click(within(tools).getByRole("button", { name: "Quiz" }));
        expect(screen.getByText("Q?")).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Gerar resumo" }));
        expect((await screen.findAllByText("Resumo novo")).length).toBeGreaterThan(0);
        expect(api.generateSummary).toHaveBeenCalledWith("area-id");

        await user.selectOptions(screen.getByLabelText("Tipo de ferramenta"), "FLASHCARDS");
        await user.type(screen.getByLabelText("Tópico opcional"), "Equações");
        await user.click(screen.getByRole("button", { name: "Gerar" }));
        expect(await screen.findByText("Nova")).toBeTruthy();
        expect(api.generateStudyTool).toHaveBeenCalledWith("area-id", { type: "FLASHCARDS", topic: "Equações" });

        await user.selectOptions(screen.getByLabelText("Tipo de ferramenta"), "QUIZ");
        await user.clear(screen.getByLabelText("Tópico opcional"));
        await user.click(screen.getByRole("button", { name: "Gerar" }));
        await waitFor(() => expect(api.createQuizGenerationJob).toHaveBeenCalledWith("area-id", { topic: undefined }));
        expect(screen.getByText("Quiz em fila.")).toBeTruthy();
    });

    it("exporta MD/PDF e mantém mensagens de sucesso", async () => {
        const user = userEvent.setup();
        render(<StudyToolsPage studyAreaId="area-id" />);
        await screen.findAllByText("Resumo inicial");

        await user.click(screen.getByRole("button", { name: "Exportar MD" }));
        expect(await screen.findByText("Markdown exportado com sucesso.")).toBeTruthy();
        expect(api.exportStudyToolArtifact).toHaveBeenCalledWith("area-id", "summary-id", "md");

        await user.click(screen.getByRole("button", { name: "Preparar PDF" }));
        expect(await screen.findByText("Documento preparado para guardar como PDF.")).toBeTruthy();
        expect(api.exportStudyToolArtifact).toHaveBeenCalledWith("area-id", "summary-id", "pdf");
    });

    it("distingue falha de carga, geração e exportação", async () => {
        const user = userEvent.setup();
        api.listSummaries.mockRejectedValueOnce(new Error("Artefactos indisponíveis"));
        const first = render(<StudyToolsPage studyAreaId="area-id" />);
        expect(await screen.findByText("Artefactos indisponíveis")).toBeTruthy();
        first.unmount();

        api.listSummaries.mockResolvedValue([summary]);
        api.generateSummary.mockRejectedValueOnce(new Error("Geração recusada"));
        const second = render(<StudyToolsPage studyAreaId="area-id" />);
        await screen.findAllByText("Resumo inicial");
        await user.click(screen.getByRole("button", { name: "Gerar resumo" }));
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Geração recusada");

        api.exportStudyToolArtifact.mockRejectedValueOnce(new Error("Exportação recusada"));
        await user.click(screen.getByRole("button", { name: "Exportar MD" }));
        expect(await screen.findByText("Exportação recusada")).toBeTruthy();
        second.unmount();
    });

    it("serializa resumo e ferramenta no mesmo ciclo assíncrono", async () => {
        const user = userEvent.setup();
        const generation = deferred<AiArtifact>();
        api.generateSummary.mockReturnValue(generation.promise);
        render(<StudyToolsPage studyAreaId="area-id" />);
        await screen.findAllByText("Resumo inicial");

        await user.click(screen.getByRole("button", { name: "Gerar resumo" }));
        expect(
            (screen.getByRole("button", { name: "A gerar..." }) as HTMLButtonElement)
                .disabled,
        ).toBe(true);
        expect(
            (screen.getByRole("button", { name: "Gerar" }) as HTMLButtonElement)
                .disabled,
        ).toBe(true);
        screen.getByRole("button", { name: "Gerar" }).click();
        expect(api.generateStudyTool).not.toHaveBeenCalled();

        await act(async () => {
            generation.resolve(
                makeArtifact("serialized-summary", "SUMMARY", {
                    title: "Resumo serializado",
                    bullets: [],
                }),
            );
            await generation.promise;
        });
        expect(await screen.findAllByText("Resumo serializado")).toHaveLength(2);
    });
});

/** Cria uma Promise controlável para observar exclusão mútua sem timers. */
function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((next) => {
        resolve = next;
    });
    return { promise, resolve };
}
