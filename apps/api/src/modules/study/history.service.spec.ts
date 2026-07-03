/**
 * Testa o comportamento de study e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { Types } from "mongoose";
import { HistoryQueryDto } from "./dto/history-query.dto.js";
import { HistoryService } from "./history.service.js";

describe("HistoryService", () => {
    const userId = "507f1f77bcf86cd799439012";

    /**
     * Cria fixture ou estrutura auxiliar de rotinas e objetivos de estudo para manter testes e prompts legíveis.
     *
     * @param events events necessário para executar make model sem depender de estado global.
     * @returns Valor de rotinas e objetivos de estudo no contrato esperado pelo chamador.
     */
    function makeModel(events: Array<Record<string, unknown>> = []) {
        const lean = jest.fn().mockResolvedValue(events);
        const limit = jest.fn().mockReturnValue({ lean });
        const sort = jest.fn().mockReturnValue({ limit });
        const find = jest.fn().mockReturnValue({ sort });
        return { model: { find }, find, sort, limit, lean };
    }

    it("usa limite default 50 quando não é passado limit", async () => {
        const event = {
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
