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
            }),
        };
        const routinesService = { countRoutines: jest.fn().mockResolvedValue(2) };
        const studyAreasService = {
            countMyStudyAreas: jest.fn().mockResolvedValue(3),
        };
        const materialsService = { countMine: jest.fn().mockResolvedValue(4) };
        const classesService = {
            listStudentClassesById: jest.fn().mockResolvedValue([]),
        };
        const service = new SoloStudyService(
            profileService as never,
            routinesService as never,
            studyAreasService as never,
            materialsService as never,
            classesService as never,
        );

        await expect(service.getSoloStudyState("user-1")).resolves.toMatchObject({
            studentName: "Nuno",
            hasOfficialClasses: false,
            officialClasses: [],
            routinesCount: 2,
            studyAreasCount: 3,
            materialsCount: 4,
        });
    });

    it("deriva a ligação escolar das turmas oficiais, não do perfil", async () => {
        const profileService = {
            getMyProfile: jest.fn().mockResolvedValue({ name: "Nuno" }),
        };
        const routinesService = { countRoutines: jest.fn().mockResolvedValue(0) };
        const studyAreasService = {
            countMyStudyAreas: jest.fn().mockResolvedValue(0),
        };
        const materialsService = { countMine: jest.fn().mockResolvedValue(0) };
        const officialClasses = [
            {
                _id: "507f1f77bcf86cd799439014",
                name: "12.º A",
                code: "12A",
                schoolYear: "2025/2026",
                status: "ACTIVE",
            },
        ];
        const classesService = {
            listStudentClassesById: jest.fn().mockResolvedValue(officialClasses),
        };
        const service = new SoloStudyService(
            profileService as never,
            routinesService as never,
            studyAreasService as never,
            materialsService as never,
            classesService as never,
        );

        await expect(service.getSoloStudyState("user-1")).resolves.toMatchObject({
            hasOfficialClasses: true,
            officialClasses,
        });
    });
});
