/**
 * Testa o comportamento de alertas de estudo e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { StudyAlertsService } from "./study-alerts.service.js";

describe("StudyAlertsService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "professor@example.test",
        role: "TEACHER",
    };

    it("agrega alertas in-app respeitando preferências e filtro futuro", async () => {
        const { service } = makeService();

        await expect(
            service.listAlerts(student, { onlyUpcoming: true }),
        ).resolves.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    context: NotificationContext.STUDY_ROUTINE,
                    title: "Rotina: Matemática",
                }),
                expect.objectContaining({
                    context: NotificationContext.GROUP_SESSION,
                    title: "Sessão: Revisão coletiva",
                }),
            ]),
        );
    });

    it("bloqueia utilizadores que não sejam alunos", async () => {
        const { service } = makeService();

        await expect(service.listAlerts(teacher, {})).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de alertas de estudo para manter testes e prompts legíveis.
 * @returns Valor de alertas de estudo no contrato esperado pelo chamador.
 */
function makeService() {
    const routinesService = {
        listMine: jest.fn().mockResolvedValue({
            routines: [
                {
                    _id: "507f1f77bcf86cd799439014",
                    title: "Matemática",
                    weekdays: ["MON"],
                    startTime: "18:00",
                },
            ],
            goals: [
                {
                    _id: "507f1f77bcf86cd799439015",
                    title: "Objetivo antigo",
                    targetDate: new Date("2020-01-01T00:00:00.000Z"),
                },
            ],
        }),
    };
    const sessionsService = {
        listUpcomingForStudent: jest.fn().mockResolvedValue([
            {
                _id: "507f1f77bcf86cd799439016",
                title: "Revisão coletiva",
                startsAt: new Date("2030-01-01T10:00:00.000Z"),
            },
        ]),
    };
    const preferencesService = {
        isInAppEnabled: jest
            .fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true),
    };
    const service = new StudyAlertsService(
        routinesService as never,
        sessionsService as never,
        preferencesService as never,
    );
    return { service };
}
