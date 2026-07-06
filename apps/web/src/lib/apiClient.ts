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