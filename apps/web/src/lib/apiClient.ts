// apps/web/src/lib/apiClient.ts

// Função utilitária mockada ou importada de outro local do seu projeto
declare function requestJson<T>(url: string): Promise<T>;

/**
 * Evento de histórico devolvido pela API de estudo.
 *
 * `occurredAt` chega ao browser como string ISO porque atravessa JSON.
 */
export type StudyHistoryEvent = {
    id: string;
    type:
        | "ROUTINE_CREATED"
        | "ROUTINE_ARCHIVED"
        | "GOAL_CREATED"
        | "GOAL_UPDATED"
        | "GOAL_ARCHIVED"
        | "STUDY_AREA_CREATED"
        | "MATERIAL_SUBMITTED"
        | "AI_PROFILE_CREATED"
        | "SUMMARY_GENERATED"
        | "STUDY_TOOL_GENERATED"
        | "ADAPTIVE_EXPLANATION_GENERATED"
        | "QUIZ_ATTEMPT_RECORDED";
    title: string;
    description?: string;
    occurredAt?: string;
};

/**
 * Lista eventos recentes de estudo do aluno autenticado.
 *
 * @returns Histórico privado do aluno com datas ISO serializadas.
 */
export function listStudyHistory(): Promise<StudyHistoryEvent[]> {
    // O requestJson já usa credentials include; o frontend não envia userId manualmente.
    return requestJson<StudyHistoryEvent[]>("/api/study/history");
}