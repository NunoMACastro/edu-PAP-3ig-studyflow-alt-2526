/**
 * Testa políticas administrativas de notificações.
 */
import { HttpException } from "@nestjs/common";
import { NotificationPoliciesService } from "./notification-policies.service.js";

const contextId = "507f1f77bcf86cd799439010";
const recipientId = "507f1f77bcf86cd799439011";

describe("NotificationPoliciesService", () => {
    it("bloqueia quota por destinatário individual e não por total agregado", async () => {
        const { notificationModel, service } = makeService();
        notificationModel.aggregate.mockResolvedValueOnce([{ _id: recipientId, count: 20 }]);

        await expect(
            service.assertWithinQuota([recipientId], contextId),
        ).rejects.toBeInstanceOf(HttpException);

        expect(notificationModel.aggregate).toHaveBeenCalledWith(
            expect.arrayContaining([
                { $unwind: "$recipientIds" },
                { $group: { _id: "$recipientIds", count: { $sum: 1 } } },
            ]),
        );
    });
});

/**
 * Executa o apoio de teste para políticas de notificações, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const policyModel = {
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                channel: "IN_APP",
                enabled: true,
                maxPerUserPerDay: 20,
                maxPerContextPerHour: 50,
            }),
        }),
    };
    const notificationModel = {
        countDocuments: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue([]),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    return {
        notificationModel,
        service: new NotificationPoliciesService(
            policyModel as never,
            notificationModel as never,
            auditLogService as never,
        ),
    };
}
