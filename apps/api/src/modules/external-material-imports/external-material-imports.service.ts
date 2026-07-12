/**
 * Implementa RF61 encaminhando links externos para services existentes.
 */
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { PublicMaterialDto } from "../materials/dto/public-material.dto.js";
import { MaterialsService } from "../materials/materials.service.js";
import {
    OfficialMaterialsService,
    OfficialMaterialView,
} from "../official-materials/official-materials.service.js";
import {
    ExternalMaterialProvider,
    ExternalMaterialTargetType,
    ImportExternalMaterialDto,
} from "./dto/import-external-material.dto.js";

/**
 * Resultado publico devolvido pelos services de materiais privados ou oficiais.
 */
export type ImportedExternalMaterial = PublicMaterialDto | OfficialMaterialView;

/**
 * Service fino que valida o provider externo e delega persistencia/autorizacao.
 */
@Injectable()
export class ExternalMaterialImportsService {
    /**
     * Recebe services de BKs anteriores para nao duplicar ownership nem persistencia.
     *
     * @param materialsService Service de materiais privados por area de estudo.
     * @param officialMaterialsService Service de materiais oficiais por disciplina.
     */
    constructor(
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    /**
     * Cria um material StudyFlow a partir de um link externo autorizado.
     *
     * @param actor Utilizador autenticado anexado pelo `SessionGuard`.
     * @param dto Payload validado pelo DTO RF61.
     * @returns Material publico criado pelo service de destino.
     * @throws ForbiddenException quando um aluno tenta criar material oficial.
     * @throws BadRequestException quando provider e URL nao correspondem.
     */
    async importExternalMaterial(
        actor: AuthenticatedUser,
        dto: ImportExternalMaterialDto,
    ): Promise<ImportedExternalMaterial> {
        const sourceUrl = this.assertProviderMatchesSourceUrl(
            dto.provider,
            dto.sourceUrl,
        );

        if (dto.targetType === ExternalMaterialTargetType.PrivateStudyArea) {
            // O dono do material vem da sessao; o browser apenas escolhe o destino pretendido.
            return this.materialsService.submitTextMaterial(actor.id, dto.targetId, {
                title: dto.title,
                type: "URL",
                url: sourceUrl,
            });
        }

        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Apenas professores podem importar materiais oficiais.",
            });
        }

        // A permissao sobre a disciplina continua no OfficialMaterialsService.
        return this.officialMaterialsService.createOfficialMaterial(
            actor,
            dto.targetId,
            {
                title: dto.title,
                type: "URL",
                sourceUrl,
            },
        );
    }

    /**
     * Garante que a URL representa realmente o provider declarado.
     *
     * @param provider Provider escolhido no formulário.
     * @param sourceUrl URL externa recebida do utilizador.
     * @returns URL normalizada pela API nativa `URL`.
     * @throws BadRequestException se a URL nao pertence ao provider esperado.
     */
    private assertProviderMatchesSourceUrl(
        provider: ExternalMaterialProvider,
        sourceUrl: string,
    ): string {
        let url: URL;
        try {
            url = new URL(sourceUrl);
        } catch {
            throw new BadRequestException({
                code: "INVALID_EXTERNAL_SOURCE_URL",
                message: "Indica um URL externo http ou https válido.",
            });
        }

        const hostname = url.hostname.toLowerCase();
        const googleDriveHost = ["drive.google.com", "docs.google.com"].includes(
            hostname,
        );
        const oneDriveHost =
            hostname === "onedrive.live.com" ||
            hostname === "1drv.ms" ||
            hostname.endsWith(".sharepoint.com");

        if (
            (provider === ExternalMaterialProvider.GoogleDrive && googleDriveHost) ||
            (provider === ExternalMaterialProvider.OneDrive && oneDriveHost)
        ) {
            return url.toString();
        }

        throw new BadRequestException({
            code: "EXTERNAL_PROVIDER_URL_MISMATCH",
            message:
                "Indica um link Google Drive ou OneDrive coerente com o provider escolhido.",
        });
    }
}
