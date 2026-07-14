/**
 * Contratos internos usados para acrescentar continuidade conversacional aos
 * serviços de IA sem transferir ownership, fontes ou permissões para o cliente.
 */
export type GovernedAiConversationTurn = Readonly<{
    question: string;
    answer: string;
}>;

/** Metadata interna passada pela fachada do Assistente aos serviços de domínio. */
export type StudentAiExecutionContext = Readonly<{
    conversationId: string;
    turns: readonly GovernedAiConversationTurn[];
}>;

export type StudentAiCitationKind =
    | "OFFICIAL_MATERIAL"
    | "PRIVATE_MATERIAL"
    | "GROUP_RESOURCE"
    | "ROOM_SHARE";

export type StudentAiCitationSnapshot = Readonly<{
    label: string;
    kind: StudentAiCitationKind;
}>;
