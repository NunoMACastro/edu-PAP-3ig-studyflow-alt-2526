/**
 * Testa a exportação segura de resumos e quizzes da MF8.
 */
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
    ArtifactExportService,
    ExportableAiArtifact,
    renderAiArtifactMarkdown,
    validateArtifactExportFormat,
} from "./artifact-export.service.js";

const userId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439011";
const artifactId = "507f1f77bcf86cd799439016";

describe("ArtifactExportService", () => {
    /**
     * Confirma que resumos são exportados com fontes mínimas.
     */
    it("exporta resumo autorizado em Markdown", async () => {
        const { artifactModel, areasService, service } = makeService();
        artifactModel.findOne.mockResolvedValue(makeSummaryDocument());

        await expect(
            service.exportArtifact(userId, studyAreaId, artifactId, "md"),
        ).resolves.toMatchObject({
            fileName: "studyflow-resumo-99439016.md",
            contentType: "text/markdown; charset=utf-8",
            disposition: "attachment",
        });

        const file = await service.exportArtifact(
            userId,
            studyAreaId,
            artifactId,
            "md",
        );
        expect(file.body).toContain("# Frações");
        expect(file.body).toContain("- Fração representa parte de um todo.");
        expect(file.body).toContain("Fonte autorizada");
        expect(file.body).not.toContain("Texto completo privado");
        expect(areasService.getMyStudyArea).toHaveBeenCalledWith(
            userId,
            studyAreaId,
        );
    });

    /**
     * Confirma que o formato PDF devolve documento imprimível.
     */
    it("prepara HTML de impressão para PDF", async () => {
        const { artifactModel, service } = makeService();
        artifactModel.findOne.mockResolvedValue(makeSummaryDocument());

        const file = await service.exportArtifact(
            userId,
            studyAreaId,
            artifactId,
            "pdf",
        );

        expect(file).toMatchObject({
            fileName: "studyflow-resumo-99439016.html",
            contentType: "text/html; charset=utf-8",
            disposition: "inline",
        });
        expect(file.body).toContain("<!doctype html>");
        expect(file.body).toContain("Frações");
    });

    /**
     * Confirma que formato inválido falha antes da query.
     */
    it("rejeita formato inválido", () => {
        expect(() => validateArtifactExportFormat("docx")).toThrow(
            BadRequestException,
        );
    });

    /**
     * Confirma que artefactos de outro aluno ou área não são exportados.
     */
    it("rejeita artefacto inacessível", async () => {
        const { artifactModel, service } = makeService();
        artifactModel.findOne.mockResolvedValue(null);

        await expect(
            service.exportArtifact(userId, studyAreaId, artifactId, "md"),
        ).rejects.toBeInstanceOf(NotFoundException);

        const query = artifactModel.findOne.mock.calls[0]?.[0] as Record<
            string,
            unknown
        >;
        expect(String(query.userId)).toBe(userId);
        expect(String(query.studyAreaId)).toBe(studyAreaId);
    });

    /**
     * Confirma que quizzes exportados não revelam respostas corretas.
     */
    it("renderiza quiz sem resposta correta", () => {
        const markdown = renderAiArtifactMarkdown(makeQuizArtifact());

        expect(markdown).toContain("## Quiz");
        expect(markdown).toContain("### Pergunta 1");
        expect(markdown).toContain("1. Numerador");
        expect(markdown).not.toContain("correctOptionIndex");
        expect(markdown).not.toContain("Resposta correta");
    });
});

/**
 * Cria service com mocks isolados.
 *
 * @returns Service e dependências mockadas.
 */
function makeService() {
    const artifactModel = {
        findOne: jest.fn(),
    };
    const areasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };

    return {
        artifactModel,
        areasService,
        service: new ArtifactExportService(
            artifactModel as never,
            areasService as never,
        ),
    };
}

/**
 * Cria documento Mongoose simulado para resumo.
 *
 * @returns Documento com `toObject`.
 */
function makeSummaryDocument() {
    return {
        /**
         * Transforma o apoio de teste para ai, mantendo o cenário legível e próximo do comportamento real validado.
         *
         * @returns Contrato público pronto para a UI, sem campos internos de persistência.
         */
        toObject: () => ({
            _id: artifactId,
            type: "SUMMARY",
            contentJson: {
                title: "Frações",
                bullets: ["Fração representa parte de um todo."],
                sourceMaterialIds: ["507f1f77bcf86cd799439010"],
            },
            sourcesJson: [
                {
                    materialId: "507f1f77bcf86cd799439010",
                    title: "Fonte autorizada",
                    contentText:
                        "Texto completo privado que não pode sair inteiro porque pertence ao material do aluno.",
                },
            ],
        }),
    };
}

/**
 * Cria quiz persistido simulado.
 *
 * @returns Artefacto exportável.
 */
function makeQuizArtifact(): ExportableAiArtifact {
    return {
        _id: artifactId,
        type: "QUIZ",
        contentJson: {
            title: "Quiz de frações",
            questions: [
                {
                    question: "Como se chama o número de cima?",
                    options: ["Numerador", "Denominador", "Quociente", "Resto"],
                    correctOptionIndex: 0,
                },
            ],
        },
        sourcesJson: [{ title: "Fonte autorizada" }],
    };
}
