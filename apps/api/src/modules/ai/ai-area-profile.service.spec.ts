/**
 * Testa o comportamento de ai e documenta os cenários de aceitação automatizados.
 */
import { Types } from "mongoose";
import { AiAreaProfileService } from "./ai-area-profile.service.js";

describe("AiAreaProfileService", () => {
    const userId = "507f1f77bcf86cd799439012";
    const studyAreaId = "507f1f77bcf86cd799439011";

    /**
     * Cria fixture ou estrutura auxiliar de artefactos de IA para manter testes e prompts legíveis.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param overrides Valor de overrides usado pela função para executar make material com dados explícitos.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    function makeMaterial(overrides: Record<string, unknown> = {}) {
        return {
            _id: new Types.ObjectId(),
            status: "PENDING_PROCESSING",
            ...overrides,
        };
    }

    /**
     * Cria fixture ou estrutura auxiliar de artefactos de IA para manter testes e prompts legíveis.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param materials Valor de materials usado pela função para executar make service com dados explícitos.
     * @param processableSources Valor de processableSources usado pela função para executar make service com dados explícitos.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    function makeService(
        materials: Array<Record<string, unknown>>,
        processableSources: Array<Record<string, unknown>>,
    ) {
        const profileId = new Types.ObjectId();
        const profileModel = {
            exists: jest.fn().mockResolvedValue(null),
            findOneAndUpdate: jest
                .fn()
                .mockImplementation((_filter, update) =>
                    Promise.resolve({
                        _id: profileId,
                        studyAreaId: new Types.ObjectId(studyAreaId),
                        userId: new Types.ObjectId(userId),
                        ...update.$set,
                    }),
                ),
        };
        const studyAreasService = {
            getMyStudyArea: jest.fn().mockResolvedValue({
                _id: studyAreaId,
                name: "Matemática",
                voiceTone: "simple",
            }),
        };
        const materialsService = {
            listByArea: jest.fn().mockResolvedValue(materials),
            listReadyTextSources: jest
                .fn()
                .mockResolvedValue(processableSources),
        };
        const historyService = { recordEvent: jest.fn() };
        const service = new AiAreaProfileService(
            profileModel as never,
            studyAreasService as never,
            materialsService as never,
            historyService as never,
        );

        return { service, profileModel, materialsService };
    }

    it("marca o perfil como MISSING_MATERIALS quando não há materiais", async () => {
        const { service, materialsService } = makeService([], []);

        await expect(
            service.prepareProfile(userId, studyAreaId),
        ).resolves.toMatchObject({
            status: "MISSING_MATERIALS",
            sourceCount: 0,
            processableSourceCount: 0,
        });
        expect(materialsService.listReadyTextSources).not.toHaveBeenCalled();
    });

    it("marca como PENDING_PROCESSING quando só existem materiais pendentes", async () => {
        const { service, profileModel } = makeService(
            [makeMaterial()],
            [],
        );

        await expect(
            service.prepareProfile(userId, studyAreaId),
        ).resolves.toMatchObject({
            status: "PENDING_PROCESSING",
            sourceCount: 1,
            processableSourceCount: 0,
        });
        expect(profileModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: "PENDING_PROCESSING",
                }),
            }),
            expect.any(Object),
        );
    });

    it("não trata material READY sem contentText como fonte processável", async () => {
        const { service, materialsService } = makeService(
            [makeMaterial({ status: "READY" })],
            [],
        );

        await expect(
            service.prepareProfile(userId, studyAreaId),
        ).resolves.toMatchObject({
            status: "PENDING_PROCESSING",
            sourceCount: 1,
            processableSourceCount: 0,
        });
        expect(materialsService.listReadyTextSources).toHaveBeenCalledWith(
            userId,
            studyAreaId,
        );
    });

    it("marca como READY_FOR_GENERATION quando existe fonte textual processável", async () => {
        const material = makeMaterial({
            status: "READY",
            contentText: "Texto de estudo processável.",
        });
        const { service } = makeService([material], [material]);

        await expect(
            service.prepareProfile(userId, studyAreaId),
        ).resolves.toMatchObject({
            status: "READY_FOR_GENERATION",
            sourceCount: 1,
            processableSourceCount: 1,
        });
    });
});
