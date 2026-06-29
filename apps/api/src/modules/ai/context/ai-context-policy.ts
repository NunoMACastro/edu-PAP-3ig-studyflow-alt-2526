// apps/api/src/modules/ai/context/ai-context-policy.ts
import { ForbiddenException } from "@nestjs/common";

/**
 * Contextos técnicos em que a aplicação pode pedir ajuda à IA.
 */
export type AiContextType = "PRIVATE_AREA" | "STUDY_ROOM" | "CLASS_SUBJECT";

/**
 * Perfis pedagógicos que podem ser aplicados ao prompt antes do provider.
 */
export type AiProfileType = "STUDENT_PRIVATE" | "ROOM_SHARED" | "TEACHER_CLASS";

const EXPECTED_PROFILE_BY_CONTEXT: Record<AiContextType, AiProfileType> = {
    PRIVATE_AREA: "STUDENT_PRIVATE",
    STUDY_ROOM: "ROOM_SHARED",
    CLASS_SUBJECT: "TEACHER_CLASS",
};

/**
 * Bloqueia mistura entre contexto IA e perfil pedagógico.
 *
 * @param contextType Contexto técnico do pedido IA.
 * @param profileType Perfil que seria aplicado ao prompt.
 */
export function assertAiContextProfile(
    contextType: AiContextType,
    profileType: AiProfileType,
): void {
    const expectedProfile = EXPECTED_PROFILE_BY_CONTEXT[contextType];

    if (profileType !== expectedProfile) {
        // Falhar antes do provider impede fuga de materiais ou voz docente entre contextos.
        throw new ForbiddenException({
            code: "AI_CONTEXT_PROFILE_MISMATCH",
            message: "O perfil de IA não corresponde ao contexto pedido.",
            details: {
                contextType,
                expectedProfile,
                receivedProfile: profileType,
            },
        });
    }
}