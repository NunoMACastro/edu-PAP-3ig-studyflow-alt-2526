// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts
/**
 * Testa o comportamento de IA com conhecimento externo limitado e documenta os cenários de aceitação automatizados.
 */
import {
    ForbiddenException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiProvider } from "../ai/providers/ai-provider.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";
import { ExternalKnowledgeAiAnswerDocument } from "./schemas/external-knowledge-ai-answer.schema.js";

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
            internalCitations: [expect.objectContaining({ title: "Limites" })],
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

    it("usa apenas fontes internas quando não há permissão externa", async () => {
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
                prompt: expect.stringContaining("Não uses conhecimento externo."),
            }),
        );
    });

    it("bloqueia sem fontes internas processáveis", async () => {
        const { aiProvider, materialsService, service } = makeService();
        materialsService.listReadyTextSources.mockResolvedValueOnce([]);

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Explica o tema.",
                allowExternalKnowledge: true,
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        // O provider não pode ser chamado quando falta a base interna autorizada.
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
    });

    it("bloqueia utilizadores que não sejam alunos", async () => {
        const { service, studyAreasService } = makeService();

        await expect(
            service.ask(teacher, {
                studyAreaId,
                question: "Explica limites.",
                allowExternalKnowledge: false,
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(studyAreasService.getMyStudyArea).not.toHaveBeenCalled();
    });

    it("devolve erro controlado quando o provider não devolve resposta válida", async () => {
        const { aiProvider, service } = makeService();
        aiProvider.generateStudyTool.mockResolvedValueOnce({ answer: "" });

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Como estudar limites?",
                allowExternalKnowledge: true,
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
});

/**
 * Cria dependências de teste sem rede real, sem base de dados real e sem dados privados.
 *
 * @returns Service e dependências observáveis pelos testes.
 */
function makeService() {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    } as unknown as jest.Mocked<Pick<Model<ExternalKnowledgeAiAnswerDocument>, "create">>;
    
    const studyAreasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439014",
            name: "Matemática",
        }),
    } as unknown as jest.Mocked<Pick<StudyAreasService, "getMyStudyArea">>;
    
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: "507f1f77bcf86cd799439015",
                title: "Limites",
                contentText: "Um limite descreve o valor aproximado de uma função.",
            },
        ]),
    } as unknown as jest.Mocked<Pick<MaterialsService, "listReadyTextSources">>;
    
    const aiProvider = {
        generateStudyTool: jest
            .fn()
            .mockResolvedValue({ answer: "Resposta externa gerada pelo provider." }),
    } as unknown as jest.Mocked<Pick<AiProvider, "generateStudyTool">>;

    const service = new ExternalKnowledgeAiService(
        answerModel as any,
        studyAreasService as any,
        materialsService as any,
        aiProvider as any,
    );

    return {
        answerModel,
        studyAreasService,
        materialsService,
        aiProvider,
        service,
    };
}