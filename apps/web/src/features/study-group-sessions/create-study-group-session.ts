/**
 * Implementa a funcionalidade frontend de sessões de estudo em grupo e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de sessões de estudo em grupo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyGroupSession = {
    _id: string;
    groupId: string;
    createdByStudentId: string;
    title: string;
    startsAt: string;
    durationMinutes: number;
    goal?: string;
    createdAt?: string;
};

/**
 * Lista sessões de um grupo.
 *
 * @param groupId Grupo alvo.
 * @returns Sessões agendadas.
 */
export function listStudyGroupSessions(
    groupId: string,
): Promise<StudyGroupSession[]> {
    return requestMf3Json<StudyGroupSession[]>(
        `/api/study-groups/${groupId}/sessions`,
    );
}

/**
 * Agenda uma sessão coletiva.
 *
 * @param groupId Grupo alvo.
 * @param input Dados da sessão.
 * @returns Sessão criada.
 */
export function createStudyGroupSession(
    groupId: string,
    input: {
        title: string;
        startsAt: string;
        durationMinutes: number;
        goal?: string;
    },
): Promise<StudyGroupSession> {
    return requestMf3Json<StudyGroupSession>(
        `/api/study-groups/${groupId}/sessions`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
