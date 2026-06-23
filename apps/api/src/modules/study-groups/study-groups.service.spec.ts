/**
 * Testa o comportamento de grupos de estudo e documenta os cenários de aceitação automatizados.
 */
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyGroupsService } from "./study-groups.service.js";

describe("StudyGroupsService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("cria grupo reutilizando StudyRoom e preservando membership", async () => {
        const { service, studyRoomsService } = makeService();

        await expect(
            service.createGroup(student, {
                title: "Grupo de Matemática",
                disciplineName: "Matemática",
                description: "Preparação para teste.",
            }),
        ).resolves.toMatchObject({
            _id: "507f1f77bcf86cd799439013",
            title: "Grupo de Matemática",
            memberIds: [student.id],
        });
        expect(studyRoomsService.createRoom).toHaveBeenCalledWith(student, {
            name: "Grupo de Matemática",
            type: "SUBJECT",
            disciplineName: "Matemática",
            description: "Preparação para teste.",
        });
    });

    it("valida membership antes de devolver grupo", async () => {
        const { service, studyRoomsService } = makeService();

        await expect(
            service.ensureMember(student.id, "507f1f77bcf86cd799439013"),
        ).resolves.toMatchObject({ title: "Grupo de Matemática" });
        expect(studyRoomsService.ensureMember).toHaveBeenCalledWith(
            student.id,
            "507f1f77bcf86cd799439013",
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de grupos de estudo para manter testes e prompts legíveis.
 * @returns Valor de grupos de estudo no contrato esperado pelo chamador.
 */
function makeService() {
    const room = {
        _id: "507f1f77bcf86cd799439013",
        ownerStudentId: "507f1f77bcf86cd799439012",
        name: "Grupo de Matemática",
        disciplineName: "Matemática",
        description: "Preparação para teste.",
        memberIds: ["507f1f77bcf86cd799439012"],
    };
    const studyRoomsService = {
        createRoom: jest.fn().mockResolvedValue(room),
        ensureMember: jest.fn().mockResolvedValue(room),
        listMyRooms: jest.fn().mockResolvedValue([room]),
    };
    const service = new StudyGroupsService(studyRoomsService as never);
    return { service, studyRoomsService };
}
