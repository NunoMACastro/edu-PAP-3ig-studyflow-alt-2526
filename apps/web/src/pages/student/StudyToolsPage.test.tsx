/**
 * Testa seleção, geração e exportação dos artefactos IA da área privada.
 */
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
    AiArtifact,
    AiArtifactGenerationJob,
} from "../../lib/apiClient.js";

const api = vi.hoisted(() => ({
    createAiArtifactGenerationJob: vi.fn(),
    exportStudyToolArtifact: vi.fn(),
    getAiArtifactGenerationJob: vi.fn(),
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
    api.createAiArtifactGenerationJob.mockImplementation(
        (_areaId: string, input: { type: AiArtifact["type"] }) =>
            Promise.resolve({
                _id: `${input.type.toLocaleLowerCase()}-job-id`,
                studyAreaId: "area-id",
                artifactType: input.type,
                status: "DONE",
                artifactId: `${input.type.toLocaleLowerCase()}-artifact-id`,
            }),
    );
    api.getAiArtifactGenerationJob.mockImplementation(
        (_areaId: string, jobId: string) => {
            const artifactType = jobId
                .replace("-job-id", "")
                .toLocaleUpperCase() as AiArtifact["type"];
            const artifactIds: Record<AiArtifact["type"], string> = {
                SUMMARY: "summary-id",
                EXPLANATION: "explanation-id",
                FLASHCARDS: "cards-id",
                QUIZ: "quiz-id",
            };
            return Promise.resolve({
                _id: jobId,
                studyAreaId: "area-id",
                artifactType,
                status: "DONE",
                artifactId: artifactIds[artifactType],
            });
        },
    );
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
    it("seleciona os tipos e coloca todos os materiais na fila background", async () => {
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
        await waitFor(() => expect(api.createAiArtifactGenerationJob).toHaveBeenCalledWith(
            "area-id",
            { type: "SUMMARY" },
        ));
        expect(await screen.findByText("Resumo: material pronto.")).toBeTruthy();

        await user.type(
            screen.getByLabelText("Tópico opcional"),
            "Normalização",
        );
        await user.click(screen.getByRole("button", { name: "Gerar" }));
        await waitFor(() => expect(api.createAiArtifactGenerationJob).toHaveBeenCalledWith(
            "area-id",
            { type: "EXPLANATION", topic: "Normalização" },
        ));
        expect(await screen.findByText("Explicação: material pronto.")).toBeTruthy();

        await user.selectOptions(screen.getByLabelText("Tipo de ferramenta"), "FLASHCARDS");
        await user.clear(screen.getByLabelText("Tópico opcional"));
        await user.type(screen.getByLabelText("Tópico opcional"), "Equações");
        await user.click(screen.getByRole("button", { name: "Gerar" }));
        await waitFor(() => expect(api.createAiArtifactGenerationJob).toHaveBeenCalledWith(
            "area-id",
            { type: "FLASHCARDS", topic: "Equações" },
        ));
        expect(await screen.findByText("Flashcards: material pronto.")).toBeTruthy();

        await user.selectOptions(screen.getByLabelText("Tipo de ferramenta"), "QUIZ");
        await user.clear(screen.getByLabelText("Tópico opcional"));
        await user.click(screen.getByRole("button", { name: "Gerar" }));
        await waitFor(() => expect(api.createAiArtifactGenerationJob).toHaveBeenCalledWith(
            "area-id",
            { type: "QUIZ", topic: undefined },
        ));
        expect(await screen.findByText("Quiz: material pronto.")).toBeTruthy();
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
        api.createAiArtifactGenerationJob.mockRejectedValueOnce(new Error("Geração recusada"));
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
        const generation = deferred<AiArtifactGenerationJob>();
        api.createAiArtifactGenerationJob.mockReturnValue(generation.promise);
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
        expect(api.createAiArtifactGenerationJob).toHaveBeenCalledTimes(1);

        await act(async () => {
            generation.resolve(
                {
                    _id: "summary-job-id",
                    studyAreaId: "area-id",
                    artifactType: "SUMMARY",
                    status: "DONE",
                    artifactId: "summary-id",
                },
            );
            await generation.promise;
        });
        expect(await screen.findByText("Resumo: material pronto.")).toBeTruthy();
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
