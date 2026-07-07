/**
 * Testa alertas docentes de acompanhamento, incluindo destinatários filtrados.
 */
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "professor@example.test",
    role: "TEACHER",
};
const classId = "507f1f77bcf86cd799439011";
const ruleId = "507f1f77bcf86cd799439012";
const activeStudentId = "507f1f77bcf86cd799439013";
const inactiveStudentId = "507f1f77bcf86cd799439014";

describe("FollowUpAlertsService", () => {
    it("envia alertas apenas para alunos inativos calculados no backend", async () => {
        const { notificationsService, service } = makeService();

        await expect(service.run(teacher, ruleId)).resolves.toMatchObject({
            inactiveStudentIds: [inactiveStudentId],
            notification: { id: "notification-1" },
        });

        expect(notificationsService.createForRecipients).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({
                contextType: "CLASS",
                contextId: classId,
                type: "FOLLOW_UP",
            }),
            [inactiveStudentId],
        );
    });
});

/**
 * Executa o apoio de teste para alertas de acompanhamento, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const ruleModel = {
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: ruleId,
                teacherId: teacher.id,
                classId,
                inactiveDays: 7,
                title: "Acompanhamento",
                message: "Volta ao estudo.",
            }),
        }),
    };
    const eventModel = {
        find: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    { userId: new Types.ObjectId(activeStudentId) },
                ]),
            }),
        }),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            studentIds: [activeStudentId, inactiveStudentId],
        }),
    };
    const notificationsService = {
        createForRecipients: jest.fn().mockResolvedValue({ id: "notification-1" }),
    };
    return {
        notificationsService,
        service: new FollowUpAlertsService(
            ruleModel as never,
            eventModel as never,
            classesService as never,
            notificationsService as never,
        ),
    };
}
