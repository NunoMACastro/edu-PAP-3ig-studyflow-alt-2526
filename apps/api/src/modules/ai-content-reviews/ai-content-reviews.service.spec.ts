/**
 * Testa o comportamento de revisão docente de conteúdos IA e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException, NotFoundException } from "@nestjs/common";
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

describe("AiContentReviewsService", () => {
    it("cria revisão apenas para material oficial da disciplina do professor", async () => {
        const { reviewModel, service } = makeService();

        await expect(
            service.create(teacher, subjectId, {
                materialId,
                contentType: "SUMMARY",
                contentJson: { title: "Resumo" },
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
                contentJson: { title: "Resumo" },
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
            { _id: reviewId, teacherId: expect.any(Object) },
            {
                $set: {
                    status: "APPROVED",
                    teacherComment: "Bom",
                },
            },
            { new: true, runValidators: true },
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
function makeService() {
    const review = {
        _id: reviewId,
        subjectId,
        materialId,
        teacherId: teacher.id,
        contentType: "SUMMARY",
        contentJson: { title: "Resumo" },
        status: "PENDING",
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
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                ...review,
                status: "APPROVED",
                teacherComment: "Bom",
            }),
        }),
        countDocuments: jest.fn().mockResolvedValue(1),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({ _id: subjectId }),
    };
    const officialMaterialsService = {
        findOwnedMaterial: jest.fn().mockResolvedValue({
            _id: materialId,
            subjectId,
        }),
    };
    const service = new AiContentReviewsService(
        reviewModel as never,
        subjectsService as never,
        officialMaterialsService as never,
    );
    return { officialMaterialsService, reviewModel, service, subjectsService };
}
