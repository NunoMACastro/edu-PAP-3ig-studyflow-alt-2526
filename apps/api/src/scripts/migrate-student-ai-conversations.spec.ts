import { describe, expect, it } from "@jest/globals";
import { parseStudentAiConversationMigrationArgs } from "./migrate-student-ai-conversations.js";

describe("migrate-student-ai-conversations CLI", () => {
    it("usa dry-run por defeito", () => {
        expect(parseStudentAiConversationMigrationArgs([])).toEqual({ mode: "DRY_RUN" });
        expect(parseStudentAiConversationMigrationArgs(["--dry-run"])).toEqual({ mode: "DRY_RUN" });
    });

    it("exige uma flag explícita para escrever ou reverter", () => {
        expect(parseStudentAiConversationMigrationArgs(["--apply"])).toMatchObject({ mode: "APPLY" });
        expect(parseStudentAiConversationMigrationArgs(["--rollback", "run-1"])).toEqual({ mode: "ROLLBACK", runId: "run-1" });
        expect(() => parseStudentAiConversationMigrationArgs(["--rollback"])).toThrow();
        expect(() => parseStudentAiConversationMigrationArgs(["--unknown"])).toThrow();
    });
});
