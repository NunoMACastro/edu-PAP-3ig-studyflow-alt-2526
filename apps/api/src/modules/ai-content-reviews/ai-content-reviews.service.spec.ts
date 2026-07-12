/**
 * Testa o comportamento de revisão docente de conteúdos IA e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiContentReviewsService } from "./ai-content-reviews.service.js";

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
const subjectId = "507f1f77bcf86cd799439014";
const otherSubjectId = "507f1f77bcf86cd799439015";
const materialId = "507f1f77bcf86cd799439016";
const reviewId = "507f1f77bcf86cd799439017";
const classId = "507f1f77bcf86cd799439018";
const attemptId = "507f1f77bcf86cd799439019";

describe("AiContentReviewsService", () => {
    it("cria revisão apenas para material oficial da disciplina do professor", async () => {
        const { reviewModel, service } = makeService();

        await expect(
            service.create(teacher, subjectId, {
                materialId,
                contentType: "SUMMARY",
                contentJson: { text: "Resumo oficial com conteúdo suficiente." },
            }),
        ).resolves.toMatchObject({
            _id: reviewId,
            subjectId,
            materialId,
            teacherId: teacher.id,
            status: "PENDING",
        });
        expect(reviewModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                contentType: "SUMMARY",
                contentJson: { text: "Resumo oficial com conteúdo suficiente." },
                status: "PENDING",
            }),
        );
    });

    it("bloqueia aluno antes de consultar disciplina", async () => {
        const { subjectsService, service } = makeService();

        await expect(
            service.create(student, subjectId, {
                materialId,
                contentType: "SUMMARY",
                contentJson: {},
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
    });

    it("rejeita material que não pertence à disciplina validada", async () => {
        const { reviewModel, service, officialMaterialsService } = makeService();
        officialMaterialsService.findOwnedMaterial.mockResolvedValueOnce({
            _id: materialId,
            subjectId: otherSubjectId,
        });

        await expect(
            service.create(teacher, subjectId, {
                materialId,
                contentType: "QUIZ",
                contentJson: {},
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(reviewModel.create).not.toHaveBeenCalled();
    });

    it("decide apenas revisões do professor autenticado", async () => {
        const { reviewModel, service } = makeService();

        await expect(
            service.decide(teacher, reviewId, {
                status: "APPROVED",
                teacherComment: " Bom ",
            }),
        ).resolves.toMatchObject({
            _id: reviewId,
            status: "APPROVED",
            teacherComment: "Bom",
        });
        expect(reviewModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: reviewId,
                teacherId: expect.anything(),
                status: "PENDING",
            },
            {
                $set: {
                    status: "APPROVED",
                    teacherComment: "Bom",
                    contentJson: {
                        text: "Resumo oficial com conteúdo suficiente.",
                    },
                },
            },
            { new: true, runValidators: true },
        );
    });

    it("usa a mesma sessão para decisão, auditoria e outbox", async () => {
        const session = { id: "session-ai-review" };
        const connection = {
            transaction: jest.fn(
                async (operation: (value: unknown) => Promise<unknown>) =>
                    operation(session),
            ),
        };
        const {
            auditLogService,
            notificationsService,
            reviewModel,
            service,
        } = makeService(connection);

        await service.decide(teacher, reviewId, {
            status: "APPROVED",
            teacherComment: "Bom",
        });

        expect(reviewModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ status: "PENDING" }),
            expect.any(Object),
            expect.objectContaining({ session }),
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({ action: "AI_CONTENT_REVIEW_DECIDED" }),
            session,
        );
        expect(notificationsService.enqueueClassEvent).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({ type: "AI_CONTENT_APPROVED" }),
            session,
        );
    });

    it("deteta uma decisão concorrente pelo estado anterior", async () => {
        const { auditLogService, reviewModel, service } = makeService();
        const current = {
            _id: reviewId,
            subjectId,
            materialId,
            teacherId: teacher.id,
            contentType: "SUMMARY",
            contentJson: { text: "Resumo oficial com conteúdo suficiente." },
            status: "PENDING",
        };
        reviewModel.findOne
            .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(current) })
            .mockReturnValueOnce({
                lean: jest.fn().mockResolvedValue({
                    ...current,
                    status: "REJECTED",
                }),
            });
        reviewModel.findOneAndUpdate.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.decide(teacher, reviewId, { status: "APPROVED" }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(auditLogService.record).not.toHaveBeenCalled();
    });

    it("exige motivo ao rejeitar", async () => {
        const { reviewModel, service } = makeService();

        await expect(
            service.decide(teacher, reviewId, {
                status: "REJECTED",
                teacherComment: "não",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(reviewModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("lista para o aluno apenas conteúdo aprovado sem soluções", async () => {
        const { reviewModel, service } = makeService();
        reviewModel.find.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([{
                    _id: reviewId,
                    subjectId,
                    materialId,
                    teacherId: teacher.id,
                    contentType: "QUIZ",
                    status: "APPROVED",
                    teacherComment: "Comentário interno",
                    updatedAt: new Date("2026-07-10T12:00:00.000Z"),
                    contentJson: {
                        questions: [{
                            question: "Quanto é dois mais dois?",
                            options: ["1", "2", "3", "4"],
                            correctOptionIndex: 3,
                            explanation: "Dois mais dois são quatro.",
                        }],
                    },
                }]),
            }),
        });

        const result = await service.listApprovedForStudent(student, subjectId);

        expect(result).toEqual([expect.objectContaining({
            reviewId,
            contentType: "QUIZ",
            material: { id: materialId, title: "Material oficial" },
            content: {
                questions: [{
                    questionIndex: 0,
                    question: "Quanto é dois mais dois?",
                    options: ["1", "2", "3", "4"],
                }],
            },
        })]);
        expect(JSON.stringify(result)).not.toContain("correctOptionIndex");
        expect(JSON.stringify(result)).not.toContain("Comentário interno");
    });

    it("corrige e persiste quiz aprovado sem duplicar a solução", async () => {
        const { approvedAttemptModel, reviewModel, service } = makeService();
        reviewModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue({
                _id: reviewId,
                subjectId,
                materialId,
                teacherId: teacher.id,
                contentType: "QUIZ",
                status: "APPROVED",
                contentJson: {
                    questions: [{
                        question: "Quanto é dois mais dois?",
                        options: ["1", "2", "3", "4"],
                        correctOptionIndex: 3,
                        explanation: "Dois mais dois são quatro.",
                    }],
                },
            }),
        });

        await expect(
            service.submitApprovedQuizAttempt(student, subjectId, reviewId, {
                selectedOptionIndexes: [3],
            }),
        ).resolves.toMatchObject({
            reviewId,
            attemptId,
            attemptNumber: 1,
            correctCount: 1,
            totalQuestions: 1,
            scorePercent: 100,
            results: [{
                questionIndex: 0,
                selectedOptionIndex: 3,
                correctOptionIndex: 3,
                isCorrect: true,
                explanation: "Dois mais dois são quatro.",
            }],
        });
        expect(reviewModel.create).not.toHaveBeenCalled();
        expect(approvedAttemptModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                attemptNumber: 1,
                selectedOptionIndexes: [3],
                correctCount: 1,
                scorePercent: 100,
            }),
        );
    });

    it("conta revisões pendentes por disciplinas e evita query sem ids", async () => {
        const { reviewModel, service } = makeService();

        await expect(service.countPendingBySubjectIds([])).resolves.toBe(0);
        expect(reviewModel.countDocuments).not.toHaveBeenCalled();

        await expect(service.countPendingBySubjectIds([subjectId])).resolves.toBe(1);
        expect(reviewModel.countDocuments).toHaveBeenCalledWith({
            subjectId: { $in: [expect.any(Object)] },
            status: "PENDING",
        });
    });

    it("conta revisões pendentes agrupadas por disciplina", async () => {
        const { reviewModel, service } = makeService();

        await expect(service.countPendingBySubjectIdsGrouped([])).resolves.toEqual(
            {},
        );
        expect(reviewModel.aggregate).not.toHaveBeenCalled();

        await expect(
            service.countPendingBySubjectIdsGrouped([subjectId]),
        ).resolves.toEqual({ [subjectId]: 1 });
        expect(reviewModel.aggregate).toHaveBeenCalledWith([
            {
                $match: {
                    subjectId: { $in: [expect.any(Types.ObjectId)] },
                    status: "PENDING",
                },
            },
            { $group: { _id: "$subjectId", count: { $sum: 1 } } },
        ]);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de revisão docente de conteúdos IA para manter testes e prompts legíveis.
 * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(connection?: unknown) {
    const review = {
        _id: reviewId,
        subjectId,
        materialId,
        teacherId: teacher.id,
        contentType: "SUMMARY",
        contentJson: { text: "Resumo oficial com conteúdo suficiente." },
        status: "PENDING",
        createdAt: new Date("2026-07-10T10:00:00.000Z"),
        updatedAt: new Date("2026-07-10T10:00:00.000Z"),
    };
    const reviewModel = {
        aggregate: jest.fn().mockResolvedValue([
            { _id: new Types.ObjectId(subjectId), count: 1 },
        ]),
        create: jest.fn().mockResolvedValue({
            /**
             * Devolve o documento de revisão no formato usado pelo service durante o teste.
             *
             * @returns Registo de revisão sem comportamento Mongoose adicional.
             */
            toObject: () => review,
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([review]),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(review),
        }),
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                ...review,
                status: "APPROVED",
                teacherComment: "Bom",
                updatedAt: new Date("2026-07-10T11:00:00.000Z"),
            }),
        }),
        countDocuments: jest.fn().mockResolvedValue(1),
    };
    const subjectsService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        findOwnedSubject: jest.fn().mockResolvedValue({ _id: subjectId, classId }),
        findOwnedSubjectForHistory: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: { _id: subjectId, classId },
            schoolClass: { _id: classId },
        }),
        findSubjectForStudentHistory: jest.fn().mockResolvedValue({
            subject: { _id: subjectId, classId },
            schoolClass: { _id: classId },
        }),
    };
    const officialMaterialsService = {
        findOwnedMaterial: jest.fn().mockResolvedValue({
            _id: materialId,
            subjectId,
            title: "Material oficial",
            status: "PROCESSED",
        }),
        listTeacherSubjectMaterials: jest.fn().mockResolvedValue([{
            _id: materialId,
            subjectId,
            title: "Material oficial",
            status: "PROCESSED",
        }]),
        findProcessedBySubject: jest.fn().mockResolvedValue([{
            _id: materialId,
            subjectId,
            title: "Material oficial",
            status: "PROCESSED",
        }]),
    };
    const auditLogService = { record: jest.fn().mockResolvedValue({}) };
    const approvedAttemptModel = {
        countDocuments: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation((input) =>
            Promise.resolve({ _id: attemptId, ...input }),
        ),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            }),
        }),
    };
    const activityService = { recordBestEffort: jest.fn().mockResolvedValue(true) };
    const notificationsService = { enqueueClassEvent: jest.fn().mockResolvedValue({}) };
    const service = new AiContentReviewsService(
        reviewModel as never,
        subjectsService as never,
        officialMaterialsService as never,
        auditLogService as never,
        approvedAttemptModel as never,
        activityService as never,
        notificationsService as never,
        connection as never,
    );
    return {
        activityService,
        approvedAttemptModel,
        auditLogService,
        notificationsService,
        officialMaterialsService,
        reviewModel,
        service,
        subjectsService,
    };
}
