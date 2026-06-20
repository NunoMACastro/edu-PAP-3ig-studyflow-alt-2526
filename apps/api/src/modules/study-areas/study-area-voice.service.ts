/**
 * Implementa as regras de negócio de study áreas e concentra validações do domínio.
 */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateStudyAreaVoiceDto } from "./dto/update-study-area-voice.dto.js";
import { toPublicStudyArea } from "./dto/public-study-area.dto.js";
import {
    StudyArea,
    StudyAreaDocument,
    StudyAreaVoiceDetailLevel,
    StudyAreaVoiceTone,
} from "./schemas/study-area.schema.js";
import { StudyAreasService } from "./study-areas.service.js";

const VALID_TONES: StudyAreaVoiceTone[] = [
    "simple",
    "rigorous",
    "step_by_step",
    "examples_first",
];
const VALID_DETAIL_LEVELS: StudyAreaVoiceDetailLevel[] = [
    "short",
    "normal",
    "detailed",
];

/**
 * Serviço da voz pedagógica por área de estudo.
 */
@Injectable()
export class StudyAreaVoiceService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param areaModel Modelo Mongoose injetado para ler e persistir áreas de estudo.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     */
    constructor(
        @InjectModel(StudyArea.name)
        private readonly areaModel: Model<StudyAreaDocument>,
        private readonly studyAreasService: StudyAreasService,
    ) {}

    /**
     * Atualiza o tom e nível de detalhe da área autenticada.
     *
     * @param userId Identificador vindo da sessão.
     * @param areaId Identificador da área.
     * @param input Preferências de voz.
     * @returns Área atualizada com campos de voz.
     */
    async updateVoice(
        userId: string,
        areaId: string,
        input: UpdateStudyAreaVoiceDto,
    ) {
        await this.studyAreasService.getMyStudyArea(userId, areaId);
        this.validateVoice(input);

        const updated = await this.areaModel
            .findOneAndUpdate(
                { _id: areaId, userId: new Types.ObjectId(userId) },
                {
                    $set: {
                        voiceTone: input.voiceTone,
                        voiceDetailLevel: input.voiceDetailLevel,
                        voiceNotes: this.sanitizeVoiceNotes(input.voiceNotes),
                    },
                },
                { new: true, runValidators: true },
            )
            .lean();

        if (!updated) {
            throw new BadRequestException({
                code: "VOICE_NOT_SAVED",
                message: "Não foi possível guardar a voz da área.",
            });
        }

        return toPublicStudyArea(updated);
    }

    /**
     * Valida enums de voz sem depender apenas de validação Mongoose.
     *
     * @param input Preferências enviadas pelo frontend.
     * @returns Nada quando os valores são válidos.
     */
    private validateVoice(input: UpdateStudyAreaVoiceDto): void {
        if (!VALID_TONES.includes(input.voiceTone)) {
            throw new BadRequestException({
                code: "INVALID_VOICE_TONE",
                message: "Tom de explicação inválido.",
            });
        }

        if (!VALID_DETAIL_LEVELS.includes(input.voiceDetailLevel)) {
            throw new BadRequestException({
                code: "INVALID_DETAIL_LEVEL",
                message: "Nível de detalhe inválido.",
            });
        }
    }

    /**
     * Normaliza notas livres para texto simples antes de persistir.
     *
     * @param value Texto opcional recebido do frontend.
     * @returns Texto limpo ou `undefined` quando fica vazio.
     */
    private sanitizeVoiceNotes(value: string | undefined): string | undefined {
        const sanitized = String(value ?? "")
            .replace(/[<>]/g, "")
            .replace(/[\u0000-\u001f\u007f]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        return sanitized || undefined;
    }
}
