/**
 * Testa a policy que separa perfis de IA por contexto autorizado.
 */
import { ForbiddenException } from "@nestjs/common";
import {
    AiContextType,
    AiProfileType,
    assertAiContextProfile,
} from "./ai-context-policy.js";

describe("assertAiContextProfile", () => {
    it.each([
        ["PRIVATE_AREA", "STUDENT_PRIVATE"],
        ["STUDY_ROOM", "ROOM_SHARED"],
        ["CLASS_SUBJECT", "TEACHER_CLASS"],
    ] satisfies Array<[AiContextType, AiProfileType]>)(
        "aceita o perfil %s/%s quando o contexto corresponde",
        (contextType, profileType) => {
            expect(() => assertAiContextProfile(contextType, profileType)).not.toThrow();
        },
    );

    it.each([
        ["PRIVATE_AREA", "TEACHER_CLASS"],
        ["STUDY_ROOM", "STUDENT_PRIVATE"],
        ["CLASS_SUBJECT", "ROOM_SHARED"],
    ] satisfies Array<[AiContextType, AiProfileType]>)(
        "bloqueia mistura de perfil %s/%s antes de fontes ou provider",
        (contextType, profileType) => {
            expect(() => assertAiContextProfile(contextType, profileType)).toThrow(
                ForbiddenException,
            );
        },
    );

    it("devolve código estável para auditoria técnica sem expor prompt ou materiais", () => {
        try {
            assertAiContextProfile("CLASS_SUBJECT", "STUDENT_PRIVATE");
            throw new Error("expected mismatch to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
            expect((error as ForbiddenException).getResponse()).toMatchObject({
                code: "AI_CONTEXT_PROFILE_MISMATCH",
                contextType: "CLASS_SUBJECT",
                expectedProfile: "TEACHER_CLASS",
                receivedProfile: "STUDENT_PRIVATE",
            });
        }
    });
});
