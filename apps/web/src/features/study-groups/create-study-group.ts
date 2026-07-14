/**
 * Implementa a funcionalidade frontend de grupos de estudo e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de grupos de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyGroup = {
    _id: string;
    ownerStudentId: string;
    title: string;
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    createdAt?: string;
    collaborationKind: "STUDY_GROUP";
    collaborationKindSource: "NATIVE" | "LEGACY_INFERRED";
};

/**
 * Lista grupos do aluno.
 *
 * @returns Grupos acessíveis.
 */
export function listStudyGroups(): Promise<StudyGroup[]> {
    return requestMf3Json<StudyGroup[]>("/api/study-groups");
}

/**
 * Cria um grupo de estudo.
 *
 * @param input Dados do grupo.
 * @returns Grupo criado.
 */
export function createStudyGroup(input: {
    title: string;
    disciplineName?: string;
    description?: string;
}): Promise<StudyGroup> {
    return requestMf3Json<StudyGroup>("/api/study-groups", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/** Adiciona um aluno por email; ownership e role são sempre revalidados na API. */
export function addStudyGroupMember(
    groupId: string,
    email: string,
): Promise<StudyGroup> {
    return requestMf3Json<StudyGroup>(`/api/study-groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}
