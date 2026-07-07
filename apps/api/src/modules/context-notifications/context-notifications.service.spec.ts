/**
 * Testa notificações de contexto com destinatários calculados no backend.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ContextNotificationsService } from "./context-notifications.service.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "professor@example.test",
    role: "TEACHER",
};
const classId = "507f1f77bcf86cd799439011";
const allowedStudentId = "507f1f77bcf86cd799439012";
const outsideStudentId = "507f1f77bcf86cd799439013";

describe("ContextNotificationsService", () => {
    it("rejeita destinatários filtrados que não pertencem ao contexto", async () => {
        const { service } = makeService();

        await expect(
            service.createForRecipients(
                teacher,
                {
                    contextType: "CLASS",
                    contextId: classId,
                    type: "FOLLOW_UP",
                    title: "Acompanhamento",
                    body: "Volta ao estudo.",
                },
                [outsideStudentId],
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("persiste apenas destinatários permitidos e respeita preferências", async () => {
        const { notificationModel, policiesService, service } = makeService();

        await service.createForRecipients(
            teacher,
            {
                contextType: "CLASS",
                contextId: classId,
                type: "FOLLOW_UP",
                title: " Acompanhamento ",
                body: " Volta ao estudo. ",
            },
            [allowedStudentId],
        );

        expect(policiesService.assertWithinQuota).toHaveBeenCalledWith([allowedStudentId], classId);
        expect(notificationModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Acompanhamento",
                body: "Volta ao estudo.",
                recipientIds: [expect.any(Types.ObjectId)],
            }),
        );
    });
});

/**
 * Executa o apoio de teste para notificações contextuais, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const notificationModel = {
        create: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439099",
            contextType: "CLASS",
            contextId: classId,
            actorId: teacher.id,
            type: "FOLLOW_UP",
            title: "Acompanhamento",
            body: "Volta ao estudo.",
            recipientIds: [allowedStudentId],
            suppressedRecipientIds: [],
            /**
             * Transforma o apoio de teste para notificações contextuais, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject() {
                return this;
            },
        }),
        find: jest.fn(),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            studentIds: [allowedStudentId],
        }),
    };
    const groupsService = {
        ensureMember: jest.fn(),
    };
    const preferencesService = {
        isInAppEnabled: jest.fn().mockResolvedValue(true),
    };
    const policiesService = {
        assertWithinQuota: jest.fn().mockResolvedValue(undefined),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        notificationModel,
        policiesService,
        service: new ContextNotificationsService(
            notificationModel as never,
            classesService as never,
            groupsService as never,
            preferencesService as never,
            policiesService as never,
            auditLogService as never,
        ),
    };
}
