/** Cobre upload multipart e estados oficiais visíveis ao professor. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    createOfficialMaterial: vi.fn(),
    getMaterialIndexJob: vi.fn(),
    indexOfficialMaterial: vi.fn(),
    listLatestOfficialMaterialIndexJobs: vi.fn(),
    listOfficialMaterials: vi.fn(),
    uploadOfficialMaterialFile: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { TeacherOfficialMaterialsPage } from "./TeacherOfficialMaterialsPage.js";

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listOfficialMaterials.mockResolvedValue([]);
    api.listLatestOfficialMaterialIndexJobs.mockResolvedValue([]);
    api.uploadOfficialMaterialFile.mockResolvedValue({});
});

describe("TeacherOfficialMaterialsPage", () => {
    it("oferece materiais textuais, Markdown e ficheiros e submete um PDF", async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText("Ainda não há materiais oficiais.");
        await user.click(screen.getByRole("button", { name: "Novo material" }));
        expect(
            Array.from(
                (screen.getByLabelText("Tipo de material") as HTMLSelectElement)
                    .options,
            ).map((option) => option.value),
        ).toEqual([
            "TEXT",
            "URL",
            "MARKDOWN",
            "MARKDOWN_FILE",
            "PDF",
            "DOCX",
        ]);
        await user.selectOptions(
            screen.getByLabelText("Tipo de material"),
            "PDF",
        );
        await user.type(screen.getByLabelText("Título"), "Manual oficial");
        const file = new File(["%PDF-conteudo"], "manual.pdf", {
            type: "application/pdf",
        });
        await user.upload(screen.getByLabelText(/Ficheiro PDF/), file);
        fireEvent.submit(
            screen.getByRole("button", { name: "Guardar material" }).closest(
                "form",
            )!,
        );

        await waitFor(() =>
            expect(api.uploadOfficialMaterialFile).toHaveBeenCalledWith(
                "subject-id",
                { title: "Manual oficial", file },
            ),
        );
    });

    it("mostra estado falhado e permite nova tentativa", async () => {
        api.listOfficialMaterials.mockResolvedValueOnce([
            {
                _id: "material-id",
                subjectId: "subject-id",
                classId: "class-id",
                teacherId: "teacher-id",
                title: "Manual oficial",
                type: "DOCX",
                status: "PENDING_PROCESSING",
                originalName: "manual.docx",
                availableToAi: false,
            },
        ]);
        api.listLatestOfficialMaterialIndexJobs.mockResolvedValueOnce([
            {
                _id: "job-id",
                scope: "OFFICIAL_SUBJECT",
                materialId: "material-id",
                status: "FAILED",
                extractedTextChunks: [],
                errorMessage: "Não foi possível processar o documento.",
            },
        ]);
        renderPage();

        expect(await screen.findByText("Falha na indexação")).toBeTruthy();
        expect(
            screen.getByRole("button", { name: "Tentar novamente" }),
        ).toBeTruthy();
        expect(
            screen.getByRole("link", { name: "Descarregar" }).getAttribute("href"),
        ).toBe("/api/official-materials/material-id/download");
    });
});

function renderPage(): void {
    render(
        <MemoryRouter>
            <TeacherOfficialMaterialsPage subjectId="subject-id" />
        </MemoryRouter>,
    );
}
