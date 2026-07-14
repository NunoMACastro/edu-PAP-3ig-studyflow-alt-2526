/**
 * Testa o comportamento de IA com conhecimento externo limitado e documenta os cenários de aceitação automatizados.
 */
import {
    ForbiddenException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { createGovernedAiExecutionFixture } from "../ai/governed-ai-execution.test-fixture.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";

describe("ExternalKnowledgeAiService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const studyAreaId = "507f1f77bcf86cd799439014";

    it("responde com citações internas e nota externa separada quando permitido", async () => {
        const { aiProvider, answerModel, materialsService, service, studyAreasService } =
            makeService();

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Como estudar limites?",
                allowExternalKnowledge: true,
            }),
        ).resolves.toMatchObject({
            studyAreaId,
            externalUsed: true,
            internalCitations: [
                expect.objectContaining({ title: "Limites" }),
            ],
            externalNotes: [expect.stringContaining("Nota externa limitada")],
        });
        expect(studyAreasService.getMyStudyArea).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
        );
        expect(materialsService.listReadyTextSources).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
        );
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                answer: "Resposta externa gerada pelo provider.",
                externalUsed: true,
            }),
        );
        expect(aiProvider.generateStudyTool).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "EXPLANATION",
                prompt: expect.stringContaining("Podes acrescentar contexto externo"),
            }),
        );
    });

    it("bloqueia sem fontes internas processáveis", async () => {
        const { aiProvider, answerModel, materialsService, service } = makeService();
        materialsService.listReadyTextSources.mockResolvedValueOnce([]);

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Explica o tema.",
                allowExternalKnowledge: false,
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia utilizadores que não sejam alunos", async () => {
        const { aiProvider, materialsService, service, studyAreasService } =
            makeService();

        await expect(
            service.ask(teacher, {
                studyAreaId,
                question: "Explica.",
                allowExternalKnowledge: false,
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(studyAreasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(materialsService.listReadyTextSources).not.toHaveBeenCalled();
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
    });

    it("mantém conhecimento externo bloqueado quando o aluno não dá permissão", async () => {
        const { aiProvider, answerModel, service } = makeService();

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Como estudar limites?",
                allowExternalKnowledge: false,
            }),
        ).resolves.toMatchObject({
            externalUsed: false,
            externalNotes: [],
        });
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                externalUsed: false,
                externalNotes: [],
            }),
        );
        expect(aiProvider.generateStudyTool).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining("Não uses conhecimento externo"),
            }),
        );
    });

    it("não persiste quando o provider devolve resposta inválida", async () => {
        const { aiProvider, answerModel, service } = makeService();
        aiProvider.generateStudyTool.mockResolvedValueOnce({ answer: "" });

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Como estudar limites?",
                allowExternalKnowledge: true,
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(answerModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de IA com conhecimento externo limitado para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            /**
             * Transforma o apoio de teste para IA com conhecimento externo limitado, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const studyAreasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439014",
            name: "Matemática",
        }),
    };
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: "507f1f77bcf86cd799439015",
                title: "Limites",
                contentText: "Um limite descreve o valor aproximado de uma função.",
            },
        ]),
    };
    const aiProvider = {
        generateStudyTool: jest
            .fn()
            .mockResolvedValue({ answer: "Resposta externa gerada pelo provider." }),
    };
    const service = new ExternalKnowledgeAiService(
        answerModel as never,
        studyAreasService as never,
        materialsService as never,
        createGovernedAiExecutionFixture(aiProvider),
    );
    return {
        aiProvider,
        answerModel,
        materialsService,
        service,
        studyAreasService,
    };
}
