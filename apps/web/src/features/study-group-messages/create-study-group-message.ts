/**
 * Implementa a funcionalidade frontend de mensagens de grupos de estudo e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de mensagens do grupo de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyGroupMessage = {
    _id: string;
    groupId: string;
    authorStudentId: string | null;
    authorDisplayName: string | null;
    kind: "MESSAGE" | "NOTE";
    text: string | null;
    tombstoned?: boolean;
    tombstonedAt?: string;
    createdAt?: string;
};

/**
 * Lista mensagens e notas do grupo.
 *
 * @param groupId Grupo alvo.
 * @returns Histórico colaborativo.
 */
export function listStudyGroupMessages(
    groupId: string,
    kind?: "MESSAGE" | "NOTE",
): Promise<StudyGroupMessage[]> {
    return requestMf3Json<StudyGroupMessage[]>(
        `/api/study-groups/${groupId}/messages${kind ? `?kind=${kind}` : ""}`,
    );
}

/**
 * Cria mensagem ou nota coletiva.
 *
 * @param groupId Grupo alvo.
 * @param input Tipo e conteúdo.
 * @returns Mensagem criada.
 */
export function createStudyGroupMessage(
    groupId: string,
    input: { kind: "MESSAGE" | "NOTE"; text: string },
): Promise<StudyGroupMessage> {
    return requestMf3Json<StudyGroupMessage>(
        `/api/study-groups/${groupId}/messages`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
