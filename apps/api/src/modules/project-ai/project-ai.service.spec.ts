/**
 * Testa o comportamento de planeamento de projetos com IA e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException, ServiceUnavailableException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
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
const projectClassId = "507f1f77bcf86cd799439016";

describe("ProjectAiService", () => {
    it("cria plano apenas para aluno e projecto publicado autorizado", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            classLearningActivityService,
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
            options: { model: "gpt-test", timeoutMs: 4000 },
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
        expect(classLearningActivityService.recordBestEffort).toHaveBeenCalledWith({
            classId: projectClassId,
            studentId: student.id,
            type: "PROJECT_AI_PLAN",
            sourceEventKey: `project-ai-plan:${planId}`,
            occurredAt: new Date("2026-06-12T00:00:00.000Z"),
        });
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

    it("lista apenas planos do aluno e reduz a voz a um indicador booleano", async () => {
        const { planModel, service } = makeService();
        planModel.find.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        {
                            _id: planId,
                            projectId,
                            studentId: student.id,
                            studentGoal: "Entregar protótipo",
                            knownDifficulties: [],
                            steps: ["Planear"],
                            rationale: "Plano gradual",
                            voiceSource: "CLASS_BASE",
                            voiceRulesApplied: ["Regra interna"],
                        },
                    ]),
                }),
            }),
        });

        const page = await service.listPlans(student, projectId);

        expect(page).toMatchObject({
            items: [{ _id: planId, teacherVoiceApplied: true }],
            nextCursor: null,
        });
        expect(page.items[0]).not.toHaveProperty("voiceRulesApplied");
    });
});

/**
 * Cria fixture ou estrutura auxiliar de planeamento de projetos com IA para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
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
            /**
             * Transforma o apoio de teste para planeamento de projetos com IA, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-06-12T00:00:00Z") }),
        }),
        find: jest.fn(),
    };
    const aiProvider = {
        generateProjectPlan: jest.fn().mockResolvedValue({
            steps: ["Ler enunciado", "Planear entrega"],
            rationale: "Plano incremental",
        }),
    };
    const projectsService = {
        findPublishedForStudentHistory: jest.fn().mockResolvedValue({
            _id: projectId,
            classId: projectClassId,
            title: "Projecto PAP",
            brief: "Construir MVP",
        }),
        findPublishedForStudent: jest.fn().mockResolvedValue({
            _id: projectId,
            classId: projectClassId,
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
    const voiceService = {
        resolveTeacherVoice: jest.fn().mockResolvedValue({
            source: "CLASS_BASE",
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        }),
    };
    const classLearningActivityService = {
        recordBestEffort: jest.fn().mockResolvedValue(true),
    };
    const aiExecution = new GovernedAiExecutionService(
        aiProvider as never,
        aiConsentsService as never,
        aiModelPoliciesService as never,
        aiQuotasService as never,
        auditLogService as never,
    );
    const service = new ProjectAiService(
        planModel as never,
        aiExecution,
        projectsService as never,
        auditLogService as never,
        voiceService as never,
        classLearningActivityService as never,
    );
    return {
        auditLogService,
        aiConsentsService,
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        classLearningActivityService,
        planModel,
        projectsService,
        service,
        voiceService,
    };
}
