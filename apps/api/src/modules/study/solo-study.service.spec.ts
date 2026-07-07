/**
 * Testa o comportamento de study e documenta os cenários de aceitação automatizados.
 */
import { SoloStudyService } from "./solo-study.service.js";

describe("SoloStudyService", () => {
    /**
     * Confirma que o dashboard usa contadores reais dos services de domínio.
     */
    it("devolve contadores reais para áreas, rotinas e materiais", async () => {
        const profileService = {
            getMyProfile: jest.fn().mockResolvedValue({
                name: "Nuno",
                className: null,
            }),
        };
        const routinesService = { countRoutines: jest.fn().mockResolvedValue(2) };
        const studyAreasService = {
            countMyStudyAreas: jest.fn().mockResolvedValue(3),
        };
        const materialsService = { countMine: jest.fn().mockResolvedValue(4) };
        const service = new SoloStudyService(
            profileService as never,
            routinesService as never,
            studyAreasService as never,
            materialsService as never,
        );

        await expect(service.getSoloStudyState("user-1")).resolves.toMatchObject({
            studentName: "Nuno",
            hasClass: false,
            className: null,
            routinesCount: 2,
            studyAreasCount: 3,
            materialsCount: 4,
        });
    });
});
