import { describe, expect, it } from "@jest/globals";
import { parsePrivateStudyMaterialTargetArgs } from "./migrate-private-study-material-targets.js";

describe("migrate-private-study-material-targets CLI", () => {
    it("é dry-run por defeito", () => {
        expect(parsePrivateStudyMaterialTargetArgs([])).toBe("DRY_RUN");
        expect(parsePrivateStudyMaterialTargetArgs(["--dry-run"])).toBe("DRY_RUN");
    });

    it("só escreve com --apply explícito", () => {
        expect(parsePrivateStudyMaterialTargetArgs(["--apply"])).toBe("APPLY");
        expect(() => parsePrivateStudyMaterialTargetArgs(["--unknown"])).toThrow();
    });
});
