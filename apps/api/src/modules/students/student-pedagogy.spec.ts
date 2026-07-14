import {
    getStudentPedagogicalGuidance,
    resolveStudentEducationStage,
} from "./student-pedagogy.js";

describe("student pedagogy", () => {
    it.each([
        ["1.º ano", "PRIMARY"],
        ["5.º ano", "LOWER_SECONDARY"],
        ["10.º ano", "UPPER_SECONDARY"],
        ["Ensino superior", "HIGHER_EDUCATION"],
        ["legacy desconhecido", "UNKNOWN"],
        [null, "UNKNOWN"],
    ] as const)("normalizes %s to %s", (year, stage) => {
        expect(resolveStudentEducationStage(year)).toBe(stage);
    });

    it("returns neutral guidance without exposing the original year", () => {
        const guidance = getStudentPedagogicalGuidance("curso secreto 5.º ano");
        expect(guidance).toContain("progressiva");
        expect(guidance).not.toContain("curso secreto");
        expect(guidance).not.toContain("5.º");
    });
});
