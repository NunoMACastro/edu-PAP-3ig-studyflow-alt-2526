/**
 * Cobre a orquestração específica da IA supervisionada das salas guiadas.
 */
import {
    ConflictException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GuidedStudyRoomAiService } from "./guided-study-room-ai.service.js";

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
const classId = "507f1f77bcf86cd799439014";
const roomId = "507f1f77bcf86cd799439015";
const subjectId = "507f1f77bcf86cd799439016";
const materialId = "507f1f77bcf86cd799439017";
const interactionId = "507f1f77bcf86cd799439018";

describe("GuidedStudyRoomAiService", () => {
    it("aplica CLASS_AI, quota de turma, voz efetiva e fontes processadas selecionadas", async () => {
        const fixture = makeService();
        fixture.aiExecution.executeAuthorized.mockImplementation(
            async (_authorization: unknown, options: Record<string, any>) => {
                const result = {
                    answer: "Resposta apoiada no material.",
                    sourceMaterialIds: [materialId],
                };
                options.validateResult(result, [fixture.material]);
                return {
                    result,
                    sources: [fixture.material],
                    policy: { model: "class-model" },
                };
            },
        );

        const studentView = await fixture.service.ask(student, classId, roomId, {
            question: " Explica o conceito principal. ",
        });
        expect(studentView).toMatchObject({
            _id: interactionId,
            question: "Explica o conceito principal.",
            sources: [{ _id: materialId }],
            teacherVoiceApplied: true,
        });
        expect(studentView).not.toHaveProperty("studentId");
        expect(studentView).not.toHaveProperty("studentEmail");

        expect(fixture.aiExecution.authorize).toHaveBeenCalledWith(
            student.id,
            "CLASS_AI",
        );
        expect(fixture.voiceService.resolveTeacherVoice).toHaveBeenCalledWith({
            classId,
            subjectId,
        });
        expect(fixture.aiExecution.executeAuthorized).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                quota: { scope: "CLASS", targetId: classId },
                sources: [fixture.material],
            }),
        );
        expect(fixture.interactionModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                question: "Explica o conceito principal.",
                sourceMaterialIds: [expect.any(Object)],
                voiceSource: "SUBJECT_OVERRIDE",
            }),
        );
        expect(
            fixture.classLearningActivityService.recordBestEffort,
        ).toHaveBeenCalledWith({
            classId,
            studentId: student.id,
            subjectId,
            type: "GUIDED_ROOM_AI_INTERACTION",
            sourceEventKey: `guided-room-ai-interaction:${interactionId}`,
            occurredAt: new Date("2026-07-01T09:00:00.000Z"),
        });
    });

    it("rejeita citações que não pertencem às fontes autorizadas e não persiste", async () => {
        const fixture = makeService();
        fixture.aiExecution.executeAuthorized.mockImplementation(
            async (_authorization: unknown, options: Record<string, any>) => {
                options.validateResult(
                    {
                        answer: "Resposta com fonte externa.",
                        sourceMaterialIds: ["507f1f77bcf86cd799439099"],
                    },
                    [fixture.material],
                );
            },
        );

        await expect(
            fixture.service.ask(student, classId, roomId, { question: "Pergunta válida" }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(fixture.interactionModel.create).not.toHaveBeenCalled();
    });

    it("mantém salas fechadas em leitura e bloqueia novas perguntas antes da governação", async () => {
        const fixture = makeService({ status: "CLOSED" });

        await expect(
            fixture.service.ask(student, classId, roomId, { question: "Nova pergunta" }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(fixture.aiExecution.authorize).not.toHaveBeenCalled();
        expect(fixture.interactionModel.create).not.toHaveBeenCalled();
    });

    it("audita a supervisão docente sem copiar perguntas nem respostas", async () => {
        const fixture = makeService();
        fixture.interactionModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        {
                            _id: interactionId,
                            roomId,
                            classId,
                            subjectId,
                            studentId: student.id,
                            question: "Pergunta privada",
                            answer: "Resposta privada",
                            sourceMaterialIds: [materialId],
                            voiceSource: "SUBJECT_OVERRIDE",
                            voiceTone: "SOCRATIC",
                            voiceDetailLevel: "BALANCED",
                        },
                    ]),
                }),
            }),
        });

        await expect(
            fixture.service.listForTeacher(teacher, classId, roomId, {}),
        ).resolves.toMatchObject({
            items: [
                {
                    studentId: student.id,
                    studentEmail: student.email,
                    question: "Pergunta privada",
                    answer: "Resposta privada",
                },
            ],
            nextCursor: null,
        });
        expect(fixture.auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "GUIDED_ROOM_AI_SUPERVISION_VIEWED",
                metadata: {
                    classId,
                    resultCount: 1,
                    filteredByStudent: false,
                },
            }),
        );
    });

    it("lista histórico do aluno em sala arquivada sem expor identidade", async () => {
        const fixture = makeService({ status: "CLOSED" });
        fixture.interactionModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        {
                            ...fixture.interaction,
                            question: "Pergunta histórica",
                            answer: "Resposta histórica",
                        },
                    ]),
                }),
            }),
        });

        const page = await fixture.service.listForStudent(
            student,
            classId,
            roomId,
        );

        expect(fixture.roomsService.ensureStudentHistoricalRoom).toHaveBeenCalledWith(
            student,
            classId,
            roomId,
        );
        expect(page.items[0]).toMatchObject({
            question: "Pergunta histórica",
            answer: "Resposta histórica",
        });
        expect(page.items[0]).not.toHaveProperty("studentId");
        expect(page.items[0]).not.toHaveProperty("studentEmail");
    });
});

