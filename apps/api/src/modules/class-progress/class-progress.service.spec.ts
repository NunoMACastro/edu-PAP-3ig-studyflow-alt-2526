/**
 * Testa o comportamento de turma progress e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassProgressService } from "./class-progress.service.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "professor@example.test",
    role: "TEACHER",
};
const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439013",
    email: "aluno@example.test",
    role: "STUDENT",
};
const classId = "507f1f77bcf86cd799439014";

describe("ClassProgressService", () => {
    it("agrega métricas, dificuldades e notas persistidas da turma", async () => {
        const { service, noteModel, postsService } = makeService();

        await expect(service.getClassProgress(teacher, classId)).resolves.toMatchObject({
            classId,
            className: "12.º A",
            studentsCount: 2,
            subjectsCount: 2,
            publishedTestsCount: 3,
            approvedAiContentCount: 4,
            postCount: 5,
            noteCount: 1,
            learningProgressPercent: null,
            learningProgressStatus: "PENDING_RESULTS_CONTRACT",
            activitySignalTotal: 13,
            activityCoveragePercent: 100,
            metricsBasis: "ACTIVITY_SIGNALS",
            difficultyTags: ["derivadas"],
            notes: [{ title: "Semana 1", difficultyTags: ["derivadas"] }],
            gaps: [
                "O progresso de aprendizagem por submissoes/resultados ainda nao tem contrato de dados nesta macrofase; os indicadores apresentados sao sinais de acompanhamento docente.",
            ],
        });
        expect(postsService.countByClassId).toHaveBeenCalledWith(classId);
        expect(noteModel.find).toHaveBeenCalledWith({
            classId: expect.any(Types.ObjectId),
        });
    });

    it("cria notas de acompanhamento apenas para professores da turma", async () => {
        const { service, noteModel } = makeService();

        await expect(
            service.createNote(teacher, classId, {
                title: " Dificuldades ",
                note: " Rever exercícios. ",
                difficultyTags: [" limites ", "", "derivadas"],
            }),
        ).resolves.toMatchObject({
            title: "Dificuldades",
            note: "Rever exercícios.",
            difficultyTags: ["limites", "derivadas"],
        });
        expect(noteModel.create).toHaveBeenCalledWith({
            classId: expect.any(Types.ObjectId),
            teacherId: expect.any(Types.ObjectId),
            title: "Dificuldades",
            note: "Rever exercícios.",
            difficultyTags: ["limites", "derivadas"],
        });
    });

    it("bloqueia alunos", async () => {
        const { service } = makeService();

        await expect(service.getClassProgress(student, classId)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de progresso da turma para manter testes e prompts legíveis.
 * @returns Valor de progresso da turma no contrato esperado pelo chamador.
 */
function makeService() {
    const note = {
        _id: "507f1f77bcf86cd799439020",
        classId,
        teacherId: teacher.id,
        title: "Semana 1",
        note: "Turma a consolidar regras.",
        difficultyTags: ["derivadas"],
    };
    const noteModel = {
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([note]),
            }),
        }),
        create: jest.fn().mockResolvedValue({
            toObject: () => ({
                _id: "507f1f77bcf86cd799439021",
                classId,
                teacherId: teacher.id,
                title: "Dificuldades",
                note: "Rever exercícios.",
                difficultyTags: ["limites", "derivadas"],
            }),
        }),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            name: "12.º A",
            studentIds: ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016"],
        }),
    };
    const postsService = { countByClassId: jest.fn().mockResolvedValue(5) };
    const subjectsService = {
        listTeacherClassSubjects: jest.fn().mockResolvedValue([
            { _id: "507f1f77bcf86cd799439017" },
            { _id: "507f1f77bcf86cd799439018" },
        ]),
    };
    const testsService = { countPublishedBySubjectIds: jest.fn().mockResolvedValue(3) };
    const reviewsService = {
        countApprovedBySubjectIds: jest.fn().mockResolvedValue(4),
    };
    const service = new ClassProgressService(
        noteModel as never,
        classesService as never,
        postsService as never,
        subjectsService as never,
        testsService as never,
        reviewsService as never,
    );
    return { noteModel, postsService, service };
}
