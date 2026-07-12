/**
 * Testa a reconciliação determinística de histórico e eventos WebSocket.
 */
import { describe, expect, it } from "vitest";
import { mergeMessages } from "./SubjectChatPanel.js";
import type { SubjectChatMessage } from "./subject-chat-client.js";

function message(id: string, createdAt: string): SubjectChatMessage {
    return {
        _id: id,
        threadId: "thread",
        subjectId: "subject",
        classId: "class",
        authorUserId: "user",
        authorRole: "STUDENT",
        text: id,
        createdAt,
    };
}

describe("mergeMessages", () => {
    it("não perde evento recebido durante o fetch nem duplica ids", () => {
        const duplicated = message("m1", "2026-07-09T10:00:00.000Z");
        const live = message("m2", "2026-07-09T10:01:00.000Z");

        expect(mergeMessages([duplicated], [duplicated, live])).toEqual([
            duplicated,
            live,
        ]);
    });
});
