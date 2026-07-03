/**
 * Implementa as regras de negócio de ai e concentra validações do domínio.
 */
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MaterialsService } from "../materials/materials.service.js";
import { HistoryService } from "../study/history.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AiAreaProfileDto } from "./dto/ai-area-profile.dto.js";
import {
    AiAreaProfile,
    AiAreaProfileDocument,
    AiAreaProfileStatus,
} from "./schemas/ai-area-profile.schema.js";

/**
 * Serviço que prepara o perfil IA de uma área.
 */
@Injectable()
export class AiAreaProfileService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param profileModel Modelo Mongoose injetado para ler e persistir artefactos de IA.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     */
    constructor(
        @InjectModel(AiAreaProfile.name)
        private readonly profileModel: Model<AiAreaProfileDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Calcula e persiste o estado IA de uma área do aluno.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns DTO público do perfil IA.
     */
    async prepareProfile(
        userId: string,
        studyAreaId: string,
    ): Promise<AiAreaProfileDto> {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        if (!area) {
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área não encontrada.",
            });
        }

        const materials = await this.materialsService.listByArea(
            userId,
            studyAreaId,
        );
        const processable =
            materials.length === 0
                ? []
                : await this.materialsService.listReadyTextSources(
                      userId,
                      studyAreaId,
                  );
        const status = this.calculateStatus(
            materials.length,
            processable.length,
        );

        const existingProfile = await this.profileModel.exists({
            studyAreaId: new Types.ObjectId(studyAreaId),
            userId: new Types.ObjectId(userId),
        });

        const profile = await this.profileModel.findOneAndUpdate(
            {
                studyAreaId: new Types.ObjectId(studyAreaId),
                userId: new Types.ObjectId(userId),
            },
            {
                $set: {
                    status,
                    sourceCount: materials.length,
                    processableSourceCount: processable.length,
                    materialIds: materials.map((material) => material._id),
                    voiceTone: area.voiceTone,
                },
            },
            { new: true, upsert: true, runValidators: true },
        );

        if (!profile) {
            throw new NotFoundException({
                code: "AI_PROFILE_NOT_CREATED",
                message: "Não foi possível preparar o perfil IA.",
            });
        }

        if (!existingProfile) {
            await this.historyService.recordEvent(
                userId,
                "AI_PROFILE_CREATED",
                "Perfil IA criado",
                area.name,
            );
        }

        return this.toDto(profile);
    }

    /**
     * Calcula estado do perfil IA a partir das fontes.
     *
     * @param sourceCount Número total de materiais.
     * @param processableCount Número de fontes prontas para IA.
     * @returns Estado canónico do perfil.
     */
    private calculateStatus(
        sourceCount: number,
        processableCount: number,
    ): AiAreaProfileStatus {
        if (sourceCount === 0) return "MISSING_MATERIALS";
        if (processableCount === 0) return "PENDING_PROCESSING";
        return "READY_FOR_GENERATION";
    }

    /**
     * Converte documento Mongoose em DTO público.
     *
     * @param profile Documento de perfil IA.
     * @returns DTO seguro.
     */
    private toDto(profile: AiAreaProfileDocument): AiAreaProfileDto {
        return {
            id: String(profile._id),
            studyAreaId: profile.studyAreaId.toString(),
            status: profile.status,
            sourceCount: profile.sourceCount,
            processableSourceCount: profile.processableSourceCount,
            voiceTone: profile.voiceTone,
        };
    }
}
