// apps/api/src/modules/notification-policies/notification-policies.service.spec.ts
import { ForbiddenException, TooManyRequestsException } from "@nestjs/common";
import { NotificationChannel } from "./dto/upsert-notification-policy.dto.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";

describe("NotificationPoliciesService", () => {
    it("bloqueia gestão por utilizador não admin", async () => {
        const service = new NotificationPoliciesService({} as never, {} as never);

        await expect(
            service.list({ id: "u1", email: "teacher@studyflow.test", role: "TEACHER" }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("bloqueia envio quando a quota já foi atingida", async () => {
        const policyModel = { findOne: jest.fn(() => ({ lean: async () => ({ enabled: true, maxPerTargetPerHour: 1, maxPerUserPerDay: 1 }) })) };
        const notificationModel = { countDocuments: jest.fn(async () => 1) };
        const service = new NotificationPoliciesService(policyModel as never, notificationModel as never);

        await expect(
            service.assertWithinQuota(NotificationChannel.IN_APP, "CLASS", "507f1f77bcf86cd799439011", ["507f1f77bcf86cd799439012"]),
        ).rejects.toBeInstanceOf(TooManyRequestsException);
    });
});