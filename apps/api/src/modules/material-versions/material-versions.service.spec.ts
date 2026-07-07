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
const materialId = "507f1f77bcf86cd799439015";
const jobId = "507f1f77bcf86cd799439016";
const versionId = "507f1f77bcf86cd799439017";

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
        expect(indexService.findDoneJob).toHaveBeenCalledWith(student, jobId);
        expect(versionModel.updateMany).toHaveBeenCalledWith(
            { materialId: expect.any(Types.ObjectId), scope: "PRIVATE_AREA" },
            { $set: { active: false } },
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

    it("mantém endpoints antigos bloqueados por não serem rastreáveis", async () => {
        const { service } = makeService();

        await expect(
            service.createPrivateVersion(student, "507f1f77bcf86cd799439014", materialId),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("propaga rejeição de jobs não concluídos", async () => {
        const { indexService, service } = makeService();
        indexService.findDoneJob.mockRejectedValueOnce(
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
        active: false,
        save: jest.fn(),
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
        create: jest.fn().mockResolvedValue({
            /**
             * Transforma o apoio de teste para versões de materiais, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => versionObject,
        }),
    };
    const indexService = { findDoneJob: jest.fn().mockResolvedValue(job) };
    const service = new MaterialVersionsService(
        versionModel as never,
        indexService as never,
    );
    return { indexService, versionModel, service };
}
