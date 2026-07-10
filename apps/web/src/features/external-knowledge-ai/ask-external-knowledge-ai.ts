/**
 * Implementa a funcionalidade frontend de IA com conhecimento externo limitado e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de IA com conhecimento externo limitado que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type ExternalKnowledgeAnswer = {
    _id: string;
    studyAreaId: string;
    question: string;
    answer: string;
    externalUsed: boolean;
    internalCitations: { materialId: string; title: string; excerpt: string }[];
    externalNotes: string[];
    createdAt?: string;
};

/**
 * Payload enviado pelo painel React ao endpoint de IA externa limitada.
 */
export type AskExternalKnowledgeAiInput = {
    studyAreaId: string;
    question: string;
    allowExternalKnowledge: boolean;
};

/**
 * Pede resposta com nota externa limitada.
 *
 * @param input Área, pergunta e permissão externa.
 * @returns Resposta separando fontes internas e notas externas.
 */
export function askExternalKnowledgeAi(
    input: AskExternalKnowledgeAiInput,
): Promise<ExternalKnowledgeAnswer> {
    // O helper comum adiciona credentials: "include" e header CSRF sem expor a sessão ao JavaScript.
    return requestMf3Json<ExternalKnowledgeAnswer>(
        "/api/ai/external-knowledge-answers",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
