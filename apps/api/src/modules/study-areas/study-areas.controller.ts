/**
 * Expõe os endpoints HTTP de study áreas e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyAreaDto } from "./dto/create-study-area.dto.js";
import { UpdateStudyAreaDto } from "./dto/update-study-area.dto.js";
import { StudyAreasService } from "./study-areas.service.js";

/**
 * Controller das áreas de estudo pessoais.
 */
@Controller("api/study-areas")
@UseGuards(SessionGuard)
export class StudyAreasController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     */
    constructor(private readonly studyAreasService: StudyAreasService) {}

    /**
     * Lista as áreas do aluno autenticado.
     *
     * @param request Pedido autenticado.
     * @returns Lista de áreas não arquivadas.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.studyAreasService.listMyStudyAreas(request.user!.id);
    }

    /**
     * Cria uma área de estudo pessoal.
     *
     * @param request Pedido autenticado.
     * @param body Dados da nova área.
     * @returns Área criada.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateStudyAreaDto,
    ) {
        return this.studyAreasService.createStudyArea(request.user!.id, body);
    }

    /**
     * Obtém detalhe de uma área do aluno.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @returns Área encontrada.
     */
    @Get(":id")
    detail(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.studyAreasService.getMyStudyArea(request.user!.id, id);
    }

    /**
     * Atualiza campos editáveis da área.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param body Campos a alterar.
     * @returns Área atualizada.
     */
    @Patch(":id")
    update(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: UpdateStudyAreaDto,
    ) {
        return this.studyAreasService.updateStudyArea(
            request.user!.id,
            id,
            body,
        );
    }
}
