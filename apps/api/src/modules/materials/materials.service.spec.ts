/**
 * Testa o comportamento de materials e documenta os cenários de aceitação automatizados.
 */
import { Types } from "mongoose";
import { MaterialsService } from "./materials.service.js";

const userId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439011";

describe("MaterialsService", () => {
    it("lista materiais sem expor campos internos", async () => {
        const createdAt = new Date("2026-06-01T10:00:00.000Z");
        const lean = jest.fn().mockResolvedValue([
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                userId,
                studyAreaId,
                title: "Fonte",
                type: "TOPIC",
                status: "READY",
                contentText: "Texto interno para IA.",
                storageKey: "private-key",
                originalName: "fonte.pdf",
                mimeType: "application/pdf",
                createdAt,
            },
        ]);
        const sort = jest.fn().mockReturnValue({ lean });
        const select = jest.fn().mockReturnValue({ sort });
        const materialModel = {
            find: jest.fn().mockReturnValue({ select }),
        };
        const { service } = makeService(materialModel);

        const materials = await service.listByArea(userId, studyAreaId);

        expect(select).toHaveBeenCalledWith(
            "_id title type status url sizeBytes createdAt",
        );
        expect(materials).toEqual([
            {
                _id: "507f1f77bcf86cd799439010",
                title: "Fonte",
                type: "TOPIC",
                status: "READY",
                createdAt,
            },
        ]);
        expect(materials[0]).not.toHaveProperty("contentText");
        expect(materials[0]).not.toHaveProperty("storageKey");
        expect(materials[0]).not.toHaveProperty("userId");
    });

    it("submete tópico sem devolver contentText no contrato público", async () => {
        const materialModel = {
            create: jest.fn().mockResolvedValue({
                toObject: () => ({
                    _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                    userId,
                    studyAreaId,
                    title: "Equações",
                    type: "TOPIC",
                    status: "READY",
                    contentText: "Texto de estudo suficientemente longo.",
                }),
            }),
        };
        const { historyService, service } = makeService(materialModel);

        const material = await service.submitTextMaterial(userId, studyAreaId, {
            type: "TOPIC",
            title: "Equações",
            topicText: "Texto de estudo suficientemente longo.",
        });

        expect(material).toEqual({
            _id: "507f1f77bcf86cd799439010",
            title: "Equações",
            type: "TOPIC",
            status: "READY",
        });
        expect(material).not.toHaveProperty("contentText");
        expect(historyService.recordEvent).toHaveBeenCalledWith(
            userId,
            "MATERIAL_SUBMITTED",
            "Tópico submetido",
            "Equações",
        );
    });

    it("mantém fontes internas com contentText para IA", async () => {
        const sources = [
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                title: "Fonte",
                type: "TOPIC",
                status: "READY",
                contentText: "Texto interno para IA.",
            },
        ];
        const lean = jest.fn().mockResolvedValue(sources);
        const sort = jest.fn().mockReturnValue({ lean });
        const materialModel = {
            find: jest.fn().mockReturnValue({ sort }),
        };
        const { service } = makeService(materialModel);

        await expect(
            service.listReadyTextSources(userId, studyAreaId),
        ).resolves.toEqual(sources);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de materiais privados para manter testes e prompts legíveis.
 *
 * @param materialModel Modelo Mongoose injetado para ler e persistir materiais privados.
 * @returns Valor de materiais privados no contrato esperado pelo chamador.
 */
function makeService(materialModel: Record<string, unknown>) {
    const studyAreasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({ _id: studyAreaId }),
    };
    const storage = {
        save: jest.fn(),
    };
    const historyService = {
        recordEvent: jest.fn(),
    };

    return {
        historyService,
        service: new MaterialsService(
            materialModel as never,
            studyAreasService as never,
            storage as never,
            historyService as never,
        ),
    };
}

