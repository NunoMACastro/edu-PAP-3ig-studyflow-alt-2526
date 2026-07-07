/**
 * Implementa a funcionalidade frontend de IA coletiva do grupo e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de IA coletiva do grupo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyGroupAiAnswer = {
    _id: string;
    groupId: string;
    question: string;
    answer: string;
    sources: { shareId: string; title: string }[];
    createdAt?: string;
};

/**
 * Pede resposta coletiva baseada em fontes partilhadas.
 *
 * @param groupId Grupo alvo.
 * @param input Pergunta e fontes opcionais.
 * @returns Resposta da IA coletiva.
 */
export function askStudyGroupAi(
    groupId: string,
    input: { question: string; sourceShareIds?: string[] },
): Promise<StudyGroupAiAnswer> {
    return requestMf3Json<StudyGroupAiAnswer>(
        `/api/study-groups/${groupId}/group-ai/questions`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
