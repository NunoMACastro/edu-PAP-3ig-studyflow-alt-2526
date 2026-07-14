/**
 * Testa o comportamento de sessões de estudo em grupo e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyGroupSessionsService } from "./study-group-sessions.service.js";

describe("StudyGroupSessionsService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const groupId = "507f1f77bcf86cd799439013";

    it("agenda sessão futura após validar membership", async () => {
        const { sessionModel, studyGroupsService, service } = makeService();

        await expect(
            service.createSession(student, groupId, {
                title: "Revisão de redes",
                startsAt: "2030-01-01T10:00:00.000Z",
                durationMinutes: 45,
                goal: "Resolver exercícios.",
            }),
        ).resolves.toMatchObject({
            groupId,
            title: "Revisão de redes",
        });
        expect(studyGroupsService.ensureMember).toHaveBeenCalledWith(
            student.id,
            groupId,
        );
        expect(sessionModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Revisão de redes",
                durationMinutes: 45,
                goal: "Resolver exercícios.",
            }),
        );
    });

    it("rejeita sessões no passado", async () => {
        const { sessionModel, service } = makeService();

        await expect(
            service.createSession(student, groupId, {
                title: "Sessão antiga",
                startsAt: "2020-01-01T10:00:00.000Z",
                durationMinutes: 45,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(sessionModel.create).not.toHaveBeenCalled();
    });

    it("agenda sessões de sala com kind explícito e autorização da sala", async () => {
        const { sessionModel, service, studyGroupsService, studyRoomsService } = makeService();

        await expect(service.createSession(student, groupId, {
            title: "Revisão na sala",
            startsAt: "2030-01-01T10:00:00.000Z",
            durationMinutes: 45,
        }, "STUDY_ROOM")).resolves.toMatchObject({
            groupId,
            collaborationKind: "STUDY_ROOM",
        });
        expect(studyRoomsService.ensureMember).toHaveBeenCalledWith(
            student.id,
            groupId,
            "STUDY_ROOM",
        );
        expect(studyGroupsService.ensureMember).not.toHaveBeenCalled();
        expect(sessionModel.create).toHaveBeenCalledWith(expect.objectContaining({
            collaborationKind: "STUDY_ROOM",
        }));
    });
});

/**
 * Cria fixture ou estrutura auxiliar de sessões de estudo em grupo para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const sessionModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            /**
             * Transforma o apoio de teste para study group sessions, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: "507f1f77bcf86cd799439099",
                ...input,
                createdAt: new Date("2026-06-15T10:00:00Z"),
            }),
        })),
        find: jest.fn(),
    };
    const studyGroupsService = {
        ensureMember: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439013" }),
        listMyGroups: jest.fn().mockResolvedValue([]),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439013" }),
        listMyRooms: jest.fn().mockResolvedValue([]),
    };
    const service = new StudyGroupSessionsService(
        sessionModel as never,
        studyGroupsService as never,
        studyRoomsService as never,
    );
    return { sessionModel, studyGroupsService, studyRoomsService, service };
}
