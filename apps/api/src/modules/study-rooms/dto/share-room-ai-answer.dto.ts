// apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts
/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo.
 */
import { IsIn } from "class-validator";

export const roomAiShareModes = ["READ_ONLY", "PRIVATE_FORK"] as const;

export type RoomAiShareMode = (typeof roomAiShareModes)[number];

/**
 * Pedido para partilhar uma resposta IA da sala ou criar um fork privado.
 */
export class ShareRoomAiAnswerDto {
    @IsIn(roomAiShareModes)
    mode!: RoomAiShareMode;
}

/**
 * Normaliza o modo recebido antes de o service tocar na persistência.
 *
 * @param mode Valor recebido no body HTTP.
 * @returns Modo validado e seguro para a operação.
 */
export function parseRoomAiShareMode(mode: string): RoomAiShareMode {
    if (mode === "READ_ONLY" || mode === "PRIVATE_FORK") {
        return mode;
    }

    throw new Error("INVALID_ROOM_AI_SHARE_MODE");
}