/**
 * Testa o comportamento de study e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { Types } from "mongoose";
import {
    CreateRoutineDto,
    UpdateRoutineDto,
} from "./dto/create-routine.dto.js";
import { RoutinesService } from "./routines.service.js";

describe("RoutinesService", () => {
    const userId = "507f1f77bcf86cd799439012";
    const routineId = "507f1f77bcf86cd799439013";
    const goalId = "507f1f77bcf86cd799439014";

    /**
     * Confirma que as listagens só devolvem dados ativos do utilizador.
     */
    it("lista rotinas e objetivos filtrando ownership e arquivo lógico", async () => {
        const routineLean = jest.fn().mockResolvedValue([]);
        const goalLean = jest.fn().mockResolvedValue([]);
        const routineSort = jest.fn().mockReturnValue({ lean: routineLean });
        const goalSort = jest.fn().mockReturnValue({ lean: goalLean });
        const routineModel = {
            find: jest.fn().mockReturnValue({ sort: routineSort }),
        };
        const goalModel = {
            find: jest.fn().mockReturnValue({ sort: goalSort }),
        };
        const service = new RoutinesService(
            routineModel as never,
            goalModel as never,
            { recordEvent: jest.fn() } as never,
        );

        await service.listMine(userId);

        expect(routineModel.find).toHaveBeenCalledWith({
            userId: expect.any(Types.ObjectId),
            archived: false,
        });
        expect(goalModel.find).toHaveBeenCalledWith({
            userId: expect.any(Types.ObjectId),
            archived: false,
        });
    });

    /**
     * Confirma que a listagem dedicada de objetivos usa sessão e arquivo lógico.
     */
    it("lista objetivos do utilizador autenticado no endpoint dedicado", async () => {
        const goalLean = jest.fn().mockResolvedValue([
            {
                _id: goalId,
                userId,
                title: "Meta",
                archived: false,
            },
        ]);
        const goalSort = jest.fn().mockReturnValue({ lean: goalLean });
        const routineModel = {};
        const goalModel = {
            find: jest.fn().mockReturnValue({ sort: goalSort }),
        };
        const service = new RoutinesService(
            routineModel as never,
            goalModel as never,
            { recordEvent: jest.fn() } as never,
        );

        await expect(service.listGoals(userId)).resolves.toEqual([
            {
                _id: goalId,
                title: "Meta",
                archived: false,
            },
        ]);
        expect(goalModel.find).toHaveBeenCalledWith({
            userId: expect.any(Types.ObjectId),
            archived: false,
        });
        expect(goalSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    /**
     * Confirma que arquivar uma rotina usa ownership e regista histórico.
     */
    it("arquiva rotina do utilizador autenticado", async () => {
        const routineModel = {
            findOneAndUpdate: jest.fn().mockResolvedValue({ title: "Estudo" }),
        };
        const goalModel = {};
        const historyService = { recordEvent: jest.fn() };
        const service = new RoutinesService(
            routineModel as never,
            goalModel as never,
            historyService as never,
        );

        await expect(service.archiveRoutine(userId, routineId)).resolves.toEqual({
            ok: true,
        });
        expect(routineModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: routineId,
                userId: expect.any(Types.ObjectId),
                archived: false,
            },
            { $set: { archived: true } },
            { new: true },
        );
        expect(historyService.recordEvent).toHaveBeenCalledWith(
            userId,
            "ROUTINE_ARCHIVED",
            "Rotina arquivada",
            "Estudo",
        );
    });

    /**
     * Confirma que atualizar objetivos respeita ownership e histórico.
     */
    it("atualiza objetivo do utilizador autenticado", async () => {
        const routineModel = {};
        const goalModel = {
            findOneAndUpdate: jest.fn().mockResolvedValue({ title: "Meta" }),
        };
        const historyService = { recordEvent: jest.fn() };
        const service = new RoutinesService(
            routineModel as never,
            goalModel as never,
            historyService as never,
        );

        await service.updateGoal(userId, goalId, { completed: true });

        expect(goalModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: goalId,
                userId: expect.any(Types.ObjectId),
                archived: false,
            },
            { $set: { completed: true } },
            { new: true, runValidators: true },
        );
        expect(historyService.recordEvent).toHaveBeenCalledWith(
            userId,
            "GOAL_UPDATED",
            "Objetivo atualizado",
            "Meta",
        );
    });

    /**
     * Confirma que dias fora do contrato MF0 são rejeitados pelo DTO.
     */
    it("rejeita weekdays inválidos no DTO de rotina", async () => {
        const pipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });

        await expect(
            pipe.transform(
                {
                    title: "Estudar matemática",
                    weekdays: ["monday"],
                    startTime: "10:00",
                    durationMinutes: 45,
                },
                { type: "body", metatype: CreateRoutineDto },
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    /**
     * Confirma que horas fora de HH:mm 24h são rejeitadas.
     */
    it("rejeita startTime inválido no DTO de rotina", async () => {
        const pipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });

        await expect(
            pipe.transform(
                {
                    startTime: "25:61",
                },
                { type: "body", metatype: UpdateRoutineDto },
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
