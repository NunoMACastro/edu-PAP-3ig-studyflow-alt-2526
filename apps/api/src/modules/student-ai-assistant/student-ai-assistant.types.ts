/** Contratos públicos e internos do Assistente de estudo do aluno. */
export const STUDENT_ASSISTANT_CONTEXT_KINDS = [
    "SUBJECT",
    "STUDY_AREA",
    "STUDY_GROUP",
    "STUDY_ROOM",
    "GUIDED_ROOM",
] as const;

export type StudentAssistantContextKind =
    (typeof STUDENT_ASSISTANT_CONTEXT_KINDS)[number];

export type StudentAssistantContextView = {
    kind: StudentAssistantContextKind;
    id: string;
    label: string;
    secondaryLabel?: string;
    consentPurpose: "CLASS_AI" | "PRIVATE_AREA_AI" | "GROUP_AI" | "ROOM_AI";
    targetPath: string;
    canAsk: boolean;
    unavailableReason?: string;
};

export type ResolvedStudentAssistantContext = StudentAssistantContextView & {
    classId?: string;
};

export const STUDENT_ASSISTANT_ARTIFACT_TYPES = [
    "SUMMARY",
    "EXPLANATION",
    "FLASHCARDS",
    "QUIZ",
] as const;

export type StudentAssistantArtifactType =
    (typeof STUDENT_ASSISTANT_ARTIFACT_TYPES)[number];

export type StudentAssistantArtifactView = {
    id: string;
    type: StudentAssistantArtifactType;
    title: string;
    createdAt: string;
    targetPath: string;
    target: {
        kind: "STUDY_AREA" | "SUBJECT" | "CLASS";
        id: string;
        label: string;
        state: "ACTIVE" | "READ_ONLY_ARCHIVED";
        contextPath?: string;
    };
    provenance: {
        snapshotAt: string;
        snapshotTurnCount: number;
        usedTurnCount: number;
        candidateSourceCount: number;
        usedSourceCount: number;
        groundingMode: "CHAT_AND_SOURCES" | "CHAT_ONLY";
    };
    capabilities: {
        canExport: boolean;
        canAttempt: boolean;
        canRegenerate: boolean;
        canDelete: boolean;
    };
};
