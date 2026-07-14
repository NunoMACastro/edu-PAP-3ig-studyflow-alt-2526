/**
 * Testa o comportamento de private área ai e documenta os cenários de aceitação automatizados.
 */
import {
    ForbiddenException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { PrivateAreaAiService } from "./private-area-ai.service.js";

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
const materialId = "507f1f77bcf86cd799439015";
const answerId = "507f1f77bcf86cd799439016";

describe("PrivateAreaAiService", () => {
    it("responde apenas com fontes privadas permitidas e persiste histórico", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            answerModel,
            materialsService,
            service,
            studyAreasService,
        } = makeService();

        await expect(
            service.ask(student, studyAreaId, { question: " Explica limites " }),
        ).resolves.toMatchObject({
            _id: answerId,
            studyAreaId,
            question: "Explica limites",
            answer: "Resposta baseada no material.",
            sources: [{ materialId }],
        });
        expect(studyAreasService.getMyStudyArea).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
        );
        expect(materialsService.listReadyTextSources).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
        );
        expect(aiProvider.generatePrivateAreaAnswer).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Explica limites"),
            options: { model: "gpt-test", timeoutMs: 4000 },
        });
        expect(aiConsentsService.assertGranted).toHaveBeenCalledWith(
            student.id,
            "PRIVATE_AREA_AI",
        );
        expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith("PRIVATE_AREA_AI");
        expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith({
            scope: "USER",
            targetId: student.id,
            purpose: "PRIVATE_AREA_AI",
            units: 1,
        });
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                question: "Explica limites",
                answer: "Resposta baseada no material.",
                sourceMaterialIds: [expect.any(Object)],
            }),
        );
    });

    it("bloqueia professor antes de consultar área privada", async () => {
        const { materialsService, service, studyAreasService } = makeService();

        await expect(
            service.ask(teacher, studyAreaId, { question: "Pergunta" }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(studyAreasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(materialsService.listReadyTextSources).not.toHaveBeenCalled();
    });

    it("bloqueia área sem fontes processáveis", async () => {
        const { aiProvider, materialsService, service } = makeService();
        materialsService.listReadyTextSources.mockResolvedValueOnce([]);

        await expect(
            service.ask(student, studyAreaId, { question: "Pergunta" }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generatePrivateAreaAnswer).not.toHaveBeenCalled();
    });

    it("rejeita resposta IA que referencia fonte não autorizada", async () => {
        const { aiProvider, answerModel, service } = makeService();
        aiProvider.generatePrivateAreaAnswer.mockResolvedValueOnce({
            answer: "Resposta",
            sourceMaterialIds: ["507f1f77bcf86cd799439099"],
        });

        await expect(
            service.ask(student, studyAreaId, { question: "Pergunta" }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(answerModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de IA privada da área de estudo para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const answerModel = {
        create: jest.fn().mockResolvedValue({
            _id: answerId,
            studyAreaId,
            question: "Explica limites",
            answer: "Resposta baseada no material.",
            sourceMaterialIds: [materialId],
            /**
             * Transforma o apoio de teste para IA da área privada, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-06-12T00:00:00Z") }),
        }),
    };
    const aiProvider = {
        generatePrivateAreaAnswer: jest.fn().mockResolvedValue({
            answer: "Resposta baseada no material.",
            sourceMaterialIds: [materialId],
        }),
    };
    const studyAreasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: materialId,
                title: "Limites",
                contentText: "Conteúdo sobre limites.",
            },
        ]),
    };
    const aiConsentsService = {
        assertGranted: jest.fn().mockResolvedValue(undefined),
    };
    const aiModelPoliciesService = {
        resolveForUse: jest.fn().mockResolvedValue({
            enabled: true,
            model: "gpt-test",
            timeoutMs: 5000,
            maxSourceCount: 10,
        }),
    };
    const aiQuotasService = {
        reserveUsage: jest.fn().mockResolvedValue({ usedUnits: 1 }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    const aiExecution = new GovernedAiExecutionService(
        aiProvider as never,
        aiConsentsService as never,
        aiModelPoliciesService as never,
        aiQuotasService as never,
        auditLogService as never,
    );
    const service = new PrivateAreaAiService(
        answerModel as never,
        aiExecution,
        studyAreasService as never,
        materialsService as never,
        auditLogService as never,
    );
    return {
        auditLogService,
        aiConsentsService,
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        answerModel,
        materialsService,
        service,
        studyAreasService,
    };
}
