/**
 * Testa submissão, importação e indexação de materiais privados.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionFeedbackProvider } from "../../features/mf5/action-feedback.js";

const apiMocks = vi.hoisted(() => ({
    listLatestPrivateMaterialIndexJobs: vi.fn(),
    getMaterialIndexJob: vi.fn(),
    indexPrivateMaterial: vi.fn(),
    submitFileMaterial: vi.fn(),
    submitTextMaterial: vi.fn(),
}));

const importMocks = vi.hoisted(() => ({ importExternalMaterial: vi.fn() }));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...apiMocks,
}));

vi.mock("../../features/mf5/external-material-imports-client.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../features/mf5/external-material-imports-client.js")>()),
    ...importMocks,
}));

import { ExternalMaterialImportPanel } from "../../features/mf5/external-material-import-panel.js";
import { MaterialList } from "./MaterialList.js";
import { MaterialSubmitForm } from "./MaterialSubmitForm.js";

const materials = [
    { _id: "done", title: "Manual PDF", type: "PDF" as const, status: "READY" as const },
    { _id: "failed", title: "Ligação", type: "URL" as const, status: "FAILED" as const },
    { _id: "queued", title: "Tópico", type: "TOPIC" as const, status: "PENDING_PROCESSING" as const },
    { _id: "new", title: "Documento", type: "DOCX" as const, status: "READY" as const },
];

const job = (materialId: string, status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED") => ({
    _id: `job-${materialId}`,
    scope: "PRIVATE_AREA" as const,
    materialId,
    studyAreaId: "study-area-id",
    status,
    extractedTextChunks: [],
    errorMessage: materialId === "failed" ? "Falha de extração" : undefined,
});

beforeEach(() => {
    for (const mock of [...Object.values(apiMocks), ...Object.values(importMocks)]) mock.mockReset();
    apiMocks.listLatestPrivateMaterialIndexJobs.mockResolvedValue([
        job("done", "DONE"),
        job("failed", "FAILED"),
        job("queued", "QUEUED"),
    ]);
    apiMocks.getMaterialIndexJob.mockResolvedValue(job("queued", "PROCESSING"));
    apiMocks.indexPrivateMaterial.mockResolvedValue(job("new", "QUEUED"));
    apiMocks.submitFileMaterial.mockResolvedValue({ _id: "file-id" });
    apiMocks.submitTextMaterial.mockResolvedValue({ _id: "text-id" });
    importMocks.importExternalMaterial.mockResolvedValue({ _id: "external-id" });
});

describe("MaterialList", () => {
    it("hidrata jobs, traduz estados e inicia uma indexação sem duplicar", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <MaterialList materials={materials} studyAreaId="study-area-id" />
            </MemoryRouter>,
        );

        expect(await screen.findByRole("link", { name: "Versões" })).toHaveProperty(
            "href",
            expect.stringContaining("/app/material-index-jobs/job-done/versoes"),
        );
        expect(screen.getByText("Falha de extração")).toBeTruthy();
        expect(screen.getByText("Ligação web")).toBeTruthy();
        expect(screen.getAllByText("Tópico")).toHaveLength(2);
        expect(screen.getByText("A processar")).toBeTruthy();
        expect(screen.getAllByText("Pronto")).toHaveLength(2);
        expect(screen.getByText(/Indexação em fila/)).toBeTruthy();

        const newMaterial = screen.getByText("Documento").closest("li")!;
        await user.click(within(newMaterial).getByRole("button", { name: "Indexar" }));
        await waitFor(() => expect(apiMocks.indexPrivateMaterial).toHaveBeenCalledWith("study-area-id", "new"));
        expect(within(newMaterial).getByText(/Indexação em fila/)).toBeTruthy();
    });

    it("representa lista vazia e falha de hidratação", async () => {
        const first = render(
            <MemoryRouter><MaterialList materials={[]} studyAreaId="study-area-id" /></MemoryRouter>,
        );
        expect(screen.getByText("Ainda não há materiais.")).toBeTruthy();
        first.unmount();

        apiMocks.listLatestPrivateMaterialIndexJobs.mockRejectedValueOnce(new Error("Jobs indisponíveis"));
        render(
            <MemoryRouter><MaterialList materials={[materials[0]]} studyAreaId="study-area-id" /></MemoryRouter>,
        );
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Jobs indisponíveis");
    });

    it("abre e descarrega Markdown sem criar jobs de indexação", async () => {
        render(
            <MemoryRouter>
                <MaterialList
                    materials={[
                        {
                            _id: "markdown-id",
                            title: "Resumo Markdown",
                            type: "MARKDOWN",
                            status: "READY",
                            contentRevision: 1,
                        },
                    ]}
                    studyAreaId="study-area-id"
                />
            </MemoryRouter>,
        );

        const card = screen.getByText("Resumo Markdown").closest("li")!;
        expect(within(card).queryByRole("button", { name: "Indexar" })).toBeNull();
        expect(within(card).getByRole("link", { name: "Abrir" })).toHaveProperty(
            "href",
            expect.stringContaining("/materiais/markdown-id"),
        );
        expect(within(card).getByRole("link", { name: /Descarregar/ })).toHaveProperty(
            "href",
            expect.stringContaining("/markdown-id/download"),
        );
    });
});

describe("MaterialSubmitForm", () => {
    function renderForm(onSubmitted = vi.fn().mockResolvedValue(undefined)) {
        return {
            onSubmitted,
            ...render(
                <ActionFeedbackProvider>
                    <MaterialSubmitForm onSubmitted={onSubmitted} studyAreaId="study-area-id" />
                </ActionFeedbackProvider>,
            ),
        };
    }

    it("valida os campos e submete tópico e URL com payloads distintos", async () => {
        const user = userEvent.setup();
        const { onSubmitted } = renderForm();

        await user.click(screen.getByRole("button", { name: "Submeter" }));
        expect(screen.getByText("Título é obrigatório.")).toBeTruthy();
        expect(screen.getByText("Texto ou tópico é obrigatório.")).toBeTruthy();

        await user.type(screen.getByLabelText("Título"), "Conceitos base");
        await user.type(screen.getByLabelText("Texto ou tópico"), "Equações do primeiro grau");
        await user.click(screen.getByRole("button", { name: "Submeter" }));
        await waitFor(() => expect(apiMocks.submitTextMaterial).toHaveBeenCalledWith("study-area-id", {
            type: "TOPIC",
            title: "Conceitos base",
            topicText: "Equações do primeiro grau",
            url: undefined,
        }));
        expect(onSubmitted).toHaveBeenCalledTimes(1);

        await user.selectOptions(screen.getByLabelText("Tipo"), "URL");
        await user.type(screen.getByLabelText("Título"), "Recurso web");
        await user.type(screen.getByLabelText("URL do material"), "https://example.test/material");
        await user.click(screen.getByRole("button", { name: "Submeter" }));
        await waitFor(() => expect(apiMocks.submitTextMaterial).toHaveBeenLastCalledWith("study-area-id", {
            type: "URL",
            title: "Recurso web",
            topicText: undefined,
            url: "https://example.test/material",
        }));
    });

    it("exige e envia um ficheiro selecionado", async () => {
        const user = userEvent.setup();
        const { onSubmitted } = renderForm();
        await user.selectOptions(screen.getByLabelText("Tipo"), "FILE");
        await user.type(screen.getByLabelText("Título"), "Ficha PDF");
        await user.click(screen.getByRole("button", { name: "Submeter" }));
        expect(screen.getByText("Ficheiro é obrigatório.")).toBeTruthy();

        const file = new File(["conteúdo"], "ficha.pdf", { type: "application/pdf" });
        await user.upload(screen.getByLabelText("Ficheiro"), file);
        await user.click(screen.getByRole("button", { name: "Submeter" }));
        await waitFor(() => expect(apiMocks.submitFileMaterial).toHaveBeenCalledWith("study-area-id", file, "Ficha PDF"));
        expect(onSubmitted).toHaveBeenCalledWith({ _id: "file-id" });
    });

    it("entrega o Markdown criado ao fluxo de detalhe", async () => {
        const user = userEvent.setup();
        const created = {
            _id: "markdown-id",
            title: "Resumo",
            type: "MARKDOWN" as const,
            status: "READY" as const,
            contentRevision: 1,
        };
        apiMocks.submitTextMaterial.mockResolvedValueOnce(created);
        const { onSubmitted } = renderForm();

        await user.selectOptions(screen.getByLabelText("Tipo"), "MARKDOWN");
        await user.type(screen.getByLabelText("Título"), "Resumo");
        await user.type(
            screen.getByLabelText("Fonte Markdown"),
            "# Resumo\n\nConteúdo suficiente.",
        );
        await user.click(screen.getByRole("button", { name: "Criar Markdown" }));

        await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(created));
    });
});

describe("ExternalMaterialImportPanel", () => {
    it("importa Google Drive/OneDrive e apresenta erros públicos", async () => {
        const user = userEvent.setup();
        const onImported = vi.fn().mockResolvedValue(undefined);
        const { unmount } = render(
            <ExternalMaterialImportPanel onImported={onImported} targetId="study-area-id" targetType="PRIVATE_STUDY_AREA" />,
        );
        await user.selectOptions(screen.getByLabelText("Origem externa"), "ONE_DRIVE");
        await user.type(screen.getByLabelText("Título importado"), "Documento externo");
        await user.type(screen.getByLabelText("Link externo"), "https://example.test/doc");
        await user.click(screen.getByRole("button", { name: "Importar link" }));
        await waitFor(() => expect(importMocks.importExternalMaterial).toHaveBeenCalledWith({
            provider: "ONE_DRIVE",
            targetType: "PRIVATE_STUDY_AREA",
            targetId: "study-area-id",
            title: "Documento externo",
            sourceUrl: "https://example.test/doc",
        }));
        expect(await screen.findByRole("status")).toHaveProperty("textContent", "Link importado como material StudyFlow.");
        unmount();

        importMocks.importExternalMaterial.mockRejectedValueOnce(new Error("Origem recusada"));
        render(<ExternalMaterialImportPanel onImported={onImported} targetId="subject-id" targetType="OFFICIAL_SUBJECT" />);
        await user.type(screen.getByLabelText("Título importado"), "Documento externo");
        await user.type(screen.getByLabelText("Link externo"), "https://example.test/doc");
        await user.click(screen.getByRole("button", { name: "Importar link" }));
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Origem recusada");
    });
});
