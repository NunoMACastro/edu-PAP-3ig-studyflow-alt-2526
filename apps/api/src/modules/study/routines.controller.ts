/**
 * Expõe os endpoints HTTP de study e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateGoalDto, UpdateGoalDto } from "./dto/create-goal.dto.js";
import {
    CreateRoutineDto,
    UpdateRoutineDto,
} from "./dto/create-routine.dto.js";
import { RoutinesService } from "./routines.service.js";

/**
 * Controller de rotinas e objetivos do aluno autenticado.
 */
@Controller("api/study")
@UseGuards(SessionGuard)
export class RoutinesController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param routinesService Service injetado para reutilizar regras de routines sem duplicar validações.
     */
    constructor(private readonly routinesService: RoutinesService) {}

    /**
     * Lista rotinas e objetivos pessoais.
     *
     * @param request Pedido autenticado.
     * @returns Rotinas e objetivos do aluno.
     */
    @Get("routines")
    list(@Req() request: AuthenticatedRequest) {
        return this.routinesService.listMine(request.user!.id);
    }

    /**
     * Lista objetivos pessoais.
     *
     * @param request Pedido autenticado.
     * @returns Objetivos ativos do aluno.
     */
    @Get("goals")
    listGoals(@Req() request: AuthenticatedRequest) {
        return this.routinesService.listGoals(request.user!.id);
    }

    /**
     * Cria uma rotina pessoal.
     *
     * @param request Pedido autenticado.
     * @param body Dados da rotina.
     * @returns Rotina criada.
     */
    @Post("routines")
    createRoutine(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateRoutineDto,
    ) {
        return this.routinesService.createRoutine(request.user!.id, body);
    }

    /**
     * Atualiza uma rotina pessoal.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da rotina.
     * @param body Campos editáveis.
     * @returns Rotina atualizada.
     */
    @Patch("routines/:id")
    updateRoutine(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: UpdateRoutineDto,
    ) {
        return this.routinesService.updateRoutine(request.user!.id, id, body);
    }

    /**
     * Arquiva uma rotina pessoal.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da rotina.
     * @returns Estado simples de sucesso.
     */
    @Delete("routines/:id")
    archiveRoutine(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
    ) {
        return this.routinesService.archiveRoutine(request.user!.id, id);
    }

    /**
     * Cria um objetivo pessoal.
     *
     * @param request Pedido autenticado.
     * @param body Dados do objetivo.
     * @returns Objetivo criado.
     */
    @Post("goals")
    createGoal(@Req() request: AuthenticatedRequest, @Body() body: CreateGoalDto) {
        return this.routinesService.createGoal(request.user!.id, body);
    }

    /**
     * Atualiza um objetivo pessoal.
     *
     * @param request Pedido autenticado.
     * @param id Identificador do objetivo.
     * @param body Campos editáveis.
     * @returns Objetivo atualizado.
     */
    @Patch("goals/:id")
    updateGoal(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: UpdateGoalDto,
    ) {
        return this.routinesService.updateGoal(request.user!.id, id, body);
    }

    /**
     * Arquiva um objetivo pessoal.
     *
     * @param request Pedido autenticado.
     * @param id Identificador do objetivo.
     * @returns Estado simples de sucesso.
     */
    @Delete("goals/:id")
    archiveGoal(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.routinesService.archiveGoal(request.user!.id, id);
    }
}
