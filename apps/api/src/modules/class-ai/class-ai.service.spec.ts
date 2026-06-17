/**
 * Testa o comportamento de turma ai e documenta os cenários de aceitação automatizados.
 */
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
        const { aiProvider, interactionModel, materialsService, service } =
            makeService();
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
        const { aiProvider, interactionModel, materialsService, service } =
            makeService();
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
    const service = new ClassAiService(
        interactionModel as never,
        aiProvider as never,
        subjectsService as never,
        materialsService as never,
        voiceService as never,
    );

    return {
        aiProvider,
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
