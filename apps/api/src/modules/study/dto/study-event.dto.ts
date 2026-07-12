/**
 * Define contratos de dados usados nas entradas e saídas de study.
 */
export type StudyEventType =
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
    | "QUIZ_ATTEMPT_RECORDED"
    | "GUIDED_ROOM_VIEWED"
    | "GUIDED_ROOM_COMPLETED";

/**
 * Evento apresentado no histórico de estudo do aluno.
 */
export type StudyEventDto = {
    id: string;
    type: StudyEventType;
    title: string;
    description?: string;
    occurredAt: Date;
};
