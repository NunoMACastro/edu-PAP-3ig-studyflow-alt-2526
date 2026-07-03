/**
 * Testa o comportamento de ai guardrails e documenta os cenários de aceitação automatizados.
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
    const resourceId = "507f1f77bcf86cd799439013";

    it("permite contexto SOLO quando a área pertence ao aluno", async () => {
        const { checkModel, studyAreasService, service } = makeService();
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
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: student.id,
                allowed: true,
            }),
        );
        const persistedDecision = checkModel.create.mock.calls[0]?.[0];
        expect(Object.keys(persistedDecision)).not.toContain(
            ["prompt", "Preview"].join(""),
        );
    });

    it("bloqueia contexto de sala sem membership e guarda decisão", async () => {
        const { checkModel, studyRoomsService, service } = makeService();
        studyRoomsService.ensureMember.mockRejectedValue(
            new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso.",
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

    it("valida contexto CLASS_SUBJECT pelo service de disciplinas", async () => {
        const { checkModel, service, subjectsService } = makeService();
        subjectsService.findSubjectForStudent.mockResolvedValue({
            subject: { _id: resourceId },
        });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.CLASS_SUBJECT,
                resourceId,
                prompt: "Ajuda-me na disciplina.",
            }),
        ).resolves.toMatchObject({
            allowed: true,
            reasonCode: "CONTEXT_ALLOWED",
        });

        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            resourceId,
        );
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.not.objectContaining({ prompt: expect.any(String) }),
        );
    });

    it("bloqueia utilizador não aluno sem consultar recursos", async () => {
        const { service, studyAreasService, studyRoomsService, subjectsService } =
            makeService();

        await expect(
            service.check(
                { ...student, role: "TEACHER" },
                {
                    contextType: AiGuardrailContextType.SOLO,
                    resourceId,
                    prompt: "Tentativa fora do papel de aluno.",
                },
            ),
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
 * Cria fixture ou estrutura auxiliar de guardrails de IA para manter testes e prompts legíveis.
 * @returns Valor de guardrails de IA no contrato esperado pelo chamador.
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
        studyAreasService,
        studyRoomsService,
        subjectsService,
        service,
    };
}
