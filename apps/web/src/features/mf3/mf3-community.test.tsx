/**
 * Exercita a comunidade MF3 como composição integrada dos seus painéis.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requestMf3Json = vi.hoisted(() => vi.fn());

vi.mock("./request-mf3-json.js", () => ({ requestMf3Json }));

import { Mf3CommunityPage } from "../../pages/student/Mf3CommunityPage.js";

function responseFor(path: string, options?: RequestInit): unknown {
    const method = options?.method ?? "GET";
    if (path === "/api/notification-preferences") {
        return method === "GET"
            ? [{ context: "STUDY_ROUTINE", email: true, push: false, inApp: true }]
            : { context: "STUDY_ROUTINE", email: false, push: false, inApp: true };
    }
    if (path.startsWith("/api/study-alerts")) {
        return [{ key: "alert-id", context: "STUDY_ROUTINE", title: "Sessão próxima", body: "Revê o plano", sourceId: "routine-id" }];
    }
    if (path === "/api/study-groups") {
        return method === "GET"
            ? [{ _id: "group-id", ownerStudentId: "student-id", title: "Grupo Matemática", memberIds: ["student-id"] }]
            : { _id: "new-group", ownerStudentId: "student-id", title: "Grupo novo", memberIds: ["student-id"] };
    }
    if (path.endsWith("/messages")) {
        return method === "GET"
            ? [{ _id: "message-id", groupId: "group-id", authorStudentId: "student-id", kind: "NOTE", text: "Nota partilhada" }]
            : { _id: "new-message", groupId: "group-id", authorStudentId: "student-id", kind: "MESSAGE", text: "Mensagem nova" };
    }
    if (path.endsWith("/sessions")) {
        return method === "GET"
            ? [{ _id: "session-id", groupId: "group-id", createdByStudentId: "student-id", title: "Revisão", startsAt: "2026-07-11T10:00:00.000Z", durationMinutes: 45 }]
            : { _id: "new-session", groupId: "group-id", title: "Sessão nova", startsAt: "2026-07-12T10:00:00.000Z", durationMinutes: 30 };
    }
    if (path.endsWith("/group-ai/questions")) {
        return { _id: "answer-id", groupId: "group-id", question: "Pergunta", answer: "Resposta coletiva", sources: [{ shareId: "share-id", title: "Nota autorizada" }] };
    }
    if (path === "/api/ai/adaptive-explanations") {
        return { _id: "adaptive-id", studyAreaId: "area-id", question: "Pergunta", answer: "Explicação adaptada pronta", suggestedNextSteps: ["Praticar"], sourceMaterialIds: [] };
    }
    if (path === "/api/ai/guardrails/check") {
        return { _id: "decision-id", contextType: "SOLO", resourceId: "area-id", allowed: false, reasonCode: "BIAS_RISK", reason: "Pedido bloqueado em segurança" };
    }
    if (path === "/api/curriculum/navigation") {
        return { topics: [{ title: "Álgebra", materialId: "material-id", sections: [{ title: "Equações", locator: "p. 2", excerpt: "Excerto" }] }] };
    }
    if (path === "/api/ai/external-knowledge-answers") {
        return { _id: "external-id", studyAreaId: "area-id", question: "Pergunta", answer: "Resposta externa controlada", externalUsed: true, internalCitations: [{ materialId: "material-id", title: "Manual", excerpt: "Excerto interno" }], externalNotes: ["Nota externa identificada"] };
    }
    if (path === "/api/ai/source-grounded-answers") {
        return { _id: "source-id", sourceJobIds: ["job-id"], question: "Pergunta", answer: "Resposta com fontes", citations: [{ sourceJobId: "job-id", materialId: "material-id", sourceLabel: "Manual", locator: "p. 3", excerpt: "Excerto autorizado" }] };
    }
    if (path === "/api/search") {
        return { query: "equação", results: [{ jobId: "job-id", materialId: "material-id", sourceLabel: "Manual", locator: "p. 4", excerpt: "Resultado encontrado" }] };
    }
    return { ok: true };
}

beforeEach(() => {
    window.history.pushState({}, "", "/app/comunidade?grupo=group-id");
    requestMf3Json.mockReset().mockImplementation((path: string, options?: RequestInit) =>
        Promise.resolve(responseFor(path, options)),
    );
});

function panel(name: string): HTMLElement {
    const heading = screen.getByRole("heading", { name });
    const section = heading.closest("section");
    if (!section) throw new Error(`Painel sem section: ${name}`);
    return section;
}

describe("Mf3CommunityPage", () => {
    it("carrega os dados colaborativos autorizados", async () => {
        render(<Mf3CommunityPage />);

        expect(await screen.findByText("Grupo Matemática")).toBeTruthy();
        expect(await screen.findByText("Nota partilhada")).toBeTruthy();
        expect(await screen.findByText("Revisão")).toBeTruthy();
        expect(await screen.findByText("Sessão próxima")).toBeTruthy();
        expect(screen.getByText("Rotinas")).toBeTruthy();
    });

    it("executa cada fluxo de IA, pesquisa e criação sem misturar contextos", async () => {
        const user = userEvent.setup();
        render(<Mf3CommunityPage />);
        await screen.findByText("Grupo Matemática");

        let scope = within(panel("Explicação adaptada"));
        await user.type(scope.getByLabelText("Área de estudo"), "0123456789abcdef01234567");
        await user.type(scope.getByLabelText("Pergunta"), "Como resolver esta equação?");
        await user.click(scope.getByRole("button", { name: "Gerar explicação" }));
        expect(await scope.findByText("Explicação adaptada pronta")).toBeTruthy();

        scope = within(panel("Guardrails IA"));
        await user.type(scope.getByLabelText("Recurso"), "area-id");
        await user.type(scope.getByLabelText("Pedido"), "Pedido para validar");
        await user.click(scope.getByRole("button", { name: "Validar" }));
        expect(await scope.findByText("Bloqueado")).toBeTruthy();
        expect(scope.getByText(/protege a segurança ética/)).toBeTruthy();

        scope = within(panel("Currículo"));
        await user.type(scope.getByLabelText("Jobs"), "job-id");
        await user.click(scope.getByRole("button", { name: "Carregar" }));
        expect(await scope.findByText("Álgebra")).toBeTruthy();

        scope = within(panel("Conhecimento externo limitado"));
        await user.type(scope.getByLabelText("Área de estudo"), "area-id");
        await user.type(scope.getByLabelText("Pergunta"), "Explica com contexto adicional");
        await user.click(scope.getByRole("checkbox"));
        await user.click(scope.getByRole("button", { name: "Responder" }));
        expect(await scope.findByText("Resposta externa controlada")).toBeTruthy();
        expect(scope.getByText("Nota externa identificada")).toBeTruthy();

        scope = within(panel("Resposta com fontes"));
        await user.type(scope.getByLabelText("Jobs de indexação"), "job-id");
        await user.type(scope.getByLabelText("Pergunta"), "Explica usando o manual");
        await user.click(scope.getByRole("button", { name: "Responder com fontes" }));
        expect(await scope.findByText("Excerto autorizado")).toBeTruthy();

        scope = within(panel("IA coletiva"));
        await user.type(scope.getByLabelText("Fontes"), "share-id");
        await user.type(scope.getByLabelText("Pergunta"), "Questão para o grupo");
        await user.click(scope.getByRole("button", { name: "Responder" }));
        expect(await scope.findByText("Resposta coletiva")).toBeTruthy();

        scope = within(panel("Pesquisa"));
        await user.type(scope.getByLabelText("Pesquisa"), "equação");
        await user.type(scope.getByLabelText("Jobs"), "job-id");
        await user.click(scope.getByRole("button", { name: "Pesquisar" }));
        expect(await scope.findByText("Resultado encontrado")).toBeTruthy();
    });

    it("cria grupo, mensagem e sessão e atualiza preferências", async () => {
        const user = userEvent.setup();
        render(<Mf3CommunityPage />);
        await screen.findByText("Grupo Matemática");

        let scope = within(panel("Grupos de estudo"));
        await user.type(scope.getByLabelText("Nome"), "Grupo novo");
        await user.type(scope.getByLabelText("Disciplina"), "Matemática");
        await user.type(scope.getByLabelText("Descrição"), "Preparação semanal");
        await user.click(scope.getByRole("button", { name: "Criar grupo" }));
        await waitFor(() => expect(requestMf3Json).toHaveBeenCalledWith("/api/study-groups", expect.objectContaining({ method: "POST" })));

        scope = within(panel("Mensagens e notas"));
        await user.selectOptions(scope.getByLabelText("Tipo"), "NOTE");
        await user.type(scope.getByLabelText("Conteúdo"), "Nova nota");
        await user.click(scope.getByRole("button", { name: "Guardar" }));
        await waitFor(() => expect(requestMf3Json).toHaveBeenCalledWith("/api/study-groups/group-id/messages", expect.objectContaining({ method: "POST" })));

        scope = within(panel("Sessões coletivas"));
        await user.type(scope.getByLabelText("Título"), "Sessão nova");
        fireEvent.change(scope.getByLabelText("Início"), { target: { value: "2026-07-12T10:00" } });
        await user.clear(scope.getByLabelText("Minutos"));
        await user.type(scope.getByLabelText("Minutos"), "30");
        await user.type(scope.getByLabelText("Objetivo"), "Rever equações");
        await user.click(scope.getByRole("button", { name: "Agendar" }));
        await waitFor(() => expect(requestMf3Json).toHaveBeenCalledWith("/api/study-groups/group-id/sessions", expect.objectContaining({ method: "POST" })));

        scope = within(panel("Notificações"));
        await user.click(scope.getByRole("checkbox", { name: "email" }));
        await waitFor(() => expect(requestMf3Json).toHaveBeenCalledWith("/api/notification-preferences", expect.objectContaining({ method: "PUT" })));

        scope = within(panel("Alertas"));
        await user.click(scope.getByRole("button", { name: /Atualizar/i }));
        expect(await scope.findByText("Revê o plano")).toBeTruthy();
    });
});
