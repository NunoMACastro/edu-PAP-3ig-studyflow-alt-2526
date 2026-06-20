// api/src/modules/external-material-imports/external-material-imports.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import {
    ExternalMaterialTargetType,
    ImportExternalMaterialDto,
} from "./dto/import-external-material.dto.js";

/**
 * Encaminha links externos para materiais privados ou oficiais sem duplicar regras de persistência.
 */
@Injectable()
export class ExternalMaterialImportsService {
    /**
     * Recebe os services herdados de BKs anteriores.
     *
     * @param materialsService Service de materiais privados por área de estudo.
     * @param officialMaterialsService Service de materiais oficiais por disciplina.
     */
    constructor(
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    /**
     * Importa um link externo para o destino pedido.
     *
     * @param actor Utilizador autenticado anexado pelo `SessionGuard`.
     * @param dto Dados validados do pedido RF61.
     * @returns Material criado pelo service especializado.
     * @throws ForbiddenException quando um aluno tenta criar material oficial.
     */
    async importExternalMaterial(
        actor: AuthenticatedUser,
        dto: ImportExternalMaterialDto,
    ) {
        if (dto.targetType === ExternalMaterialTargetType.PrivateStudyArea) {
            // O userId vem da sessão para impedir que o frontend escolha o dono do material.
            return this.materialsService.submitTextMaterial(actor.id, dto.targetId, {
                title: dto.title,
                type: "URL",
                url: dto.sourceUrl,
            });
        }

        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Apenas professores podem importar materiais oficiais.",
            });
        }

        // O provider fica no contrato RF61; o service oficial mantém apenas o DTO que já conhece.
        return this.officialMaterialsService.createOfficialMaterial(
            actor,
            dto.targetId,
            {
                title: dto.title,
                type: "URL",
                sourceUrl: dto.sourceUrl,
            },
        );
    }
}