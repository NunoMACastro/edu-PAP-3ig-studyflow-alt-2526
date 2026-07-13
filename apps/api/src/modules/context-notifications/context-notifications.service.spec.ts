/**
 * Testa notificações de contexto com destinatários calculados no backend.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "professor@example.test",
    role: "TEACHER",
};
const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439014",
    email: "aluno-grupo@example.test",
    role: "STUDENT",
};
const classId = "507f1f77bcf86cd799439011";
const allowedStudentId = "507f1f77bcf86cd799439012";
const outsideStudentId = "507f1f77bcf86cd799439013";
const groupId = "507f1f77bcf86cd799439015";
const groupPeerId = "507f1f77bcf86cd799439016";

describe("ContextNotificationsService", () => {
    it("permite ao professor criar uma tarefa manual para a própria turma", async () => {
        const { classesService, notificationModel, service } = makeService();

        await expect(
            service.create(teacher, {
                contextType: "CLASS",
                contextId: classId,
                type: "TASK",
                title: "Nova tarefa",
                body: "Consulta a tarefa da turma.",
            }),
        ).resolves.toMatchObject({ recipientCount: 1 });

        expect(classesService.findOwnedActiveClass).toHaveBeenCalledWith(
            teacher.id,
            classId,
        );
        expect(notificationModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ type: "TASK" }),
        );
    });

    it("não cria notificações manuais numa turma arquivada", async () => {
        const { classesService, notificationModel, service } = makeService();
        classesService.findOwnedActiveClass.mockRejectedValueOnce(
            new ForbiddenException({ code: "CLASS_NOT_ACTIVE" }),
        );

        await expect(
            service.create(teacher, {
                contextType: "CLASS",
                contextId: classId,
                type: "TASK",
                title: "Nova tarefa",
                body: "Consulta a tarefa da turma.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(notificationModel.create).not.toHaveBeenCalled();
    });

    it("permite a um aluno criar um aviso manual de material no próprio grupo", async () => {
        const { groupsService, notificationModel, service } = makeService();
        groupsService.ensureMember.mockResolvedValue({
            _id: groupId,
            memberIds: [student.id, groupPeerId],
        });

        await service.create(student, {
            contextType: "GROUP",
            contextId: groupId,
            type: "NEW_MATERIAL",
            title: "Novo material",
            body: "Partilhei um novo material com o grupo.",
        });

        expect(groupsService.ensureMember).toHaveBeenCalledWith(student.id, groupId);
        expect(notificationModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                contextType: "GROUP",
                type: "NEW_MATERIAL",
                recipientIds: [expect.any(Types.ObjectId)],
            }),
        );
    });

    it("impede o professor de fabricar um evento automático de lifecycle", async () => {
        const { classesService, notificationModel, service } = makeService();

        await expect(
            service.create(teacher, {
                contextType: "CLASS",
                contextId: classId,
                type: "CLASS_ARCHIVED",
                title: "Turma arquivada",
                body: "A turma foi arquivada.",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "CONTEXT_NOTIFICATION_AUTOMATIC_TYPE_FORBIDDEN",
            },
        });
        expect(classesService.findOwnedActiveClass).not.toHaveBeenCalled();
        expect(notificationModel.create).not.toHaveBeenCalled();
    });

    it("impede um aluno de fabricar uma remoção de membership num grupo", async () => {
        const { groupsService, notificationModel, service } = makeService();

        await expect(
            service.create(student, {
                contextType: "GROUP",
                contextId: groupId,
                type: "CLASS_MEMBERSHIP_REMOVED",
                title: "Inscrição terminada",
                body: "O acesso foi removido.",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "CONTEXT_NOTIFICATION_AUTOMATIC_TYPE_FORBIDDEN",
            },
        });
        expect(groupsService.ensureMember).not.toHaveBeenCalled();
        expect(notificationModel.create).not.toHaveBeenCalled();
    });

    it("reserva também os envios dirigidos aos tipos manuais internos", async () => {
        const { service } = makeService();

        await expect(
            service.createForRecipients(
                teacher,
                {
                    contextType: "CLASS",
                    contextId: classId,
                    type: "OFFICIAL_TEST_PUBLISHED",
                    title: "Mini-teste disponível",
                    body: "Está disponível um mini-teste.",
                },
                [allowedStudentId],
            ),
        ).rejects.toMatchObject({
            response: {
                code: "CONTEXT_NOTIFICATION_AUTOMATIC_TYPE_FORBIDDEN",
            },
        });
    });

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
        const {
            classesService,
            notificationModel,
            policiesService,
            service,
        } = makeService();

        const view = await service.createForRecipients(
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
        expect(policiesService.assertChannelEnabled).not.toHaveBeenCalled();
        expect(classesService.reserveActiveChildMutation).toHaveBeenCalledWith(
            teacher.id,
            classId,
            undefined,
        );
        expect(notificationModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Acompanhamento",
                body: "Volta ao estudo.",
                recipientIds: [expect.any(Types.ObjectId)],
            }),
        );
        expect(view).toMatchObject({
            recipientCount: 1,
            suppressedRecipientCount: 0,
        });
        expect(view).not.toHaveProperty("recipientIds");
        expect(view).not.toHaveProperty("suppressedRecipientIds");
        expect(view).not.toHaveProperty("actorId");
    });

    it("cria a tarefa da sala guiada com preferência própria e deep link derivado", async () => {
        const {
            notificationModel,
            preferencesService,
            service,
        } = makeService();

        await service.createForGuidedRoom(teacher, {
            classId,
            roomId: "507f1f77bcf86cd799439014",
            title: "Energia",
        });

        expect(preferencesService.isInAppEnabled).toHaveBeenCalledWith(
            allowedStudentId,
            NotificationContext.GUIDED_ROOM,
        );
        expect(notificationModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                contextType: "CLASS",
                type: "GUIDED_ROOM_OPENED",
                title: "Sala guiada: Energia",
                targetPath: `/app/turmas/${classId}/salas-guiadas/507f1f77bcf86cd799439014`,
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
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        }),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            studentIds: [allowedStudentId],
        }),
        findOwnedActiveClass: jest.fn().mockResolvedValue({
            _id: classId,
            studentIds: [allowedStudentId],
        }),
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
    };
    const groupsService = {
        ensureMember: jest.fn(),
    };
    const preferencesService = {
        isInAppEnabled: jest.fn().mockResolvedValue(true),
    };
    const policiesService = {
        assertWithinQuota: jest.fn().mockResolvedValue(undefined),
        assertChannelEnabled: jest.fn().mockResolvedValue(undefined),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        classesService,
        groupsService,
        notificationModel,
        policiesService,
        preferencesService,
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