function makeService(overrides: { status?: "OPEN" | "CLOSED" } = {}) {
    const material = {
        _id: materialId,
        subjectId,
        classId,
        teacherId: teacher.id,
        title: "Resumo processado",
        type: "TEXT" as const,
        status: "PROCESSED" as const,
        textContent: "Fonte pedagógica autorizada.",
    };
    const room = {
        _id: roomId,
        classId,
        subjectId,
        teacherId: teacher.id,
        title: "Sala guiada",
        description: "Trabalha apenas a partir dos materiais indicados.",
        goal: "Compreender o conceito",
        materialIds: [materialId],
        aiEnabled: true,
        status: overrides.status ?? "OPEN",
    };
    const interaction = {
        _id: interactionId,
        roomId,
        classId,
        subjectId,
        studentId: student.id,
        question: "Explica o conceito principal.",
        answer: "Resposta apoiada no material.",
        sourceMaterialIds: [materialId],
        voiceSource: "SUBJECT_OVERRIDE" as const,
        voiceTone: "SOCRATIC" as const,
        voiceDetailLevel: "BALANCED" as const,
        voiceRulesApplied: ["Fazer perguntas orientadoras"],
        createdAt: new Date("2026-07-01T09:00:00.000Z"),
    };
    const interactionModel = {
        create: jest.fn().mockResolvedValue({
            _id: interactionId,
            toObject: () => interaction,
        }),
        find: jest.fn(),
        distinct: jest.fn().mockResolvedValue([student.id]),
    };
    const roomsService = {
        ensureStudentRoom: jest.fn().mockResolvedValue(room),
        ensureStudentHistoricalRoom: jest.fn().mockResolvedValue(room),
        findOwnedRoom: jest.fn().mockResolvedValue(room),
        getProgress: jest.fn().mockResolvedValue({
            totalStudents: 1,
            notViewed: 0,
            viewed: 1,
            completed: 0,
            completionPercent: 0,
            students: [
                {
                    studentId: student.id,
                    email: student.email,
                    status: "VIEWED",
                },
            ],
        }),
        listProcessedSelectedMaterials: jest.fn().mockResolvedValue([material]),
        filterMaterialsForRoom: jest.fn((_room, materials) => materials),
    };
    const voiceService = {
        resolveTeacherVoice: jest.fn().mockResolvedValue({
            source: "SUBJECT_OVERRIDE",
            tone: "SOCRATIC",
            detailLevel: "BALANCED",
            rules: ["Fazer perguntas orientadoras"],
        }),
    };
    const aiExecution = {
        authorize: jest.fn().mockResolvedValue({ purpose: "CLASS_AI" }),
        executeAuthorized: jest.fn(),
    };
    const auditLogService = { record: jest.fn().mockResolvedValue(undefined) };
    const classesService = {
        listOwnedClassStudentsIncluding: jest
            .fn()
            .mockResolvedValue([{ id: student.id, email: student.email }]),
    };
    const materialsService = {
        listByIds: jest.fn().mockResolvedValue([material]),
        toStudentMaterialView: jest.fn().mockImplementation(
            ({ teacherId: _teacherId, ...safe }) => ({
                ...safe,
                contentRevision: safe.contentRevision ?? 0,
                availableToAi:
                    safe.status === "PROCESSED" && Boolean(safe.textContent),
            }),
        ),
    };
    const classLearningActivityService = {
        recordBestEffort: jest.fn().mockResolvedValue(true),
    };
    const service = new GuidedStudyRoomAiService(
        interactionModel as never,
        roomsService as never,
        voiceService as never,
        aiExecution as never,
        auditLogService as never,
        classesService as never,
        materialsService as never,
        classLearningActivityService as never,
    );
    return {
        service,
        material,
        interaction,
        interactionModel,
        roomsService,
        classLearningActivityService,
        voiceService,
        aiExecution,
        auditLogService,
    };
}
