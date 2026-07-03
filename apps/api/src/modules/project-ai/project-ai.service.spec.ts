/**
 * Testa o comportamento de planeamento de projetos com IA e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException, ServiceUnavailableException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ProjectAiService } from "./project-ai.service.js";

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
const projectId = "507f1f77bcf86cd799439014";
const planId = "507f1f77bcf86cd799439015";

describe("ProjectAiService", () => {
    it("cria plano apenas para aluno e projecto publicado autorizado", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            planModel,
            projectsService,
            service,
        } = makeService();

        await expect(
            service.createPlan(student, projectId, {
                studentGoal: " Entregar protótipo ",
                knownDifficulties: [" tempo "],
            }),
        ).resolves.toMatchObject({
            _id: planId,
            projectId,
            studentGoal: "Entregar protótipo",
            steps: ["Ler enunciado", "Planear entrega"],
        });
        expect(projectsService.findPublishedForStudent).toHaveBeenCalledWith(
            student.id,
            projectId,
        );
        expect(aiProvider.generateProjectPlan).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Entregar protótipo"),
            options: { model: "gpt-test", timeoutMs: 5000 },
        });
        expect(aiConsentsService.assertGranted).toHaveBeenCalledWith(
            student.id,
            "PROJECT_AI",
        );
        expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith("PROJECT_AI");
        expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith({
            scope: "USER",
            targetId: student.id,
            purpose: "PROJECT_AI",
            units: 1,
        });
        expect(planModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                studentGoal: "Entregar protótipo",
                knownDifficulties: ["tempo"],
            }),
        );
    });

    it("bloqueia professor antes de consultar projecto", async () => {
        const { projectsService, service } = makeService();

        await expect(
            service.createPlan(teacher, projectId, { studentGoal: "Plano" }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(projectsService.findPublishedForStudent).not.toHaveBeenCalled();
    });

    it("rejeita resposta IA sem passos validos e não grava plano vazio", async () => {
        const { aiProvider, planModel, service } = makeService();
        aiProvider.generateProjectPlan.mockResolvedValueOnce({
            steps: [],
            rationale: "Sem passos",
        });

        await expect(
            service.createPlan(student, projectId, { studentGoal: "Plano" }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(planModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de planeamento de projetos com IA para manter testes e prompts legíveis.
 * @returns Valor de planeamento de projetos com IA no contrato esperado pelo chamador.
 */
function makeService() {
    const planModel = {
        create: jest.fn().mockResolvedValue({
            _id: planId,
            projectId,
            studentGoal: "Entregar protótipo",
            knownDifficulties: ["tempo"],
            steps: ["Ler enunciado", "Planear entrega"],
            rationale: "Plano incremental",
            toObject: () => ({ createdAt: new Date("2026-06-12T00:00:00Z") }),
        }),
    };
    const aiProvider = {
        generateProjectPlan: jest.fn().mockResolvedValue({
            steps: ["Ler enunciado", "Planear entrega"],
            rationale: "Plano incremental",
        }),
    };
    const projectsService = {
        findPublishedForStudent: jest.fn().mockResolvedValue({
            _id: projectId,
            title: "Projecto PAP",
            brief: "Construir MVP",
        }),
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
    const service = new ProjectAiService(
        planModel as never,
        aiProvider as never,
        projectsService as never,
        aiConsentsService as never,
        aiModelPoliciesService as never,
        aiQuotasService as never,
        auditLogService as never,
    );
    return {
        auditLogService,
        aiConsentsService,
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        planModel,
        projectsService,
        service,
    };
}
