/** Testa a policy de escrita e a atomicidade das estruturas derivadas. */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialStructureService } from "./material-structure.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const jobId = "507f1f77bcf86cd799439013";
const materialId = "507f1f77bcf86cd799439014";

describe("MaterialStructureService", () => {
    it("reserva o contexto writable na mesma sessão do upsert", async () => {
        const session = { id: "structure-session" };
        const context = {
            job: {
                _id: jobId,
                scope: "PRIVATE_AREA",
                materialId,
                studyAreaId: "507f1f77bcf86cd799439015",
                userId: student.id,
                status: "DONE",
                extractedTextChunks: [
                    {
                        order: 1,
                        text: "Derivadas e taxas de variação",
                        sourceLabel: "Cálculo",
                        locator: "chunk-1",
                    },
                ],
            },
        } as const;
        const structure = {
            _id: "507f1f77bcf86cd799439016",
            jobId,
            materialId,
            topics: ["Derivadas"],
            sections: [],
        };
        const structureModel = {
            findOneAndUpdate: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(structure),
            }),
        };
        const indexService = {
            findWritableDoneJob: jest.fn().mockResolvedValue(context),
            reserveWritableJob: jest.fn().mockResolvedValue(undefined),
        };
        const connection = {
            transaction: jest.fn(
                async (work: (value: unknown) => Promise<unknown>) => work(session),
            ),
        };
        const service = new MaterialStructureService(
            structureModel as never,
            indexService as never,
            connection as never,
        );

        await expect(service.createFromJob(student, jobId)).resolves.toMatchObject({
            jobId,
            materialId,
        });
        expect(indexService.reserveWritableJob).toHaveBeenCalledWith(
            student,
            context,
            session,
        );
        expect(structureModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            expect.objectContaining({ session }),
        );
    });

    it("não persiste quando a policy writable rejeita role ou lifecycle", async () => {
        const structureModel = { findOneAndUpdate: jest.fn() };
        const indexService = {
            findWritableDoneJob: jest
                .fn()
                .mockRejectedValue(new ForbiddenException()),
        };
        const service = new MaterialStructureService(
            structureModel as never,
            indexService as never,
            {} as never,
        );

        await expect(service.createFromJob(student, jobId)).rejects
            .toBeInstanceOf(ForbiddenException);
        expect(structureModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
});
