/**
 * Testa RF61 para importacao unidirecional Google Drive/OneDrive.
 */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { PublicMaterialDto } from "../materials/dto/public-material.dto.js";
import { OfficialMaterialView } from "../official-materials/official-materials.service.js";
import {
    ExternalMaterialProvider,
    ExternalMaterialTargetType,
} from "./dto/import-external-material.dto.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

const studyAreaId = "507f1f77bcf86cd799439011";
const subjectId = "507f1f77bcf86cd799439015";

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

describe("ExternalMaterialImportsService", () => {
    it("importa link Google Drive para material privado usando o aluno da sessão", async () => {
        const privateMaterial: PublicMaterialDto = {
            _id: "507f1f77bcf86cd799439016",
            title: "Ficha de estudo",
            type: "URL",
            status: "PENDING_PROCESSING",
            url: "https://drive.google.com/file/d/abc/view",
        };
        const { materialsService, officialMaterialsService, service } =
            makeService();
        materialsService.submitTextMaterial.mockResolvedValue(privateMaterial);

        await expect(
            service.importExternalMaterial(student, {
                provider: ExternalMaterialProvider.GoogleDrive,
                targetType: ExternalMaterialTargetType.PrivateStudyArea,
                targetId: studyAreaId,
                title: "Ficha de estudo",
                sourceUrl: "https://drive.google.com/file/d/abc/view",
            }),
        ).resolves.toEqual(privateMaterial);

        expect(materialsService.submitTextMaterial).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
            {
                title: "Ficha de estudo",
                type: "URL",
                url: "https://drive.google.com/file/d/abc/view",
            },
        );
        expect(officialMaterialsService.createOfficialMaterial).not.toHaveBeenCalled();
    });

    it("importa link OneDrive para material oficial quando o professor controla o destino", async () => {
        const officialMaterial: OfficialMaterialView = {
            _id: "507f1f77bcf86cd799439017",
            subjectId,
            classId: "507f1f77bcf86cd799439014",
            teacherId: teacher.id,
            title: "Critérios de avaliação",
            type: "URL",
            status: "REFERENCE_ONLY",
            sourceUrl: "https://1drv.ms/b/s!ficheiro",
        };
        const { materialsService, officialMaterialsService, service } =
            makeService();
        officialMaterialsService.createOfficialMaterial.mockResolvedValue(
            officialMaterial,
        );

        await expect(
            service.importExternalMaterial(teacher, {
                provider: ExternalMaterialProvider.OneDrive,
                targetType: ExternalMaterialTargetType.OfficialSubject,
                targetId: subjectId,
                title: "Critérios de avaliação",
                sourceUrl: "https://1drv.ms/b/s!ficheiro",
            }),
        ).resolves.toEqual(officialMaterial);

        expect(officialMaterialsService.createOfficialMaterial).toHaveBeenCalledWith(
            teacher,
            subjectId,
            {
                title: "Critérios de avaliação",
                type: "URL",
                sourceUrl: "https://1drv.ms/b/s!ficheiro",
            },
        );
        expect(materialsService.submitTextMaterial).not.toHaveBeenCalled();
    });

    it("bloqueia aluno que tenta importar para material oficial", async () => {
        const { materialsService, officialMaterialsService, service } =
            makeService();

        await expect(
            service.importExternalMaterial(student, {
                provider: ExternalMaterialProvider.GoogleDrive,
                targetType: ExternalMaterialTargetType.OfficialSubject,
                targetId: subjectId,
                title: "Material oficial",
                sourceUrl: "https://drive.google.com/file/d/abc/view",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(materialsService.submitTextMaterial).not.toHaveBeenCalled();
        expect(officialMaterialsService.createOfficialMaterial).not.toHaveBeenCalled();
    });

    it("rejeita provider que nao corresponde ao host do link", async () => {
        const { materialsService, officialMaterialsService, service } =
            makeService();

        await expect(
            service.importExternalMaterial(student, {
                provider: ExternalMaterialProvider.GoogleDrive,
                targetType: ExternalMaterialTargetType.PrivateStudyArea,
                targetId: studyAreaId,
                title: "Link errado",
                sourceUrl: "https://example.test/material",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(materialsService.submitTextMaterial).not.toHaveBeenCalled();
        expect(officialMaterialsService.createOfficialMaterial).not.toHaveBeenCalled();
    });
});

/**
 * Cria dependencias mockadas para exercitar apenas o router de dominio RF61.
 *
 * @returns Service sob teste e mocks dos services herdados.
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
            materialsService as never,
            officialMaterialsService as never,
        ),
    };
}
