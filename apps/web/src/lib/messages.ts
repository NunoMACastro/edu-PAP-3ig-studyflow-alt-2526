/**
 * Centraliza mensagens visíveis da MF8 para preparar i18n futuro sem adicionar
 * uma biblioteca externa nesta fase da PAP.
 */
export const messageKeys = {
    aiNoSources: "ai.noSources",
    formGenericError: "form.genericError",
    guardrailsAllowed: "guardrails.allowed",
    guardrailsBlocked: "guardrails.blocked",
    guardrailsContextLabel: "guardrails.contextLabel",
    guardrailsError: "guardrails.error",
    guardrailsLoading: "guardrails.loading",
    guardrailsOptionClassSubject: "guardrails.optionClassSubject",
    guardrailsOptionSolo: "guardrails.optionSolo",
    guardrailsOptionStudyRoom: "guardrails.optionStudyRoom",
    guardrailsPromptLabel: "guardrails.promptLabel",
    guardrailsResourceLabel: "guardrails.resourceLabel",
    guardrailsSafetyBlock: "guardrails.safetyBlock",
    guardrailsSubmit: "guardrails.submit",
    guardrailsTitle: "guardrails.title",
    sourceAnswerTitle: "source.answerTitle",
    sourceCitationsTitle: "source.citationsTitle",
    sourceEmptyState: "source.emptyState",
    sourceError: "source.error",
    sourceJobIdsHelp: "source.jobIdsHelp",
    sourceJobIdsLabel: "source.jobIdsLabel",
    sourceLoading: "source.loading",
    sourceQuestionLabel: "source.questionLabel",
    sourceSubmit: "source.submit",
    sourceTitle: "source.title",
    stateUnavailable: "state.unavailable",
} as const;

export type MessageKey = (typeof messageKeys)[keyof typeof messageKeys];

const ptMessages: Record<MessageKey, string> = {
    [messageKeys.aiNoSources]: "Não existem fontes autorizadas para responder.",
    [messageKeys.formGenericError]: "Não foi possível concluir a operação.",
    [messageKeys.guardrailsAllowed]: "Permitido",
    [messageKeys.guardrailsBlocked]: "Bloqueado",
    [messageKeys.guardrailsContextLabel]: "Contexto",
    [messageKeys.guardrailsError]: "Erro ao validar o pedido.",
    [messageKeys.guardrailsLoading]: "A validar...",
    [messageKeys.guardrailsOptionClassSubject]: "Disciplina",
    [messageKeys.guardrailsOptionSolo]: "Área privada",
    [messageKeys.guardrailsOptionStudyRoom]: "Sala de estudo",
    [messageKeys.guardrailsPromptLabel]: "Pedido",
    [messageKeys.guardrailsResourceLabel]: "Recurso",
    [messageKeys.guardrailsSafetyBlock]:
        "Este bloqueio protege a segurança ética da IA antes de qualquer resposta ser gerada.",
    [messageKeys.guardrailsSubmit]: "Validar",
    [messageKeys.guardrailsTitle]: "Guardrails IA",
    [messageKeys.sourceAnswerTitle]: "Resposta",
    [messageKeys.sourceCitationsTitle]: "Fontes usadas:",
    [messageKeys.sourceEmptyState]:
        "Escolhe fontes processáveis antes de pedir uma resposta factual.",
    [messageKeys.sourceError]: "Erro ao responder.",
    [messageKeys.sourceJobIdsHelp]: "Separa vários IDs por vírgula.",
    [messageKeys.sourceJobIdsLabel]: "Jobs de indexação",
    [messageKeys.sourceLoading]: "A responder...",
    [messageKeys.sourceQuestionLabel]: "Pergunta",
    [messageKeys.sourceSubmit]: "Responder com fontes",
    [messageKeys.sourceTitle]: "Resposta com fontes",
    [messageKeys.stateUnavailable]: "Mensagem indisponível.",
};

/**
 * Confirma se uma string corresponde a uma chave conhecida do catálogo local.
 *
 * @param key Chave recebida de código dinâmico.
 * @returns Verdadeiro quando a chave existe em `messageKeys`.
 */
export function isMessageKey(key: string): key is MessageKey {
    return Object.values(messageKeys).includes(key as MessageKey);
}

/**
 * Resolve uma mensagem cuja chave é conhecida em tempo de desenvolvimento.
 *
 * @param key Chave tipada do catálogo.
 * @returns Mensagem visível em português de Portugal.
 */
export function t(key: MessageKey): string {
    return ptMessages[key];
}

/**
 * Resolve uma chave dinâmica com fallback seguro para a interface.
 *
 * @param key Chave potencialmente desconhecida.
 * @returns Mensagem conhecida ou fallback genérico.
 */
export function tOrDefault(key: string): string {
    if (isMessageKey(key)) {
        return ptMessages[key];
    }

    // Evita expor chaves técnicas cruas a alunos/professores quando a origem é dinâmica.
    return ptMessages[messageKeys.stateUnavailable];
}
