/**
 * Testa o comportamento de study e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { Types } from "mongoose";
import { HistoryQueryDto } from "./dto/history-query.dto.js";
import { StudyEventDto, StudyEventType } from "./dto/study-event.dto.js";
import { HistoryService } from "./history.service.js";

type StudyHistoryFixture = {
    _id: Types.ObjectId;
    type: StudyEventType;
    title: string;
    description?: string;
    occurredAt: Date;
};

describe("HistoryService", () => {
    const userId = "507f1f77bcf86cd799439012";

    /**
     * Cria um modelo Mongoose controlado para testar o service sem base de dados real.
     *
     * @param events Eventos devolvidos pela query `lean`.
     * @returns Modelo mínimo e spies usados nas asserções.
     */
    function makeModel(events: StudyHistoryFixture[] = []) {
        const lean = jest.fn().mockResolvedValue(events);
        const limit = jest.fn().mockReturnValue({ lean });
        const sort = jest.fn().mockReturnValue({ limit });
        const find = jest.fn().mockReturnValue({ sort });
        return { model: { find }, find, sort, limit, lean };
    }

    it("usa limite default 50 quando não é passado limit", async () => {
        const event: StudyHistoryFixture = {
            _id: new Types.ObjectId(),
            type: "ROUTINE_CREATED",
            title: "Rotina criada",
            description: "Matemática",
            occurredAt: new Date("2026-01-01T10:00:00.000Z"),
        };
        const { model, limit } = makeModel([event]);
        const service = new HistoryService(model as never);

        await expect(service.listMyEvents(userId)).resolves.toEqual([
            {
                id: String(event._id),
                type: event.type,
                title: event.title,
                description: event.description,
                occurredAt: event.occurredAt,
            },
        ]);
        expect(limit).toHaveBeenCalledWith(50);
    });

    it("preserva occurredAt como data técnica serializável para ISO", async () => {
        const occurredAt = new Date("2026-01-01T10:00:00.000Z");
        const event: StudyHistoryFixture = {
            _id: new Types.ObjectId(),
            type: "STUDY_AREA_CREATED",
            title: "Área criada",
            occurredAt,
        };
        const { model } = makeModel([event]);
        const service = new HistoryService(model as never);

        const [result] = await service.listMyEvents(userId);

        // O backend preserva a data técnica; a UI decide como a apresentar.
        expect(result).toMatchObject<Partial<StudyEventDto>>({
            title: "Área criada",
            occurredAt,
        });
        expect(result?.occurredAt.toISOString()).toBe("2026-01-01T10:00:00.000Z");
    });

    it("aplica o limit validado recebido pelo controller", async () => {
        const { model, limit } = makeModel();
        const service = new HistoryService(model as never);

        await service.listMyEvents(userId, 30);

        expect(limit).toHaveBeenCalledWith(30);
    });

    it("valida query limit como inteiro entre 1 e 50", async () => {
        const pipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });

        await expect(
            pipe.transform(
                { limit: "30" },
                { type: "query", metatype: HistoryQueryDto },
            ),
        ).resolves.toMatchObject({ limit: 30 });
        await expect(
            pipe.transform(
                { limit: "51" },
                { type: "query", metatype: HistoryQueryDto },
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
