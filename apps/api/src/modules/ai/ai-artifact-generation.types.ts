/**
 * Contratos internos para gerar materiais privados a partir de um snapshot do
 * Assistente sem confiar em contexto, ownership ou fontes vindas do browser.
 */
import type { AiSource } from "./providers/ai-provider.js";
import type { GovernedAiConversationTurn } from "./student-ai-conversation-context.js";

export const AI_ARTIFACT_GENERATION_TYPES = [
    "SUMMARY",
    "EXPLANATION",
    "FLASHCARDS",
    "QUIZ",
] as const;

export type AiArtifactGenerationType =
    (typeof AI_ARTIFACT_GENERATION_TYPES)[number];

export const AI_ARTIFACT_TARGET_KINDS = [
    "STUDY_AREA",
    "SUBJECT",
    "CLASS",
] as const;

export type AiArtifactTargetKind =
    (typeof AI_ARTIFACT_TARGET_KINDS)[number];
export type AiArtifactGroundingMode = "CHAT_AND_SOURCES" | "CHAT_ONLY";

export type AiArtifactTarget = Readonly<{
    kind: AiArtifactTargetKind;
    id: string;
    label: string;
}>;

/** Bundle imutável resolvido no servidor no momento do pedido. */
export type AssistantArtifactGenerationSnapshot = Readonly<{
    userId: string;
    conversationId: string;
    sourceContextKind:
        | "SUBJECT"
        | "STUDY_AREA"
        | "STUDY_GROUP"
        | "STUDY_ROOM"
        | "GUIDED_ROOM";
    sourceContextId: string;
    contextLabel: string;
    target: AiArtifactTarget;
    sources: readonly AiSource[];
    candidateSourceCount: number;
    conversationTurns: readonly GovernedAiConversationTurn[];
    snapshotAt: Date;
    snapshotTurnCount: number;
    groundingMode: AiArtifactGroundingMode;
    snapshotDigest: string;
    voiceTone?: string;
}>;

/** Metadata persistida sem duplicar perguntas, respostas ou texto de fontes. */
export function assistantArtifactMetadata(
    snapshot: AssistantArtifactGenerationSnapshot,
    usedTurnCount: number,
    usedSourceCount: number,
) {
    return {
        visibility: "PRIVATE" as const,
        targetKind: snapshot.target.kind,
        targetId: snapshot.target.id,
        targetLabelSnapshot: snapshot.target.label,
        sourceContextKind: snapshot.sourceContextKind,
        sourceContextId: snapshot.sourceContextId,
        snapshotAt: snapshot.snapshotAt,
        snapshotTurnCount: snapshot.snapshotTurnCount,
        usedTurnCount,
        candidateSourceCount: snapshot.candidateSourceCount,
        usedSourceCount,
        groundingMode: snapshot.groundingMode,
        snapshotDigest: snapshot.snapshotDigest,
        ...(snapshot.target.kind === "STUDY_AREA"
            ? { studyAreaId: snapshot.target.id }
            : {}),
    };
}
