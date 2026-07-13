/** Testes de ownership e arquivo read-only dos materiais privados. */
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudentStudyMaterialsService } from "./student-study-materials.service.js";

const studentId = "507f1f77bcf86cd799439014";
const artifactId = "507f1f77bcf86cd799439015";
const targetId = "507f1f77bcf86cd799439016";
const actor: AuthenticatedUser = {
    id: studentId,
    role: "STUDENT",
    email: "aluno@example.test",
};

describe("StudentStudyMaterialsService", () => {
    it("não revela materiais de outro owner", async () => {
        const setup = makeService({ artifact: null });
        await expect(setup.service.get(actor, artifactId)).rejects.toBeInstanceOf(
            NotFoundException,
        );
        expect(setup.artifactModel.findOne).toHaveBeenCalledWith({
            _id: new Types.ObjectId(artifactId),
            userId: new Types.ObjectId(studentId),
        });
    });

    it("mantém consulta mas bloqueia nova tentativa quando o destino terminou", async () => {
        const setup = makeService({ active: false });
        await expect(
            setup.service.submitQuizAttempt(actor, artifactId, { answers: [0] }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(
            setup.studyToolsService.submitQuizAttemptForOwnedArtifact,
        ).not.toHaveBeenCalled();
    });

    it("exporta por owner sem exigir uma área pessoal ativa", async () => {
        const setup = makeService({ active: false });
        await setup.service.export(actor, artifactId, "md");
        expect(setup.exportService.exportArtifactForOwner).toHaveBeenCalledWith(
            studentId,
            artifactId,
            "md",
        );
    });
});

function makeService(options: { artifact?: Record<string, unknown> | null; active?: boolean } = {}) {
    const artifact = options.artifact === undefined
        ? {
              _id: new Types.ObjectId(artifactId),
              userId: new Types.ObjectId(studentId),
              targetKind: "SUBJECT",
              targetId: new Types.ObjectId(targetId),
              targetLabelSnapshot: "Bases de Dados",
              type: "QUIZ",
              contentJson: { questions: [] },
              sourcesJson: [],
              createdAt: new Date(),
          }
        : options.artifact;
    const artifactModel = {
        findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(artifact) }),
        find: jest.fn(),
        db: { startSession: jest.fn() },
    };
    const studyToolsService = {
        submitQuizAttemptForOwnedArtifact: jest.fn(),
    };
    const exportService = {
        exportArtifactForOwner: jest.fn().mockResolvedValue({
            fileName: "material.md",
            contentType: "text/markdown",
            disposition: "attachment",
            body: "# Material",
        }),
    };
    const service = new StudentStudyMaterialsService(
        artifactModel as never,
        {} as never,
        {} as never,
        { toArtifactView: jest.fn() } as never,
        {
            resolveTargetAccess: jest.fn().mockResolvedValue({
                active: options.active ?? true,
                label: "Bases de Dados",
            }),
        } as never,
        studyToolsService as never,
        exportService as never,
        {} as never,
    );
    return { service, artifactModel, studyToolsService, exportService };
}
