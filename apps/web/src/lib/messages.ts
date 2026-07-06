// apps/web/src/lib/messages.ts
/**
 * Catálogo local de mensagens visíveis da MF8.
 *
 * Este ficheiro prepara a aplicação para futura tradução sem instalar uma
 * biblioteca externa de i18n nesta fase da PAP.
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
    guardrailsSubmit: "guardrails.submit",
    guardrailsTitle: "guardrails.title",
    sourceAnswerTitle: "source.answerTitle",
    sourceCitationsTitle: "source.citationsTitle",
    sourceError: "source.error",
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
    [messageKeys.guardrailsAllowed]: "Pedido permitido.",
    [messageKeys.guardrailsBlocked]: "Pedido bloqueado.",
    [messageKeys.guardrailsContextLabel]: "Contexto",
    [messageKeys.guardrailsError]: "Erro ao validar o pedido.",
    [messageKeys.guardrailsLoading]: "A validar...",
    [messageKeys.guardrailsOptionClassSubject]: "Disciplina",
    [messageKeys.guardrailsOptionSolo]: "Solo",
    [messageKeys.guardrailsOptionStudyRoom]: "Grupo",
    [messageKeys.guardrailsPromptLabel]: "Pedido",
    [messageKeys.guardrailsResourceLabel]: "Recurso",
    [messageKeys.guardrailsSubmit]: "Validar",
    [messageKeys.guardrailsTitle]: "Guardrails IA",
    [messageKeys.sourceAnswerTitle]: "Resposta",
    [messageKeys.sourceCitationsTitle]: "Fontes usadas:",
    [messageKeys.sourceError]: "Erro ao responder.",
    [messageKeys.sourceJobIdsLabel]: "Jobs de indexação",
    [messageKeys.sourceLoading]: "A responder...",
    [messageKeys.sourceQuestionLabel]: "Pergunta",
    [messageKeys.sourceSubmit]: "Responder",
    [messageKeys.sourceTitle]: "Resposta com fontes",
    [messageKeys.stateUnavailable]: "Mensagem indisponível.",
};

/**
 * Confirma se uma string corresponde a uma chave conhecida do catálogo.
 *
 * @param key Chave recebida de código dinâmico.
 * @returns `true` quando a chave existe no catálogo local.
 */
export function isMessageKey(key: string): key is MessageKey {
    return Object.values(messageKeys).includes(key as MessageKey);
}

/**
 * Resolve uma mensagem cuja chave é conhecida em tempo de desenvolvimento.
 *
 * @param key Chave tipada do catálogo.
 * @returns Mensagem em português de Portugal.
 */
export function t(key: MessageKey): string {
    return ptMessages[key];
}

/**
 * Resolve uma chave dinâmica com fallback seguro.
 *
 * @param key Chave que pode vir de configuração ou outro ponto dinâmico.
 * @returns Mensagem conhecida ou fallback genérico.
 */
export function tOrDefault(key: string): string {
    if (isMessageKey(key)) {
        return ptMessages[key];
    }

    // O fallback evita mostrar chaves técnicas cruas na interface do aluno.
    return ptMessages[messageKeys.stateUnavailable];
}