/** Testes da hierarquia e dos estados da conversa partilhada do Assistente. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentAssistantConversationView } from "./StudentAssistantConversationView.js";
import * as api from "../../lib/apiClient.js";

vi.mock("../../components/ai/AiConsentGate.js", () => ({
    AiConsentGate: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => {
    const original = await importOriginal<typeof import("../../lib/apiClient.js")>();
    return {
        ...original,
        deleteStudentAssistantConversation: vi.fn(),
        listStudentAssistantForkInvitations: vi.fn(),
        listStudentAssistantForkRecipients: vi.fn(),
        getStudentAssistantArtifactJob: vi.fn(),
        getStudentAssistantConversation: vi.fn(),
        listStudentAssistantArtifactJobs: vi.fn(),
        listStudentAssistantArtifacts: vi.fn(),
        listStudentAssistantMessages: vi.fn(),
        updateStudentAssistantConversation: vi.fn(),
    };
});

const baseConversation: api.StudentAssistantConversation = {
    id: "conversation-id",
    title: "Nova conversa",
    status: "ACTIVE",
    origin: "NATIVE",
    context: {
        kind: "STUDY_AREA",
        id: "area-id",
        label: "Bases de Dados",
        secondaryLabel: "Estudo pessoal",
        access: "ACTIVE",
        targetPath: "/app/areas/area-id",
    },
    readOnly: false,
    capabilities: { canInviteFork: false, canCreateArtifact: true },
};

describe("StudentAssistantConversationView", () => {
    beforeEach(() => {
        vi.mocked(api.getStudentAssistantConversation).mockReset();
        vi.mocked(api.listStudentAssistantMessages).mockReset();
        vi.mocked(api.listStudentAssistantArtifacts).mockReset();
        vi.mocked(api.listStudentAssistantArtifactJobs).mockReset();
        vi.mocked(api.getStudentAssistantArtifactJob).mockReset();
        vi.mocked(api.updateStudentAssistantConversation).mockReset();
        vi.mocked(api.deleteStudentAssistantConversation).mockReset();
        vi.mocked(api.listStudentAssistantForkInvitations).mockReset();
        vi.mocked(api.listStudentAssistantForkRecipients).mockReset();
        vi.mocked(api.getStudentAssistantConversation).mockResolvedValue(baseConversation);
        vi.mocked(api.listStudentAssistantMessages).mockResolvedValue({
            items: [],
            previousCursor: null,
        });
        vi.mocked(api.listStudentAssistantArtifacts).mockResolvedValue({
            items: [],
            previousCursor: null,
        });
        vi.mocked(api.listStudentAssistantArtifactJobs).mockResolvedValue([]);
        vi.mocked(api.listStudentAssistantForkInvitations).mockResolvedValue({
            items: [],
            nextCursor: null,
        });
        vi.mocked(api.listStudentAssistantForkRecipients).mockResolvedValue({
            items: [{ id: "recipient-id", email: "colega@example.test" }],
            nextCursor: null,
        });
    });

    it("organiza o launcher com empty state compacto, dock e ações secundárias", async () => {
        const onNewConversation = vi.fn();
        const onChangeContext = vi.fn();
        renderConversation({
            launcherActions: { onChangeContext, onNewConversation },
            variant: "launcher",
        });

        expect(await screen.findByRole("heading", { name: "Nova conversa" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Abrir área" })).toBeTruthy();
        expect(screen.getByText("Ainda não há mensagens").parentElement?.parentElement?.className).toContain("gap-3");
        expect(screen.getByRole("button", { name: "Criar material de estudo" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Renomear" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Mais ações" }));
        expect(screen.getByRole("button", { name: "Renomear" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Arquivar" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Apagar" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Nova conversa" }));
        fireEvent.click(screen.getByRole("button", { name: "Mudar contexto" }));
        expect(onNewConversation).toHaveBeenCalledTimes(1);
        expect(onChangeContext).toHaveBeenCalledTimes(1);
    });

    it("não apresenta o chrome exclusivo do launcher na página completa", async () => {
        renderConversation({ variant: "page" });
        expect(await screen.findByRole("heading", { name: "Nova conversa" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Nova conversa" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Mudar contexto" })).toBeNull();
        expect(screen.getByRole("button", { name: "Criar material de estudo" })).toBeTruthy();
    });

    it.each([
        ["SUBJECT", "Abrir disciplina"],
        ["STUDY_AREA", "Abrir área"],
        ["STUDY_GROUP", "Abrir grupo"],
        ["STUDY_ROOM", "Abrir sala"],
        ["GUIDED_ROOM", "Abrir sala guiada"],
    ] as const)("usa o link contextual de %s", async (kind, linkLabel) => {
        vi.mocked(api.getStudentAssistantConversation).mockResolvedValue({
            ...baseConversation,
            context: {
                ...baseConversation.context,
                kind,
                targetPath: "/app/contexto",
            },
        });
        renderConversation({ variant: "launcher" });
        expect(await screen.findByRole("link", { name: linkLabel })).toBeTruthy();
    });

    it("fecha Mais ações por Escape e restitui o foco", async () => {
        renderConversation({ variant: "launcher" });
        const trigger = await screen.findByRole("button", { name: "Mais ações" });
        fireEvent.click(trigger);
        expect(screen.getByRole("button", { name: "Renomear" })).toBeTruthy();
        fireEvent.keyDown(document, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("button", { name: "Renomear" })).toBeNull());
        await waitFor(() => expect(document.activeElement).toBe(trigger));

        fireEvent.click(trigger);
        fireEvent.pointerDown(document.body);
        await waitFor(() => expect(screen.queryByRole("button", { name: "Renomear" })).toBeNull());
        await waitFor(() => expect(document.activeElement).toBe(trigger));
    });

    it("mantém conversas arquivadas sem composer e permite restaurar", async () => {
        vi.mocked(api.getStudentAssistantConversation).mockResolvedValue({
            ...baseConversation,
            status: "ARCHIVED",
        });
        renderConversation({ variant: "launcher" });
        await screen.findByRole("heading", { name: "Nova conversa" });
        expect(screen.queryByLabelText("Pergunta ao Assistente")).toBeNull();
        expect(screen.queryByRole("button", { name: "Criar material de estudo" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Mais ações" }));
        expect(screen.getByRole("button", { name: "Restaurar" })).toBeTruthy();
    });

    it("mantém o histórico read-only e conserva apenas a navegação do launcher", async () => {
        vi.mocked(api.getStudentAssistantConversation).mockResolvedValue({
            ...baseConversation,
            context: {
                ...baseConversation.context,
                access: "REVOKED",
                targetPath: undefined,
            },
            readOnly: true,
            readOnlyReason: "ACCESS_REVOKED",
        });
        const onNewConversation = vi.fn();
        const onChangeContext = vi.fn();
        renderConversation({
            launcherActions: { onChangeContext, onNewConversation },
            variant: "launcher",
        });
        expect(await screen.findByText(/O acesso a este contexto terminou/)).toBeTruthy();
        expect(screen.queryByLabelText("Pergunta ao Assistente")).toBeNull();
        expect(screen.queryByRole("button", { name: "Criar material de estudo" })).toBeNull();
        expect(screen.getByRole("button", { name: "Nova conversa" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Mudar contexto" })).toBeTruthy();
    });

    it("bloqueia organização e nova geração enquanto um quiz está ativo", async () => {
        vi.mocked(api.listStudentAssistantArtifactJobs).mockResolvedValue([
            {
                id: "job-id",
                type: "QUIZ",
                status: "PROCESSING",
                createdAt: "2026-07-12T12:00:00.000Z",
            },
        ]);
        renderConversation({ variant: "launcher" });
        await screen.findByText("A preparar o quiz…");
        expect(screen.queryByRole("button", { name: "Criar material de estudo" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Mais ações" }));
        expect((screen.getByRole("button", { name: "Arquivar" }) as HTMLButtonElement).disabled).toBe(true);
        expect((screen.getByRole("button", { name: "Apagar" }) as HTMLButtonElement).disabled).toBe(true);
    });

    it("expõe partilha apenas quando autorizada e identifica perguntas herdadas", async () => {
        vi.mocked(api.getStudentAssistantConversation).mockResolvedValue({
            ...baseConversation,
            origin: "FORK",
            fork: {
                inheritedTurnCount: 1,
                forkedAt: "2026-07-13T10:00:00.000Z",
            },
            context: {
                ...baseConversation.context,
                kind: "STUDY_ROOM",
            },
            capabilities: { canInviteFork: true, canCreateArtifact: true },
        });
        vi.mocked(api.listStudentAssistantMessages).mockResolvedValue({
            items: [{
                id: "turn-id",
                question: "Pergunta recebida",
                answer: "Resposta recebida",
                citations: [],
                createdAt: "2026-07-13T09:00:00.000Z",
                inherited: true,
            }],
            previousCursor: null,
        });
        renderConversation({ variant: "page" });

        expect(await screen.findByText("Fork recebido")).toBeTruthy();
        expect(screen.getByText("Pergunta herdada")).toBeTruthy();
        const trigger = screen.getByRole("button", { name: "Mais ações" });
        fireEvent.click(trigger);
        fireEvent.click(screen.getByRole("button", { name: "Partilhar conversa" }));
        expect(await screen.findByRole("dialog", { name: "Partilhar conversa" })).toBeTruthy();
        expect(screen.getByText(/não poderá ser revogada/)).toBeTruthy();
        fireEvent.keyDown(document, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Partilhar conversa" })).toBeNull());
        await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
});

function renderConversation({
    launcherActions,
    variant,
}: {
    launcherActions?: {
        onChangeContext: () => void;
        onNewConversation: () => void;
    };
    variant: "launcher" | "page";
}) {
    return render(
        <MemoryRouter>
            <StudentAssistantConversationView
                conversationId="conversation-id"
                launcherActions={launcherActions}
                variant={variant}
            />
        </MemoryRouter>,
    );
}
