/**
 * Testa o comportamento de turma ai e documenta os cenários de aceitação automatizados.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
    ForbiddenException,
    PayloadTooLargeException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import * as aiContextPolicy from "../ai/context/ai-context-policy.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
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
            classLearningActivityService,
            interactionModel,
            materialsService,
            service,
            voiceService,
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
        expect(aiConsentsService.assertGranted).toHaveBeenCalledWith(
            student.id,
            "CLASS_AI",
        );
        expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith("CLASS_AI");
        expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
        expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("não prepara materiais nem chama provider quando a policy da IA da disciplina está desativada", async () => {
        const {
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            auditLogService,
            interactionModel,
            materialsService,
            service,
            voiceService,
        } = makeService();
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
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "AI_EXECUTION_AUTHORIZATION_DENIED",
                result: "DENIED",
            }),
        );
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
            classLearningActivityService,
            interactionModel,
            materialsService,
            service,
            voiceService,
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
            /**
             * Transforma o apoio de teste para IA de turma, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
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
            teacherVoiceApplied: true,
            sources: [{ _id: materialId, title: "Derivadas" }],
        });
        expect(interactionModel.create).toHaveBeenCalledWith({
            subjectId: expect.anything(),
            classId: expect.anything(),
            studentId: expect.anything(),
            question: "Explica derivadas.",
            answer: "A derivada mede taxa de variação.",
            sourceMaterialIds: [expect.anything()],
            voiceRulesApplied: ["Usar exemplos do quotidiano."],
            voiceSource: "CLASS_BASE",
            citationSnapshots: [
                { label: "Derivadas", kind: "OFFICIAL_MATERIAL" },
            ],
        });
        expect(classLearningActivityService.recordBestEffort).toHaveBeenCalledWith({
            classId,
            studentId: student.id,
            subjectId,
            type: "CLASS_AI_INTERACTION",
            sourceEventKey: "class-ai-interaction:507f1f77bcf86cd799439017",
            occurredAt: new Date("2026-01-01T00:00:00.000Z"),
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
        expect(voiceService.resolveTeacherVoice).toHaveBeenCalledWith({
            classId,
            subjectId,
        });
        expect(aiProvider.generateClassAnswer).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Explica derivadas."),
            options: { model: "gpt-test", timeoutMs: 4000 },
        });
    });

    it("guarda as regras efetivas quando existe override da disciplina", async () => {
        const { aiProvider, interactionModel, materialsService, service, voiceService } =
            makeService();
        materialsService.listProcessedForSubject.mockResolvedValue([
            makeMaterial(materialId),
        ]);
        voiceService.resolveTeacherVoice.mockResolvedValueOnce({
            scope: "SUBJECT",
            source: "SUBJECT_OVERRIDE",
            hasOverride: true,
            subjectId,
            classId,
            tone: "SOCRATIC",
            detailLevel: "DETAILED",
            rules: ["Responder com perguntas orientadoras."],
        });
        aiProvider.generateClassAnswer.mockResolvedValue({
            answer: "A derivada mede taxa de variação.",
            sourceMaterialIds: [materialId],
        });
        interactionModel.create.mockResolvedValue({
            _id: "507f1f77bcf86cd799439018",
            question: "Explica derivadas.",
            answer: "A derivada mede taxa de variação.",
            /**
             * Transforma o apoio de teste para IA de turma, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-01-01T00:00:00.000Z") }),
        });

        await service.askClassAi(student, subjectId, {
            question: "Explica derivadas.",
        });

        expect(interactionModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                voiceRulesApplied: ["Responder com perguntas orientadoras."],
            }),
        );
        expect(aiProvider.generateClassAnswer).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Tom docente: SOCRATIC"),
            options: { model: "gpt-test", timeoutMs: 4000 },
        });
    });

    it("lista histórico paginado sem expor as regras internas da voz docente", async () => {
        const { interactionModel, service } = makeService();
        interactionModel.find.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        {
                            _id: "507f1f77bcf86cd799439017",
                            subjectId,
                            classId,
                            studentId: student.id,
                            question: "Explica derivadas.",
                            answer: "A derivada mede a taxa de variação.",
                            sourceMaterialIds: [materialId],
                            voiceSource: "SUBJECT_OVERRIDE",
                            voiceRulesApplied: ["Regra interna"],
                        },
                    ]),
                }),
            }),
        });

        const page = await service.listMyAnswers(student, subjectId);

        expect(page).toMatchObject({
            nextCursor: null,
            items: [
                {
                    _id: "507f1f77bcf86cd799439017",
                    teacherVoiceApplied: true,
                    sources: [{ _id: materialId, title: "Derivadas" }],
                },
            ],
        });
        expect(page.items[0]).not.toHaveProperty("voiceRulesApplied");
    });

    it("bloqueia prompt acima do limite docente antes de quota, provider e persistência", async () => {
        const {
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            auditLogService,
            interactionModel,
            service,
        } = makeService();
        aiModelPoliciesService.resolveForUse.mockResolvedValue({
            enabled: true,
            model: "gpt-test",
            timeoutMs: 5000,
            maxSourceCount: 10,
            maxPromptChars: 20,
        });

        await expect(
            service.askClassAi(student, subjectId, {
                question: "Explica derivadas.",
            }),
        ).rejects.toBeInstanceOf(PayloadTooLargeException);
        expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
        expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "CLASS_AI_REQUESTED",
                result: "FAILED",
            }),
        );
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
        expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith({
            scope: "CLASS",
            targetId: classId,
            purpose: "CLASS_AI",
            units: 1,
        });
        expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia perfil incompatível antes de consentimento, materiais, quota, provider e persistência", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            interactionModel,
            materialsService,
            service,
            subjectsService,
        } = makeService();
        jest.spyOn(aiContextPolicy, "assertAiContextProfile").mockImplementationOnce(
            () => {
                throw new ForbiddenException({
                    code: "AI_CONTEXT_PROFILE_MISMATCH",
                    message:
                        "O perfil pedagógico de IA não corresponde ao contexto autorizado.",
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

        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            subjectId,
        );
        expect(aiContextPolicy.assertAiContextProfile).toHaveBeenCalledWith(
            "CLASS_SUBJECT",
            "TEACHER_CLASS",
        );
        expect(aiConsentsService.assertGranted).not.toHaveBeenCalled();
        expect(aiModelPoliciesService.resolveForUse).not.toHaveBeenCalled();
        expect(materialsService.listProcessedForSubject).not.toHaveBeenCalled();
        expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
        expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("mantém consentimento e policy entre perfil e materiais oficiais", () => {
        const source = readFileSync(
            join(process.cwd(), "src/modules/class-ai/class-ai.service.ts"),
            "utf8",
        );
        const membershipIndex = source.indexOf("findSubjectForStudent(actor.id, subjectId)");
        const profileIndex = source.indexOf(
            'aiContextPolicy.assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS")',
        );
        const authorizationIndex = source.indexOf(
            'this.aiExecution.authorize(actor.id, "CLASS_AI")',
            profileIndex,
        );
        const materialsIndex = source.indexOf(
            "listProcessedForSubject",
            authorizationIndex,
        );
        const executionIndex = source.indexOf(
            "this.aiExecution.executeAuthorized",
            materialsIndex,
        );
        const providerCallbackIndex = source.indexOf(
            "provider.generateClassAnswer",
            executionIndex,
        );

        const facadeSource = readFileSync(
            join(
                process.cwd(),
                "src/modules/ai/governed-ai-execution.service.ts",
            ),
            "utf8",
        );
        const promptLimitIndex = facadeSource.indexOf(
            "assertPromptWithinLimit(prompt, policy)",
        );
        const quotaIndex = facadeSource.indexOf(
            "this.quotasService.reserveUsage",
            promptLimitIndex,
        );
        const providerIndex = facadeSource.indexOf(
            "input.invoke",
            quotaIndex,
        );

        expect(membershipIndex).toBeGreaterThanOrEqual(0);
        expect(profileIndex).toBeGreaterThan(membershipIndex);
        expect(authorizationIndex).toBeGreaterThan(profileIndex);
        expect(materialsIndex).toBeGreaterThan(authorizationIndex);
        expect(executionIndex).toBeGreaterThan(materialsIndex);
        expect(providerCallbackIndex).toBeGreaterThan(executionIndex);
        expect(promptLimitIndex).toBeGreaterThanOrEqual(0);
        expect(quotaIndex).toBeGreaterThan(promptLimitIndex);
        expect(providerIndex).toBeGreaterThan(quotaIndex);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de IA da disciplina para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const interactionModel = {
        create: jest.fn(),
        find: jest.fn(),
    };
    const aiProvider = {
        generateClassAnswer: jest.fn(),
    };
    const subjectsService = {
        findSubjectForStudentHistory: jest.fn().mockResolvedValue({
            subject: {
                _id: subjectId,
                classId,
                teacherId: "507f1f77bcf86cd799439013",
                name: "Matemática A",
                description: "",
            },
            schoolClass: { _id: classId, status: "ARCHIVED" },
        }),
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
        listByIds: jest.fn().mockResolvedValue([makeMaterial(materialId)]),
    };
    const voiceService = {
        resolveTeacherVoice: jest.fn().mockResolvedValue({
            scope: "SUBJECT",
            source: "CLASS_BASE",
            hasOverride: false,
            subjectId,
            classId,
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
            maxPromptChars: 12000,
        }),
    };
    const aiQuotasService = {
        reserveUsage: jest.fn().mockResolvedValue({ usedUnits: 1 }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
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
    const service = new ClassAiService(
        interactionModel as never,
        aiExecution,
        subjectsService as never,
        materialsService as never,
        voiceService as never,
        auditLogService as never,
        classLearningActivityService as never,
    );

    return {
        auditLogService,
        aiConsentsService,
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        classLearningActivityService,
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
 * @param materialId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
 * @returns Resultado da operação no formato esperado pelo chamador.
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
