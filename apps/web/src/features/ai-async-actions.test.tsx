/**
 * Testa que os painéis IA usam um ciclo assíncrono exclusivo e preservam os
 * payloads, mensagens e resultados públicos existentes.
 */
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    askExternalKnowledgeAi: vi.fn(),
    askSourceGroundedAi: vi.fn(),
    askStudyGroupAi: vi.fn(),
}));

vi.mock("./external-knowledge-ai/ask-external-knowledge-ai.js", () => ({
    askExternalKnowledgeAi: api.askExternalKnowledgeAi,
}));
vi.mock("./source-grounded-ai/ask-source-grounded-ai.js", () => ({
    askSourceGroundedAi: api.askSourceGroundedAi,
}));
vi.mock("./study-group-ai/ask-study-group-ai.js", () => ({
    askStudyGroupAi: api.askStudyGroupAi,
}));

import { ExternalKnowledgeAiPanel } from "./external-knowledge-ai/external-knowledge-ai-panel.js";
import { SourceGroundedAiPanel } from "./source-grounded-ai/source-grounded-ai-panel.js";
import { StudyGroupAiPanel } from "./study-group-ai/study-group-ai-panel.js";

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
});

describe("ações assíncronas dos painéis IA", () => {
    it("bloqueia double-submit e mantém o payload com fontes autorizadas", async () => {
        const user = userEvent.setup();
        const request = deferred<{
            _id: string;
            sourceJobIds: string[];
            question: string;
            answer: string;
            citations: never[];
        }>();
        api.askSourceGroundedAi.mockReturnValue(request.promise);
        render(<SourceGroundedAiPanel />);

        await user.type(screen.getByLabelText("Jobs de indexação"), "job-1, job-2");
        await user.type(screen.getByLabelText("Pergunta"), "Explica este tema");
        await user.click(screen.getByRole("button", { name: "Responder com fontes" }));

        const pendingButton = screen.getByRole("button", { name: "A responder..." });
        expect((pendingButton as HTMLButtonElement).disabled).toBe(true);
        pendingButton.click();
        expect(api.askSourceGroundedAi).toHaveBeenCalledTimes(1);
        expect(api.askSourceGroundedAi).toHaveBeenCalledWith({
            sourceJobIds: ["job-1", "job-2"],
            question: "Explica este tema",
        });

        await act(async () => {
            request.resolve({
                _id: "answer-1",
                sourceJobIds: ["job-1", "job-2"],
                question: "Explica este tema",
                answer: "Resposta fundamentada",
                citations: [],
            });
            await request.promise;
        });
        expect(await screen.findByText("Resposta fundamentada")).toBeTruthy();
    });

    it("mantém a mensagem técnica controlada no painel de conhecimento externo", async () => {
        const user = userEvent.setup();
        api.askExternalKnowledgeAi.mockRejectedValue(new Error("Finalidade desativada"));
        render(<ExternalKnowledgeAiPanel />);

        await user.type(screen.getByLabelText("Área de estudo"), " area-1 ");
        await user.type(screen.getByLabelText("Pergunta"), " Questão externa ");
        await user.click(screen.getByRole("button", { name: "Responder" }));

        expect(await screen.findByRole("alert")).toHaveProperty(
            "textContent",
            "Finalidade desativada",
        );
        expect(api.askExternalKnowledgeAi).toHaveBeenCalledWith({
            studyAreaId: "area-1",
            question: "Questão externa",
            allowExternalKnowledge: false,
        });
    });

    it("mantém grupo, fontes e resposta no painel coletivo", async () => {
        const user = userEvent.setup();
        api.askStudyGroupAi.mockResolvedValue({
            _id: "group-answer-1",
            groupId: "group-1",
            question: "Questão coletiva",
            answer: "Resposta do grupo",
            sources: [{ shareId: "share-1", title: "Fonte comum" }],
        });
        render(<StudyGroupAiPanel initialGroupId="group-1" />);

        await user.type(screen.getByLabelText("Fontes"), "share-1, share-2");
        await user.type(screen.getByLabelText("Pergunta"), "Questão coletiva");
        await user.click(screen.getByRole("button", { name: "Responder" }));

        expect(await screen.findByText("Resposta do grupo")).toBeTruthy();
        expect(api.askStudyGroupAi).toHaveBeenCalledWith("group-1", {
            question: "Questão coletiva",
            sourceShareIds: ["share-1", "share-2"],
        });
    });
});

/** Cria uma Promise controlável para observar o estado pendente sem timers. */
function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((next) => {
        resolve = next;
    });
    return { promise, resolve };
}
