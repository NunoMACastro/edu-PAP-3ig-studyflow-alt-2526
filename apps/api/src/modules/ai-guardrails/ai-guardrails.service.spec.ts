// apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts
/**
 * Testa o comportamento de guardrails IA e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import { AiGuardrailContextType } from "./dto/check-ai-guardrails.dto.js";

describe("AiGuardrailsService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439015",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const resourceId = "507f1f77bcf86cd799439013";

    it("permite contexto SOLO quando a área pertence ao aluno", async () => {
        const { checkModel, service, studyAreasService } = makeService();
        studyAreasService.getMyStudyArea.mockResolvedValue({ _id: resourceId });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.SOLO,
                resourceId,
                prompt: "Explica este conteúdo.",
            }),
        ).resolves.toMatchObject({
            allowed: true,
            reasonCode: "CONTEXT_ALLOWED",
        });
        expect(studyAreasService.getMyStudyArea).toHaveBeenCalledWith(
            student.id,
            resourceId,
        );

        // A decisão persiste a razão, mas nunca o prompt privado do aluno.
        const persistedDecision = checkModel.create.mock.calls[0]?.[0];
        expect(Object.keys(persistedDecision)).not.toContain("prompt");
    });

    it("bloqueia contexto de sala sem membership", async () => {
        const { checkModel, service, studyRoomsService } = makeService();
        studyRoomsService.ensureMember.mockRejectedValue(
            new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso a esta sala.",
            }),
        );

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.STUDY_ROOM,
                resourceId,
                prompt: "Ajuda o grupo.",
            }),
        ).resolves.toMatchObject({
            allowed: false,
            reasonCode: "CONTEXT_FORBIDDEN",
        });
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: student.id,
                allowed: false,
                reasonCode: "CONTEXT_FORBIDDEN",
            }),
        );
    });

    it("permite contexto CLASS_SUBJECT quando o aluno está inscrito", async () => {
        const { service, subjectsService } = makeService();
        subjectsService.findSubjectForStudent.mockResolvedValue({
            subject: { _id: resourceId },
            schoolClass: { _id: "507f1f77bcf86cd799439020" },
        });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.CLASS_SUBJECT,
                resourceId,
                prompt: "Explica a matéria oficial.",
            }),
        ).resolves.toMatchObject({
            allowed: true,
            reasonCode: "CONTEXT_ALLOWED",
        });
        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            resourceId,
        );
    });

    it("bloqueia roles que não representam aluno", async () => {
        const { service, studyAreasService, studyRoomsService, subjectsService } =
            makeService();

        await expect(
            service.check(teacher, {
                contextType: AiGuardrailContextType.SOLO,
                resourceId,
                prompt: "Testa IA privada.",
            }),
        ).resolves.toMatchObject({
            allowed: false,
            reasonCode: "STUDENT_ROLE_REQUIRED",
        });
        expect(studyAreasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(studyRoomsService.ensureMember).not.toHaveBeenCalled();
        expect(subjectsService.findSubjectForStudent).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixtures de guardrails IA para manter os testes focados nas regras do service.
 *
 * @returns Service e dependências controladas.
 */
function makeService() {
    const checkModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const studyAreasService = { getMyStudyArea: jest.fn() };
    const studyRoomsService = { ensureMember: jest.fn() };
    const subjectsService = { findSubjectForStudent: jest.fn() };
    const service = new AiGuardrailsService(
        checkModel as never,
        studyAreasService as never,
        studyRoomsService as never,
        subjectsService as never,
    );

    return {
        checkModel,
        service,
        studyAreasService,
        studyRoomsService,
        subjectsService,
    };
}