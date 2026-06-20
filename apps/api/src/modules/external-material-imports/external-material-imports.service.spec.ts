// real_dev/api/src/modules/external-material-imports/external-material-imports.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import {
    ExternalMaterialProvider,
    ExternalMaterialTargetType,
} from "./dto/import-external-material.dto.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

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

const studyAreaId = "507f1f77bcf86cd799439014";
const subjectId = "507f1f77bcf86cd799439015";

describe("ExternalMaterialImportsService", () => {
    it("importa URL para área privada usando o aluno autenticado", async () => {
        const { materialsService, officialMaterialsService, service } = makeService();
        materialsService.submitTextMaterial.mockResolvedValue({
            _id: "507f1f77bcf86cd799439016",
            title: "Resumo Drive",
            type: "URL",
            status: "PENDING_PROCESSING",
            url: "https://drive.google.com/file/d/abc",
        });

        await expect(
            service.importExternalMaterial(student, {
                provider: ExternalMaterialProvider.GoogleDrive,
                targetType: ExternalMaterialTargetType.PrivateStudyArea,
                targetId: studyAreaId,
                title: "Resumo Drive",
                sourceUrl: "https://drive.google.com/file/d/abc",
            }),
        ).resolves.toMatchObject({
            title: "Resumo Drive",
            type: "URL",
        });

        expect(materialsService.submitTextMaterial).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
            {
                title: "Resumo Drive",
                type: "URL",
                url: "https://drive.google.com/file/d/abc",
            },
        );
        expect(officialMaterialsService.createOfficialMaterial).not.toHaveBeenCalled();
    });

    it("bloqueia aluno que tenta importar material oficial", async () => {
        const { materialsService, officialMaterialsService, service } = makeService();

        await expect(
            service.importExternalMaterial(student, {
                provider: ExternalMaterialProvider.OneDrive,
                targetType: ExternalMaterialTargetType.OfficialSubject,
                targetId: subjectId,
                title: "Ficha OneDrive",
                sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        // O erro acontece antes de tocar em persistência oficial ou privada.
        expect(materialsService.submitTextMaterial).not.toHaveBeenCalled();
        expect(officialMaterialsService.createOfficialMaterial).not.toHaveBeenCalled();
    });

    it("delega importação oficial para o service de materiais oficiais", async () => {
        const { materialsService, officialMaterialsService, service } = makeService();
        officialMaterialsService.createOfficialMaterial.mockResolvedValue({
            _id: "507f1f77bcf86cd799439017",
            subjectId,
            classId: "507f1f77bcf86cd799439018",
            teacherId: teacher.id,
            title: "Ficha OneDrive",
            type: "URL",
            status: "REFERENCE_ONLY",
            sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
        });

        await expect(
            service.importExternalMaterial(teacher, {
                provider: ExternalMaterialProvider.OneDrive,
                targetType: ExternalMaterialTargetType.OfficialSubject,
                targetId: subjectId,
                title: "Ficha OneDrive",
                sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
            }),
        ).resolves.toMatchObject({
            title: "Ficha OneDrive",
            type: "URL",
            status: "REFERENCE_ONLY",
        });

        expect(officialMaterialsService.createOfficialMaterial).toHaveBeenCalledWith(
            teacher,
            subjectId,
            {
                title: "Ficha OneDrive",
                type: "URL",
                sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
            },
        );
        expect(materialsService.submitTextMaterial).not.toHaveBeenCalled();
    });
});

/**
 * Cria dependências controladas para testar apenas a regra do service RF61.
 *
 * @returns Service em teste e dependências observáveis.
 */
function makeService() {
    const materialsService = {
        submitTextMaterial: jest.fn(),
    };
    const officialMaterialsService = {
        createOfficialMaterial: jest.fn(),
    };

    return {
        materialsService,
        officialMaterialsService,
        service: new ExternalMaterialImportsService(
            materialsService as never as MaterialsService,
            officialMaterialsService as never as OfficialMaterialsService,
        ),
    };
}