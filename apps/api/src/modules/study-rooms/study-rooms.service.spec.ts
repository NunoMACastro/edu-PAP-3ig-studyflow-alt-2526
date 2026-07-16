/**
 * Testa o comportamento de salas de estudo e documenta os cenários de aceitação automatizados.
 */
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyRoomsService } from "./study-rooms.service.js";

describe("StudyRoomsService", () => {
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
    const roomId = "507f1f77bcf86cd799439014";

    it("bloqueia criação de salas por professores", async () => {
        const { roomModel, service } = makeService();

        await expect(
            service.createRoom(teacher, {
                name: "Grupo de Física",
                type: "FREE",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "STUDENT_ROLE_REQUIRED",
            },
        });
        await expect(
            service.createRoom(teacher, {
                name: "Grupo de Física",
                type: "FREE",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(roomModel.create).not.toHaveBeenCalled();
    });

    it("obriga a disciplina em salas do tipo SUBJECT", async () => {
        const { roomModel, service } = makeService();

        await expect(
            service.createRoom(student, {
                name: "Matemática",
                type: "SUBJECT",
                disciplineName: "   ",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "DISCIPLINE_NAME_REQUIRED",
            },
        });
        await expect(
            service.createRoom(student, {
                name: "Matemática",
                type: "SUBJECT",
                disciplineName: "   ",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(roomModel.create).not.toHaveBeenCalled();
    });

    it("cria sala com o aluno autenticado como membro inicial", async () => {
        const { roomModel, service } = makeService();
        roomModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para salas de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: roomId,
                ownerStudentId: student.id,
                name: "Matemática",
                type: "SUBJECT",
                disciplineName: "Matemática A",
                description: "Preparação para teste",
                memberIds: [student.id],
            }),
        });

        await expect(
            service.createRoom(student, {
                name: " Matemática ",
                type: "SUBJECT",
                disciplineName: " Matemática A ",
                description: " Preparação para teste ",
            }),
        ).resolves.toMatchObject({
            _id: roomId,
            ownerStudentId: student.id,
            memberIds: [student.id],
            members: [{ id: student.id, displayName: "Aluno da Sala" }],
        });
        expect(roomModel.create).toHaveBeenCalledWith(expect.objectContaining({
            ownerStudentId: expect.anything(),
            name: "Matemática",
            type: "SUBJECT",
            disciplineName: "Matemática A",
            description: "Preparação para teste",
            memberIds: [expect.anything()],
            collaborationKind: "STUDY_ROOM",
            collaborationKindSource: "NATIVE",
        }));
    });

    it("adiciona membros por email normalizado e apenas com role STUDENT", async () => {
        const memberId = "507f1f77bcf86cd799439015";
        const { roomModel, userModel, service } = makeService();
        roomModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: roomId,
                ownerStudentId: student.id,
                name: "Matemática",
                type: "FREE",
                memberIds: [student.id],
            }),
        });
        userModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: memberId,
                email: "colega@example.test",
                role: "STUDENT",
            }),
        });
        roomModel.findByIdAndUpdate.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: roomId,
                ownerStudentId: student.id,
                name: "Matemática",
                type: "FREE",
                memberIds: [student.id, memberId],
            }),
        });

        await expect(
            service.addMember(student, roomId, {
                email: " Colega@Example.Test ",
            }),
        ).resolves.toMatchObject({
            memberIds: [student.id, memberId],
        });
        expect(userModel.findOne).toHaveBeenCalledWith({
            email: "colega@example.test",
            role: "STUDENT",
        });
        expect(roomModel.findByIdAndUpdate).toHaveBeenCalledWith(
            roomId,
            { $addToSet: { memberIds: memberId } },
            { new: true, runValidators: true },
        );
    });

    it("rejeita membros inexistentes sem atualizar a sala", async () => {
        const { roomModel, userModel, service } = makeService();
        roomModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: roomId,
                ownerStudentId: student.id,
                name: "Matemática",
                type: "FREE",
                memberIds: [student.id],
            }),
        });
        userModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.addMember(student, roomId, {
                email: "desconhecido@example.test",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "ROOM_MEMBER_NOT_FOUND",
            },
        });
        await expect(
            service.addMember(student, roomId, {
                email: "desconhecido@example.test",
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(roomModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("exige proprietário quando a política interna do grupo é owner-only", async () => {
        const { roomModel, userModel, service } = makeService();
        roomModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: roomId,
                ownerStudentId: "507f1f77bcf86cd799439099",
                name: "Grupo",
                type: "FREE",
                memberIds: [student.id],
                collaborationKind: "STUDY_GROUP",
            }),
        });

        await expect(service.addMember(
            student,
            roomId,
            { email: "colega@example.test" },
            { collaborationKind: "STUDY_GROUP", ownerOnly: true },
        )).rejects.toMatchObject({ response: { code: "GROUP_OWNER_REQUIRED" } });
        expect(userModel.findOne).not.toHaveBeenCalled();
    });

    it("recusa professor antes de tentar adicionar um membro", async () => {
        const { roomModel, userModel, service } = makeService();
        await expect(service.addMember(
            teacher,
            roomId,
            { email: "colega@example.test" },
            { collaborationKind: "STUDY_GROUP", ownerOnly: true },
        )).rejects.toMatchObject({ response: { code: "STUDENT_ROLE_REQUIRED" } });
        expect(roomModel.findOne).not.toHaveBeenCalled();
        expect(userModel.findOne).not.toHaveBeenCalled();
    });

    it("bloqueia acesso a salas onde o aluno não é membro", async () => {
        const { profileService, roomModel, service } = makeService();
        roomModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.ensureMember(student.id, roomId),
        ).rejects.toMatchObject({
            response: {
                code: "ROOM_ACCESS_DENIED",
            },
        });
        await expect(
            service.ensureMember(student.id, roomId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(profileService.resolvePublicDisplayNames).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de salas de estudo para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const roomModel = {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    };
    const userModel = {
        findOne: jest.fn(),
    };
    const profileService = {
        resolvePublicDisplayNames: jest.fn().mockImplementation(
            async (ids: string[]) => new Map(ids.map((id) => [id, "Aluno da Sala"])),
        ),
    };
    const service = new StudyRoomsService(
        roomModel as never,
        userModel as never,
        profileService as never,
    );

    return {
        roomModel,
        userModel,
        profileService,
        service,
    };
}
