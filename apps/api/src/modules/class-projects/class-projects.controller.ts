/**
 * Expõe os endpoints HTTP de turma projects e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassProjectsService } from "./class-projects.service.js";
import { CreateClassProjectDto, UpdateClassProjectDto } from "./dto/create-class-project.dto.js";

/**
 * Endpoints de projectos oficiais da turma.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class ClassProjectsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param projectsService Service injetado para reutilizar regras de projects sem duplicar validações.
     */
    constructor(private readonly projectsService: ClassProjectsService) {}

    /**
     * Recebe o pedido de criação de projetos da turma e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de projetos da turma criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("teacher/classes/:classId/projects")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateClassProjectDto,
    ) {
        return this.projectsService.create(request.user!, classId, body);
    }

    /** Edita apenas rascunhos pertencentes ao professor autenticado. */
    @Patch("teacher/classes/:classId/projects/:projectId")
    updateDraft(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("projectId") projectId: string,
        @Body() body: UpdateClassProjectDto,
    ) {
        return this.projectsService.updateDraft(request.user!, classId, projectId, body);
    }

    /** Publica um rascunho de forma explícita e idempotente. */
    @Post("teacher/classes/:classId/projects/:projectId/publish")
    publish(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("projectId") projectId: string,
    ) {
        return this.projectsService.publish(request.user!, classId, projectId);
    }

    /**
     * Recebe o pedido de listagem de projetos da turma e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de projetos da turma visível para o contexto autorizado.
     */
    @Get("teacher/classes/:classId/projects")
    listTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.projectsService.listForTeacher(request.user!, classId);
    }

    /**
     * Recebe o pedido de listagem de projetos da turma e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de projetos da turma visível para o contexto autorizado.
     */
    @Get("student/classes/:classId/projects")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.projectsService.listPublishedForStudent(request.user!, classId);
    }
}
