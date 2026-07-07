/**
 * Define a policy que impede misturar contexto técnico de IA com perfil pedagógico.
 */
import { ForbiddenException } from "@nestjs/common";

/**
 * Contextos técnicos em que a StudyFlow pode pedir ajuda à IA.
 */
export type AiContextType = "PRIVATE_AREA" | "STUDY_ROOM" | "CLASS_SUBJECT";

/**
 * Perfis pedagógicos que podem moldar o prompt antes do provider.
 */
export type AiProfileType = "STUDENT_PRIVATE" | "ROOM_SHARED" | "TEACHER_CLASS";

const EXPECTED_PROFILE_BY_CONTEXT: Record<AiContextType, AiProfileType> = {
    PRIVATE_AREA: "STUDENT_PRIVATE",
    STUDY_ROOM: "ROOM_SHARED",
    CLASS_SUBJECT: "TEACHER_CLASS",
};

/**
 * Bloqueia mistura entre contexto de IA e perfil pedagógico.
 * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
 *
 * @param contextType Valor de contextType usado pela função para executar assert ai context profile com dados explícitos.
 * @param profileType Valor de profileType usado pela função para executar assert ai context profile com dados explícitos.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
export function assertAiContextProfile(
    contextType: AiContextType,
    profileType: AiProfileType,
): void {
    const expectedProfile = EXPECTED_PROFILE_BY_CONTEXT[contextType];

    if (profileType === expectedProfile) return;

    // Falha cedo: nada deve listar fontes, montar prompt, reservar quota ou chamar provider com perfil trocado.
    throw new ForbiddenException({
        code: "AI_CONTEXT_PROFILE_MISMATCH",
        message: "O perfil pedagógico de IA não corresponde ao contexto autorizado.",
        expectedProfile,
        receivedProfile: profileType,
        contextType,
    });
}
