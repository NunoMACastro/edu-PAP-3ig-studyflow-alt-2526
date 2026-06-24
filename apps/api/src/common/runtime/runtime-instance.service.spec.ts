// apps/api/src/common/runtime/runtime-instance.service.spec.ts
import { RuntimeInstanceService } from "./runtime-instance.service.js";

describe("RuntimeInstanceService", () => {
    it("não devolve dados pessoais", () => {
        const result = new RuntimeInstanceService().describe();

        // O smoke protege a fronteira de privacidade do endpoint técnico.
        expect(Object.keys(result)).toEqual(["instanceId", "sessionStore", "persistentStore"]);
        expect(JSON.stringify(result)).not.toMatch(/cookie|email|password|sessionId|userId/i);
    });
});