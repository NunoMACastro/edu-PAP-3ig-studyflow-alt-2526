/**
 * Testa o comportamento de preferências de notificação e documenta os cenários de aceitação automatizados.
 */
import { NotificationContext } from "./dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "./notification-preferences.service.js";

describe("NotificationPreferencesService", () => {
    const userId = "507f1f77bcf86cd799439012";

    it("preenche defaults para contextos sem preferência persistida", async () => {
        const { preferenceModel, service } = makeService();
        preferenceModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
                {
                    _id: "507f1f77bcf86cd799439013",
                    context: NotificationContext.STUDY_GOAL,
                    email: true,
                    push: false,
                    inApp: false,
                },
            ]),
        });

        await expect(service.listEffective(userId)).resolves.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    context: NotificationContext.STUDY_ROUTINE,
                    email: false,
                    push: false,
                    inApp: true,
                }),
                expect.objectContaining({
                    context: NotificationContext.STUDY_GOAL,
                    email: true,
                    inApp: false,
                }),
            ]),
        );
    });

    it("atualiza preferência e consulta canal in-app", async () => {
        const { preferenceModel, service } = makeService();
        preferenceModel.findOneAndUpdate.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439013",
                context: NotificationContext.GROUP_SESSION,
                email: false,
                push: false,
                inApp: false,
            }),
        });
        preferenceModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ inApp: false }),
        });

        await expect(
            service.upsert(userId, {
                context: NotificationContext.GROUP_SESSION,
                email: false,
                push: false,
                inApp: false,
            }),
        ).resolves.toMatchObject({ inApp: false });
        await expect(
            service.isInAppEnabled(userId, NotificationContext.GROUP_SESSION),
        ).resolves.toBe(false);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de preferências de notificação para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const preferenceModel = {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    };
    const service = new NotificationPreferencesService(preferenceModel as never);
    return { preferenceModel, service };
}
