/**
 * Testa o comportamento de material versions e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException, UnprocessableEntityException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialVersionsService } from "./material-versions.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439019",
    email: "professor@example.test",
    role: "TEACHER",
};
const materialId = "507f1f77bcf86cd799439015";
const jobId = "507f1f77bcf86cd799439016";
const versionId = "507f1f77bcf86cd799439017";
const subjectId = "507f1f77bcf86cd799439018";
const classId = "507f1f77bcf86cd799439020";

describe("MaterialVersionsService", () => {
    it("cria versões exclusivamente a partir de jobs DONE", async () => {
        const { indexService, versionModel, service } = makeService();

        await expect(
            service.createFromJob(student, jobId, {
                title: "Primeira versão",
                changeSummary: "Indexação inicial",
            }),
        ).resolves.toMatchObject({
            materialId,
            jobId,
            versionNumber: 2,
            active: true,
            chunksSnapshot: [{ order: 0 }],
        });
        expect(indexService.findWritableDoneJob).toHaveBeenCalledWith(
            student,
            jobId,
        );
        expect(versionModel.updateMany).toHaveBeenCalledWith(
            { materialId: expect.any(Types.ObjectId), scope: "PRIVATE_AREA" },
            { $set: { active: false } },
            { session: expect.anything() },
        );
    });

    it("restaura uma versão e desactiva as restantes do mesmo material", async () => {
        const { versionModel, service } = makeService();

        await expect(
            service.restoreVersion(student, jobId, versionId),
        ).resolves.toMatchObject({
            _id: versionId,
            active: true,
        });
        expect(versionModel.updateMany).toHaveBeenCalled();
    });

    it("projeta o snapshot restaurado no material oficial consumido pelo aluno e pela IA", async () => {
        const { indexService, officialMaterialModel, service } = makeService();
        indexService.findWritableDoneJob.mockResolvedValueOnce({
            job: {
                _id: jobId,
                scope: "OFFICIAL_SUBJECT",
                materialId,
                subjectId,
                teacherId: teacher.id,
                status: "DONE",
                extractedTextChunks: [],
            },
            subject: { _id: subjectId, classId },
        });

        await service.restoreVersion(teacher, jobId, versionId);

        expect(officialMaterialModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({ _id: expect.any(Types.ObjectId) }),
            {
                $set: expect.objectContaining({
                    textContent: "Texto indexado",
                    status: "PROCESSED",
                    activeVersionId: versionId,
                }),
                $inc: { contentRevision: 1 },
            },
            { session: expect.anything() },
        );
    });

    it("mantém endpoints antigos bloqueados por não serem rastreáveis", async () => {
        const { service } = makeService();

        await expect(
            service.createPrivateVersion(student, "507f1f77bcf86cd799439014", materialId),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("não deixa um utilizador com role alterada escrever versões do âmbito antigo", async () => {
        const { indexService, service } = makeService();
        indexService.findWritableDoneJob.mockRejectedValueOnce(
            new ForbiddenException(),
        );

        await expect(
            service.createFromJob(
                { ...teacher, role: "STUDENT" },
                jobId,
                {},
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("propaga rejeição de jobs não concluídos", async () => {
        const { indexService, service } = makeService();
        indexService.findWritableDoneJob.mockRejectedValueOnce(
            new UnprocessableEntityException(),
        );

        await expect(service.createFromJob(student, jobId, {})).rejects.toBeInstanceOf(
            UnprocessableEntityException,
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de versões de materiais para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const job = {
        _id: jobId,
        scope: "PRIVATE_AREA",
        materialId,
        studyAreaId: "507f1f77bcf86cd799439014",
        userId: student.id,
        status: "DONE",
        extractedTextChunks: [
            {
                order: 0,
                text: "Texto indexado",
                sourceLabel: "Limites",
                locator: "chunk:1",
            },
        ],
    };
    const versionObject = {
        _id: versionId,
        scope: "PRIVATE_AREA",
        materialId: new Types.ObjectId(materialId),
        jobId: new Types.ObjectId(jobId),
        versionNumber: 2,
        title: "Primeira versão",
        textSnapshot: "Texto indexado",
        chunksSnapshot: [{ order: 0, text: "Texto indexado", sourceLabel: "Limites", locator: "chunk:1" }],
        active: true,
    };
    const versionDocument = {
        _id: versionId,
        textSnapshot: "Texto indexado",
        /**
         * Transforma o apoio de teste para versões de materiais, mantendo o cenário legível e próximo do comportamento real validado.
         *
         * @returns Contrato público pronto para a UI, sem campos internos de persistência.
         */
        toObject: () => versionObject,
    };
    const versionModel = {
        findOne: jest.fn().mockImplementation((query) => {
            if (query?._id) return Promise.resolve(versionDocument);
            return {
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ versionNumber: 1 }),
                }),
            };
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([versionObject]),
            }),
        }),
        updateMany: jest.fn(),
        findOneAndUpdate: jest.fn().mockResolvedValue(versionDocument),
        create: jest.fn().mockResolvedValue([versionDocument]),
    };
    const indexService = {
        findDoneJob: jest.fn().mockResolvedValue(job),
        findWritableDoneJob: jest.fn().mockResolvedValue({ job }),
        reserveWritableJob: jest.fn().mockResolvedValue(undefined),
    };
    const connection = {
        transaction: jest.fn(async (work) =>
            work({ id: "transaction-session" }),
        ),
    };
    const officialMaterialModel = {
        updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    };
    const service = new MaterialVersionsService(
        versionModel as never,
        officialMaterialModel as never,
        indexService as never,
        connection as never,
    );
    return {
        indexService,
        officialMaterialModel,
        versionModel,
        service,
    };
}
