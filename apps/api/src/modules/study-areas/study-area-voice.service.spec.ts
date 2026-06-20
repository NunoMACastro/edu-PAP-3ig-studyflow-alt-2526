/**
 * Testa o comportamento de study áreas e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException } from "@nestjs/common";
import { StudyAreaVoiceService } from "./study-area-voice.service.js";

describe("StudyAreaVoiceService", () => {
    const userId = "507f1f77bcf86cd799439012";
    const areaId = "507f1f77bcf86cd799439011";

    /**
     * Cria fixture ou estrutura auxiliar de áreas de estudo para manter testes e prompts legíveis.
     * @returns Valor de áreas de estudo no contrato esperado pelo chamador.
     */
    function makeService() {
        const lean = jest.fn().mockResolvedValue({
            _id: areaId,
            voiceTone: "simple",
            voiceDetailLevel: "normal",
        });
        const areaModel = {
            findOneAndUpdate: jest.fn().mockReturnValue({ lean }),
        };
        const studyAreasService = {
            getMyStudyArea: jest.fn().mockResolvedValue({ _id: areaId }),
        };
        const service = new StudyAreaVoiceService(
            areaModel as never,
            studyAreasService as never,
        );

        return { service, areaModel };
    }

    it("persiste voiceNotes como texto simples sanitizado", async () => {
        const { service, areaModel } = makeService();

        await service.updateVoice(userId, areaId, {
            voiceTone: "simple",
            voiceDetailLevel: "normal",
            voiceNotes: " <script>alert(1)</script>\u0000 usa\n exemplos ",
        });

        const update = areaModel.findOneAndUpdate.mock.calls[0][1];
        expect(update.$set.voiceNotes).not.toContain("<");
        expect(update.$set.voiceNotes).not.toContain(">");
        expect(update.$set.voiceNotes).not.toContain("\u0000");
        expect(update.$set.voiceNotes).toContain("alert(1)");
    });

    it("guarda undefined quando as notas ficam vazias depois da sanitização", async () => {
        const { service, areaModel } = makeService();

        await service.updateVoice(userId, areaId, {
            voiceTone: "rigorous",
            voiceDetailLevel: "detailed",
            voiceNotes: "\u0000 \n\t",
        });

        const update = areaModel.findOneAndUpdate.mock.calls[0][1];
        expect(update.$set.voiceNotes).toBeUndefined();
    });

    it("rejeita tom inválido antes de persistir", async () => {
        const { service, areaModel } = makeService();

        await expect(
            service.updateVoice(userId, areaId, {
                voiceTone: "aggressive" as never,
                voiceDetailLevel: "normal",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(areaModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
});
