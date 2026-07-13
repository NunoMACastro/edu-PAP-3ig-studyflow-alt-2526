import { Types } from "mongoose";
import { StudentAiContextResolverService } from "./student-ai-context-resolver.service.js";

const student = {
    id: new Types.ObjectId().toString(),
    email: "aluno@example.test",
    role: "STUDENT" as const,
};

describe("StudentAiContextResolverService", () => {
    it("resolve os cinco contextos com finalidade e path construídos no backend", async () => {
        const fixture = makeFixture();
        const subjectId = new Types.ObjectId().toString();
        const areaId = new Types.ObjectId().toString();
        const groupId = new Types.ObjectId().toString();
        const roomId = new Types.ObjectId().toString();
        const guidedId = new Types.ObjectId().toString();
        const classId = new Types.ObjectId().toString();
        fixture.subjects.findSubjectForStudent.mockResolvedValue({
            subject: { _id: subjectId, name: "Bases de Dados" },
            schoolClass: { _id: classId, name: "12.º GPSI" },
        });
        fixture.areas.getMyStudyArea.mockResolvedValue({ _id: areaId, name: "Exames" });
        fixture.groups.ensureMember.mockResolvedValue({ _id: groupId, title: "Grupo SQL" });
        fixture.rooms.ensureMember.mockResolvedValue({ _id: roomId, name: "Sala SQL" });
        fixture.guidedModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ _id: guidedId, classId }),
        });
        fixture.guided.getForStudent.mockResolvedValue({
            _id: guidedId,
            classId,
            title: "Revisão guiada",
            status: "OPEN",
            aiEnabled: true,
        });

        await expect(fixture.service.resolve(student, "SUBJECT", subjectId)).resolves.toMatchObject({
            consentPurpose: "CLASS_AI",
            targetPath: `/app/disciplinas/${subjectId}`,
        });
        await expect(fixture.service.resolve(student, "STUDY_AREA", areaId)).resolves.toMatchObject({
            consentPurpose: "PRIVATE_AREA_AI",
            targetPath: `/app/areas/${areaId}`,
        });
        await expect(fixture.service.resolve(student, "STUDY_GROUP", groupId)).resolves.toMatchObject({
            consentPurpose: "GROUP_AI",
            targetPath: `/app/grupos/${groupId}`,
        });
        await expect(fixture.service.resolve(student, "STUDY_ROOM", roomId)).resolves.toMatchObject({
            consentPurpose: "ROOM_AI",
            targetPath: `/app/salas/${roomId}`,
        });
        await expect(fixture.service.resolve(student, "GUIDED_ROOM", guidedId)).resolves.toMatchObject({
            consentPurpose: "CLASS_AI",
            targetPath: `/app/turmas/${classId}/salas-guiadas/${guidedId}`,
        });
    });

    it("não consulta domínios quando o ID de contexto é inválido", async () => {
        const fixture = makeFixture();
        await expect(
            fixture.service.resolve(student, "SUBJECT", "id-invalido"),
        ).rejects.toMatchObject({
            response: { code: "ASSISTANT_CONTEXT_INVALID" },
        });
        expect(fixture.subjects.findSubjectForStudent).not.toHaveBeenCalled();
    });
});

/** Cria dependências estritamente controladas para testar só a resolução segura. */
function makeFixture() {
    const classes = { listStudentClasses: jest.fn() };
    const subjects = {
        findSubjectForStudent: jest.fn(),
        listStudentClassSubjects: jest.fn(),
    };
    const areas = {
        getMyStudyArea: jest.fn(),
        listMyStudyAreas: jest.fn(),
    };
    const groups = {
        ensureMember: jest.fn(),
        listMyGroups: jest.fn(),
    };
    const rooms = {
        ensureMember: jest.fn(),
        listMyRooms: jest.fn(),
    };
    const guided = {
        getForStudent: jest.fn(),
        listAllForStudent: jest.fn(),
    };
    const guidedModel = { findById: jest.fn() };
    const service = new StudentAiContextResolverService(
        classes as never,
        subjects as never,
        areas as never,
        groups as never,
        rooms as never,
        guided as never,
        guidedModel as never,
    );
    return { service, classes, subjects, areas, groups, rooms, guided, guidedModel };
}

