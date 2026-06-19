// apps/api/src/modules/audit-log/audit-log.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service.js";
import { AuditDomain, AuditResult } from "./dto/audit-query.dto.js";

describe("AuditLogService", () => {
    it("remove metadados sensíveis antes de persistir", async () => {
        const create = jest.fn();
        const service = new AuditLogService({ create } as never);
        await service.record({
            actorId: "507f1f77bcf86cd799439010",
            domain: AuditDomain.ROLE,
            action: "USER_ROLE_CHANGED",
            resourceType: "User",
            result: AuditResult.SUCCESS,
            metadata: { passwordHash: "secret", nextRole: "TEACHER" },
        });
        expect(create.mock.calls[0][0].metadata).toEqual({ nextRole: "TEACHER" });
    });

    it("bloqueia consulta por não admin", async () => {
        const service = new AuditLogService({} as never);
        await expect(service.list({ id: "u1", email: "t@studyflow.test", role: "TEACHER" }, {})).rejects.toBeInstanceOf(ForbiddenException);
    });
});