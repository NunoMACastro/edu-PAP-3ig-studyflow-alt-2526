import { Types } from "mongoose";
import { buildCollaborationKindPlan, parseCollaborationMigrationArgs } from "./migrate-collaboration-kinds.js";

describe("collaboration kind migration", () => {
    it("é dry-run por defeito e exige runId no rollback", () => {
        expect(parseCollaborationMigrationArgs([])).toEqual({ mode: "DRY_RUN" });
        expect(() => parseCollaborationMigrationArgs(["--rollback"])).toThrow();
    });

    it("prioriza evidência de grupo e assinala conflitos", () => {
        const group = new Types.ObjectId();
        const room = new Types.ObjectId();
        const ambiguous = new Types.ObjectId();
        const plan = buildCollaborationKindPlan({
            rooms: [{ _id: group, disciplineName: "BD" }, { _id: room, disciplineName: "BD" }, { _id: ambiguous }],
            groupEvidenceIds: new Set([String(group), String(ambiguous)]),
            roomEvidenceIds: new Set([String(room), String(ambiguous)]),
        });
        expect(plan).toEqual([
            { roomId: String(group), kind: "STUDY_GROUP", ambiguous: false },
            { roomId: String(room), kind: "STUDY_ROOM", ambiguous: false },
            { roomId: String(ambiguous), kind: "STUDY_GROUP", ambiguous: true },
        ]);
    });
});
