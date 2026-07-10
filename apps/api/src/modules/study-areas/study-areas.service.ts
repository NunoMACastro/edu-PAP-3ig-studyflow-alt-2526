/**
 * Implementa as regras de negócio de study áreas e concentra validações do domínio.
 */
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { isMongoDuplicateKeyError } from "../../common/utils/mongo-error.util.js";
import { HistoryService } from "../study/history.service.js";
import { CreateStudyAreaDto } from "./dto/create-study-area.dto.js";
import { toPublicStudyArea } from "./dto/public-study-area.dto.js";
import { UpdateStudyAreaDto } from "./dto/update-study-area.dto.js";
import {
    StudyArea,
    StudyAreaDocument,
} from "./schemas/study-area.schema.js";

/**
 * Serviço de áreas de estudo.
 *
 * Todas as queries filtram por `userId` para garantir que uma área só existe
 * dentro do espaço pessoal do aluno autenticado.
 */
@Injectable()
export class StudyAreasService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param areaModel Modelo Mongoose injetado para ler e persistir áreas de estudo.
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     */
    constructor(
        @InjectModel(StudyArea.name)
        private readonly areaModel: Model<StudyAreaDocument>,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Lista áreas ativas do aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @returns Áreas não arquivadas ordenadas por nome.
     */
    async listMyStudyAreas(userId: string) {
        const areas = await this.areaModel
            .find({ userId: new Types.ObjectId(userId), archived: false })
            .sort({ name: 1 })
            .lean();
        return areas.map((area) => toPublicStudyArea(area));
    }

    /**
     * Conta áreas ativas do aluno.
     *
     * @param userId Identificador vindo da sessão.
     * @returns Número de áreas ativas.
     */
    async countMyStudyAreas(userId: string): Promise<number> {
        return this.areaModel.countDocuments({
            userId: new Types.ObjectId(userId),
            archived: false,
        });
    }

    /**
     * Obtém uma área, validando ownership.
     *
     * @param userId Identificador vindo da sessão.
     * @param areaId Identificador da área.
     * @returns Área encontrada.
     * @throws NotFoundException quando não existe ou pertence a outro aluno.
     */
    async getMyStudyArea(userId: string, areaId: string) {
        if (!Types.ObjectId.isValid(areaId)) {
            throw this.notFound();
        }

        const area = await this.areaModel
            .findOne({
                _id: areaId,
                userId: new Types.ObjectId(userId),
                archived: false,
            })
            .lean();

        if (!area) throw this.notFound();
        return toPublicStudyArea(area);
    }

    /**
     * Cria uma nova área de estudo para o aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param input Dados da área.
     * @returns Área criada.
     */
    async createStudyArea(userId: string, input: CreateStudyAreaDto) {
        const name = input.name?.trim();
        if (!name) {
            throw new BadRequestException({
                code: "AREA_NAME_REQUIRED",
                message: "Indica o nome da área.",
            });
        }

        const duplicate = await this.areaModel.exists({
            userId: new Types.ObjectId(userId),
            name,
        });
        if (duplicate) {
            throw this.duplicatedAreaName();
        }

        let area: StudyAreaDocument;
        try {
            area = await this.areaModel.create({
                userId: new Types.ObjectId(userId),
                name,
                description: input.description?.trim(),
                color: input.color?.trim(),
            });
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.duplicatedAreaName();
            }
            throw error;
        }

        await this.historyService.recordEvent(
            userId,
            "STUDY_AREA_CREATED",
            "Área de estudo criada",
            area.name,
        );

        return toPublicStudyArea(area);
    }

    /**
     * Atualiza uma área de estudo do aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param areaId Identificador da área.
     * @param input Campos editáveis.
     * @returns Área atualizada.
     */
    async updateStudyArea(
        userId: string,
        areaId: string,
        input: UpdateStudyAreaDto,
    ) {
        if (!Types.ObjectId.isValid(areaId)) throw this.notFound();

        const update: UpdateStudyAreaDto = {};
        if (input.name !== undefined) {
            const name = input.name.trim();
            if (!name) {
                throw new BadRequestException({
                    code: "AREA_NAME_REQUIRED",
                    message: "Indica o nome da área.",
                });
            }
            update.name = name;
        }
        if (input.description !== undefined)
            update.description = input.description.trim();
        if (input.color !== undefined) update.color = input.color.trim();
        if (input.archived !== undefined) update.archived = input.archived;

        let updated: (StudyArea & { _id: unknown }) | null;
        try {
            updated = await this.areaModel
                .findOneAndUpdate(
                    { _id: areaId, userId: new Types.ObjectId(userId) },
                    { $set: update },
                    { new: true, runValidators: true },
                )
                .lean<StudyArea & { _id: unknown }>();
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.duplicatedAreaName();
            }
            throw error;
        }

        if (!updated) throw this.notFound();
        return toPublicStudyArea(updated);
    }

    /**
     * Cria a exceção padronizada de área não encontrada.
     *
     * @returns Exceção `NotFoundException`.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "STUDY_AREA_NOT_FOUND",
            message: "Área de estudo não encontrada.",
        });
    }

    /**
     * Cria o erro público para nome de área duplicado.
     *
     * @returns Exceção `ConflictException`.
     */
    private duplicatedAreaName(): ConflictException {
        return new ConflictException({
            code: "AREA_NAME_DUPLICATED",
            message: "Já tens uma área com esse nome.",
        });
    }
}
