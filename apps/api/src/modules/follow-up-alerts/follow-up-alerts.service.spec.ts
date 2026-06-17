// apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.spec.ts
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

describe("FollowUpAlertsService", () => {
    it("devolve apenas alunos sem eventos recentes na turma validada", async () => {
        const rule = {
            _id: "507f1f77bcf86cd799439010",
            classId: "507f1f77bcf86cd799439011",
            inactivityDays: 7,
            title: "Retomar estudo",
            message: "Precisas de apoio?",
            enabled: true,
        };
        const ruleModel = { findOne: jest.fn(() => ({ lean: async () => rule })) };
        const eventModel = {
            find: jest.fn(() => ({
                select: () => ({ sort: () => ({ lean: async () => [{ userId: "507f1f77bcf86cd799439012" }] }) }),
            })),
        };
        const classesService = {
            findOwnedClass: jest.fn(async () => ({
                studentIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
            })),
        };
        const notificationsService = { create: jest.fn() };
        const service = new FollowUpAlertsService(
            ruleModel as never,
            eventModel as never,
            classesService as never,
            notificationsService as never,
        );

        const result = await service.previewInactiveStudents(
            { id: "507f1f77bcf86cd799439014", email: "teacher@studyflow.test", role: "TEACHER" },
            "507f1f77bcf86cd799439010",
        );

        expect(classesService.findOwnedClass).toHaveBeenCalledWith(
            "507f1f77bcf86cd799439014",
            "507f1f77bcf86cd799439011",
        );
        expect(result).toEqual([{ studentId: "507f1f77bcf86cd799439013", lastActivityAt: null }]);
    });
});