/**
 * Define o contrato público do histórico privado da IA da sala.
 */
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomAiInteractionDocument } from "./schemas/room-ai-interaction.schema.js";

type RoomAiInteractionWithTimestamps = RoomAiInteractionDocument & {
    createdAt?: Date;
};

/**
 * Item exposto pela API quando o aluno autenticado consulta o seu histórico privado.
 */
export type RoomAiHistoryItem = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    createdAt?: Date;
};

/**
 * Converte interações persistidas numa resposta privada para o aluno autenticado.
 *
 * @param actor Aluno autenticado vindo da sessão segura.
 * @param roomId Identificador da sala validada pelo service.
 * @param rows Documentos devolvidos pela query privada do histórico.
 * @returns Lista pronta para expor no endpoint público.
 */
export function toPrivateRoomAiHistory(
    actor: AuthenticatedUser,
    roomId: string,
    rows: RoomAiInteractionDocument[],
): RoomAiHistoryItem[] {
    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(actor.id)) {
        return [];
    }

    return rows
        .filter((row) => {
            // Mantém defesa em profundidade caso a query seja alterada no futuro.
            const sameRoom = String(row.roomId) === roomId;
            const sameStudent = String(row.studentId) === actor.id;
            return sameRoom && sameStudent;
        })
        .map((row) => {
            const timedRow = row as RoomAiInteractionWithTimestamps;

            return {
                _id: String(row._id),
                roomId,
                question: row.question,
                answer: row.answer,
                createdAt: timedRow.createdAt,
            };
        });
}
