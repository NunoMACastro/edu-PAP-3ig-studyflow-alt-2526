/**
 * Implementa as regras de negócio de study e concentra validações do domínio.
 */
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateGoalDto, UpdateGoalDto } from "./dto/create-goal.dto.js";
import {
    CreateRoutineDto,
    UpdateRoutineDto,
} from "./dto/create-routine.dto.js";
import { HistoryService } from "./history.service.js";
import {
    StudyGoal,
    StudyGoalDocument,
} from "./schemas/study-goal.schema.js";
import {
    StudyRoutine,
    StudyRoutineDocument,
} from "./schemas/study-routine.schema.js";
import {
    toPublicStudyGoal,
    toPublicStudyRoutine,
} from "./dto/public-study-plan.dto.js";

/**
 * Serviço de rotinas e objetivos pessoais.
 */
@Injectable()
export class RoutinesService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param routineModel Modelo Mongoose injetado para ler e persistir rotinas e objetivos de estudo.
     * @param goalModel Modelo Mongoose injetado para ler e persistir rotinas e objetivos de estudo.
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     */
    constructor(
        @InjectModel(StudyRoutine.name)
        private readonly routineModel: Model<StudyRoutineDocument>,
        @InjectModel(StudyGoal.name)
        private readonly goalModel: Model<StudyGoalDocument>,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Lista rotinas e objetivos do aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @returns Objeto com arrays `routines` e `goals`.
     */
    async listMine(userId: string) {
        const query = {
            userId: new Types.ObjectId(userId),
            archived: false,
        };
        const [routines, goals] = await Promise.all([
            this.routineModel.find(query).sort({ createdAt: -1 }).lean(),
            this.goalModel.find(query).sort({ createdAt: -1 }).lean(),
        ]);

        return {
            routines: routines.map((routine) => toPublicStudyRoutine(routine)),
            goals: goals.map((goal) => toPublicStudyGoal(goal)),
        };
    }

    /**
     * Lista objetivos ativos do aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @returns Objetivos não arquivados do aluno.
     */
    async listGoals(userId: string) {
        const goals = await this.goalModel
            .find({
                userId: new Types.ObjectId(userId),
                archived: false,
            })
            .sort({ createdAt: -1 })
            .lean();
        return goals.map((goal) => toPublicStudyGoal(goal));
    }

    /**
     * Conta rotinas do aluno para o dashboard individual.
     *
     * @param userId Identificador vindo da sessão.
     * @returns Número de rotinas persistidas.
     */
    async countRoutines(userId: string): Promise<number> {
        return this.routineModel.countDocuments({
            userId: new Types.ObjectId(userId),
            archived: false,
        });
    }

    /**
     * Cria uma rotina de estudo.
     *
     * @param userId Identificador vindo da sessão.
     * @param input Dados da rotina.
     * @returns Rotina criada.
     */
    async createRoutine(userId: string, input: CreateRoutineDto) {
        const title = input.title?.trim();
        if (!title) {
            throw new BadRequestException({
                code: "ROUTINE_TITLE_REQUIRED",
                message: "Indica um título para a rotina.",
            });
        }

        if (!Array.isArray(input.weekdays) || input.weekdays.length === 0) {
            throw new BadRequestException({
                code: "ROUTINE_WEEKDAYS_REQUIRED",
                message: "Escolhe pelo menos um dia da semana.",
            });
        }

        const routine = await this.routineModel.create({
            userId: new Types.ObjectId(userId),
            title,
            weekdays: input.weekdays,
            startTime: input.startTime,
            durationMinutes: input.durationMinutes,
            archived: false,
        });

        await this.historyService.recordEvent(
            userId,
            "ROUTINE_CREATED",
            "Rotina criada",
            title,
        );

        return toPublicStudyRoutine(routine);
    }

    /**
     * Atualiza uma rotina pertencente ao aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param routineId Identificador da rotina.
     * @param input Campos editáveis.
     * @returns Rotina atualizada.
     */
    async updateRoutine(
        userId: string,
        routineId: string,
        input: UpdateRoutineDto,
    ) {
        if (!Types.ObjectId.isValid(routineId)) throw this.notFound("ROTINA");

        const update: Partial<{
            title: string;
            weekdays: string[];
            startTime: string;
            durationMinutes: number;
        }> = {};

        if (input.title !== undefined) {
            const title = input.title.trim();
            if (!title) {
                throw new BadRequestException({
                    code: "ROUTINE_TITLE_REQUIRED",
                    message: "Indica um título para a rotina.",
                });
            }
            update.title = title;
        }
        if (input.weekdays !== undefined) update.weekdays = input.weekdays;
        if (input.startTime !== undefined) update.startTime = input.startTime;
        if (input.durationMinutes !== undefined)
            update.durationMinutes = input.durationMinutes;

        const updated = await this.routineModel.findOneAndUpdate(
            {
                _id: routineId,
                userId: new Types.ObjectId(userId),
                archived: false,
            },
            { $set: update },
            { new: true, runValidators: true },
        );

        if (!updated) throw this.notFound("ROTINA");
        return toPublicStudyRoutine(updated);
    }

    /**
     * Arquiva uma rotina sem apagar fisicamente.
     *
     * @param userId Identificador vindo da sessão.
     * @param routineId Identificador da rotina.
     * @returns Estado simples de sucesso.
     */
    async archiveRoutine(userId: string, routineId: string) {
        if (!Types.ObjectId.isValid(routineId)) throw this.notFound("ROTINA");

        const updated = await this.routineModel.findOneAndUpdate(
            {
                _id: routineId,
                userId: new Types.ObjectId(userId),
                archived: false,
            },
            { $set: { archived: true } },
            { new: true },
        );

        if (!updated) throw this.notFound("ROTINA");

        await this.historyService.recordEvent(
            userId,
            "ROUTINE_ARCHIVED",
            "Rotina arquivada",
            updated.title,
        );

        return { ok: true };
    }

    /**
     * Cria um objetivo de estudo.
     *
     * @param userId Identificador vindo da sessão.
     * @param input Dados do objetivo.
     * @returns Objetivo criado.
     */
    async createGoal(userId: string, input: CreateGoalDto) {
        const title = input.title?.trim();
        if (!title) {
            throw new BadRequestException({
                code: "GOAL_TITLE_REQUIRED",
                message: "Indica um título para o objetivo.",
            });
        }

        const goal = await this.goalModel.create({
            userId: new Types.ObjectId(userId),
            title,
            description: input.description?.trim(),
            targetDate: this.parseOptionalDate(input.targetDate),
            archived: false,
        });

        await this.historyService.recordEvent(
            userId,
            "GOAL_CREATED",
            "Objetivo criado",
            title,
        );

        return toPublicStudyGoal(goal);
    }

    /**
     * Atualiza um objetivo pertencente ao aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param goalId Identificador do objetivo.
     * @param input Campos editáveis.
     * @returns Objetivo atualizado.
     */
    async updateGoal(userId: string, goalId: string, input: UpdateGoalDto) {
        if (!Types.ObjectId.isValid(goalId)) throw this.notFound("OBJETIVO");

        const update: Partial<{
            title: string;
            description: string | undefined;
            targetDate: Date | undefined;
            completed: boolean;
        }> = {};

        if (input.title !== undefined) {
            const title = input.title.trim();
            if (!title) {
                throw new BadRequestException({
                    code: "GOAL_TITLE_REQUIRED",
                    message: "Indica um título para o objetivo.",
                });
            }
            update.title = title;
        }
        if (input.description !== undefined)
            update.description = input.description.trim();
        if (input.targetDate !== undefined)
            update.targetDate = this.parseOptionalDate(input.targetDate);
        if (input.completed !== undefined) update.completed = input.completed;

        const updated = await this.goalModel.findOneAndUpdate(
            {
                _id: goalId,
                userId: new Types.ObjectId(userId),
                archived: false,
            },
            { $set: update },
            { new: true, runValidators: true },
        );

        if (!updated) throw this.notFound("OBJETIVO");

        await this.historyService.recordEvent(
            userId,
            "GOAL_UPDATED",
            "Objetivo atualizado",
            updated.title,
        );

        return toPublicStudyGoal(updated);
    }

    /**
     * Arquiva um objetivo sem apagar fisicamente.
     *
     * @param userId Identificador vindo da sessão.
     * @param goalId Identificador do objetivo.
     * @returns Estado simples de sucesso.
     */
    async archiveGoal(userId: string, goalId: string) {
        if (!Types.ObjectId.isValid(goalId)) throw this.notFound("OBJETIVO");

        const updated = await this.goalModel.findOneAndUpdate(
            {
                _id: goalId,
                userId: new Types.ObjectId(userId),
                archived: false,
            },
            { $set: { archived: true } },
            { new: true },
        );

        if (!updated) throw this.notFound("OBJETIVO");

        await this.historyService.recordEvent(
            userId,
            "GOAL_ARCHIVED",
            "Objetivo arquivado",
            updated.title,
        );

        return { ok: true };
    }

    /**
     * Valida e converte datas opcionais.
     *
     * @param value Data ISO opcional vinda do frontend.
     * @returns Date ou undefined.
     */
    private parseOptionalDate(value: string | undefined): Date | undefined {
        if (!value) return undefined;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException({
                code: "INVALID_TARGET_DATE",
                message: "Indica uma data válida.",
            });
        }
        return date;
    }

    /**
     * Cria erro de recurso pessoal não encontrado.
     *
     * @param resource Nome curto do recurso.
     * @returns Exceção `NotFoundException`.
     */
    private notFound(resource: "ROTINA" | "OBJETIVO"): NotFoundException {
        return new NotFoundException({
            code: `${resource}_NOT_FOUND`,
            message:
                resource === "ROTINA"
                    ? "Rotina não encontrada."
                    : "Objetivo não encontrado.",
        });
    }
}
