/**
 * Testa o comportamento de study e documenta os cenários de aceitação automatizados.
 */
import { RequestMethod } from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { RoutinesController } from "./routines.controller.js";

const METHOD_METADATA = "method";
const PATH_METADATA = "path";

describe("RoutinesController", () => {
    const userId = "507f1f77bcf86cd799439012";

    /**
     * Confirma o contrato HTTP documentado para a listagem dedicada de goals.
     */
    it("expõe GET /api/study/goals sem receber userId do frontend", async () => {
        const routinesService = {
            listGoals: jest.fn().mockResolvedValue([{ title: "Meta" }]),
        };
        const controller = new RoutinesController(routinesService as never);
        const request = { user: { id: userId } } as AuthenticatedRequest;

        await expect(controller.listGoals(request)).resolves.toEqual([
            { title: "Meta" },
        ]);
        expect(routinesService.listGoals).toHaveBeenCalledWith(userId);
        expect(Reflect.getMetadata(PATH_METADATA, controller.listGoals)).toBe(
            "goals",
        );
        expect(Reflect.getMetadata(METHOD_METADATA, controller.listGoals)).toBe(
            RequestMethod.GET,
        );
    });
});
