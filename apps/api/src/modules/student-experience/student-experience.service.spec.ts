import { StudentExperienceService, type StudentAction } from "./student-experience.service.js";

describe("StudentExperienceService ordering", () => {
    const service = Object.create(StudentExperienceService.prototype) as StudentExperienceService;

    it("orders overdue, today, upcoming and available", () => {
        const compare = (service as unknown as { compareActions: (left: StudentAction, right: StudentAction) => number }).compareActions.bind(service);
        const action = (key: string, urgency: StudentAction["urgency"], dueAt?: Date): StudentAction => ({ key, kind: "GOAL", title: key, urgency, dueAt, targetPath: "/app/plano" });
        const rows = [
            action("available", "AVAILABLE"),
            action("upcoming", "UPCOMING", new Date("2030-01-03T10:00:00Z")),
            action("today", "TODAY", new Date("2030-01-02T10:00:00Z")),
            action("overdue", "OVERDUE", new Date("2030-01-01T10:00:00Z")),
        ];
        expect(rows.sort(compare).map((item) => item.key)).toEqual(["overdue", "today", "upcoming", "available"]);
    });

    it("calculates a future occurrence without inventing a date for invalid routines", () => {
        const next = (service as unknown as { nextRoutineOccurrence: (weekdays: string[], startTime: string) => Date | undefined }).nextRoutineOccurrence.bind(service);
        expect(next(["segunda", "quarta"], "18:00")).toBeInstanceOf(Date);
        expect(next(["MONDAY", "WEDNESDAY", "FRIDAY"], "18:00")).toBeInstanceOf(Date);
        expect(next([], "18:00")).toBeUndefined();
        expect(next(["segunda"], "hora inválida")).toBeUndefined();
    });
});
