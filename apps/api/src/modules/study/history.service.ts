/**
 * Implementa as regras de negócio de study e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DEFAULT_HISTORY_LIMIT } from "./dto/history-query.dto.js";
import { StudyEventDto, StudyEventType } from "./dto/study-event.dto.js";
import {
    StudyEvent,
    StudyEventDocument,
} from "./schemas/study-event.schema.js";

/**
 * Serviço de histórico de estudo.
 *
 * É usado diretamente pelo BK-MF0-06 e também pelos BKs seguintes para registar
 * eventos sem duplicar lógica de persistência.
 */
@Injectable()
export class HistoryService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param eventModel Modelo Mongoose injetado para ler e persistir rotinas e objetivos de estudo.
     */
    constructor(
        @InjectModel(StudyEvent.name)
        private readonly eventModel: Model<StudyEventDocument>,
    ) {}

    /**
     * Lista os eventos do aluno autenticado por ordem cronológica inversa.
     *
     * @param userId Identificador vindo da sessão.
     * @param limit Número máximo de eventos a devolver.
     * @returns Lista de eventos formatados para a API.
     */
    async listMyEvents(
        userId: string,
        limit = DEFAULT_HISTORY_LIMIT,
    ): Promise<StudyEventDto[]> {
        const events = await this.eventModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ occurredAt: -1 })
            .limit(limit)
            .lean();

        return events.map((event) => ({
            id: String(event._id),
            type: event.type,
            title: event.title,
            description: event.description,
            occurredAt: event.occurredAt,
        }));
    }

    /**
     * Regista um evento de estudo para o aluno.
     *
     * @param userId Identificador vindo da sessão.
     * @param type Tipo canónico do evento.
     * @param title Título curto visível no histórico.
     * @param description Descrição opcional para contexto.
     * @returns Evento criado.
     */
    async recordEvent(
        userId: string,
        type: StudyEventType,
        title: string,
        description?: string,
    ): Promise<StudyEventDocument> {
        return this.eventModel.create({
            userId: new Types.ObjectId(userId),
            type,
            title,
            description,
            occurredAt: new Date(),
        });
    }
}
