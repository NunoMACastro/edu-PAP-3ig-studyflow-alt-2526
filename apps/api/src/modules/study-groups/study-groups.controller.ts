/**
 * Expõe os endpoints HTTP de grupos de estudo e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupDto } from "./dto/create-study-group.dto.js";
import { StudyGroupsService } from "./study-groups.service.js";

/**
 * Endpoints de grupos de estudo.
 */
@Controller("api/study-groups")
@UseGuards(SessionGuard)
export class StudyGroupsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param studyGroupsService Service injetado para reutilizar regras de grupos de estudo sem duplicar validações.
     */
    constructor(private readonly studyGroupsService: StudyGroupsService) {}

    /**
     * Lista grupos acessíveis ao aluno.
     *
     * @param request Pedido autenticado.
     * @returns Grupos do aluno.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.studyGroupsService.listMyGroups(request.user!);
    }

    /**
     * Cria um grupo de estudo.
     *
     * @param request Pedido autenticado.
     * @param body Dados do grupo.
     * @returns Grupo criado.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateStudyGroupDto,
    ) {
        return this.studyGroupsService.createGroup(request.user!, body);
    }
}
