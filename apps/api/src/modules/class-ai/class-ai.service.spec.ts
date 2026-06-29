/**
 * Testa o comportamento de turma ai e documenta os cenários de aceitação automatizados.
 */
import * as aiContextPolicy from "../ai/context/ai-context-policy.js";
import {
    ForbiddenException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassAiService } from "./class-ai.service.js";

const subjectId = "507f1f77bcf86cd799439014";
const classId = "507f1f77bcf86cd799439015";
const materialId = "507f1f77bcf86cd799439016";

describe("ClassAiService", () => {
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

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("bloqueia perfil incompatível antes de materiais, quota, provider e persistência", async () => {
        const {
            aiProvider,
            aiQuotasService,
            interactionModel,
            materialsService,
            service,
        } = makeService();
        // Forçamos a falha da policy para provar que o service pára no guardrail de contexto.
        jest.spyOn(aiContextPolicy, "assertAiContextProfile").mockImplementationOnce(
            () => {
                throw new ForbiddenException({
                    code: "AI_CONTEXT_PROFILE_MISMATCH",
                    message: "O perfil de IA não corresponde ao contexto pedido.",
                });
            },
        );

        await expect(
            service.askClassAi(student, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "AI_CONTEXT_PROFILE_MISMATCH",
            },
        });

        expect(aiContextPolicy.assertAiContextProfile).toHaveBeenCalledWith(
            "CLASS_SUBJECT",
            "TEACHER_CLASS",
        );
        // Estes asserts provam que a falha acontece antes de ler materiais, reservar quota, chamar provider ou gravar interação.
        expect(materialsService.listProcessedForSubject).not.toHaveBeenCalled();
        expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
        expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia IA docente para utilizadores que não sejam alunos", async () => {
        const { aiProvider, interactionModel, subjectsService, service } =
            makeService();

        await expect(
            service.askClassAi(teacher, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "STUDENT_ROLE_REQUIRED",
            },
        });
        await expect(
            service.askClassAi(teacher, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findSubjectForStudent).not.toHaveBeenCalled();
        expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("não chama o provider IA quando não há materiais oficiais processados", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            interactionModel,
            materialsService,
            service,
        } = makeService();
        materialsService.listProcessedForSubject.mockResolvedValue([]);

        await expect(
            service.askClassAi(student, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "NO_OFFICIAL_AI_SOURCES",
            },
        });
        await expect(
            service.askClassAi(student, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("rejeita respostas do provider com fontes fora dos materiais autorizados", async () => {
        const { aiProvider, interactionModel, materialsService, service } =
            makeService();
        materialsService.listProcessedForSubject.mockResolvedValue([
            makeMaterial(materialId),
        ]);
        aiProvider.generateClassAnswer.mockResolvedValue({
            answer: "A derivada mede taxa de variação.",
            sourceMaterialIds: ["507f1f77bcf86cd799439099"],
        });

        await expect(
            service.askClassAi(student, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "AI_PROVIDER_INVALID_CLASS_ANSWER",
            },
        });
        await expect(
            service.askClassAi(student, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("guarda interação quando a resposta usa fontes oficiais autorizadas", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            interactionModel,
            materialsService,
            service,
        } = makeService();
        materialsService.listProcessedForSubject.mockResolvedValue([
            makeMaterial(materialId),
        ]);
        aiProvider.generateClassAnswer.mockResolvedValue({
            answer: "A derivada mede taxa de variação.",
            sourceMaterialIds: [materialId],
        });
        interactionModel.create.mockResolvedValue({
            _id: "507f1f77bcf86cd799439017",
            question: "Explica derivadas.",
            answer: "A derivada mede taxa de variação.",
            toObject: () => ({ createdAt: new Date("2026-01-01T00:00:00.000Z") }),
        });

        await expect(
            service.askClassAi(student, subjectId, {
                question: " Explica derivadas. ",
            }),
        ).resolves.toMatchObject({
            _id: "507f1f77bcf86cd799439017",
            subjectId,
            classId,
            question: "Explica derivadas.",
            answer: "A derivada mede taxa de variação.",
            sources: [makeMaterial(materialId)],
        });
        expect(interactionModel.create).toHaveBeenCalledWith({
            subjectId: expect.anything(),
            classId: expect.anything(),
            studentId: expect.anything(),
            question: "Explica derivadas.",
            answer: "A derivada mede taxa de variação.",
            sourceMaterialIds: [expect.anything()],
            voiceRulesApplied: ["Usar exemplos do quotidiano."],
        });
        expect(aiConsentsService.assertGranted).toHaveBeenCalledWith(
            student.id,
            "CLASS_AI",
        );
        expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith("CLASS_AI");
        expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith({
            scope: "CLASS",
            targetId: classId,
            purpose: "CLASS_AI",
            units: 1,
        });
        expect(aiProvider.generateClassAnswer).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Explica derivadas."),
            options: { model: "gpt-test", timeoutMs: 5000 },
        });

        it("não chama o provider quando a política de IA da disciplina está desativada", async () => {
    const {
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        interactionModel,
        materialsService,
        service,
    } = makeService();
    // A policy desativada deve falhar cedo para não listar materiais nem preparar contexto de IA.
    aiModelPoliciesService.resolveForUse.mockRejectedValueOnce(
        new ServiceUnavailableException({
            code: "AI_MODEL_POLICY_DISABLED",
            message: "Esta funcionalidade de IA está temporariamente desativada.",
        }),
    );

    await expect(
        service.askClassAi(student, subjectId, {
            question: "Explica derivadas.",
        }),
    ).rejects.toMatchObject({
        response: {
            code: "AI_MODEL_POLICY_DISABLED",
        },
    });

    expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith("CLASS_AI");
    expect(materialsService.listProcessedForSubject).not.toHaveBeenCalled();
    expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
    expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
    expect(interactionModel.create).not.toHaveBeenCalled();
});

it("não reserva quota nem chama o provider quando o prompt excede o limite", async () => {
    const {
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        interactionModel,
        materialsService,
        service,
    } = makeService();
    materialsService.listProcessedForSubject.mockResolvedValue([
        makeMaterial(materialId),
    ]);
    aiModelPoliciesService.resolveForUse.mockResolvedValueOnce({
        enabled: true,
        model: "gpt-test",
        timeoutMs: 5000,
        maxSourceCount: 10,
        maxPromptChars: 10,
    });
    // O limite curto simula a regra docente e deve bloquear antes de reservar quota ou chamar o provider.

    await expect(
        service.askClassAi(student, subjectId, {
            question: "Explica derivadas com detalhe.",
        }),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);

    expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
    expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
    expect(interactionModel.create).not.toHaveBeenCalled();
});

it("não chama o provider quando a reserva de quota falha", async () => {
    const {
        aiProvider,
        aiQuotasService,
        interactionModel,
        materialsService,
        service,
    } = makeService();
    materialsService.listProcessedForSubject.mockResolvedValue([
        makeMaterial(materialId),
    ]);
    aiQuotasService.reserveUsage.mockRejectedValueOnce(
        new ServiceUnavailableException({
            code: "AI_QUOTA_EXCEEDED",
            message: "O limite de IA da turma foi atingido.",
        }),
    );

    await expect(
        service.askClassAi(student, subjectId, {
            question: "Explica derivadas.",
        }),
    ).rejects.toMatchObject({
        response: {
            code: "AI_QUOTA_EXCEEDED",
        },
    });

    // Mesmo quando a quota é avaliada, a falha impede chamada externa e evita persistir uma resposta inexistente.
    expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith({
        scope: "CLASS",
        targetId: classId,
        purpose: "CLASS_AI",
        units: 1,
    });
    expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
    expect(interactionModel.create).not.toHaveBeenCalled();
});
    });
});

/**
 * Cria fixture ou estrutura auxiliar de IA da disciplina para manter testes e prompts legíveis.
 * @returns Valor de IA da disciplina no contrato esperado pelo chamador.
 */
function makeService() {
    const interactionModel = {
        create: jest.fn(),
    };
    const aiProvider = {
        generateClassAnswer: jest.fn(),
    };
    const subjectsService = {
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: {
                _id: subjectId,
                classId,
                teacherId: "507f1f77bcf86cd799439013",
                name: "Matemática A",
                description: "",
            },
            schoolClass: {
                _id: classId,
                teacherId: "507f1f77bcf86cd799439013",
                name: "12.º A",
                code: "12A",
                schoolYear: "2025/2026",
                studentIds: ["507f1f77bcf86cd799439012"],
            },
        }),
    };
    const materialsService = {
        listProcessedForSubject: jest.fn().mockResolvedValue([makeMaterial(materialId)]),
    };
    const voiceService = {
        findVoiceForSubject: jest.fn().mockResolvedValue({
            subjectId,
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: ["Usar exemplos do quotidiano."],
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
    const service = new ClassAiService(
        interactionModel as never,
        aiProvider as never,
        subjectsService as never,
        materialsService as never,
        voiceService as never,
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
        interactionModel,
        materialsService,
        service,
        subjectsService,
        voiceService,
    };
}

/**
 * Cria fixture ou estrutura auxiliar de IA da disciplina para manter testes e prompts legíveis.
 *
 * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
 * @returns Valor de IA da disciplina no contrato esperado pelo chamador.
 */
function makeMaterial(materialId: string) {
    return {
        _id: materialId,
        subjectId,
        classId,
        teacherId: "507f1f77bcf86cd799439013",
        title: "Derivadas",
        type: "TEXT",
        status: "PROCESSED",
        textContent: "Derivadas medem taxas de variação instantânea.",
    };
}
