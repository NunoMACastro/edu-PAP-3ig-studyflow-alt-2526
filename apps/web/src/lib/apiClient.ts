/**
 * Resposta da IA da sala baseada nas partilhas autorizadas.
 */
export type RoomAiAnswer = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    sources: { shareId: string; title: string; contentText: string }[];
    createdAt?: string;
};

// apps/web/src/lib/apiClient.ts
/**
 * Modos permitidos para reutilizar uma resposta IA da sala.
 */
export type RoomAiShareMode = "READ_ONLY" | "PRIVATE_FORK";

/**
 * Resposta IA partilhada ou cópia privada criada a partir de uma resposta partilhada.
 */
export type RoomAiSharedAnswer = {
    _id: string;
    roomId: string;
    studentId: string;
    question: string;
    answer: string;
    sourceShareIds: string[];
    visibility: "PRIVATE" | "SHARED";
    sharedAt?: string;
    forkedFromInteractionId?: string;
    createdAt?: string;
};

/**
 * Resultado da operação de partilha ou fork privado.
 */
export type RoomAiShareResult = {
    mode: RoomAiShareMode;
    answer: RoomAiSharedAnswer;
    createdPrivateCopy: boolean;
};

/**
 * Lista respostas IA partilhadas em read-only na sala.
 *
 * @param roomId Identificador da sala.
 * @returns Respostas partilhadas visíveis para membros da sala.
 */
export function listSharedRoomAiAnswers(roomId: string): Promise<RoomAiSharedAnswer[]> {
    return requestJson<RoomAiSharedAnswer[]>(
        `/api/study-rooms/${roomId}/ai/answers?scope=shared`,
    );
}

/**
 * Partilha uma resposta própria ou cria uma cópia privada de uma resposta partilhada.
 *
 * @param roomId Identificador da sala.
 * @param answerId Identificador da resposta IA.
 * @param input Modo da operação.
 * @returns Resultado público devolvido pela API.
 */
export function shareRoomAiAnswer(
    roomId: string,
    answerId: string,
    input: { mode: RoomAiShareMode },
): Promise<RoomAiShareResult> {
    return requestJson<RoomAiShareResult>(
        `/api/study-rooms/${roomId}/ai/answers/${answerId}/share`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Item privado do histórico da IA da sala.
 */
export type RoomAiHistoryItem = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    createdAt?: string;
};

/**
 * Pergunta à IA da sala usando apenas partilhas autorizadas como contexto.
 *
 * @param roomId Identificador da sala; o backend valida membership antes de expor dados.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Resposta da IA da sala com fontes usadas.
 */
export function askRoomAi(
    roomId: string,
    input: { question: string; sourceIds?: string[] },
): Promise<RoomAiAnswer> {
    return requestJson<RoomAiAnswer>(`/api/study-rooms/${roomId}/ai/answers`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Lista o histórico privado da IA da sala para o aluno autenticado.
 *
 * @param roomId Identificador da sala; o backend valida membership e dono do histórico.
 * @returns Interações privadas ordenadas da mais recente para a mais antiga.
 */
export function listMyRoomAiHistory(roomId: string): Promise<RoomAiHistoryItem[]> {
    return requestJson<RoomAiHistoryItem[]>(
        `/api/study-rooms/${roomId}/ai/answers?scope=mine`,
    );
}