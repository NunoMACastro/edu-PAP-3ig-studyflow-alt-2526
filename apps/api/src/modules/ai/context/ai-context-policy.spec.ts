// apps/api/src/modules/ai/context/ai-context-policy.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { assertAiContextProfile } from "./ai-context-policy.js";

describe("assertAiContextProfile", () => {
    it("aceita perfil docente apenas em IA da disciplina", () => {
        // Este caso permitido mostra que a IA da disciplina só aceita o perfil docente da turma.
        expect(() =>
            assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS"),
        ).not.toThrow();
    });

    it.each([
        ["PRIVATE_AREA", "TEACHER_CLASS"],
        ["CLASS_SUBJECT", "STUDENT_PRIVATE"],
        ["CLASS_SUBJECT", "ROOM_SHARED"],
    ] as const)(
        "bloqueia contexto %s com perfil %s",
        (contextType, profileType) => {
            // Cada par proibido representa uma mistura de contexto que deve falhar antes de tocar em dados privados ou partilhados.
            expect(() =>
                assertAiContextProfile(contextType, profileType),
            ).toThrow(ForbiddenException);
        },
    );
});