// apps/api/src/modules/context-notifications/context-notifications.service.spec.ts
import { ContextNotificationsService } from "./context-notifications.service.js";
import {
    ContextNotificationEventType,
    ContextNotificationTargetType,
} from "./dto/create-context-notification.dto.js";

describe("ContextNotificationsService", () => {
    it("calcula destinatários de turma e respeita preferências in-app", async () => {
        const createdRows: unknown[] = [];
        const model = {
            create: jest.fn(async (row) => {
                createdRows.push(row);
                return { toObject: () => ({ _id: "n1", createdAt: new Date(), ...row }) };
            }),
        };
        const classesService = {
            findOwnedClass: jest.fn(async () => ({ studentIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"] })),
        };
        const groupsService = { ensureMember: jest.fn() };
        const preferencesService = {
            // O segundo aluno fica suprimido para provar que a lista não é cega.
            isInAppEnabled: jest.fn(async (userId: string) => userId.endsWith("11")),
        };
        const service = new ContextNotificationsService(
            model as never,
            classesService as never,
            groupsService as never,
            preferencesService as never,
        );

        const result = await service.create(
            { id: "507f1f77bcf86cd799439010", email: "teacher@studyflow.test", role: "TEACHER" },
            {
                targetType: ContextNotificationTargetType.CLASS,
                targetId: "507f1f77bcf86cd799439013",
                eventType: ContextNotificationEventType.MATERIAL_CREATED,
                title: "Novo material",
                body: "Consulta o PDF da aula.",
            },
        );

        expect(classesService.findOwnedClass).toHaveBeenCalled();
        expect(result.recipientIds).toHaveLength(1);
        expect(result.suppressedRecipientIds).toHaveLength(1);
        expect(createdRows).toHaveLength(1);
    });
});